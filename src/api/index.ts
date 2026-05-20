const API_BASE = '/api';

export async function parseProject(path: string) {
  const response = await fetch(`${API_BASE}/project/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ path })
  });
  
  return response.json();
}

export async function getProjectTree(path: string) {
  const response = await fetch(`${API_BASE}/project/tree?path=${encodeURIComponent(path)}`);
  return response.json();
}

export async function getFileContent(filePath: string, projectPath: string) {
  const response = await fetch(
    `${API_BASE}/project/file?path=${encodeURIComponent(filePath)}&projectPath=${encodeURIComponent(projectPath)}`
  );
  return response.json();
}

export async function getGraphData() {
  const response = await fetch(`${API_BASE}/graph/data`);
  return response.json();
}

export async function getStats() {
  const response = await fetch(`${API_BASE}/graph/stats`);
  return response.json();
}

export async function executeCypher(query: string) {
  const response = await fetch(`${API_BASE}/graph/cypher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  
  return response.json();
}

export async function naturalLanguageQuery(query: string) {
  const response = await fetch(`${API_BASE}/graph/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  
  return response.json();
}
