import * as fs from 'fs';
import * as path from 'path';

const projectDir = './ultimate-chaos-test';
const srcDir = path.join(projectDir, 'src');

if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

// 文件1：终极混乱 - 所有问题场景集中
const chaos1 = `// 🔥 终极混乱场景 1 - 绝对疯狂的文件
// 注释中有 @Component 和 @Entry
/* 多行注释也有装饰器 @Page 
class InComment { /* 嵌套 */ method(){} } 
*/
// 字符串中也有装饰器 "const a = '@Component';";

export class NormalClass1 {
  method1() {
    // 字符串中有 { 和 }
    const str1 = "class Fake1 {";
    const str2 = 'class Fake2 {';
    const str3 = \`class Fake3 {
      method(){}
    }\`;
    
    // 正则表达式中也有内容
    const regex1 = /class\\s+\\w+/g;
    const regex2 = /class\\s+[\\w\$]+\\s*\\{/;
    
    return str1 + str2 + str3;
  }
  
  @Builder
  builderMethod1() {
    Column() { Text('test'); }
  }
  
  method2() {
    // 函数嵌套函数
    function innerFunc1() { return 1; }
    function innerFunc2() { return 2; }
    return innerFunc1() + innerFunc2();
  }
}

// 未闭合的多行注释 - 测试处理能力
/* 这个注释不闭合 

@Entry
@Component
export struct ShouldBeIgnored {
  build(){}
}
*/

@Entry
@Component
struct RealEntryComponent {
  build() {
    Column() {
      Text('real component');
      Button('click');
    }
  }
  
  @Builder
  customBuilder() {
    Row() { /* noop */ }
  }
}

// 混合类定义
export class $ClassWithDollar {
  $methodWithDollar() { return '$'; }
  
  methodWithoutDollar() { return 'ok'; }
}

// 注释中的类
// class CommentedOut { method(){} }

// 空行
export class AnotherNormal {
  build() { // build是关键词但不是Component
    return 'build';
  }
}
`;

// 文件2：嵌套地狱 - 多层嵌套
const chaos2 = `// 🔥 终极混乱场景 2 - 嵌套地狱
export class Level1 {
  level1Method() {
    console.log('level1');
  }
  
  class Level2 { // 嵌套类1
    level2Method() {
      console.log('level2');
      
      class Level3 { // 嵌套类2
        level3Method() {
          console.log('level3');
        }
      }
    }
  }
}

export class NormalAfterNesting {
  normalMethod() { return 1; }
}

/* 多重注释 *//* 嵌套注释 */ // 单行注释

export class $DeepNestedClass {
  $deepMethod() {
    // 很深的嵌套
    let a = 1;
    if (a) {
      if (a) {
        if (a) {
          if (a) {
            if (a) {
              if (a) {
                return 'deep';
              }
            }
          }
        }
      }
    }
  }
}
`;

// 文件3：装饰器地狱
const chaos3 = `// 🔥 终极混乱场景 3 - 装饰器地狱
@Entry
@Component
@Builder
@Builder // 多个装饰器
export struct MultipleDecoratorComponent {
  build() {
    Text('multiple decorators');
  }
  
  @Builder
  @Builder // 重复
  duplicatedBuilder() {
    Column() {}
  }
}

// 装饰器和注释混合
// @Component
/* @Component */
export class NotAComponent {
  normalMethod() { return 'ok'; }
}

// 装饰器和字符串混合
"const decoratorString = '@Component';"
export class AlsoNotAComponent {
  notDecorated() { return 'nope'; }
}

@Page
struct PageWithoutComponent {
  build() {
    Text('just page');
  }
}
`;

// 文件4：标识符地狱 - 各种奇怪名字
const chaos4 = `// 🔥 终极混乱场景 4 - 标识符地狱
export class _UnderscoreStart {
  _privateMethod() { return '_'; }
  publicMethod() { return 'public'; }
}

export class $AndUnderscore {
  $_mixMethod() { return '$_'; }
}

export class MixedCasingAndNumbers {
  camelCase123() { return 1; }
  PascalCase456() { return 2; }
  snake_case_789() { return 3; }
}

// 很长的类名
export class ThisIsAClassWithAVeryLongNameThatMightCauseIssuesButProbablyNotButWeNeedToTest {
  methodWithEvenLongerNameJustToMakeSureEverythingWorks() {
    return 'long method name is fine';
  }
}

// 单个字符类名 - 应该被识别，但方法名太短会被过滤
export class A {
  a() { return 'a'; } // 太短被过滤
  aa() { return 'aa'; } // 正常
}
`;

// 文件5：注释混合地狱
const chaos5 = `// 🔥 终极混乱场景 5 - 注释地狱
export class ClassBeforeComments {
  method1() { return 1; }
}

/* 这是一个注释，中间夹杂了一些代码
export class FakeInComment {
  fakeMethod(){}
}
*/

export class ClassAfterMultiComment {
  method2() { return 2; }
}

// 这是单行注释
// export class AlsoFakeInComment {}

export class RealAfterSingleComment {
  method3() { return 3; }
}

/*
多
行
注
释
多
行
*/

@Entry
@Component
export struct AfterBigComment {
  build() {
    Text('finally after comments');
  }
}
`;

// 文件6：未闭合各种边界
const chaos6 = `// 🔥 终极混乱场景 6 - 未闭合边界
export class ClassBeforeProblems {
  method1() { return 'ok'; }
}

const unclosedString1 = "this string never ends...
const moreCode = "should not be seen"; // 这会被包括在字符串中

export class ShouldBeFoundButMaybeNot {
  method2() { return 'did we find me?'; }
}

// 未闭合的单行注释也没什么问题
// 未闭合的多行注释：
/* 这个注释从这里开始，
一直延续，
永远不闭合。

但是，我们的preprocessContent可以处理这种情况！
export class TotallyLostInComment {
  foreverHidden(){}
}
`;

// 文件7：真实代码混合 - 模拟真实项目
const chaos7 = `// 🔥 终极混乱场景 7 - 真实项目模拟
// 这是一个混合了真实代码和混乱内容的文件

// 真实的组件
@Entry
@Component
struct MainPage {
  build() {
    Column() {
      Text('Hello World!');
      Button('Click Me');
    }
  }
}

// 真实的服务类
export class UserService {
  getUsers() {
    return [
      {id: 1, name: 'Alice'},
      {id: 2, name: 'Bob'}
    ];
  }
  
  updateUser(id: number, data: any) {
    return { id, ...data };
  }
}

// 混乱的常量，包含字符串中的类名
const CODE_SNIPPETS = [
  "export class GeneratedClass1 { method(){} }",
  'export class GeneratedClass2 { method(){} }',
  \`export class GeneratedClass3 { 
    method(){} 
  }\`
];

// 另一个真实组件
@Component
export struct UserList {
  build() {
    List() { /* list implementation */ }
  }
}

export class DataService {
  fetchData() {
    return Promise.resolve({});
  }
}
`;

// 文件8：函数方法混合
const chaos8 = `// 🔥 终极混乱场景 8 - 函数与方法混合
export class MethodContainer {
  method1() { return 1; }
  
  method2() { 
    // 函数嵌套
    function innerFunction() { return 2; }
    return innerFunction(); 
  }
  
  method3() {}
}

// 顶级函数
export function topLevel1() { return 3; }

function topLevel2() { return 4; } // 私有

async function asyncTopLevel() { return Promise.resolve(5); }

export class AnotherContainer {
  anotherMethod() { return 'another'; }
}
`;

// 文件9：大量的代码 - 性能测试
const generateLargeFile = () => {
  let content = '// 🔥 终极混乱场景 9 - 大量代码与性能\n';
  
  for (let i = 1; i <= 50; i++) {
    content += \`
export class LargeClass\${i} {
  method\${i}_1() { return \${i}; }
  method\${i}_2() { return \${i} * 2; }
  method\${i}_3() { return \${i} * 3; }
}
\`;
  }
  
  content += \`
@Component
export struct LargeComponent {
  build() {
    Column() { Text('large'); }
  }
}
\`;
  
  return content;
};

fs.writeFileSync(path.join(srcDir, 'chaos1-ultimate.ets'), chaos1);
fs.writeFileSync(path.join(srcDir, 'chaos2-nesting.ets'), chaos2);
fs.writeFileSync(path.join(srcDir, 'chaos3-decorators.ets'), chaos3);
fs.writeFileSync(path.join(srcDir, 'chaos4-identifiers.ets'), chaos4);
fs.writeFileSync(path.join(srcDir, 'chaos5-comments.ets'), chaos5);
fs.writeFileSync(path.join(srcDir, 'chaos6-unclosed.ets'), chaos6);
fs.writeFileSync(path.join(srcDir, 'chaos7-realistic.ets'), chaos7);
fs.writeFileSync(path.join(srcDir, 'chaos8-functions.ets'), chaos8);
fs.writeFileSync(path.join(srcDir, 'chaos9-large.ets'), generateLargeFile());

console.log('✅ 终极混乱测试项目创建完成！');
console.log('📦 包含 9 个极端测试文件！');
