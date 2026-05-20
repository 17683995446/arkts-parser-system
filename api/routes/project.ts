import { Router, Request, Response } from 'express';
import { ParserService } from '../services/parserService.js';
import { Neo4jService } from '../services/neo4jService.js';
import type { ParseProjectRequest } from '../../shared/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { setLatestData } from '../app.js';

const router = Router();

let neo4jService: Neo4jService | null = null;

export function setNeo4jService(service: Neo4jService) {
  neo4jService = service;
}

// 解析项目
router.post('/parse', async (req: Request, res: Response) => {
  try {
    const { path: projectPath } = req.body as ParseProjectRequest;
    
    if (!projectPath || !fs.existsSync(projectPath)) {
      return res.status(400).json({ success: false, error: 'Invalid project path' });
    }
    
    // 解析项目
    const parser = new ParserService(projectPath);
    const graphData = parser.parse();
    
    // 计算统计数据
    const stats = {
      files: graphData.nodes.filter(n => n.type === 'File').length,
      classes: graphData.nodes.filter(n => n.type === 'Class').length,
      components: graphData.nodes.filter(n => n.type === 'Component').length,
      methods: graphData.nodes.filter(n => n.type === 'Method').length,
      entries: graphData.nodes.filter(n => n.type === 'Component' && n.isEntry).length
    };
    
    // 保存最新数据到内存
    setLatestData(graphData, stats);
    
    // 导入到 Neo4j (如果可用)
    if (neo4jService) {
      try {
        await neo4jService.importGraphData(graphData);
      } catch (neo4jError) {
        console.warn('⚠️ Neo4j import failed:', (neo4jError as Error).message);
      }
    }
    
    return res.json({
      success: true,
      stats,
      data: graphData
    });
    
  } catch (error) {
    console.error('Error parsing project:', error);
    return res.status(500).json({ success: false, error: 'Failed to parse project' });
  }
});

// 获取文件内容
router.get('/file', async (req: Request, res: Response) => {
  try {
    const { path: filePath, projectPath } = req.query as { path: string; projectPath: string };
    
    if (!filePath || !projectPath) {
      return res.status(400).json({ success: false, error: 'Missing path parameters' });
    }
    
    const fullPath = path.join(projectPath, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    return res.json({
      success: true,
      content,
      path: filePath
    });
    
  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).json({ success: false, error: 'Failed to read file' });
  }
});

// 获取项目文件树
router.get('/tree', async (req: Request, res: Response) => {
  try {
    const { path: projectPath } = req.query as { path: string };
    
    if (!projectPath || !fs.existsSync(projectPath)) {
      return res.status(400).json({ success: false, error: 'Invalid project path' });
    }
    
    const tree = buildFileTree(projectPath, projectPath);
    
    return res.json({
      success: true,
      tree
    });
    
  } catch (error) {
    console.error('Error reading project tree:', error);
    return res.status(500).json({ success: false, error: 'Failed to read project tree' });
  }
});

function buildFileTree(dir: string, root: string): any {
  const result: any = {
    name: path.basename(dir),
    path: path.relative(root, dir),
    type: 'directory',
    children: []
  };
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) continue;
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        result.children.push(buildFileTree(fullPath, root));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.ets'))) {
        result.children.push({
          name: entry.name,
          path: path.relative(root, fullPath),
          type: 'file'
        });
      }
    }
  } catch (error) {
    console.error('Error reading directory:', dir);
  }
  
  return result;
}

export default router;
