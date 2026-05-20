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
   */
  private preprocessContent(content: string): { cleaned: string, original: string } {
    let cleaned = content;
    
    // 1. 移除多行注释 /* ... */
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      return ' '.repeat(match.length);
    });
    
    // 2. 移除单行注释 // ...
    cleaned = cleaned.replace(/\/\/[^\n]*$/gm, (match) => {
      return ' '.repeat(match.length);
    });
    
    // 3. 移除单引号字符串
    cleaned = cleaned.replace(/'([^'\\]|\\.)*'/g, (match) => {
      return ' '.repeat(match.length);
    });
    
    // 4. 移除双引号字符串
    cleaned = cleaned.replace(/"([^"\\]|\\.)*"/g, (match) => {
      return ' '.repeat(match.length);
    });
    
    // 5. 移除反引号字符串
    cleaned = cleaned.replace(/`([^`\\]|\\.)*`/g, (match) => {
      return ' '.repeat(match.length);
    });
    
    // 6. 移除正则表达式 (简单处理)
    cleaned = cleaned.replace(/\/([^\/\\]|\\.)*\/[gimuy]*/g, (match) => {
      return ' '.repeat(match.length);
    });
    
    return { cleaned, original: content };
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
    
    // 在清理后的内容中查找类定义
    const classPattern = /(?:export\s+)?(class|struct)\s+(\w+)/g;
    let match: RegExpExecArray | null;
    
    while ((match = classPattern.exec(cleaned)) !== null) {
      const name = match[2];
      
      if (invalidNames.has(name)) {
        continue;
      }
      
      const classStart = match.index;
      
      let isEntry = false;
      let isComponent = false;
      
      const decoratorSearchRaw = original.substring(Math.max(0, classStart - 500), classStart);
      const { cleaned: decoratorSearch } = this.preprocessContent(decoratorSearchRaw);
      
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
  }

  private parseMethodsInClass(classContent: string, classNode: FileNode): void {
    const found = new Set<string>();
    
    const { cleaned } = this.preprocessContent(classContent);
    
    const methodPattern1 = /\b(?:public|private|protected|static|async)?\s*(?:async)?\s*(\w+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
    let match: RegExpExecArray | null;
    
    while ((match = methodPattern1.exec(cleaned)) !== null) {
      const methodName = match[1];
      if (this.isValidMethodName(methodName, found)) {
        found.add(methodName);
        this.addMethod(methodName, classNode);
      }
    }
    
    const accessorPattern = /\b(get|set)\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
    while ((match = accessorPattern.exec(cleaned)) !== null) {
      const methodName = match[2];
      if (this.isValidMethodName(methodName, found)) {
        found.add(methodName);
        this.addMethod(methodName, classNode);
      }
    }
    
    const builderPattern = /@Builder\s+(\w+)/g;
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
    const pattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
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
    if (name.startsWith('$')) return false;
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
