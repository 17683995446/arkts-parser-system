import * as fs from 'fs';
import * as path from 'path';
import type { FileNode, GraphLink, GraphData } from '../../shared/types.js';

/**
 * 改进型解析器 - 处理注释、字符串、正则表达式
 */
export class ParserService {
  private projectPath: string;
  private nodes: Map<string, FileNode> = new Map();
  private links: GraphLink[] = [];
  private nodeIdCounter: number = 0;

  // 完整的 skip 关键词列表
  private readonly skipKeywords: Set<string> = new Set([
    'Row', 'Column', 'Stack', 'Flex', 'Grid', 'List', 'Scroll', 'Swiper',
    'Text', 'Button', 'Image', 'Input', 'TextInput', 'Checkbox', 'Radio', 'Slider',
    'Progress', 'Loading', 'Divider', 'Blank', 'Span', 'Navigator', 'Web',
    'Video', 'Audio', 'Camera', 'Map', 'Calendar', 'Clock', 'Gauge',
    'Marquee', 'QRCode', 'Barcode', 'Svg', 'Canvas', 'XComponent',
    'Circle', 'Ellipse', 'Line', 'Path', 'Polygon', 'Polyline', 'Rect',
    'TextArea', 'Toggle', 'LoadingProgress', 'fontSize', 'fontColor', 
    'fontWeight', 'width', 'height', 'backgroundColor', 'borderRadius', 
    'justifyContent', 'onClick', 'padding', 'margin', 'alignItems',
    'alignContent', 'flexDirection', 'flexWrap', 'flex', 'gap', 'color', 'textAlign',
    'textOverflow', 'overflow', 'opacity', 'display', 'position', 'top', 'left',
    'right', 'bottom', 'zIndex', 'boxShadow', 'border', 'borderWidth', 'borderColor',
    'transform', 'translate', 'rotate', 'scale', 'skew', 'perspective',
    'layoutWeight', 'enabled', 'selectedColor', 'fillColor', 'placeholderColor',
    'type', 'shadow', 'fill', 'console', 'log', 'warn', 'error', 'info', 'debug', 'trace',
    'Math', 'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh',
    'ceil', 'clz32', 'cos', 'cosh', 'exp', 'floor', 'fround', 'hypot', 'imul',
    'log1p', 'log2', 'log10', 'max', 'min', 'pow', 'random', 'round', 'sign',
    'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc', 'E', 'PI', 'SQRT2', 'SQRT1_2',
    'LN2', 'LN10', 'LOG2E', 'LOG10E', 'String', 'charAt', 'charCodeAt', 'concat', 
    'endsWith', 'includes', 'indexOf', 'lastIndexOf', 'match', 'repeat', 'replace', 
    'replaceAll', 'search', 'slice', 'split', 'startsWith', 'substring', 
    'toLocaleLowerCase', 'toLocaleUpperCase', 'toLowerCase', 'toUpperCase', 
    'trim', 'trimStart', 'trimEnd', 'padStart', 'padEnd', 'Number', 'isNaN', 
    'isFinite', 'isInteger', 'isSafeInteger', 'parseFloat', 'parseInt', 'Array', 
    'from', 'isArray', 'of', 'concat', 'copyWithin', 'every', 'fill', 'filter',
    'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf',
    'map', 'pop', 'push', 'reduce', 'reduceRight', 'reverse', 'shift', 'slice', 'some',
    'sort', 'splice', 'toLocaleString', 'toString', 'unshift', 'values', 'entries',
    'Object', 'assign', 'create', 'defineProperties', 'defineProperty', 'entries', 'freeze',
    'getOwnPropertyDescriptor', 'getOwnPropertyDescriptors', 'getOwnPropertyNames',
    'getOwnPropertySymbols', 'getPrototypeOf', 'hasOwnProperty', 'is', 'isExtensible',
    'isFrozen', 'isSealed', 'keys', 'preventExtensions', 'seal', 'setPrototypeOf', 'values',
    'Date', 'now', 'parse', 'UTC', 'getDate', 'getDay', 'getFullYear', 'getHours',
    'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getTime', 'getTimezoneOffset',
    'getUTCDate', 'getUTCDay', 'getUTCFullYear', 'getUTCHours', 'getUTCMilliseconds',
    'getUTCMinutes', 'getUTCMonth', 'getUTCSeconds', 'setDate', 'setFullYear', 'setHours',
    'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate',
    'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth',
    'setUTCSeconds', 'toDateString', 'toISOString', 'toJSON', 'toLocaleDateString',
    'toLocaleTimeString', 'toTimeString', 'toUTCString', 'RegExp', 'exec', 'test', 
    'source', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode', 'JSON', 
    'parse', 'stringify', 'Promise', 'all', 'allSettled', 'any', 'race', 'resolve', 
    'reject', 'then', 'catch', 'finally', 'Set', 'add', 'clear', 'delete', 'entries', 
    'forEach', 'has', 'keys', 'values', 'size', 'Map', 'clear', 'delete', 'entries', 
    'forEach', 'get', 'has', 'keys', 'set', 'values', 'size', 'WeakSet', 'WeakMap',
    'Symbol', 'for', 'keyFor', 'hasInstance', 'isConcatSpreadable', 'iterator', 'match',
    'replace', 'search', 'species', 'split', 'toPrimitive', 'toStringTag', 'unscopables',
    'Proxy', 'Reflect', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 
    'SyntaxError', 'TypeError', 'URIError', 'eval', 'isFinite', 'isNaN', 'parseFloat', 
    'parseInt', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 
    'escape', 'unescape', 'window', 'document', 'navigator', 'location', 'history', 
    'screen', 'localStorage', 'sessionStorage', 'fetch', 'Headers', 'Request', 'Response',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 
    'cancelAnimationFrame', 'class', 'struct', 'interface', 'function', 'if', 'else', 
    'for', 'while', 'return', 'const', 'let', 'var', 'new', 'import', 'export', 'from', 
    'as', 'this', 'super', 'constructor', 'get', 'set', 'async', 'await', 'try', 'catch',
    'throw', 'finally', 'switch', 'case', 'default', 'break', 'continue', 'typeof', 
    'instanceof', 'in', 'of', 'void', 'delete', 'yield', 'debugger', 'extends', 
    'implements', 'public', 'private', 'protected', 'static', 'readonly', 'null', 
    'undefined', 'true', 'false', 'NaN', 'Infinity', '$r', 'app', 'media', 
    'namespace', 'type', 'in'
  ]);

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  public parse(): GraphData {
    console.log(`🔍 Parsing project: ${this.projectPath}`);
    
    this.nodes.clear();
    this.links = [];
    this.nodeIdCounter = 0;
    
    this.walkDirectory(this.projectPath);
    
    console.log(`✅ Parsed ${this.nodes.size} nodes and ${this.links.length} links`);
    
    return {
      nodes: Array.from(this.nodes.values()),
      links: this.links
    };
  }

  private walkDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️ Directory does not exist: ${dir}`);
      return;
    }
    
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      console.error(`❌ Error reading directory ${dir}: ${(error as Error).message}`);
      return;
    }
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.idea', '.vscode'].includes(entry.name)) {
          this.walkDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.ets'))) {
        this.parseFile(fullPath);
      }
    }
  }

  private parseFile(filePath: string): void {
    const relativePath = path.relative(this.projectPath, filePath);
    const fileId = this.generateId();
    const fileNode: FileNode = {
      id: fileId,
      type: 'File',
      name: path.basename(filePath),
      path: relativePath
    };
    this.nodes.set(fileId, fileNode);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.parseFileContent(content, fileNode);
    } catch (error) {
      console.warn(`⚠️ Could not read file: ${filePath}`);
    }
  }

  /**
   * 预处理内容：移除注释和字符串，避免误识别
   * 使用逐字符分析方式，更安全可靠
   */
  private preprocessContent(content: string): { cleaned: string, original: string } {
    const result: string[] = new Array(content.length).fill(' ');
    
    let inString: string | null = null; // "'", '"', '`'
    let inComment: string | null = null; // '//', '/*'
    let inRegex: boolean = false;
    let escapeNext = false;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = i < content.length - 1 ? content[i + 1] : '';
      
      // 只有非反引号字符串遇到换行时才强制结束（反引号字符串可以跨多行）
      if (char === '\n' && inString !== null && inString !== '`') {
        inString = null;
      }
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      // 处理转义
      if (char === '\\' && (inString !== null || inRegex)) {
        escapeNext = true;
        continue;
      }
      
      // 优先处理正则表达式结束（非常重要！）
      if (inRegex && char === '/') {
        inRegex = false;
        result[i] = ' '; // 正则内容替换为空格
        continue;
      }
      
      // 不在正则、字符串、注释的时候才处理注释和正则开始
      if (!inRegex && inString === null && inComment === null) {
        // 处理注释
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
        
        // 处理正则表达式开始（只有确定不是结束的时候）
        if (char === '/') {
          const possibleRegexStarts = [' ', '\n', '\r', '\t', '(', '[', '{', ',', ';', '=', '?', '!', ':', '&', '|', '+', '-', '*', '/', '%'];
          let isRegexStart = true;
          
          let j = i - 1;
          while (j >= 0 && (content[j] === ' ' || content[j] === '\t')) {
            j--;
          }
          if (j >= 0 && !possibleRegexStarts.includes(content[j])) {
            isRegexStart = false;
          }
          
          if (isRegexStart) {
            inRegex = true;
            result[i] = ' ';
            continue;
          }
        }
      }
      
      // 处理字符串（只有不在正则和注释的时候）
      if (!inRegex && inComment === null) {
        if (inString === null) {
          if (char === "'") { inString = "'"; continue; }
          if (char === '"') { inString = '"'; continue; }
          if (char === '`') { inString = '`'; continue; }
        } else if (inString === char) {
          inString = null;
          continue;
        }
      }
      
      // 处理多行注释结束
      if (inComment === '/*' && char === '*' && nextChar === '/') {
        inComment = null;
        i++;
        continue;
      }
      
      // 处理单行注释换行结束
      if (inComment === '//' && char === '\n') {
        inComment = null;
      }
      
      // 如果不在字符串、注释或正则中，保留原字符
      if (inString === null && inComment === null && !inRegex) {
        result[i] = char;
      } else {
        result[i] = ' ';
      }
    }
    
    return { cleaned: result.join(''), original: content };
  }

  private parseFileContent(content: string, fileNode: FileNode): void {
    const { cleaned, original } = this.preprocessContent(content);
    const classPositions = this.findClassPositions(cleaned, original);
    
    for (const clsPos of classPositions) {
      const classId = this.generateId();
      const classNode: FileNode = {
        id: classId,
        type: clsPos.isComponent ? 'Component' : 'Class',
        name: clsPos.name,
        file: fileNode.path,
        isEntry: clsPos.isEntry
      };
      
      this.nodes.set(classId, classNode);
      this.addLink(fileNode.id, classId, '包含');
      
      const classContent = original.substring(clsPos.start, clsPos.end);
      this.parseMethodsInClass(classContent, classNode);
    }
    
    this.parseTopLevelFunctions(cleaned, fileNode, classPositions);
  }

  /**
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
    // 修复：支持 Unicode 字符（中文、日文等）使用 \p{L} 匹配任何语言的字母
    // \p{L} - 任何语言的字母
    // \p{N} - 任何数字
    // _ - 下划线
    // $ - 美元符号
    const classPattern = /(?:^|\s+)(?:export\s+)?(class|struct)\s+([\p{L}\p{N}_$]+)/gu;
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
      let braceIndex = cleaned.indexOf('{', classStart);
      
      if (braceIndex !== -1) {
        braceCount = 1;
        braceFound = true;
        
        for (let k = braceIndex + 1; k < original.length; k++) {
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
  }

  private parseMethodsInClass(classContent: string, classNode: FileNode): void {
    const found = new Set<string>();
    
    const { cleaned } = this.preprocessContent(classContent);
    
    // 修复：async 修饰符只匹配一次，不重复匹配
    // 问题：async asyncMethod 会被匹配为 "async" + "Method"，而不是一个整体
    // 解决方案：只保留一个 async?，并确保它不会与方法名冲突
    // 修复：支持 $ 前缀的方法名，使用负向断言替代 \b
    const methodPattern1 = /(?<![\w$])(?:public|private|protected|static)?\s*(?:async\s+)?([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
    let match: RegExpExecArray | null;
    
    while ((match = methodPattern1.exec(cleaned)) !== null) {
      const methodName = match[1];
      if (this.isValidMethodName(methodName, found)) {
        found.add(methodName);
        this.addMethod(methodName, classNode);
      }
    }
    
    const accessorPattern = /\b(get|set)\s+([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
    while ((match = accessorPattern.exec(cleaned)) !== null) {
      const methodName = match[2];
      if (this.isValidMethodName(methodName, found)) {
        found.add(methodName);
        this.addMethod(methodName, classNode);
      }
    }
    
    const builderPattern = /@Builder\s+([\w$]+)/g;
    while ((match = builderPattern.exec(classContent)) !== null) {
      const builderName = match[1];
      if (this.isValidMethodName(builderName, found)) {
        found.add(builderName);
        this.addMethod(builderName, classNode);
      }
    }
  }

  private parseTopLevelFunctions(cleaned: string, fileNode: FileNode, classPositions: any[]): void {
    const found = new Set<string>();
    const pattern = /(?:export\s+)?(?:async\s+)?function\s+([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
    let match: RegExpExecArray | null;
    
    while ((match = pattern.exec(cleaned)) !== null) {
      const funcName = match[1];
      const funcPos = match.index;
      
      const isInsideClass = classPositions.some(cls => 
        funcPos >= cls.start && funcPos < cls.end
      );
      
      if (!isInsideClass && this.isValidMethodName(funcName, found)) {
        found.add(funcName);
        
        const funcId = this.generateId();
        const funcNode: FileNode = {
          id: funcId,
          type: 'Method',
          name: funcName,
          file: fileNode.path
        };
        
        this.nodes.set(funcId, funcNode);
        this.addLink(fileNode.id, funcId, '包含');
      }
    }
  }

  private isValidMethodName(name: string, found: Set<string>): boolean {
    if (found.has(name)) return false;
    if (this.skipKeywords.has(name)) return false;
    if (name.length < 2) return false;
    if (/^[A-Z][A-Z0-9_]*$/.test(name)) return false;
    // 移除 $ 前缀检查，保持与类名识别一致性
    // if (name.startsWith('$')) return false;
    if (/^\d/.test(name)) return false;
    return true;
  }

  private addMethod(name: string, parentNode: FileNode): void {
    const methodId = this.generateId();
    const methodNode: FileNode = {
      id: methodId,
      type: 'Method',
      name,
      class: parentNode.name
    };
    
    this.nodes.set(methodId, methodNode);
    this.addLink(parentNode.id, methodId, '包含');
  }

  private generateId(): string {
    return `node_${++this.nodeIdCounter}`;
  }

  private addLink(source: string, target: string, type: '包含' | '调用' | '包含组件'): void {
    this.links.push({ source, target, type });
  }
}
