import * as fs from 'fs';

console.log('🔍 Debugging: Why is RealTrickyComponent not being detected as Component?');
console.log('='.repeat(70));

const content = fs.readFileSync('./round2-mega-test/src/tricky.ets', 'utf8');
console.log('Original content:');
console.log('---');
console.log(content);
console.log('---');

console.log('\nStep 1: Simulating preprocessContent');

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
console.log('\nCleaned content:');
console.log('---');
console.log(cleaned);
console.log('---');

// Now find class positions:
console.log('\nStep 2: Simulating classPattern');
const classPattern = /(?:^|\s+)(?:export\s+)?(class|struct)\s+([\w$]+)/g;
let match;
const matches = [];

while ((match = classPattern.exec(cleaned)) !== null) {
  matches.push({
    name: match[2],
    index: match.index,
    fullMatch: match[0]
  });
}
console.log('\nClass matches found:');
console.log(matches);

// Check the decorator search for RealTrickyComponent!
const realTrickyMatch = matches.find(m => m.name === 'RealTrickyComponent');
console.log('\nStep 3: Checking decorator search for RealTrickyComponent');

if (realTrickyMatch) {
  const classStart = realTrickyMatch.index;
  const prevClassEnd = 140; // 我们知道NormalClass在前面结束的位置
  const decoratorSearchStart = Math.max(0, Math.max(prevClassEnd, classStart - 200));
  const decoratorSearchRaw = content.substring(decoratorSearchStart, classStart);
  
  console.log('classStart:', classStart);
  console.log('prevClassEnd (manual estimate):', prevClassEnd);
  console.log('decoratorSearchStart:', decoratorSearchStart);
  console.log('\ndecoratorSearchRaw content (from original):');
  console.log('---');
  console.log(decoratorSearchRaw);
  console.log('---');
  
  console.log('\nThen, preprocess this decoratorSearchRaw to decoratorSearch:');
  const { cleaned: decoratorSearch } = preprocessContent(decoratorSearchRaw);
  console.log('---');
  console.log(decoratorSearch);
  console.log('---');
  
  console.log('Does it have @Entry?', decoratorSearch.includes('@Entry'));
  console.log('Does it have @Component?', decoratorSearch.includes('@Component'));
}
