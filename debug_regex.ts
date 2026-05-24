const testContent = `export class $DollarClass {
  normalMethod() {}
  $dollarMethod() {}
}`;

console.log('测试 1: 原正则');
const regex1 = /\b(?:public|private|protected|static)?\s*(?:async\s+)?([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
console.log('  正则:', regex1);
let match;
while ((match = regex1.exec(testContent)) !== null) {
  console.log(`  Match: ${match[1]} at ${match.index}`);
}

console.log('\n测试 2: 用 [\\s;{ 开头');
const regex2 = /(?:^|\s|;|{)(?:public|private|protected|static)?\s*(?:async\s+)?([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
console.log('  正则:', regex2);
regex2.lastIndex = 0;
while ((match = regex2.exec(testContent)) !== null) {
  console.log(`  Match: ${match[1]} at ${match.index}`);
}

console.log('\n测试 3: (?<![\\w$]) 负向断言');
const regex3 = /(?<![\w$])(?:public|private|protected|static)?\s*(?:async\s+)?([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
console.log('  正则:', regex3);
regex3.lastIndex = 0;
while ((match = regex3.exec(testContent)) !== null) {
  console.log(`  Match: ${match[1]} at ${match.index}`);
}

console.log('\n测试 4: 分开处理');
const regex4 = /(?:\s|^|;|{)\s*(?:public|private|protected|static)?\s*(?:async\s+)?([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
console.log('  正则:', regex4);
regex4.lastIndex = 0;
while ((match = regex4.exec(testContent)) !== null) {
  console.log(`  Match: ${match[1]} at ${match.index}`);
}
