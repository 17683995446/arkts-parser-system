import * as fs from 'fs';
import * as path from 'path';

const testFileContent = `export class $DollarClass {
  normalMethod() {}
  $dollarMethod() {}
}`;

const testFile = './temp_dollar_test.ets';
fs.writeFileSync(testFile, testFileContent);

console.log('测试文件内容:');
console.log(testFileContent);
console.log('\n方法识别测试:');

// 测试方法识别正则
const methodPattern1 = /\b(?:public|private|protected|static)?\s*(?:async\s+)?([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;

let match;
console.log('方法匹配结果:');
while ((match = methodPattern1.exec(testFileContent)) !== null) {
  console.log(`  匹配到: ${match[1]} at index ${match.index}`);
  console.log(`  完整匹配: '${match[0]}'`);
}

console.log('\npreprocessContent 后的结果:');

// 模拟 preprocessContent
function preprocess(content: string): { cleaned: string } {
  const result = new Array(content.length).fill(' ');
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

  return { cleaned: result.join('') };
}

const { cleaned } = preprocess(testFileContent);
console.log(cleaned);

console.log('\n清理后再进行方法匹配:');
while ((match = methodPattern1.exec(cleaned)) !== null) {
  console.log(`  匹配到: ${match[1]} at index ${match.index}`);
  console.log(`  完整匹配: '${match[0]}'`);
}

try { fs.rmSync(testFile); } catch (e) {}
