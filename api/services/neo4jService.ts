import neo4j, { Driver, Session, Record } from 'neo4j-driver';
import type { FileNode, GraphLink, GraphData, ProjectStats, Neo4jConfig } from '../../shared/types.js';

export class Neo4jService {
  private driver: Driver | null = null;
  private config: Neo4jConfig;

  constructor(config: Neo4jConfig) {
    this.config = config;
  }

  public async connect(): Promise<void> {
    try {
      this.driver = neo4j.driver(
        this.config.uri,
        neo4j.auth.basic(this.config.user, this.config.password)
      );
      await this.driver.verifyConnectivity();
      console.log('✅ Connected to Neo4j successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Neo4j:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      console.log('👋 Disconnected from Neo4j');
    }
  }

  private getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not connected');
    }
    return this.driver.session();
  }

  public async clearGraph(): Promise<void> {
    const session = this.getSession();
    try {
      await session.run('MATCH (n) DETACH DELETE n');
      console.log('🗑️ Graph cleared');
    } finally {
      await session.close();
    }
  }

  public async importGraphData(data: GraphData): Promise<void> {
    const session = this.getSession();
    try {
      await this.clearGraph();
      
      // 导入节点
      for (const node of data.nodes) {
        const cypher = `
          MERGE (n:${node.type} {id: $id})
          SET n.name = $name,
              n.path = $path,
              n.file = $file,
              n.class = $class,
              n.isEntry = $isEntry
        `;
        await session.run(cypher, {
          id: node.id,
          name: node.name,
          path: node.path || null,
          file: node.file || null,
          class: node.class || null,
          isEntry: node.isEntry || null
        });
      }

      // 导入关系
      for (const link of data.links) {
        let relType: string;
        switch (link.type) {
          case '包含':
            relType = 'CONTAINS';
            break;
          case '调用':
            relType = 'CALLS';
            break;
          case '包含组件':
            relType = 'CONTAINS_COMPONENT';
            break;
          default:
            relType = 'RELATED';
        }
        
        const cypher = `
          MATCH (a {id: $source}), (b {id: $target})
          MERGE (a)-[r:${relType}]->(b)
          SET r.type = $type
        `;
        await session.run(cypher, {
          source: link.source,
          target: link.target,
          type: link.type
        });
      }
      
      console.log('📊 Graph data imported');
    } finally {
      await session.close();
    }
  }

  public async getGraphData(): Promise<GraphData> {
    const session = this.getSession();
    try {
      const nodes: FileNode[] = [];
      const links: GraphLink[] = [];

      // 获取所有节点
      const nodeResult = await session.run(`
        MATCH (n)
        RETURN n, labels(n) as labels
      `);
      
      for (const record of nodeResult.records) {
        const n = record.get('n');
        const labels = record.get('labels') as string[];
        nodes.push({
          id: n.properties.id,
          type: labels[0] as any,
          name: n.properties.name,
          path: n.properties.path,
          file: n.properties.file,
          class: n.properties.class,
          isEntry: n.properties.isEntry
        });
      }

      // 获取所有关系
      const linkResult = await session.run(`
        MATCH (a)-[r]->(b)
        RETURN a.id as source, b.id as target, r.type as type
      `);
      
      for (const record of linkResult.records) {
        links.push({
          source: record.get('source'),
          target: record.get('target'),
          type: record.get('type') || '包含'
        });
      }

      return { nodes, links };
    } finally {
      await session.close();
    }
  }

  public async getStats(): Promise<ProjectStats> {
    const session = this.getSession();
    try {
      const files = await this.countNodes(session, 'File');
      const classes = await this.countNodes(session, 'Class');
      const components = await this.countNodes(session, 'Component');
      const methods = await this.countNodes(session, 'Method');
      const entries = await this.countNodesWithProperty(session, 'Component', 'isEntry', true);
      
      return { files, classes, components, methods, entries };
    } finally {
      await session.close();
    }
  }

  private async countNodes(session: Session, label: string): Promise<number> {
    const result = await session.run(`MATCH (n:${label}) RETURN count(n) as count`);
    return result.records[0].get('count').toNumber();
  }

  private async countNodesWithProperty(session: Session, label: string, prop: string, value: any): Promise<number> {
    const result = await session.run(`MATCH (n:${label} {${prop}: $value}) RETURN count(n) as count`, { value });
    return result.records[0].get('count').toNumber();
  }

  public async executeCypher(cypher: string): Promise<any[]> {
    const session = this.getSession();
    try {
      const result = await session.run(cypher);
      return result.records.map(r => r.toObject());
    } finally {
      await session.close();
    }
  }
}
