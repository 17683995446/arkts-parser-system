#!/usr/bin/env tsx
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const execAsync = promisify(exec);

const GITHUB_TOKEN = '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';
const REPO_NAME = 'arkts-to-neo4j-parser';
const USER_EMAIL = '2358384171@qq.com';

async function createGitHubRepo() {
  console.log('Creating GitHub repository...');

  const data = JSON.stringify({
    name: REPO_NAME,
    description: 'ArkTS/HarmonyOS Project Parser to Neo4j Knowledge Graph',
    private: true,
    auto_init: false
  });

  const options = {
    hostname: 'api.github.com',
    path: '/user/repos',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'Node.js'
    }
  };

  return new Promise<void>((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log(`GitHub API Response: ${res.statusCode}`);
        if (res.statusCode === 201 || res.statusCode === 422) {
          console.log('Repository created or already exists!');
          resolve();
        } else {
          console.error('Error creating repo:', responseBody);
          reject(new Error(`Failed to create repo, status: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function pushToGitHub() {
  console.log('Pushing to GitHub...');

  const remoteUrl = `https://${GITHUB_TOKEN}@github.com/2358384171/${REPO_NAME}.git`;

  try {
    await execAsync(`git remote add origin ${remoteUrl}`);
  } catch (e) {
    // Remote probably already exists
  }

  await execAsync('git branch -M main');
  await execAsync('git push -u origin main');
  console.log('Successfully pushed to GitHub!');
}

async function main() {
  try {
    await createGitHubRepo();
    await pushToGitHub();
    console.log(`\n🎉 All done! Repository is at: https://github.com/2358384171/${REPO_NAME}`);
  } catch (e) {
    console.error('Error:', (e as Error).message);
  }
}

main();
