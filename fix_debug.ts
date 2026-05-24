import * as fs from 'fs';

const debugParserPath = './api/services/debugParserService.ts';
let content = fs.readFileSync(debugParserPath, 'utf-8');

content = content.replace(
  "let braceIndex = original.indexOf('{', classStart);", 
  "let braceIndex = cleaned.indexOf('{', classStart);"
);

content = content.replace(
  /for \(let k = braceIndex \+ 1; k < original\.length; k\+\+\) \{[\s\S]*?original\[k\] === '\{'[\s\S]*?original\[k\] === '\}'/g,
  (match) => {
    return match.replace(/original\[k\] === '\{'/g, "cleaned[k] === '{'")
                .replace(/original\[k\] === '\}'/g, "cleaned[k] === '}'");
  }
);

fs.writeFileSync(debugParserPath, content);
console.log('✅ debugParserService.ts 修复成功！');
