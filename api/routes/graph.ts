import { Router, Request, Response } from 'express';
import { Neo4jService } from '../services/neo4jService.js';
import { LLMService } from '../services/llmService.js';
import type { QueryGraphRequest } from '../../shared/types.js';
import { getLatestData } from '../app.js';

const router = Router();

let neo4jService: Neo4jService | null = null;
let llmService: LLMService | null = null;

export function setServices(neo4j: Neo4jService, llm?: LLMService) {
  neo4jService = neo4j;
  llmService = llm;
}

// 获取完整图谱数据
router.get('/data', async (req: Request, res: Response) => {
  try {
    // 首先尝试从内存中获取最新数据
    const { graphData } = getLatestData();
    if (graphData) {
      return res.json({
        success: true,
        data: graphData
      });
    }
    
    // 否则尝试从 Neo4j 获取
    if (neo4jService) {
      const data = await neo4jService.getGraphData();
      return res.json({
        success: true,
        data
      });
    }
    
    return res.status(404).json({ 
      success: false, 
      error: 'No graph data available - please parse a project first' 
    });
    
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch graph data' });
  }
});

// 获取统计信息
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // 首先尝试从内存中获取最新数据
    const { stats } = getLatestData();
    if (stats) {
      return res.json({
        success: true,
        stats
      });
    }
    
    // 否则尝试从 Neo4j 获取
    if (neo4jService) {
      const neo4jStats = await neo4jService.getStats();
      return res.json({
        success: true,
        stats: neo4jStats
      });
    }
    
    return res.status(404).json({ 
      success: false, 
      error: 'No stats available - please parse a project first' 
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// 执行 Cypher 查询
router.post('/cypher', async (req: Request, res: Response) => {
  try {
    const { query: cypher } = req.body as { query: string };
    
    if (!neo4jService) {
      return res.status(500).json({ success: false, error: 'Neo4j not connected' });
    }
    
    const results = await neo4jService.executeCypher(cypher);
    
    return res.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error('Error executing cypher:', error);
    return res.status(500).json({ success: false, error: 'Failed to execute cypher' });
  }
});

// 自然语言查询
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body as QueryGraphRequest;
    
    if (!neo4jService) {
      return res.status(500).json({ success: false, error: 'Neo4j not connected' });
    }
    
    let cypher = '';
    let results: any[] = [];
    
    if (llmService) {
      try {
        cypher = await llmService.generateCypher(query);
        results = await neo4jService.executeCypher(cypher);
      } catch (llmError) {
        console.warn('LLM failed, falling back to simple queries');
        // 提供一些预定义查询
        cypher = getFallbackQuery(query);
        if (cypher) {
          results = await neo4jService.executeCypher(cypher);
        }
      }
    } else {
      cypher = getFallbackQuery(query);
      if (cypher) {
        results = await neo4jService.executeCypher(cypher);
      }
    }
    
    return res.json({
      success: true,
      cypher,
      results
    });
    
  } catch (error) {
    console.error('Error processing query:', error);
    return res.status(500).json({ success: false, error: 'Failed to process query' });
  }
});

function getFallbackQuery(nlQuery: string): string {
  const query = nlQuery.toLowerCase();
  
  if (query.includes('entry') || query.includes('入口')) {
    return 'MATCH (c:Component {isEntry: true}) RETURN c';
  }
  if (query.includes('component') || query.includes('组件')) {
    return 'MATCH (c:Component) RETURN c';
  }
  if (query.includes('file') || query.includes('文件')) {
    return 'MATCH (f:File) RETURN f';
  }
  if (query.includes('method') || query.includes('方法')) {
    return 'MATCH (m:Method) RETURN m';
  }
  
  return 'MATCH (n) RETURN n LIMIT 20';
}

export default router;
