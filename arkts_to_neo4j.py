#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
from neo4j import GraphDatabase

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

PROJECT_PATH = "/你的/鸿蒙/项目/路径"
NEO4J_PASSWORD = "12345678"
OPENAI_API_KEY = "你的API密钥"


class ArkTSFile:
    def __init__(self, path):
        self.path = path
        self.classes = []
        self.functions = []


class ArkTSClass:
    def __init__(self, name):
        self.name = name
        self.decorators = []
        self.methods = []


class ArkTSMethod:
    def __init__(self, name):
        self.name = name
        self.called_methods = []
        self.nested_components = []


class ArkTSProject:
    def __init__(self, project_path):
        self.project_path = project_path
        self.files = []
    
    def analyze(self):
        for root, dirs, files in os.walk(self.project_path):
            for file in files:
                if file.endswith(('.ts', '.ets')):
                    file_path = os.path.join(root, file)
                    self._analyze_file(file_path)
    
    def _analyze_file(self, file_path):
        ark_file = ArkTSFile(file_path)
        
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        decorator_pattern = re.compile(r'@(\w+)\s*\n?\s*(class|struct|@Composable)\s+(\w+)')
        class_pattern = re.compile(r'(?:@\w+\s*\n?\s*)?(class|struct)\s+(\w+)')
        
        matches = decorator_pattern.findall(content)
        for decorator, _, class_name in matches:
            cls = ArkTSClass(class_name)
            cls.decorators.append(ArkTSClass(decorator))
            ark_file.classes.append(cls)
        
        class_matches = class_pattern.findall(content)
        for _, class_name in class_matches:
            if not any(c.name == class_name for c in ark_file.classes):
                cls = ArkTSClass(class_name)
                ark_file.classes.append(cls)
        
        method_pattern = re.compile(r'(?:public\s+|private\s+|protected\s+)?(\w+)\s*\(\s*[\w\s,:]*\s*\)\s*(:\s*\w+)?\s*\{')
        method_matches = method_pattern.findall(content)
        for method_name, _ in method_matches:
            if method_name not in ['class', 'struct', 'interface', 'function', 'let', 'const', 'var', 'if', 'else', 'for', 'while']:
                method = ArkTSMethod(method_name)
                for cls in ark_file.classes:
                    cls.methods.append(method)
        
        self.files.append(ark_file)


class Neo4jConnector:
    def __init__(self, password):
        self.driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", password))
    
    def close(self):
        self.driver.close()
    
    def clear_graph(self):
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
    
    def build_graph(self, project):
        print("📦 正在存储文件节点...")
        for file in project.files:
            with self.driver.session() as session:
                session.run("MERGE (f:File {path: $path})", path=file.path)
                
                for cls in file.classes:
                    is_component = any(d.name in ["Component", "Entry", "Page", "Composable"] for d in cls.decorators)
                    is_entry = any(d.name == "Entry" for d in cls.decorators)
                    
                    node_type = "Component" if is_component else "Class"
                    session.run(f"""
                        MERGE (c:{node_type} {{name: $name, file: $file}})
                        SET c.is_entry = $is_entry
                    """, name=cls.name, file=file.path, is_entry=is_entry)
                    
                    session.run("""
                        MATCH (f:File {path: $file}), (c {name: $name})
                        MERGE (f)-[:包含]->(c)
                    """, file=file.path, name=cls.name)
                    
                    for method in cls.methods:
                        session.run("""
                            MERGE (m:Method {name: $name, class: $cls})
                        """, name=method.name, cls=cls.name)
                        
                        session.run("""
                            MATCH (c {name: $cls}), (m:Method {name: $name})
                            MERGE (c)-[:包含]->(m)
                        """, cls=cls.name, name=method.name)


def build_knowledge_graph(project_path, neo4j_password):
    print("🔍 正在解析你的鸿蒙项目...")
    
    project = ArkTSProject(project_path)
    project.analyze()
    
    print(f"📊 解析完成：共 {len(project.files)} 个文件，{sum(len(f.classes) for f in project.files)} 个类/组件")
    
    connector = Neo4jConnector(neo4j_password)
    connector.clear_graph()
    connector.build_graph(project)
    connector.close()
    
    print("✅ 知识图谱构建完成！")
    print("👉 打开 http://localhost:7474 查看可视化结果")


def ask_ai(question, neo4j_password, openai_api_key):
    if not OPENAI_AVAILABLE:
        print("❌ 需要安装 openai 库：pip install openai")
        return []
    
    client = OpenAI(api_key=openai_api_key)
    
    schema = """
    图谱里有这些东西：
    - File(文件)：path(路径)
    - Class(类)：name(名称), file(所在文件)
    - Component(组件)：name(名称), file(所在文件), is_entry(是不是入口页面)
    - Method(函数)：name(名称), class(所属类)
    
    关系：
    - 包含：文件→类/组件，类/组件→函数
    - 调用：函数→函数
    - 包含组件：父组件→子组件
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"""
            根据以下Schema，将用户问题转换为Cypher查询语句。
            只返回Cypher代码，不要任何解释。
            
            Schema:
            {schema}
            
            问题: {question}
        """}]
    )
    
    cypher = response.choices[0].message.content.strip()
    print(f"\n生成的查询: {cypher}")
    
    connector = Neo4jConnector(neo4j_password)
    with connector.driver.session() as session:
        result = session.run(cypher)
        connector.close()
        return [record.data() for record in result]


if __name__ == "__main__":
    if not os.path.exists(PROJECT_PATH):
        print(f"❌ 项目路径不存在: {PROJECT_PATH}")
        print("请修改 PROJECT_PATH 变量为你的鸿蒙项目路径")
        exit(1)
    
    build_knowledge_graph(PROJECT_PATH, NEO4J_PASSWORD)
    
    if OPENAI_API_KEY and OPENAI_API_KEY != "你的API密钥":
        print("\n=== AI查询示例 ===")
        print("问题：列出所有入口页面")
        print("结果：", ask_ai("列出所有is_entry为true的Component", NEO4J_PASSWORD, OPENAI_API_KEY))
        
        print("\n问题：UserPage组件包含哪些子组件？")
        print("结果：", ask_ai("UserPage组件包含哪些子组件？", NEO4J_PASSWORD, OPENAI_API_KEY))