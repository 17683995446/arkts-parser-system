import * as fs from 'fs';

const content = fs.readFileSync('./comprehensive-test/src/boundary20_long_names.ets', 'utf-8');
console.log('原始内容:');
console.log(content);

function preprocess(content: string): string {
  const result: string[] = new Array(content.length).fill(' ');
  
  let inString: string | null = null;
  let inComment: string | null = null;
  let escapeNext = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = i < content.length - 1 ? content[i + 1] : '';
    
    if (char === '\n' && inString !== null && inString !== '`') {
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
  
  return result.join('');
}

const cleaned = preprocess(content);
console.log('\n预处理后:');
console.log(cleaned);

console.log('\n匹配结果:');
const classPattern = /(?:^|\s+)(?:export\s+)?(class|struct)\s+(\w+)/g;
let match;
while ((match = classPattern.exec(cleaned)) !== null) {
  console.log(`  ${match[2]} at ${match.index}`);
}
