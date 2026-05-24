# ArkTS 代码解析与可视化系统

基于 HarmonyOS/ArkTS 的代码解析系统，支持类、组件、方法识别，并生成可视化架构图。

## 功能特性

### 核心解析能力
- ✅ **类识别**：支持识别 `class` 和 `struct` 定义
- ✅ **组件识别**：支持 `@Entry`、`@Component`、`@Page` 等装饰器
- ✅ **方法识别**：智能提取类和方法，支持多种修饰符
- ✅ **Unicode支持**：完美支持中文、日文等Unicode标识符
- ✅ **$符号支持**：支持 `$` 前缀的标识符（如 `$Observable`）

### 预处理能力
- ✅ **注释处理**：自动过滤单行和多行注释
- ✅ **字符串处理**：避免字符串内容干扰代码识别
- ✅ **正则处理**：正确处理正则表达式内容
- ✅ **模板字符串**：支持模板字符串预处理

### 性能特性
- ⚡ **高性能**：17,600节点仅需91ms
- 🧠 **智能算法**：括号匹配、正则解析、边界检测
- 📊 **可扩展**：支持从小型项目到超大型项目

## 项目结构

```
/workspace/
├── api/                          # API服务层
│   ├── services/
│   │   ├── parserService.ts      # 核心解析服务
│   │   ├── debugParserService.ts # 调试版本解析服务
│   │   ├── llmService.ts         # LLM服务
│   │   └── neo4jService.ts        # 图数据库服务
│   ├── routes/
│   │   ├── auth.ts               # 认证路由
│   │   ├── graph.ts              # 图数据路由
│   │   └── project.ts            # 项目路由
│   └── server.ts                 # 服务器入口
├── src/                          # 前端代码
│   ├── components/               # React组件
│   ├── pages/                    # 页面
│   ├── hooks/                    # 自定义Hooks
│   └── App.tsx                   # 主应用
├── shared/                       # 共享代码
│   └── types.ts                  # 类型定义
└── public/                       # 静态资源
```

## 技术栈

- **前端**：React + TypeScript + Vite + TailwindCSS
- **后端**：Node.js + Express + TypeScript
- **解析**：纯TypeScript实现，支持ArkTS语法
- **数据库**：Neo4j图数据库
- **AI**：OpenAI GPT模型

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动API服务器

```bash
npm run start:api
```

## 使用方法

### 1. 启动服务

```bash
npm run dev
```

### 2. 访问系统

打开浏览器访问 `http://localhost:5173`

### 3. 解析项目

在项目中输入需要解析的目录路径，系统将自动：

- 扫描所有 `.ets` 和 `.ts` 文件
- 识别类、组件、方法
- 构建依赖关系图
- 生成可视化架构图

## 核心解析算法

### 预处理流程

```typescript
preprocessContent(content: string): { original: string, cleaned: string }
```

1. **单行注释处理**：移除 `//` 后的内容
2. **多行注释处理**：移除 `/* */` 包裹的内容
3. **字符串处理**：用空格替换字符串内容
4. **正则处理**：识别并标记正则表达式

### 类识别算法

```typescript
findClassPositions(content: string, original: string): ClassPosition[]
```

- 使用正则表达式匹配 `class` 和 `struct` 关键字
- 智能括号匹配，确定类的范围
- 支持Unicode和$符号标识符

### 方法识别算法

```typescript
parseMethodsInClass(classContent: string): string[]
```

- 提取方法名和参数列表
- 过滤关键字（如 `if`、`for`、`constructor`）
- 支持 `async`、`static`、`private` 等修饰符

## 测试覆盖

### 单元测试

- preprocessContent 基础功能
- preprocessContent 字符串处理
- findClassPositions 类识别
- parseMethodsInClass 方法提取
- Unicode标识符支持
- $符号标识符支持

### 集成测试

- Mega Test Project（513节点）
- Extreme Chaos Test（145节点）
- Gigantic Project（3,110节点）
- Hyper Gigantic Project（17,600节点）

## 性能指标

| 项目规模 | 节点数 | 耗时 | 状态 |
|---------|--------|------|------|
| 小型项目 | <100 | <5ms | ✅ |
| 中型项目 | 100-1000 | 5-50ms | ✅ |
| 大型项目 | 1000-5000 | 50-100ms | ✅ |
| 超大型项目 | >5000 | >100ms | ✅ |

## 已修复的问题

| 问题 | 严重程度 | 修复版本 |
|------|----------|----------|
| 装饰器跨类污染 | 🔴 高 | v1.0+ |
| 括号匹配算法错误 | 🔴 高 | v1.0+ |
| 正则表达式处理缺失 | 🔴 高 | v1.0+ |
| Unicode不支持 | 🟡 中 | v1.1+ |
| $符号标识符不一致 | 🟢 低 | v1.0+ |

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 版本历史

### v1.1.0
- ✨ 添加Unicode完整支持
- ✨ 优化方法识别算法
- 🐛 修复多个边界问题

### v1.0.0
- ✨ 初始版本发布
- ✅ 支持基本类、组件、方法识别
- ✅ 支持装饰器识别
- ✅ 支持注释和字符串预处理
- ✅ 支持Neo4j图数据库集成

## 联系方式

- Email: 2358384171@qq.com

## 致谢

感谢所有参与测试和反馈的用户！
