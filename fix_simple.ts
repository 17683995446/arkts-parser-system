import * as fs from 'fs';

const parserFilePath = './api/services/parserService.ts';
let content = fs.readFileSync(parserFilePath, 'utf-8');

// 第一步：替换 braceIndex
content = content.replace(
  "let braceIndex = original.indexOf('{', classStart);", 
  "let braceIndex = cleaned.indexOf('{', classStart);"
);

// 第二步：替换内部循环，检查 cleaned 而不是 original
// 找到 for 循环并替换
const loopMatch = /for \(let k = braceIndex \+ 1; k < original\.length; k\+\+\) \{[\s\S]*?original\[k\] === '\{'[\s\S]*?original\[k\] === '\}'/;
const matchResult = content.match(loopMatch);
if (matchResult) {
  const oldLoop = matchResult[0];
  const newLoop = oldLoop.replace(/original\[k\] === '\{'/g, "cleaned[k] === '{'")
                         .replace(/original\[k\] === '\}'/g, "cleaned[k] === '}'");
  content = content.replace(oldLoop, newLoop);
}

fs.writeFileSync(parserFilePath, content);
console.log('✅ 成功修复！');
