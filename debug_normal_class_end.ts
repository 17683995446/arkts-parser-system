import * as fs from 'fs';

console.log('🔍 Debugging: Why NormalClass endPos is wrong?');
console.log('='.repeat(70));

const content = fs.readFileSync('./round2-mega-test/src/tricky.ets', 'utf8');

function preprocessContent(content: string) {
  const result: string[] = new Array(content.length).fill(' ');
  let inString: string | null = null;
  let inComment: string | null = null;
  let escapeNext = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = i < content.length - 1 ? content[i + 1] : '';
    
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\' && inString !== null) { escapeNext = true; continue; }
    
    if (inComment === null && inString === null) {
      if (char === '/' && nextChar === '/') { inComment = '//'; i++; continue; }
      if (char === '/' && nextChar === '*') { inComment = '/*'; i++; continue; }
    }
    
    if (inComment === null) {
      if (inString === null) {
        if (char === "'") { inString = "'"; continue; }
        if (char === '"') { inString = '"'; continue; }
        if (char === '`') { inString = '`'; continue; }
      } else if (inString === char) { inString = null; continue; }
    }
    
    if (inComment === '/*' && char === '*' && nextChar === '/') { inComment = null; i++; continue; }
    if (inComment === '//' && char === '\n') { inComment = null; }
    
    if (inString === null && inComment === null) {
      result[i] = char;
    }
  }
  return { cleaned: result.join(''), original: content };
}

const { cleaned } = preprocessContent(content);

// Now find NormalClass and calculate endPos:
console.log('Finding NormalClass and calculating endPos');

// Find NormalClass start
const classPattern = /(?:^|\s+)(?:export\s+)?(class|struct)\s+([\w$]+)/g;
let match = classPattern.exec(cleaned);
if (match && match[2] === 'NormalClass') {
  const classStart = match.index;
  console.log('NormalClass starts at', classStart);
  
  // Find first { in cleaned
  let braceIndex = cleaned.indexOf('{', classStart);
  console.log('First { in cleaned:', braceIndex);
  
  let braceCount = 1;
  let endPos = content.length;
  
  console.log('Starting brace counting...');
  for (let k = braceIndex + 1; k < content.length; k++) {
    const cleanedChar = cleaned[k];
    const originalChar = content[k];
    // console.log(`k: ${k}, cleaned: ${JSON.stringify(cleanedChar)}, original: ${JSON.stringify(originalChar)}, braceCount: ${braceCount}`);
    if (cleanedChar === '{') {
      braceCount++;
      console.log(`  k: ${k}, found {, braceCount: ${braceCount}`);
    } else if (cleanedChar === '}') {
      braceCount--;
      console.log(`  k: ${k}, found }, braceCount: ${braceCount}`);
      if (braceCount === 0) {
        endPos = k + 1;
        console.log(`✅ Found matching } at ${k}, endPos: ${endPos}`);
        break;
      }
    }
  }
  
  console.log('NormalClass endPos:', endPos);
  
  // Now check what's after endPos!
  console.log('\nContent after NormalClass endPos:');
  console.log('---');
  console.log(content.substring(endPos, endPos + 200));
  console.log('---');
}
