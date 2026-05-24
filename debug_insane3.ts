
import { ParserService } from './api/services/parserService.js';
import * as fs from 'fs';

console.log('🔍 调试 insane3.ets...');
const content = fs.readFileSync('./insane-chaos-test/src/insane3.ets', 'utf-8');

// 模拟预处理
function debugPreprocess(content: string): { cleaned: string } {
  const result: string[] = new Array(content.length).fill(' ');
    
  let inString: string | null = null;
  let inComment: string | null = null;
  let escapeNext = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = i < content.length - 1 ? content[i + 1] : '';
    
    if (char === '\n' && inString !== null) {
      inString = null;
    }
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\' && inString !== null) {
      escapeNext = true;
      continue;
    }
    
    if (inComment === null && inString === null) {
      if (char === '/' && nextChar === '/') {
        inComment = '//';
        i++;
        continue;
      }
      if (char === '/' && nextChar === '*') {
        inComment = '/*';
        i++;
        continue;
      }
    }
    
    if (inComment === null) {
      if (inString === null) {
        if (char === "'") { inString = "'"; continue; }
        if (char === '"') { inString = '"'; continue; }
        if (char === '`') { inString = '`'; continue; }
      } else if (inString === char) {
        inString = null;
        continue;
      }
    }
    
    if (inComment === '/*' && char === '*' && nextChar === '/') {
      inComment = null;
      i++;
      continue;
    }
    
    if (inComment === '//' && char === '\n') {
      inComment = null;
    }
    
    if (inString === null && inComment === null) {
      result[i] = char;
    } else {
      result[i] = ' ';
    }
  }
  
  return { cleaned: result.join('') };
}

const { cleaned } = debugPreprocess(content);
console.log('📜 预处理后的内容:');
console.log(cleaned);

console.log('\n🔎 匹配的内容:');
const classPattern = /(?:^|\s+)(?:export\s+)?(class|struct)\s+(\w+)/g;
let match;
while ((match = classPattern.exec(cleaned)) !== null) {
  console.log(`  找到: ${match[2]} at ${match.index}`);
  console.log(`  上下文: "${cleaned.substring(Math.max(0, match.index - 20), Math.min(cleaned.length, match.index + 30))}"`);
}
