import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import projectRoutes, { setNeo4jService } from './routes/project.js';
import graphRoutes, { setServices } from './routes/graph.js';
import { Neo4jService } from './services/neo4jService.js';
import { LLMService } from './services/llmService.js';
import type { GraphData, ProjectStats } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let neo4jService: Neo4jService | null = null;
let llmService: LLMService | null = null;
let latestGraphData: GraphData | null = null;
let latestStats: ProjectStats | null = null;

export async function initServices(config: {
  neo4jUri?: string;
  neo4jUser?: string;
  neo4jPassword?: string;
  openaiApiKey?: string;
}) {
  try {
    neo4jService = new Neo4jService({
      uri: config.neo4jUri || 'bolt://localhost:7687',
      user: config.neo4jUser || 'neo4j',
      password: config.neo4jPassword || '12345678'
    });
    
    await neo4jService.connect();
    setNeo4jService(neo4jService);
    
    if (config.openaiApiKey) {
      llmService = new LLMService(config.openaiApiKey);
    }
    
    setServices(neo4jService, llmService);
    
    console.log('✅ Services initialized');
  } catch (error) {
    console.warn('⚠️ Neo4j connection failed, running without database:', (error as Error).message);
  }
}

export function getNeo4jService() {
  return neo4jService;
}

export function setLatestData(graphData: GraphData, stats: ProjectStats) {
  latestGraphData = graphData;
  latestStats = stats;
}

export function getLatestData() {
  return { graphData: latestGraphData, stats: latestStats };
}

app.use('/api/project', projectRoutes);
app.use('/api/graph', graphRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running'
  });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;
