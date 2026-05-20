# ArkTS 知识图谱可视化平台

把你的 HarmonyOS/ArkTS 项目代码自动转换成可搜索、可查询、可让 AI 理解的知识图谱！

## 特性

- 📊 **自动代码解析**：扫描你的 ArkTS 项目，识别文件、类、组件和方法
- 📈 **交互式知识图谱**：可视化展示代码实体及其关系
- 📁 **代码浏览器**：内置的语法高亮代码查看器
- 🤖 **AI 查询**（可选）：使用自然语言查询你的代码库
- 🎨 **美观的深色主题**：现代化的用户界面设计

## 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + React Router
- **后端**：Express.js + TypeScript
- **图数据库**：Neo4j
- **图谱可视化**：react-force-graph-2d
- **状态管理**：Zustand

## 快速开始

### 前置要求

- Node.js 18+ 
- Neo4j Desktop 或 Neo4j Server
- (可选) OpenAI API Key

### 1. 克隆项目

```bash
git clone <repository-url>
cd arkts-graph
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置 Neo4j

1. 下载并安装 [Neo4j Desktop](https://neo4j.com/download/)
2. 创建一个新项目和数据库
3. 设置密码（默认：12345678）
4. 启动数据库

### 4. 配置环境变量

复制 `.env.example` 为 `.env` 并修改：

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=12345678
OPENAI_API_KEY=your-api-key-here  # 可选
```

### 5. 启动应用

```bash
# 同时启动前端和后端
npm run dev
```

或者分别启动：

```bash
# 前端开发服务器（端口 5173）
npm run client:dev

# 后端服务器（端口 3001）
npm run server:dev
```

### 6. 开始使用

1. 打开浏览器访问 `http://localhost:5173`
2. 进入 **Settings** 页面
3. 配置你的 Neo4j 连接信息
4. 设置你的 ArkTS 项目路径（可以使用示例项目：`/workspace/sample-project`）
5. 回到 **Dashboard**，点击 "Parse Project" 开始解析！

## 使用说明

### 页面功能

1. **Dashboard**：项目概览、快速操作、统计数据
2. **Graph**：交互式知识图谱可视化
3. **Explorer**：代码文件树和语法高亮查看器
4. **AI Query**：自然语言查询代码库
5. **Settings**：配置数据库和项目路径

### 节点类型

- 🟦 **File**：项目文件
- 🟪 **Class**：类定义
- 🟩 **Component**：ArkTS 组件
- 🟨 **Method**：函数和方法

### 快速体验

项目包含一个示例 ArkTS 项目在 `sample-project/` 目录，可以用来测试。

## 项目结构

```
/workspace
├── api/                  # 后端代码
│   ├── routes/          # API 路由
│   ├── services/        # 业务逻辑服务
│   ├── app.ts           # Express 应用
│   └── server.ts        # 服务器入口
├── src/                 # 前端代码
│   ├── components/      # React 组件
│   ├── pages/          # 页面组件
│   ├── store/          # Zustand 状态管理
│   ├── api/            # API 调用工具
│   └── App.tsx         # 主应用
├── shared/             # 共享类型定义
├── sample-project/     # 示例 ArkTS 项目
├── arkts_to_neo4j.py   # 原始 Python 版本
└── .trae/documents/    # 项目文档
```

## API 端点

- `POST /api/project/parse`：解析 ArkTS 项目
- `GET /api/project/tree`：获取项目文件树
- `GET /api/project/file`：获取文件内容
- `GET /api/graph/data`：获取图谱数据
- `GET /api/graph/stats`：获取统计数据
- `POST /api/graph/query`：自然语言查询

## 开发

### 运行类型检查

```bash
npm run check
```

### 构建

```bash
npm run build
```

## License

MIT
