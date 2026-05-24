import { ParserService } from './api/services/parserService.js';
import * as fs from 'fs';
import * as path from 'path';

// 测试统计数据
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [] as Array<{name: string, status: 'passed'|'failed', error?: string}>
};

// 日志函数
function log(message: string, type: 'info'|'warn'|'error'|'success' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📘 [INFO]',
    warn: '⚠️  [WARN]',
    error: '❌ [ERROR]',
    success: '✅ [SUCCESS]'
  }[type];
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// 测试断言函数
function assert(condition: boolean, testName: string, message?: string) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    testResults.tests.push({name: testName, status: 'passed'});
    log(`Test passed: ${testName}`, 'success');
  } else {
    testResults.failed++;
    testResults.tests.push({name: testName, status: 'failed', error: message});
    log(`Test failed: ${testName} - ${message || 'Assertion failed'}`, 'error');
  }
}

// 测试 1: isValidMethodName 测试
log('Starting comprehensive unit test suite...', 'info');
log('Test 1: isValidMethodName 边界测试', 'info');

const parser = new ParserService('./test');

// 通过反射访问私有方法
const isValidMethodName = (parser as any).isValidMethodName;
const found = new Set<string>();

assert(
  isValidMethodName.call(parser, 'normalMethod', found) === true,
  '正常方法名应被允许',
  'normalMethod should be valid'
);

assert(
  isValidMethodName.call(parser, 'a', found) === false,
  '长度为 1 的方法名应被过滤',
  'Length < 2 should be invalid'
);

assert(
  isValidMethodName.call(parser, 'CONSTANT_NAME', found) === false,
  '全大写下划线分隔应被过滤',
  'ALL_CAPS should be invalid'
);

assert(
  isValidMethodName.call(parser, '$dollarMethod', found) === true,
  '$ 前缀方法名应被允许（修复后）',
  '$ prefix should be valid'
);

assert(
  isValidMethodName.call(parser, '123invalid', found) === false,
  '数字开头方法名应被过滤',
  'Digit start should be invalid'
);

found.add('duplicateMethod');
assert(
  isValidMethodName.call(parser, 'duplicateMethod', found) === false,
  '重复方法名应被过滤',
  'Duplicate should be invalid'
);

// 测试 2: preprocessContent 测试
log('Test 2: preprocessContent 各种场景测试', 'info');
const preprocessContent = (parser as any).preprocessContent;

// 正常场景
const test1 = `export class Test {
  method() {}
}`;
const result1 = preprocessContent.call(parser, test1);
assert(
  result1.cleaned.includes('class') && result1.cleaned.includes('method'),
  '普通代码应被保留',
  'Normal code should be preserved'
);

// 单行注释
const test2 = `// export class Commented {
export class RealClass {
  // method() {}
  realMethod() {}
}`;
const result2 = preprocessContent.call(parser, test2);
assert(
  !result2.cleaned.includes('Commented') && result2.cleaned.includes('RealClass'),
  '单行注释中的类应被忽略',
  'Commented class should be ignored'
);

// 多行注释
const test3 = `/*
export class BlockCommentClass {
  method() {}
}
*/
export class RealClass2 {
  method2() {}
}`;
const result3 = preprocessContent.call(parser, test3);
assert(
  !result3.cleaned.includes('BlockCommentClass') && result3.cleaned.includes('RealClass2'),
  '多行注释中的类应被忽略',
  'Block comment class should be ignored'
);

// 字符串中的类
const test4 = `const str1 = "export class StringClass1 {}";
const str2 = 'export class StringClass2 {}';
export class RealClass3 {
  method() {
    return "class";
  }
}`;
const result4 = preprocessContent.call(parser, test4);
assert(
  !result4.cleaned.includes('StringClass1') && !result4.cleaned.includes('StringClass2'),
  '字符串中的类应被忽略',
  'String classes should be ignored'
);

// 未闭合多行注释
const test5 = `/*
This comment never closes!
export class LostClass {
  shouldNotFindThis() {}
}
`;
const result5 = preprocessContent.call(parser, test5);
assert(
  !result5.cleaned.includes('LostClass'),
  '未闭合多行注释中的类应被忽略',
  'Unclosed comment content should be ignored'
);

// 反引号多行字符串
const test6 = `export class RealClass4 {
  template() {
    return \`
      This has \`class\` and \`function\` in it
      but should not interfere with parsing
    \`;
  }
  realMethod() {}
}`;
const result6 = preprocessContent.call(parser, test6);
assert(
  result6.cleaned.includes('RealClass4') && result6.cleaned.includes('realMethod'),
  '反引号字符串不应干扰解析',
  'Backtick string should not interfere'
);

// 测试 3: findClassPositions 测试
log('Test 3: findClassPositions 类定位测试', 'info');
const findClassPositions = (parser as any).findClassPositions;

const testClasses1 = `@Component
struct MyComponent {
  build() {}
}

export class NormalClass {
  method() {}
}

@Entry
@Component
struct EntryComponent {
  build() {}
}

@Page
struct PageComponent {
  build() {}
}`;
const preprocessed1 = preprocessContent.call(parser, testClasses1);
const classes1 = findClassPositions.call(parser, preprocessed1.cleaned, testClasses1);

assert(
  classes1.length === 4,
  '应找到 4 个类/组件',
  `Expected 4 classes, found ${classes1.length}`
);
assert(
  classes1[0].isComponent === true,
  'MyComponent 应被标记为 Component',
  'MyComponent should be a Component'
);
assert(
  classes1[1].isComponent === false,
  'NormalClass 不应被标记为 Component',
  'NormalClass should not be a Component'
);
assert(
  classes1[2].isEntry === true,
  'EntryComponent 应被标记为 Entry',
  'EntryComponent should be an Entry'
);

// 测试 4: 完整解析测试
log('Test 4: 完整项目解析测试', 'info');

// 创建临时测试项目
const testProjectDir = './temp_test_project';
if (!fs.existsSync(testProjectDir)) {
  fs.mkdirSync(testProjectDir, { recursive: true });
}

const testFile1 = path.join(testProjectDir, 'test1.ets');
fs.writeFileSync(testFile1, `@Component
struct Component1 {
  build() {}
}

export class Class1 {
  method1() {}
  method2() {}
  
  @Builder
  customBuilder() {}
}
`);

const testFile2 = path.join(testProjectDir, 'test2.ets');
fs.writeFileSync(testFile2, `export class Class2 {
  method3() {}
}

export function topLevelFunction() {}
`);

const testParser = new ParserService(testProjectDir);
const graphData = testParser.parse();

assert(
  graphData.nodes.length > 0,
  '解析应返回节点',
  'Should have nodes'
);
assert(
  graphData.links.length > 0,
  '解析应返回链接',
  'Should have links'
);

const files = graphData.nodes.filter(n => n.type === 'File');
const classes = graphData.nodes.filter(n => n.type === 'Class');
const components = graphData.nodes.filter(n => n.type === 'Component');
const methods = graphData.nodes.filter(n => n.type === 'Method');

assert(
  files.length === 2,
  `应找到 2 个文件，实际找到 ${files.length}`,
  'File count wrong'
);
assert(
  classes.length === 2,
  `应找到 2 个类，实际找到 ${classes.length}`,
  'Class count wrong'
);
assert(
  components.length === 1,
  `应找到 1 个组件，实际找到 ${components.length}`,
  'Component count wrong'
);

// 测试 5: $ 前缀类名测试
log('Test 5: $ 前缀类名测试', 'info');

const dollarTestFile = path.join(testProjectDir, 'dollar_test.ets');
fs.writeFileSync(dollarTestFile, `export class $DollarClass {
  normalMethod() {}
  $dollarMethod() {}
}
`);

const dollarParser = new ParserService(testProjectDir);
const dollarGraph = dollarParser.parse();

const dollarClass = dollarGraph.nodes.find(n => n.name === '$DollarClass');
assert(
  dollarClass !== undefined,
  '$DollarClass 应被识别',
  '$DollarClass should be found'
);

const dollarMethod = dollarGraph.nodes.find(n => n.name === '$dollarMethod');
assert(
  dollarMethod !== undefined,
  '$dollarMethod 应被识别（修复后）',
  '$dollarMethod should be found'
);

// 测试 6: 边界条件 - 空项目
log('Test 6: 空项目边界测试', 'info');
const emptyParser = new ParserService('./non_existent_path_12345');
const emptyResult = emptyParser.parse();
assert(
  emptyResult.nodes.length === 0 && emptyResult.links.length === 0,
  '空/不存在路径应返回空数据',
  'Non-existent path should return empty'
);

// 清理临时文件
try {
  fs.rmSync(testProjectDir, { recursive: true, force: true });
} catch(e) {}

// 打印测试总结
log('\n========================================', 'info');
log('单元测试总结', 'info');
log('========================================', 'info');
log(`总测试数: ${testResults.total}`, 'info');
log(`✅  通过: ${testResults.passed}`, 'info');
log(`❌  失败: ${testResults.failed}`, 'info');
log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'info');

if (testResults.failed > 0) {
  log('\n失败的测试:', 'error');
  testResults.tests
    .filter(t => t.status === 'failed')
    .forEach(t => log(`  - ${t.name}: ${t.error}`, 'error'));
}

console.log('\n完整测试详情:', JSON.stringify(testResults, null, 2));
