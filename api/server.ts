/**
 * local server entry file, for local development
 */
import app, { initServices } from './app.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

async function startServer() {
  // 初始化服务
  await initServices({
    neo4jUri: process.env.NEO4J_URI,
    neo4jUser: process.env.NEO4J_USER,
    neo4jPassword: process.env.NEO4J_PASSWORD,
    openaiApiKey: process.env.OPENAI_API_KEY
  });
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server ready on port ${PORT}`);
    console.log(`📊 API endpoints:
  - POST /api/project/parse
  - GET /api/project/file
  - GET /api/project/tree
  - GET /api/graph/data
  - GET /api/graph/stats
  - POST /api/graph/cypher
  - POST /api/graph/query
    `);
  });
  
  /**
   * close server
   */
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

startServer();

export default app;