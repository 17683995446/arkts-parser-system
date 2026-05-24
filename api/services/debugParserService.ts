import * as fs from 'fs';
import * as path from 'path';
import type { FileNode, GraphLink, GraphData } from '../../shared/types.js';

/**
 * Debug Parser Service - 添加详细的日志功能
 * 用于发现和调试问题
 */
export class DebugParserService {
  private projectPath: string;
  private nodes: Map<string, FileNode> = new Map();
  private links: GraphLink[] = [];
  private nodeIdCounter: number = 0;
  private debugLog: string[] = [];
  private debugMode: boolean = true;

  private log(level: string, method: string, message: string, ...args: any[]) {
    if (!this.debugMode) return;
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] [${method}] ${message}`;
    this.debugLog.push(logMessage);
    console.log(logMessage, ...args);
  }

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

  constructor(projectPath: string, debugMode: boolean = true) {
    this.projectPath = projectPath;
    this.debugMode = debugMode;
    this.log('INFO', 'constructor', `Parser initialized for project: ${projectPath}`);
  }

  public getDebugLog(): string[] {
    return [...this.debugLog];
  }

  public parse(): GraphData & { debugLog: string[] } {
    this.log('INFO', 'parse', 'Start parsing project...');
    const startTime = Date.now();
    
    this.nodes.clear();
    this.links = [];
    this.nodeIdCounter = 0;
    this.log('DEBUG', 'parse', 'State initialized: nodes cleared, links cleared, counter reset');
    
    this.walkDirectory(this.projectPath);
    
    const duration = Date.now() - startTime;
    this.log('INFO', 'parse', `Parsing completed. Duration: ${duration}ms, Nodes: ${this.nodes.size}, Links: ${this.links.length}`);
    
    return {
      nodes: Array.from(this.nodes.values()),
      links: this.links,
      debugLog: this.debugLog
    };
  }

  private walkDirectory(dir: string): void {
    this.log('TRACE', 'walkDirectory', `Entering directory: ${dir}`);
    
    if (!fs.existsSync(dir)) {
      this.log('WARN', 'walkDirectory', `Directory does not exist: ${dir}`);
      return;
    }
    
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
      this.log('TRACE', 'walkDirectory', `Found ${entries.length} entries in directory`);
    } catch (error) {
      this.log('ERROR', 'walkDirectory', `Error reading directory ${dir}: ${(error as Error).message}`);
      return;
    }
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        this.log('TRACE', 'walkDirectory', `Processing directory entry: ${entry.name}`);
        if (!['node_modules', '.git', 'dist', 'build', '.idea', '.vscode'].includes(entry.name)) {
          this.log('DEBUG', 'walkDirectory', `Recursing into directory: ${entry.name}`);
          this.walkDirectory(fullPath);
        } else {
          this.log('TRACE', 'walkDirectory', `Skipping excluded directory: ${entry.name}`);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.ets'))) {
        this.log('DEBUG', 'walkDirectory', `Found source file: ${entry.name}`);
        this.parseFile(fullPath);
      }
    }
    this.log('TRACE', 'walkDirectory', `Exiting directory: ${dir}`);
  }

  private parseFile(filePath: string): void {
    this.log('TRACE', 'parseFile', `Starting to parse file: ${filePath}`);
    
    const relativePath = path.relative(this.projectPath, filePath);
    const fileId = this.generateId();
    const fileNode: FileNode = {
      id: fileId,
      type: 'File',
      name: path.basename(filePath),
      path: relativePath
    };
    this.nodes.set(fileId, fileNode);
    this.log('DEBUG', 'parseFile', `Created file node: ${fileNode.name} (${fileId})`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.log('TRACE', 'parseFile', `File content read successfully, size: ${content.length} chars`);
      this.parseFileContent(content, fileNode);
      this.log('DEBUG', 'parseFile', `File content parsed: ${fileNode.name}`);
    } catch (error) {
      this.log('WARN', 'parseFile', `Could not read file: ${filePath}, error: ${(error as Error).message}`);
    }
  }

  private preprocessContent(content: string): { cleaned: string, original: string } {
    this.log('TRACE', 'preprocessContent', 'Starting content preprocessing');
    
    const result: string[] = new Array(content.length).fill(' ');
    
    let inString: string | null = null; // "'", '"', '`'
    let inComment: string | null = null; // '//', '/*'
    let inRegex: boolean = false;
    let escapeNext = false;
    let lastNewlinePos = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = i < content.length - 1 ? content[i + 1] : '';
      
      // 记录换行位置
      if (char === '\n') {
        lastNewlinePos = i;
        
        // 只有非反引号字符串遇到换行时才强制结束（反引号字符串可以跨多行）
        if (inString !== null && inString !== '`') {
          this.log('DEBUG', 'preprocessContent', `Forcing close of unclosed non-backtick string (pos ${i})`);
          inString = null;
        }
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
        result[i] = ' ';
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
        
        // 处理正则表达式开始
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
    
    this.log('DEBUG', 'preprocessContent', 'Content preprocessing completed');
    return { cleaned: result.join(''), original: content };
  }

  private parseFileContent(content: string, fileNode: FileNode): void {
    this.log('TRACE', 'parseFileContent', 'Starting file content parsing');
    
    const { cleaned, original } = this.preprocessContent(content);
    this.log('DEBUG', 'parseFileContent', 'Content preprocessed, now finding class positions');
    
    const classPositions = this.findClassPositions(cleaned, original);
    this.log('INFO', 'parseFileContent', `Found ${classPositions.length} classes/components`);
    
    for (let i = 0; i < classPositions.length; i++) {
      const clsPos = classPositions[i];
      this.log('DEBUG', 'parseFileContent', `Processing class ${i + 1}/${classPositions.length}: ${clsPos.name}`);
      
      const classId = this.generateId();
      const classNode: FileNode = {
        id: classId,
        type: clsPos.isComponent ? 'Component' : 'Class',
        name: clsPos.name,
        file: fileNode.path,
        isEntry: clsPos.isEntry
      };
      
      this.nodes.set(classId, classNode);
      this.log('TRACE', 'parseFileContent', `Created node: ${classNode.type} ${classNode.name} (${classId})`);
      
      this.addLink(fileNode.id, classId, '包含');
      this.log('TRACE', 'parseFileContent', `Added link: File -> ${classNode.name}`);
      
      const classContent = original.substring(clsPos.start, clsPos.end);
      this.log('TRACE', 'parseFileContent', `Extracted class content, size: ${classContent.length} chars`);
      
      this.parseMethodsInClass(classContent, classNode);
    }
    
    this.log('DEBUG', 'parseFileContent', 'Now parsing top-level functions');
    this.parseTopLevelFunctions(cleaned, fileNode, classPositions);
    this.log('TRACE', 'parseFileContent', 'File content parsing completed');
  }

  private findClassPositions(cleaned: string, original: string): Array<{
    name: string;
    start: number;
    end: number;
    isComponent: boolean;
    isEntry: boolean;
  }> {
    this.log('TRACE', 'findClassPositions', 'Starting class position detection');
    const results: Array<any> = [];
    const invalidNames = new Set(['method', 'function', 'class', 'type', 'interface', 'in', 'test', 'NotARealClass', 'NotARealComponent']);
    
    // 修复：支持 Unicode 字符（中文、日文等）
    const classPattern = /(?:^|\s+)(?:export\s+)?(class|struct)\s+([\p{L}\p{N}_$]+)/gu;
    let match: RegExpExecArray | null;
    
    while ((match = classPattern.exec(cleaned)) !== null) {
      const name = match[2];
      this.log('TRACE', 'findClassPositions', `Potential match found: ${name} at position ${match.index}`);
      
      if (invalidNames.has(name)) {
        this.log('DEBUG', 'findClassPositions', `Skipping invalid name: ${name}`);
        continue;
      }
      
      const classStart = match.index;
      
      const prevClassEnd = results.length > 0 ? results[results.length - 1].end : 0;
      const decoratorSearchStart = Math.max(0, Math.max(prevClassEnd, classStart - 200));
      const decoratorSearchRaw = original.substring(decoratorSearchStart, classStart);
      const { cleaned: decoratorSearch } = this.preprocessContent(decoratorSearchRaw);
      
      let isEntry = false;
      let isComponent = false;
      
      if (decoratorSearch.includes('@Entry')) {
        isEntry = true;
        isComponent = true;
        this.log('TRACE', 'findClassPositions', `Found @Entry decorator for ${name}`);
      }
      if (decoratorSearch.includes('@Component')) {
        isComponent = true;
        this.log('TRACE', 'findClassPositions', `Found @Component decorator for ${name}`);
      }
      if (decoratorSearch.includes('@Page')) {
        isComponent = true;
        this.log('TRACE', 'findClassPositions', `Found @Page decorator for ${name}`);
      }
      
      let braceCount = 0;
      let braceFound = false;
      let endPos = original.length;
      let braceIndex = cleaned.indexOf('{', classStart);
      
      if (braceIndex !== -1) {
        braceCount = 1;
        braceFound = true;
        this.log('TRACE', 'findClassPositions', `Found opening brace for ${name} at ${braceIndex}`);
        
        for (let k = braceIndex + 1; k < original.length; k++) {
          if (cleaned[k] === '{') {
            braceCount++;
          } else if (cleaned[k] === '}') {
            braceCount--;
            if (braceCount === 0) {
              endPos = k + 1;
              this.log('TRACE', 'findClassPositions', `Found closing brace for ${name} at ${k}`);
              break;
            }
          }
        }
      } else {
        this.log('WARN', 'findClassPositions', `No opening brace found for ${name}`);
      }
      
      results.push({
        name,
        start: classStart,
        end: endPos,
        isComponent,
        isEntry
      });
      this.log('DEBUG', 'findClassPositions', `Added class: ${name}, start: ${classStart}, end: ${endPos}, component: ${isComponent}, entry: ${isEntry}`);
    }
    
    this.log('INFO', 'findClassPositions', `Class detection completed. Total: ${results.length}`);
    return results;
  }

  private parseMethodsInClass(classContent: string, classNode: FileNode): void {
    this.log('TRACE', 'parseMethodsInClass', `Starting method parsing for ${classNode.name}`);
    const found = new Set<string>();
    
    const { cleaned } = this.preprocessContent(classContent);
    this.log('TRACE', 'parseMethodsInClass', 'Class content preprocessed');
    
    // 修复：async 修饰符只匹配一次，不重复匹配
    // 修复：支持 $ 前缀的方法名，使用负向断言替代 \b
    const methodPattern1 = /(?<![\w$])(?:public|private|protected|static)?\s*(?:async\s+)?([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
    let match: RegExpExecArray | null;
    
    while ((match = methodPattern1.exec(cleaned)) !== null) {
      const methodName = match[1];
      this.log('TRACE', 'parseMethodsInClass', `Potential method match: ${methodName} at ${match.index}`);
      
      if (this.isValidMethodName(methodName, found)) {
        found.add(methodName);
        this.addMethod(methodName, classNode);
        this.log('DEBUG', 'parseMethodsInClass', `Added method: ${methodName} to ${classNode.name}`);
      } else {
        this.log('TRACE', 'parseMethodsInClass', `Skipping invalid method name: ${methodName}`);
      }
    }
    
    const accessorPattern = /\b(get|set)\s+([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
    while ((match = accessorPattern.exec(cleaned)) !== null) {
      const methodName = match[2];
      this.log('TRACE', 'parseMethodsInClass', `Potential accessor match: ${methodName} at ${match.index}`);
      
      if (this.isValidMethodName(methodName, found)) {
        found.add(methodName);
        this.addMethod(methodName, classNode);
        this.log('DEBUG', 'parseMethodsInClass', `Added accessor: ${methodName} to ${classNode.name}`);
      }
    }
    
    const builderPattern = /@Builder\s+([\w$]+)/g;
    while ((match = builderPattern.exec(classContent)) !== null) {
      const builderName = match[1];
      this.log('TRACE', 'parseMethodsInClass', `Potential builder match: ${builderName} at ${match.index}`);
      
      if (this.isValidMethodName(builderName, found)) {
        found.add(builderName);
        this.addMethod(builderName, classNode);
        this.log('DEBUG', 'parseMethodsInClass', `Added builder: ${builderName} to ${classNode.name}`);
      }
    }
    
    this.log('INFO', 'parseMethodsInClass', `Method parsing completed for ${classNode.name}. Found ${found.size} methods`);
  }

  private parseTopLevelFunctions(cleaned: string, fileNode: FileNode, classPositions: any[]): void {
    this.log('TRACE', 'parseTopLevelFunctions', 'Starting top-level function parsing');
    const found = new Set<string>();
    const pattern = /(?:export\s+)?(?:async\s+)?function\s+([\w$]+)\s*\([^)]*\)\s*(?::\s*[^;{]+)?\s*{/g;
    let match: RegExpExecArray | null;
    
    while ((match = pattern.exec(cleaned)) !== null) {
      const funcName = match[1];
      const funcPos = match.index;
      this.log('TRACE', 'parseTopLevelFunctions', `Potential function match: ${funcName} at ${funcPos}`);
      
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
        this.log('DEBUG', 'parseTopLevelFunctions', `Added top-level function: ${funcName}`);
      } else if (isInsideClass) {
        this.log('TRACE', 'parseTopLevelFunctions', `Skipping function inside class: ${funcName}`);
      }
    }
    this.log('INFO', 'parseTopLevelFunctions', `Top-level function parsing completed. Found ${found.size} functions`);
  }

  private isValidMethodName(name: string, found: Set<string>): boolean {
    if (found.has(name)) {
      this.log('TRACE', 'isValidMethodName', `Invalid name: ${name} (already found)`);
      return false;
    }
    if (this.skipKeywords.has(name)) {
      this.log('TRACE', 'isValidMethodName', `Invalid name: ${name} (in skip list)`);
      return false;
    }
    if (name.length < 2) {
      this.log('TRACE', 'isValidMethodName', `Invalid name: ${name} (too short)`);
      return false;
    }
    if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
      this.log('TRACE', 'isValidMethodName', `Invalid name: ${name} (looks like constant)`);
      return false;
    }
    // 移除 $ 前缀检查，保持与类名识别一致性
    // if (name.startsWith('$')) {
    //   this.log('TRACE', 'isValidMethodName', `Invalid name: ${name} (starts with $)`);
    //   return false;
    // }
    if (/^\d/.test(name)) {
      this.log('TRACE', 'isValidMethodName', `Invalid name: ${name} (starts with digit)`);
      return false;
    }
    this.log('TRACE', 'isValidMethodName', `Valid name: ${name}`);
    return true;
  }

  private addMethod(name: string, parentNode: FileNode): void {
    this.log('TRACE', 'addMethod', `Adding method ${name} to ${parentNode.name}`);
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
    const id = `node_${++this.nodeIdCounter}`;
    this.log('TRACE', 'generateId', `Generated node ID: ${id}`);
    return id;
  }

  private addLink(source: string, target: string, type: '包含' | '调用' | '包含组件'): void {
    this.log('TRACE', 'addLink', `Adding link: ${source} -> ${target} (${type})`);
    this.links.push({ source, target, type });
  }
}
