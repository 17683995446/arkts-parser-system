import * as fs from 'fs';
import * as path from 'path';

const projectDir = './ultimate-super-chaos';
const srcDir = path.join(projectDir, 'src');

if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true });
}
fs.mkdirSync(srcDir, { recursive: true });

console.log('🚀🚀🚀 第六轮：创建终极超级混乱测试项目！');
console.log('================================================================================');
console.log('🔥🔥🔥 包含所有极端情况！');
console.log('================================================================================');

// 文件1：超级组合 - 所有边界情况的综合
const chaos1 = `// 🔥 终极超级混乱文件1
// 注释中有 @Entry 和 @Component
/* 多行注释中的 export struct FakeComponent { build(); } */
export class NormalClassBefore {
  method() {
    // 字符串中包含 class/struct
    const str1 = "export class StringClass { method() { return 'fake'; } }";
    const str2 = '@Component export struct StringStruct {}';
    // 正则中包含 class/struct
    const regex = /class\s+\w+/g;
    return str1 + str2;
  }
}

@Entry
@Component
export struct RealComponent1 {
  build() {
    Column() { Text('真的组件1'); }
  }
  
  @Builder
  builderMethod() {
    Row() {}
  }
}

// 未闭合的字符串！测试边界
const unclosedString = "这个字符串不会闭合...
export class ThisShouldNotExist {
  hiddenMethod() { return 'gone'; }
}

export class RealClassAfter {
  realMethod() { return '这里真的存在！'; }
}`;

// 文件2：注释地狱和特殊字符
const chaos2 = `// 🔥 终极超级混乱文件2
/* 多重嵌套注释的问题！
  /* 嵌套注释 */
*/
// 单个 / 号的情况
export class ClassWithDollarSign {
  dollarMethod() { return 'test'; }
}

export class $DollarStart {
  $dollarMethod() { return '$'; }
}

@Entry
@Component
export struct RealComponent2 {
  build() {
    Text('真的组件2');
  }
}`;

// 文件3：深度嵌套地狱
const chaos3 = `// 🔥 终极超级混乱文件3
export class NestedLevel1 {
  method1() {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            if (true) {
              if (true) {
                if (true) {
                  if (true) {
                    // 深度嵌套8层！
                    class DeepClass {
                      deepMethod() { return 'deep'; }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

@Entry
@Component
export struct AfterDeepNesting {
  build() {
    Text('深度嵌套之后');
  }
}`;

// 文件4：混合装饰器
const chaos4 = `// 🔥 终极超级混乱文件4
const fakeDecoratorInString = "@Component";
const anotherFakeDecorator = "@Entry";

export class NotAComponent {
  method() { return 'not a component'; }
}

// 连续装饰器
@Entry
@Entry
@Entry
@Component
@Component
@Component
export struct MultipleDecorators {
  build() {
    Text('连续装饰器');
  }
}`;

// 文件5：极长文件名和长类名
const chaos5 = `// 🔥 终极超级混乱文件5
export class ThisIsAVeryLongClassNameThatShouldBeHandledProperlyWithoutIssues {
  thisIsALongMethodNameThatWorksWell() { return 'long name'; }
}

@Entry
@Component
export struct ThisIsALongComponentNameThatWorksGreat {
  build() {
    Text('长组件名');
  }
}`;

// 文件6：大量小类和小方法
let chaos6 = `// 🔥 终极超级混乱文件6\n`;
for (let i = 1; i <= 50; i++) {
  chaos6 += `export class TinyClass${i} { tinyMethod${i}() { return ${i}; } }\n\n`;
}
chaos6 += `@Entry
@Component
export struct AfterTinyClasses {
  build() {
    Text('大量小类之后');
  }
}`;

// 文件7：空类和特殊结构
const chaos7 = `// 🔥 终极超级混乱文件7
export class EmptyClass {}

export class ClassWithOnlyComments {
  // Only comments
  /* No methods */
}

export class ClassWithEmptyMethod {
  emptyMethod() {}
}

@Entry
@Component
export struct EmptyComponent {
  build() {
    Text('');
  }
}`;

// 写入所有文件
fs.writeFileSync(path.join(srcDir, 'super-chaos1.ets'), chaos1);
fs.writeFileSync(path.join(srcDir, 'super-chaos2.ets'), chaos2);
fs.writeFileSync(path.join(srcDir, 'super-chaos3.ets'), chaos3);
fs.writeFileSync(path.join(srcDir, 'super-chaos4.ets'), chaos4);
fs.writeFileSync(path.join(srcDir, 'super-chaos5.ets'), chaos5);
fs.writeFileSync(path.join(srcDir, 'super-chaos6.ets'), chaos6);
fs.writeFileSync(path.join(srcDir, 'super-chaos7.ets'), chaos7);

console.log('\n✅ 终极超级混乱测试项目创建完成！');
console.log('📦 共7个极端测试文件！');
console.log('================================================================================');
