import * as fs from 'fs';
import * as path from 'path';

const projectDir = './super-extreme-chaos-final';
const srcDir = path.join(projectDir, 'src');

if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true });
}
fs.mkdirSync(srcDir, { recursive: true });

console.log('🚀🚀🚀 第七轮：创建超级极端复杂测试项目');
console.log('================================================================================');
console.log('🔥🔥🔥 这是最极端的测试！包含所有边界情况和真实场景！');
console.log('================================================================================');

// 文件1：超级组合 - 所有边界情况的综合
const chaos1 = `// 🔥 超级极端混乱文件1 - 所有情况组合
// 注释中的 @Entry 和 @Component
/* 多行注释中的 @Component export struct FakeComponent { build(); } */
export class NormalClass1 {
  method1() {
    const str1 = "@Entry export class StringClass {}";
    const str2 = '@Component export struct StringStruct {}';
    const regex = /class\\s+\\w+/g;
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

// 连续装饰器
@Entry
@Entry
@Component
export struct MultipleDecorators1 {
  build() {
    Text('连续装饰器');
  }
}

export class AfterMultipleDecorators {
  method() { return 'after'; }
}

// $符号特殊处理
export class DollarClass {
  $dollarMethod() { return '$'; }
}

export class $DollarStart {
  method() { return 'starts with $'; }
}

@Entry
@Component
export struct RealComponent2 {
  $build() {
    Text('$ in method');
  }
}`;

// 文件2：Unicode和特殊字符
const chaos2 = `// 🔥 Unicode和特殊字符测试
export class 中文类名 {
  中文方法() { return '中文'; }
}

export class EmojiClass123 {
  emojiMethod() { return '😀'; }
}

export class SpecialChars_Class {
  special_123_Method() { return 'special'; }
}

@Entry
@Component
export struct UnicodeComponent {
  build() {
    Text('Unicode 测试');
  }
}`;

// 文件3：深度嵌套地狱
const chaos3 = `// 🔥 深度嵌套地狱
export class Nested1 {
  level1() {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            if (true) {
              if (true) {
                if (true) {
                  if (true) {
                    if (true) {
                      if (true) {
                        // 10层嵌套！
                        const obj = { a: { b: { c: { d: { e: 1 } } } } };
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
}

export class NestingAfter {
  after() { return 'after deep nesting'; }
}

@Entry
@Component
export struct AfterNestingComponent {
  build() {
    Text('深度嵌套之后');
  }
}`;

// 文件4：超长类名和方法名
const chaos4 = `// 🔥 超长类名和方法名
export class ThisIsAVeryVeryVeryLongClassNameThatShouldBeHandledPerfectly {
  thisIsAVeryVeryVeryLongMethodNameThatShouldBeHandledPerfectly() { return 'long'; }
  anotherVeryVeryLongMethodNameWithDifferentPrefix() { return 'long2'; }
}

export class VeryLongClassName_Test_123_ABC {
  veryLongMethodName_Test_123() { return 'test'; }
}

@Entry
@Component
export struct VeryLongComponentName_Test_123_ABC {
  build() {
    Text('长名字组件');
  }
  
  anotherVeryLongMethodName() {
    Column() {}
  }
}`;

// 文件5：大量小类
let chaos5 = `// 🔥 大量小类测试
`;
for (let i = 1; i <= 100; i++) {
  chaos5 += `export class SmallClass${i} { method${i}() { return ${i}; } }
`;
}
chaos5 += `
@Entry
@Component
export struct AfterManySmallClasses {
  build() { Text('100个小类之后'); }
}
`;

// 文件6：真实项目场景
const chaos6 = `// 🔥 真实项目场景测试
// 模拟真实项目中的复杂结构

// 数据模型
export class UserModel {
  id: number = 0;
  name: string = '';
  email: string = '';
}

export class OrderModel {
  id: number = 0;
  userId: number = 0;
  total: number = 0;
}

// 业务逻辑类
export class UserService {
  private users: UserModel[] = [];
  
  addUser(user: UserModel): void {
    this.users.push(user);
  }
  
  getUser(id: number): UserModel | null {
    return this.users.find(u => u.id === id) || null;
  }
}

// 工具类
export class StringUtils {
  static format(str: string): string {
    return str.trim().toUpperCase();
  }
}

// UI组件
@Entry
@Component
export struct Index {
  @State message: string = 'Hello World';
  
  build() {
    Column() {
      Text(this.message)
        .fontSize(50)
        .fontWeight(FontWeight.Bold)
      
      Button('Click')
        .onClick(() => {
          this.message = 'Clicked!';
        })
    }
    .width('100%')
    .height('100%')
  }
}
`;

// 文件7：空文件和边界情况
const chaos7 = `// 🔥 空类和边界情况
export class EmptyClass {}

export class ClassWithEmptyMethods {
  emptyMethod1() {}
  emptyMethod2() {}
}

export class ClassWithOnlyComments {
  // This is a comment
  /* This is also a comment */
  // Another comment
}

@Entry
@Component
export struct EmptyComponent {
  build() {}
}
`;

// 写入所有文件
fs.writeFileSync(path.join(srcDir, 'chaos1_all_combinations.ets'), chaos1);
fs.writeFileSync(path.join(srcDir, 'chaos2_unicode.ets'), chaos2);
fs.writeFileSync(path.join(srcDir, 'chaos3_deep_nesting.ets'), chaos3);
fs.writeFileSync(path.join(srcDir, 'chaos4_long_names.ets'), chaos4);
fs.writeFileSync(path.join(srcDir, 'chaos5_many_small.ets'), chaos5);
fs.writeFileSync(path.join(srcDir, 'chaos6_real_scenario.ets'), chaos6);
fs.writeFileSync(path.join(srcDir, 'chaos7_empty.ets'), chaos7);

console.log('\n✅ 超级极端复杂测试项目创建完成！');
console.log('📦 共7个极端测试文件！');
console.log('🔥🔥🔥 包含所有真实场景！');
console.log('================================================================================');
