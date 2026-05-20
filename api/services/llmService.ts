import OpenAI from 'openai';

export class LLMService {
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  public async generateCypher(naturalLanguageQuery: string): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    const schema = `
      Knowledge Graph Schema:
      
      Nodes:
      - File: {id: string, name: string, path: string}
      - Class: {id: string, name: string, file: string}
      - Component: {id: string, name: string, file: string, isEntry: boolean}
      - Method: {id: string, name: string, class: string}
      
      Relationships:
      - CONTAINS: File -> Class/Component, Class/Component -> Method
      - CALLS: Method -> Method
      - CONTAINS_COMPONENT: Component -> Component
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a Cypher query generator for Neo4j. 
          Given a natural language query, convert it to a Cypher statement.
          Only return the Cypher query, no explanations.
          Use the following schema:
          ${schema}`
        },
        {
          role: 'user',
          content: naturalLanguageQuery
        }
      ],
      temperature: 0
    });

    const cypher = response.choices[0].message.content || '';
    return cypher.trim();
  }
}
