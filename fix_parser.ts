import * as fs from 'fs';

const parserFilePath = './api/services/parserService.ts';
let content = fs.readFileSync(parserFilePath, 'utf-8');

// 查找 findClassPositions 函数并替换
const oldFindClassPositions = `  /**
   * 查找类和组件位置 - 使用预处理后的内容
   * 关键改进：装饰器搜索范围限制在前一个类的结束位置之后
   */
  private findClassPositions(cleaned: string, original: string): Array<{
    name: string;
    start: number;
    end: number;
    isComponent: boolean;
    isEntry: boolean;
  }> {
    const results: Array<any> = [];
    const invalidNames = new Set(['method', 'function', 'class', 'type', 'interface', 'in', 'test', 'NotARealClass', 'NotARealComponent']);

    // 在清理后的内容中查找类定义 - 使用边界检查防止假阳性
    // 修复：允许类名包含 $ 字符（\\w+ 改为 [\\w$]+）
    const classPattern = /(?:^|\\s+)(?:export\\s+)?(class|struct)\\s+([\\w$]+)/g;
    let match: RegExpExecArray | null;

    while ((match = classPattern.exec(cleaned)) !== null) {
      const name = match[2];

      if (invalidNames.has(name)) {
        continue;
      }

      const classStart = match.index;

      // 装饰器搜索范围：从前一个类的结束位置之后开始，而不是固定的500字符
      // 这避免装饰器搜索跨越到前一个类的范围
      const prevClassEnd = results.length > 0 ? results[results.length - 1].end : 0;
      const decoratorSearchStart = Math.max(0, Math.max(prevClassEnd, classStart - 200));
      const decoratorSearchRaw = original.substring(decoratorSearchStart, classStart);
      const { cleaned: decoratorSearch } = this.preprocessContent(decoratorSearchRaw);

      let isEntry = false;
      let isComponent = false;

      if (decoratorSearch.includes('@Entry')) {
        isEntry = true;
        isComponent = true;
      }
      if (decoratorSearch.includes('@Component')) {
        isComponent = true;
      }
      if (decoratorSearch.includes('@Page')) {
        isComponent = true;
      }

      let braceCount = 0;
      let braceFound = false;
      let endPos = original.length;
      let braceIndex = original.indexOf('{', classStart);

      if (braceIndex !== -1) {
        braceCount = 1;
        braceFound = true;

        for (let k = braceIndex + 1; k < original.length; k++) {
          if (original[k] === '{') {
            braceCount++;
          } else if (original[k] === '}') {
            braceCount--;
            if (braceCount === 0) {
              endPos = k + 1;
              break;
            }
          }
        }
      }

      results.push({
        name,
        start: classStart,
        end: endPos,
        isComponent,
        isEntry
      });
    }

    return results;
  }`;

const newFindClassPositions = `  /**
   * 查找类和组件位置 - 使用预处理后的内容
   * 关键改进：装饰器搜索范围限制在前一个类的结束位置之后
   */
  private findClassPositions(cleaned: string, original: string): Array<{
    name: string;
    start: number;
    end: number;
    isComponent: boolean;
    isEntry: boolean;
  }> {
    const results: Array<any> = [];
    const invalidNames = new Set(['method', 'function', 'class', 'type', 'interface', 'in', 'test', 'NotARealClass', 'NotARealComponent']);

    // 在清理后的内容中查找类定义 - 使用边界检查防止假阳性
    // 修复：允许类名包含 $ 字符（\\w+ 改为 [\\w$]+）
    const classPattern = /(?:^|\\s+)(?:export\\s+)?(class|struct)\\s+([\\w$]+)/g;
    let match: RegExpExecArray | null;

    while ((match = classPattern.exec(cleaned)) !== null) {
      const name = match[2];

      if (invalidNames.has(name)) {
        continue;
      }

      const classStart = match.index;

      // 装饰器搜索范围：从前一个类的结束位置之后开始，而不是固定的500字符
      // 这避免装饰器搜索跨越到前一个类的范围
      const prevClassEnd = results.length > 0 ? results[results.length - 1].end : 0;
      const decoratorSearchStart = Math.max(0, Math.max(prevClassEnd, classStart - 200));
      const decoratorSearchRaw = original.substring(decoratorSearchStart, classStart);
      const { cleaned: decoratorSearch } = this.preprocessContent(decoratorSearchRaw);

      let isEntry = false;
      let isComponent = false;

      if (decoratorSearch.includes('@Entry')) {
        isEntry = true;
        isComponent = true;
      }
      if (decoratorSearch.includes('@Component')) {
        isComponent = true;
      }
      if (decoratorSearch.includes('@Page')) {
        isComponent = true;
      }

      let braceCount = 0;
      let braceFound = false;
      let endPos = original.length;
      // 🔧 关键修复：在 cleaned 内容中寻找大括号，而不是原始内容，这样不会匹配到字符串或注释中的大括号
      let braceIndex = cleaned.indexOf('{', classStart);

      if (braceIndex !== -1) {
        braceCount = 1;
        braceFound = true;

        // 在原始内容中从找到的 braceIndex 位置处开始找匹配的大括号
        for (let k = braceIndex + 1; k < original.length; k++) {
          // 需要再次检查字符是否在清理后的内容中（即不在字符串或注释中）
          if (cleaned[k] === '{') {
            braceCount++;
          } else if (cleaned[k] === '}') {
            braceCount--;
            if (braceCount === 0) {
              endPos = k + 1;
              break;
            }
          }
        }
      }

      results.push({
        name,
        start: classStart,
        end: endPos,
        isComponent,
        isEntry
      });
    }

    return results;
  }`;

if (content.includes(oldFindClassPositions)) {
  content = content.replace(oldFindClassPositions, newFindClassPositions);
  fs.writeFileSync(parserFilePath, content);
  console.log('✅ 成功修复 findClassPositions 函数！');
} else {
  console.error('❌ 无法找到 findClassPositions 函数进行修复！');
  console.log('🔍 尝试另一种方式查找...');
  
  // 尝试另一种查找方式，只找关键部分
  const oldBracePart = "let braceIndex = original.indexOf('{', classStart);";
  const newBracePart = "let braceIndex = cleaned.indexOf('{', classStart);";
  
  if (content.includes(oldBracePart)) {
    content = content.replace(oldBracePart, newBracePart);
    console.log('✅ 修复 braceIndex 成功！');
    
    // 然后修复内部循环
    const oldLoopPart = "for (let k = braceIndex + 1; k < original.length; k++) {\n          if (original[k] === '{') {\n            braceCount++;\n          } else if (original[k] === '}') {\n            braceCount--;";
    const newLoopPart = "for (let k = braceIndex + 1; k < original.length; k++) {\n          if (cleaned[k] === '{') {\n            braceCount++;\n          } else if (cleaned[k] === '}') {\n            braceCount--;";
    
    if (content.includes(oldLoopPart)) {
      content = content.replace(oldLoopPart, newLoopPart);
      console.log('✅ 修复循环检查成功！');
    }
    
    fs.writeFileSync(parserFilePath, content);
    console.log('✅ 文件保存成功！');
  }
}
