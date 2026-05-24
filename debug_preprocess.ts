import * as fs from 'fs';

console.log('🔍 专门测试tricky.ets的预处理');
const content = fs.readFileSync('./round2-mega-test/src/tricky.ets', 'utf8');
console.log('Original:', JSON.stringify(content));

function preprocessContent(content: string) {
  const result: string[] = new Array(content.length).fill(' ');
  
  let inString: string | null = null; 
  let inComment: string | null = null; 
  let inRegex: boolean = false;
  let escapeNext = false;
  let lastNewlinePos = 0;
  
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
    
    if (char === '\\' && (inString !== null || inRegex)) {
      escapeNext = true;
      continue;
    }
    
    // 处理注释
    if (inComment === null && inString === null && !inRegex) {
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
    
    // 处理字符串
    if (inComment === null && !inRegex) {
      if (inString === null) {
        if (char === "'") { inString = "'"; continue; }
        if (char === '"') { inString = '"'; continue; }
        if (char === '`') { inString = '`'; continue; }
      } else if (inString === char) {
        inString = null;
        continue;
      }
    }
    
    // 处理正则表达式 - 详细打印调试信息
    if (inComment === null && inString === null && char === '/') {
      console.log(`[${i}] Found /, checking possible regex start`);
      const possibleRegexStarts = [' ', '\n', '\r', '\t', '(', '[', '{', ',', ';', '=', '?', '!', ':', '&', '|', '+', '-', '*', '/', '%'];
      let isRegexStart = true;
      
      let j = i - 1;
      console.log(`  Starting check from j=${j}`);
      while (j >= 0 && (content[j] === ' ' || content[j] === '\t')) {
        console.log(`  Skipping whitespace at j=${j} (char=${JSON.stringify(content[j])})`);
        j--;
      }
      console.log(`  Stopped at j=${j}, char=${JSON.stringify(content[j])}`);
      
      if (j >= 0 && !possibleRegexStarts.includes(content[j])) {
        isRegexStart = false;
        console.log(`  Not a regex start: ${JSON.stringify(content[j])} not in possible starts`);
      } else {
        console.log(`  Is regex start!`);
      }
      
      if (isRegexStart) {
        inRegex = true;
        console.log(`  Entering regex mode at i=${i}`);
        continue;
      }
    }
    
    if (inRegex) {
      console.log(`  [${i}] In regex, char=${JSON.stringify(char)}`);
    }
    
    if (inRegex && char === '/') {
      inRegex = false;
      console.log(`  Exiting regex mode at i=${i}`);
      continue;
    }
    
    if (inComment === '/*' && char === '*' && nextChar === '/') {
      inComment = null;
      i++;
      continue;
    }
    
    if (inComment === '//' && char === '\n') {
      inComment = null;
    }
    
    if (inString === null && inComment === null && !inRegex) {
      result[i] = char;
    } else {
      result[i] = ' ';
    }
  }
  
  return { cleaned: result.join(''), original: content };
}

const { cleaned } = preprocessContent(content);
console.log('\nCleaned:', JSON.stringify(cleaned));
