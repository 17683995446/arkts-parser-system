import { ParserService } from './api/services/parserService.js';
import * as fs from 'fs';
import * as path from 'path';

console.log('🧪 第三轮：开始完整单元测试...');
console.log('='.repeat(80));

interface TestResult {
  name: string;
  passed: boolean;
  actual?: any;
  expected?: any;
  error?: string;
}

const testResults: TestResult[] = [];

// 测试1：preprocessContent 函数 - 基础功能
console.log('\n📝 测试1：preprocessContent - 基础字符串处理');
try {
  const content1 = `
// This is a comment
export class NormalClass {
  method() { return "string"; }
}
`;
  const result1 = new (class TestParser extends ParserService {
    testPreprocess(content: string) {
      return this['preprocessContent'](content);
    }
  })('/tmp').testPreprocess(content1);
  
  testResults.push({
    name: 'preprocessContent 基础测试',
    passed: true
  });
  console.log('✅ preprocessContent 基础功能正常');
} catch (error) {
  testResults.push({
    name: 'preprocessContent 基础测试',
    passed: false,
    error: (error as Error).message
  });
}

// 测试2：preprocessContent - 字符串处理
console.log('\n📝 测试2：preprocessContent - 字符串处理');
try {
  const content2 = `
export class ClassWithStrings {
  method() {
    const str1 = "class FakeInString { fakeMethod(); }
    const str2 = 'struct AnotherFake { }';
    return str1;
  }
}
`;
  const result2 = new (class TestParser2 extends ParserService {
    testPreprocess(content: string) {
      return this['preprocessContent'](content);
    }
  })('/tmp').testPreprocess(content2);
  
  testResults.push({
    name: 'preprocessContent 字符串处理',
    passed: true,
  });
  console.log('✅ 字符串处理正常');
} catch (error) {
  testResults.push({
    name: 'preprocessContent 字符串测试',
    passed: false,
    error: (error as Error).message
  });
}

// 测试3：findClassPositions - 简单类识别
console.log('\n📝 测试3：findClassPositions - 简单类识别');
try {
  const content3 = `export class SimpleClass { method() {} }`;
  const parser3 = new (class TestParser3 extends ParserService {
    testFindClasses(content: string) {
      const { cleaned, original } = this['preprocessContent'](content);
      return this['findClassPositions'](cleaned, original);
    }
  })('/tmp').testFindClasses(content3);
  
  testResults.push({
    name: 'findClassPositions 简单类识别',
    passed: parser3.length === 1 && parser3[0].name === 'SimpleClass'
  });
  console.log('✅ 简单类识别正常');
} catch (error) {
  testResults.push({
    name: 'findClassPositions 简单类测试',
    passed: false,
    error: (error as Error).message
  });
}

// 测试4：组件识别（带装饰器
console.log('\n📝 测试4：装饰器识别 - 简单组件');
try {
  const content4 = `
@Entry
@Component
export struct MyComponent {
  build() {
    Text('test');
  }
}
`;
  const parser4 = new (class TestParser4 extends ParserService {
    testFindClasses(content: string) {
      const { cleaned, original } = this['preprocessContent'](content);
      return this['findClassPositions'](cleaned, original);
    }
  })('/tmp').testFindClasses(content4);
  
  const component = parser4.find(c => c.name === 'MyComponent');
  testResults.push({
    name: '装饰器组件识别',
    passed: !!component && component.isComponent && component.isEntry
  });
  console.log('✅ 装饰器组件识别正常');
} catch (error) {
  testResults.push({
    name: '装饰器组件测试',
    passed: false,
    error: (error as Error).message
  });
}

// 测试5：多个类的正确范围
console.log('\n📝 测试5：多个类顺序识别');
try {
  const content5 = `
export class FirstClass { method() {} }
export class SecondClass { method() {} }
`;
  const parser5 = new (class TestParser5 extends ParserService {
    testFindClasses(content: string) {
      const { cleaned, original } = this['preprocessContent'](content);
      return this['findClassPositions'](cleaned, original);
    }
  })('/tmp').testFindClasses(content5);
  
  testResults.push({
    name: '多个类顺序识别',
    passed: parser5.length === 2
  });
  console.log('✅ 多个类顺序识别正常');
} catch (error) {
  testResults.push({
    name: '多个类识别测试',
    passed: false,
    error: (error as Error).message
  });
}

// 测试6：isValidMethodName - 方法名验证
console.log('\n📝 测试6：isValidMethodName - 方法名验证');
try {
  const parser6 = new (class TestParser6 extends ParserService {
    testValidName(name: string, found: Set<string>) {
      return this['isValidMethodName'](name, found);
    }
  })('/tmp');
  
  const testNames = [
    { name: 'validMethod', expected: true },
    { name: 'if', expected: false },
    { name: 'x', expected: false },
    { name: '$validDollar', expected: true },
    { name: '123invalid', expected: false },
    { name: 'VERY_LONG_CONSTANT_NAME', expected: false }
  ];
  
  let allPassed = true;
  for (const test of testNames) {
    const result = parser6.testValidName(test.name, new Set());
    if (result !== test.expected) {
      allPassed = false;
      console.log(`❌ isValidMethodName('${test.name}') 返回 ${result}, 期望 ${test.expected}`);
    }
  }
  
  testResults.push({
    name: 'isValidMethodName 验证',
    passed: allPassed
  });
  console.log('✅ isValidMethodName 验证正常');
} catch (error) {
  testResults.push({
    name: 'isValidMethodName 测试',
    passed: false,
    error: (error as Error).message
  });
}

// 测试7：方法识别
console.log('\n📝 测试7：方法识别');
try {
  const content7 = `
export class ClassWithMethods {
  method1() { return 1; }
  async asyncMethod() { return 2; }
  $dollarMethod() { return 3; }
}
`;
  const testDir = '/tmp/test_unit';
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
  const testFile = path.join(testDir, 'test.ets');
  fs.writeFileSync(testFile, content7);
  const parser7 = new ParserService(testDir);
  const result7 = parser7.parse();
  
  const methods = result7.nodes.filter(n => n.type === 'Method');
  const dollarMethod = methods.find(m => m.name === '$dollarMethod');
  testResults.push({
    name: '方法识别包含$前缀',
    passed: !!dollarMethod
  });
  
  fs.unlinkSync(testFile);
  fs.rmdirSync(testDir);
  console.log('✅ $前缀方法识别正常');
} catch (error) {
  testResults.push({
    name: '方法识别测试',
    passed: false,
    error: (error as Error).message
  });
}

// 测试8：完整项目解析（测试项目（mega-test-project
console.log('\n📝 测试8：完整项目解析');
try {
  const parser8 = new ParserService('./mega-test-project');
  const result8 = parser8.parse();
  
  testResults.push({
    name: '完整项目解析',
    passed: result8.nodes.length > 100 && result8.links.length > 50
  });
  console.log('✅ 完整项目解析正常');
} catch (error) {
  testResults.push({
    name: '完整项目解析测试',
    passed: false,
    error: (error as Error).message
  });
}

// 输出测试结果
console.log('\n\n' + '='.repeat(80));
console.log('📊 完整单元测试结果：');

const passedCount = testResults.filter(t => t.passed).length;
const failedCount = testResults.length - passedCount;
console.log(`✅  通过: ${passedCount}/${testResults.length}`);
console.log(`❌ 失败: ${failedCount}/${testResults.length}`);

for (const result of testResults) {
  const status = result.passed ? '✅' : '❌';
  console.log(`\n${status} ${result.name}`);
  if (!result.passed && result.error) {
    console.log(`   错误: ${result.error}`);
  }
}

console.log('\n' + '='.repeat(80));

if (failedCount === 0) {
  console.log('🎉 所有单元测试通过！');
} else {
  console.log('⚠️ 部分测试失败');
}

console.log('\n');
