// 共享类型定义
export interface FileNode {
  id: string;
  type: 'File' | 'Class' | 'Component' | 'Method';
  name: string;
  path?: string;
  file?: string;
  class?: string;
  isEntry?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  type: '包含' | '调用' | '包含组件';
}

export interface GraphData {
  nodes: FileNode[];
  links: GraphLink[];
}

export interface ProjectStats {
  files: number;
  classes: number;
  components: number;
  methods: number;
  entries: number;
}

// API 请求/响应类型
export interface ParseProjectRequest {
  path: string;
}

export interface ParseProjectResponse {
  success: boolean;
  stats: ProjectStats;
  data: GraphData;
}

export interface QueryGraphRequest {
  query: string;
}

export interface QueryGraphResponse {
  cypher: string;
  results: any[];
}

export interface Neo4jConfig {
  uri: string;
  user: string;
  password: string;
}

export interface AppSettings {
  neo4j: Neo4jConfig;
  openaiApiKey?: string;
  projectPath?: string;
}
