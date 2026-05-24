# 系统全面测试分析文档

## 一、架构拆解

### 1.1 模块分层结构

```
┌─────────────────────────────────────────────────────────┐
│                      前端层 (React)                     │
├─────────────────────────────────────────────────────────┤
│  Pages: Dashboard, Graph, Explorer, Query, Settings    │
│  Components: GraphVisualization, Sidebar, Empty        │
│  State: Zustand Store                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API 路由层 (Express)                    │
├─────────────────────────────────────────────────────────┤
│  Routes: /api/project (parse, file, tree)               │
│          /api/graph (query, stats)                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   核心服务层                              │
├─────────────────────────────────────────────────────────┤
│  ParserService: ArkTS 代码解析                           │
│  Neo4jService: 图数据库交互                              │
│  LLMService: AI 自然语言查询处理                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   数据存储层                              │
├─────────────────────────────────────────────────────────┤
│  Neo4j Graph Database: 知识图谱持久化                     │
│  内存: latestGraphData, latestStats                     │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心调用链路

**解析流程：**
`parse() → walkDirectory() → parseFile() → parseFileContent() 
→ preprocessContent() → findClassPositions() 
→ parseMethodsInClass() / parseTopLevelFunctions()
→ nodes Map + links Array → 返回 GraphData`

**Neo4j 导入流程：**
`importGraphData() → clearGraph() 
→ import nodes (MERGE) + import links (MERGE)`

## 二、参数规则和边界条件

### 2.1 ParserService

| 参数 | 类型 | 约束 | 边界情况 |
|------|------|------|----------|
| projectPath | string | 必须存在且可读 | 不存在路径 → 警告并返回空数据 |
| filePath | string | 以 .ts 或 .ets 结尾 | 其他扩展名被跳过 |
| content | string | 任意长度 | 空内容 → 正常处理（无节点） |
| classStart | number | 必须 >= 0 | 无匹配 → 空数组 |
| braceIndex | number | 必须 >= 0 | 无括号 → endPos = content.length |

### 2.2 skipKeywords 集合

- **UI 组件**: 30 个 HarmonyOS UI 组件 (Row, Column, Text, etc.)
- **样式属性**: 40+ 个样式属性 (fontSize, width, height, etc.)
- **全局对象**: Math, String, Array, Object, Date, JSON, RegExp, Promise, etc.
- **语言关键字**: class, struct, function, constructor, etc.
- **总数**: 约 180+ 关键词

### 2.3 isValidMethodName 检查规则

1. 已存在检查
2. skipKeywords 黑名单检查
3. 长度检查: < 2 → invalid
4. 全大写常量检查: /^[A-Z][A-Z0-9_]*$/ → invalid
5. $ 前缀检查: startsWith('$') → invalid
6. 数字开头检查: /^\d/ → invalid

## 三、静态代码核验 - 发现的问题

### 🔴 严重问题

1. **$ 前缀类被正确识别，但 $ 前缀方法被过滤**:
   - `$DollarStart` 类现在可以被正确识别（已修复）
   - 但 `$dollarMethod()` 方法会被 `isValidMethodName()` 中的 `if (name.startsWith('$')) return false;` 过滤掉
   - **问题**: 命名一致性矛盾

2. **未闭合多行注释会把整个文件变为注释**:
   - `/*` 开头但没有 `*/` 结尾的注释会把整个文件变成注释
   - 没有超时或强制结束机制

### 🟡 中等问题

3. **类名验证不完全**:
   - `invalidNames` 只有 'method', 'function', 'class', 'type', 'interface', 'in', 'test', 'NotARealClass', 'NotARealComponent'
   - 但 'struct', 'namespace', 'type' 等也应被添加

4. **preprocessContent 未处理正则表达式**:
   - 正则表达式 `/pattern/g` 中的内容会干扰类/方法识别
   - 但正则表达式本身不被处理

### 🟢 轻微问题

5. **无限循环防护缺失**:
   - `findClassPositions()` 和 `parseMethodsInClass()` 中的 `while ((match = pattern.exec(...)))`
   - 如果正则有 bug 可能导致无限循环

6. **错误处理过于简单**:
   - `parseFile()` 中的 `try-catch` 只是打印警告
   - 没有详细的错误信息记录

## 四、测试计划

### 4.1 单元测试覆盖

- ✅ isValidMethodName 边界测试
- ✅ preprocessContent 各种字符串/注释混合场景
- ✅ findClassPositions 各种类定义格式
- ✅ parseMethodsInClass 各种方法声明
- ✅ walkDirectory 边界条件
- ✅ parse 完整流程

### 4.2 集成测试

- ✅ ParserService + Neo4jService 完整导入
- ✅ API 接口正常工作
- ✅ 大数据量压力测试

### 4.3 异常场景

- ✅ 不存在路径
- ✅ 无法读取的文件
- ✅ 损坏的代码文件
- ✅ 未闭合字符串/注释
- ✅ 极端命名情况

## 五、数据流向图

```
用户输入项目路径
    ↓
[walkDirectory] → 遍历文件夹
    ↓
[parseFile] → 每个文件创建 File 节点
    ↓
[preprocessContent] → 清理代码（移除注释/字符串）
    ↓
[findClassPositions] → 定位类/组件位置
    ↓
[parseMethodsInClass] → 解析类内方法
    ↓
[parseTopLevelFunctions] → 解析顶级函数
    ↓
[nodes Map] + [links Array] 构建完成
    ↓
[parse()] 返回 GraphData
    ↓
可选: [Neo4jService.importGraphData()] 存入数据库
```

## 六、隐藏逻辑发现

1. **装饰器搜索范围优化**: 从前一个类结束位置开始，而非固定 200 字符
2. **非反引号字符串换行时自动结束**: 避免未闭合单/双引号字符串影响后续代码
3. **方法名去重**: 使用 Set 防止同一方法被多次添加
4. **顶级函数位置检查**: 确保函数不在类内部被误识别

## 七、待验证假设

1. `$` 前缀方法是否需要过滤？
2. Unicode 字符类名/方法名是否都能识别？
3. 超大文件 (>100k 行) 是否性能可接受？
4. 极深嵌套的类结构能否被正确处理？
5. 多个 @Builder 装饰器在同一类中是否会正确添加所有方法？
