import * as fs from 'fs';
import * as path from 'path';

const projectDir = './super-extreme-test';
const srcDir = path.join(projectDir, 'src');

if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true });
}
fs.mkdirSync(srcDir, { recursive: true });

console.log('🚀 创建超级边界测试项目...');

// 文件1: 模板字符串中的代码（容易误识别）
const templateString = `// Super Extreme Test 1: 模板字符串中的代码
export class NormalClass1 {
  method1() {
    const code1 = "export class FakeInTemplate { fakeMethod() {} }";
    const code2 = "@Entry @Component export struct FakeComponent { build() {} }";
    return code1 + code2;
  }
}

@Entry
@Component
export struct RealComponent {
  build() {
    Text('Real');
  }
}

export class NormalClass2 {
  test() { return 1; }
}
`;

// 文件2: TypeScript类型注解和泛型
const typescriptFile = `
// Super Extreme Test 2: TypeScript类型注解和泛型
export class GenericClass<T, U> {
  value: T;
  callback: any;
  
  methodWithTypes(): Promise<T[]> {
    return Promise.resolve([]);
  }
}

@Component
export struct GenericComponent<T> {
  build() {
    Text('Generic');
  }
}

export class ComplexTypes {
  mapField: any;
  optionalField: any;
  readonlyField: any;
}

export class NestedGenerics {
  deeplyNested: any;
}
`;

// 文件3: 特殊标识符（数字、Unicode等）
const specialIdentifiers = `
// Super Extreme Test 3: 特殊标识符
export class UnicodeClass {
  method() { return 1; }
}

export class _Private_Class_$ {
  _private$Method() { return 1; }
  publicMethod() { return 2; }
}

export class ThisIsAVeryLongClassNameThatExceedsNormalLength {
  thisIsAVeryLongMethodNameThatExceedsNormalLength() {
    return 1;
  }
}

export class CamelCase123 {
  camelCase123() { return 1; }
  PascalCase456() { return 2; }
}
`;

// 文件4: 多重装饰器和装饰器参数
const decoratorsFile = `
// Super Extreme Test 4: 多重装饰器和装饰器参数
@Component
@Entry
export struct ComponentWithArgs {
  build() {
    Text('args');
  }
}

// 装饰器在注释中
// @Component
// @Entry
export class NotDecorated {
  method() { return 1; }
}

// 装饰器在字符串中
const decoratorStr = "@Component";
export class AlsoNotDecorated {
  notMethod() { return 2; }
}

@Component
export struct BuilderComponent {
  @Builder
  myBuilder(config: any) {
    Column() { Text('config'); }
  }
  
  build() {
    Column() { Text('build'); }
  }
}
`;

// 文件5: 深度嵌套和复杂结构
const nestingFile = `
// Super Extreme Test 5: 深度嵌套和复杂结构
export class DeepNesting {
  level1() {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            if (true) {
              class VeryDeepClass {
                veryDeepMethod() { return 'deep'; }
              }
            }
          }
        }
      }
    }
  }
}

export class ComplexExpressions {
  chainedCalls() {
    return this;
  }
  
  computedProps() {
    const obj: any = {};
    return obj;
  }
}

export class ArrowFunctions {
  callbacks: any[] = [];
}
`;

// 文件6: 未闭合和语法错误场景
const unclosedFile = `
// Super Extreme Test 6: 未闭合和边界场景
export class BeforeUnclosed {
  method() {
    const str = "unclosed string";
    return str;
  }
}

export class AfterUnclosedString {
  actualMethod() { return 1; }
}

/* This comment never closes

export class HiddenInComment {
  hiddenMethod() {}
}

export class AfterUnclosedComment {
  visibleMethod() { return 2; }
}
`;

// 文件7: 特殊字符和边界标识符
const specialCharsFile = `
// Super Extreme Test 7: 特殊字符和边界标识符
export class DollarSigns {
  dollarfield: string = "";
  doubledollar: number = 0;
  dollarmethod() { return this.dollarfield; }
  tripledollar() { return 1; }
}

class _PrivateClass {
  _privateMethod() { return 1; }
}

export class SpecialChars {
  template() {
    const str1 = "With template and Interpolation";
    const str2 = "Escaped backslash quotes";
    const str3 = "Single quote in string";
    return str1 + str2 + str3;
  }
}
`;

// 文件8: 循环引用和复杂依赖
const circularFile = `
// Super Extreme Test 8: 循环引用和复杂依赖
export class ClassA {
  useClassB() {
    return new ClassB();
  }
}

export class ClassB {
  useClassA() {
    return new ClassA();
  }
}

@Component
export struct ComponentA {
  build() {
    Column() { Text('A'); }
  }
}

@Component
export struct ComponentB {
  @Builder
  builderA() {
    ComponentA({});
  }
  
  build() {
    Column() { Text('B'); }
  }
}
`;

// 写入所有文件
fs.writeFileSync(path.join(srcDir, 'test1-templates.ets'), templateString);
fs.writeFileSync(path.join(srcDir, 'test2-typescript.ets'), typescriptFile);
fs.writeFileSync(path.join(srcDir, 'test3-identifiers.ets'), specialIdentifiers);
fs.writeFileSync(path.join(srcDir, 'test4-decorators.ets'), decoratorsFile);
fs.writeFileSync(path.join(srcDir, 'test5-nesting.ets'), nestingFile);
fs.writeFileSync(path.join(srcDir, 'test6-unclosed.ets'), unclosedFile);
fs.writeFileSync(path.join(srcDir, 'test7-specialchars.ets'), specialCharsFile);
fs.writeFileSync(path.join(srcDir, 'test8-circular.ets'), circularFile);

console.log('✅ 超级边界测试项目创建完成！');
console.log('📦 包含8个测试文件，测试场景：');
console.log('  1. 模板字符串中的代码');
console.log('  2. TypeScript类型注解和泛型');
console.log('  3. 特殊标识符（Unicode、下划线、$）');
console.log('  4. 多重装饰器和装饰器参数');
console.log('  5. 深度嵌套和复杂结构');
console.log('  6. 未闭合和语法错误场景');
console.log('  7. 特殊字符和边界标识符');
console.log('  8. 循环引用和复杂依赖');
