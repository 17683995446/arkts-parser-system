import * as fs from 'fs';
import * as path from 'path';

const projectDir = './extreme-test-project';
const srcDir = path.join(projectDir, 'src');

if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

// ===========================================
// 极端测试场景 1: 装饰器在字符串/注释中的干扰
// ===========================================
const test1Content = `// 极端场景 1 - 装饰器边缘情况
// 这里 @Entry 在注释中，不应该触发
export class ShouldNotBeEntry1 {
  method() {}
}

/* 
  这里 @Component 在多行注释中，不应该触发 
*/
export class ShouldNotBeComponent1 {
  method() {}
}

// 这里装饰器和类名之间有很多东西
export class NormalClass1 {
  method() {}
}

const str1 = '@Component this is in a string';
const str2 = \`@Entry this is in a template string\`;

// 真正有装饰器的类
@Entry
@Component
struct RealEntryClass1 {
  build() {
    // 这里的 build 方法应该被识别
    const temp = '@Page in build method';
  }
}

// 多个装饰器混在字符串中
@Page
struct RealPageClass1 {
  build() {
    return 'blah';
  }
}
`;

fs.writeFileSync(path.join(srcDir, 'extreme1_decorators.ets'), test1Content);
console.log('✅ 创建 extreme1_decorators.ets');

// ===========================================
// 极端测试场景 2: 括号和类定义在字符串/注释中
// ===========================================
const test2Content = `// 极端场景 2 - 括号地狱
export class NormalClass2 {
  method() {
    // 字符串中有 {
    const a = "class FakeClass {";
    return a;
  }
  
  // 方法中也有类似类的东西
  anotherMethod() {
    function internal() { return 1; }
  }
}

/* 
  注释中有类定义：
  export class CommentClass {
    shouldNotBeFound() {}
  }
*/

const codeInString = \`
  export class StringClass {
    method() {}
  }
\`;

@Builder
export struct RealComponent2 {
  build() {
    Text('test');
  }
}

// 嵌套很深的大括号
export class NestingHell2 {
  a() {
    b() {
      c() {
        d() {
          e() {}
        }
      }
    }
  }
}
`;

fs.writeFileSync(path.join(srcDir, 'extreme2_brackets.ets'), test2Content);
console.log('✅ 创建 extreme2_brackets.ets');

// ===========================================
// 极端测试场景 3: 各种类型定义和边界
// ===========================================
const test3Content = `// 极端场景 3 - 类型定义
interface ITest {
  name: string;
}

type MyType = {
  value: number;
};

// 这些不应该被识别为类
export class RealClass3 {
  prop1: string;
  prop2: number;
  
  constructor() {}
  
  // 构造函数在 skipKeywords 中，不会被识别
  regularMethod() {}
}

@Component
export struct Component3 {
  build() {}
}

function topLevelFunction3() { return 1; }

async function asyncFunction3() { return Promise.resolve(); }

export function exportedFunction3() { return 1; }

// 很多奇怪的命名
export class $test {
  $method() {}
  test$() {}
}

export class _private {
  _privMethod() {}
}

// 这个类只有1个字母（会被过滤吗？）
export class A {
  method() {} // 这个方法名太短，会被过滤
  normalMethod() {}
}
`;

fs.writeFileSync(path.join(srcDir, 'extreme3_types.ets'), test3Content);
console.log('✅ 创建 extreme3_types.ets');

// ===========================================
// 极端测试场景 4: 混合混乱的真实场景
// ===========================================
const test4Content = `// 极端场景 4 - 真实代码混乱场景
import { X } from 'some-package';

@Entry
@Component
export struct MainPage {
  build() {
    Column() {
      Text('Hello')
      Button('Click')
    }
  }
  
  @Builder
  customBuilder() {}
}

export class ServiceLayer {
  getData() {}
  
  processData() {}
}

export interface IData {}

const constants = {
  key1: 'value',
  key2: 'value'
};

function utility() { return 1; }

/* 复杂的注释 */
// @Component this is commented

// 又一个正常类
export class AnotherClass {
  method1() {}
  
  method2() {}
  
  @Builder
  someBuilder() {}
}

// 正则表达式里有 /class/ 等
const regexTest = /class\\s+\\w+/g;
const testResult = regexTest.test('test');

export const someExport = {};

export let someLet = {};

export var someVar = {};
`;

fs.writeFileSync(path.join(srcDir, 'extreme4_mixed.ets'), test4Content);
console.log('✅ 创建 extreme4_mixed.ets');

console.log('\n🎉 所有极端测试场景创建完成！');
