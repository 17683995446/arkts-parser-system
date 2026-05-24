import * as fs from 'fs';
import * as path from 'path';

const projectDir = './comprehensive-test';

// 创建项目目录
if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir, { recursive: true });
}
if (!fs.existsSync(path.join(projectDir, 'src'))) {
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
}

const testFiles = {
  // 边界测试 1: 未闭合多行注释（会吃掉整个文件）
  'boundary1_unclosed_multiline_comment.ets': `// 这应该被识别
class ShouldBeFound {
  method1() { return 1; }
}

/* 未闭合的多行注释开始
这会导致整个文件被误判吗？
export class ThisShouldNotBeFound {
  method2() {}
}
`,

  // 边界测试 2: 正则表达式（会被误识别吗？）
  'boundary2_regex_pattern.ets': `export class RegexClass {
  test() {
    const pattern = /class|struct|function/g;
    const match = "test".match(/class/g);
    return pattern.test("class");
  }
}

export class AfterRegex {
  actualMethod() { return true; }
}
`,

  // 边界测试 3: 嵌套类
  'boundary3_nested_classes.ets': `export class OuterClass {
  outerMethod() { return 1; }
  
  class InnerClass {
    innerMethod() { return 2; }
  }
  
  class AnotherInner {
    anotherMethod() { return 3; }
  }
}

export class AfterOuter {
  afterMethod() { return 4; }
}
`,

  // 边界测试 4: 构造函数（constructor在skipKeywords中）
  'boundary4_constructor.ets': `export class ConstructorClass {
  constructor() {
    console.log("init");
  }
  
  otherMethod() {
    return 1;
  }
}
`,

  // 边界测试 5: Builder 装饰器
  'boundary5_builder_decorator.ets': `export class BuilderClass {
  @Builder
  myBuilder() {
    Column() {
      Text("test")
    }
  }
  
  @Builder
  anotherBuilder() {
    Row() {}
  }
}
`,

  // 边界测试 6: 箭头函数方法
  'boundary6_arrow_functions.ets': `export class ArrowClass {
  regularMethod() {
    return 1;
  }
  
  arrowMethod = () => {
    return 2;
  }
  
  anotherArrow = (x: number) => {
    return x + 1;
  }
}
`,

  // 边界测试 7: Getter/Setter
  'boundary7_getter_setter.ets': `export class AccessorClass {
  private _value: number = 0;
  
  get value(): number {
    return this._value;
  }
  
  set value(v: number) {
    this._value = v;
  }
}
`,

  // 边界测试 8: 空类和方法
  'boundary8_empty_class.ets': `export class EmptyClass {
}

export class AlmostEmpty {
  method() {}
}
`,

  // 边界测试 9: 注释中的class关键字
  'boundary9_comment_class.ets': `// class is a keyword
// export class Test {}
/* export class BlockComment {}
*/
export class ActualClass {
  method() { return 1; }
}

// Also class in string
export class StringClass {
  method() {
    const s = "class keyword in string";
    return s;
  }
}
`,

  // 边界测试 10: 特殊字符和Unicode
  'boundary10_unicode.ets': `export class UnicodeClass {
  日本語メソッド() { return 1; }
  emojiMethod() { return 2; }
  _privateMethod() { return 3; }
  $dollarMethod() { return 4; }
}

export class UnicodeClass2 {
  私有方法() { return 5; }
}
`,

  // 边界测试 11: 接口和类型（按设计不识别，但测试边界）
  'boundary11_interface_type.ets': `interface MyInterface {
  name: string;
  age: number;
}

type MyType = {
  value: number;
}

export class UsingInterface implements MyInterface {
  name = "test";
  age = 25;
}
`,

  // 边界测试 12: export default
  'boundary12_export_default.ets': `export default class DefaultExport {
  defaultMethod() { return 1; }
}

export class NamedExport {
  namedMethod() { return 2; }
}
`,

  // 边界测试 13: 复杂装饰器组合
  'boundary13_complex_decorators.ets': `@Entry
@Component
struct ComplexDecorator {
  build() {
    Column() {}
  }
}

export class NormalDecorator {
  @Builder
  customBuilder() {
    Row() {}
  }
}
`,

  // 边界测试 14: 方法重载（TypeScript）
  'boundary14_method_overload.ets': `export class OverloadClass {
  method(a: string): string;
  method(a: number): number;
  method(a: string | number): string | number {
    return a;
  }
}
`,

  // 边界测试 15: 命名空间
  'boundary15_namespace.ets': `namespace MyNamespace {
  export class InsideNamespace {
    nsMethod() { return 1; }
  }
}

export class OutsideNamespace {
  outsideMethod() { return 2; }
}
`,

  // 边界测试 16: 异步方法
  'boundary16_async_methods.ets': `export class AsyncClass {
  async fetchData(): Promise<string> {
    return "data";
  }
  
  async asyncMethod() {
    const result = await Promise.resolve(1);
    return result;
  }
}
`,

  // 边界测试 17: 静态方法
  'boundary17_static_methods.ets': `export class StaticClass {
  static create(): StaticClass {
    return new StaticClass();
  }
  
  static factoryMethod() {
    return { type: "factory" };
  }
  
  instanceMethod() {
    return 1;
  }
}
`,

  // 边界测试 18: 复杂字符串（SQL、HTML、JSON）
  'boundary18_complex_strings.ets': `export class StringHell {
  sqlMethod() {
    const sql = "SELECT * FROM class WHERE struct = 'value'";
    const html = "<div class='container'>class</div>";
    const json = '{"type": "class", "value": "struct"}';
    return sql + html + json;
  }
}

@Component
struct TemplateComponent {
  build() {
    Text(\`This is class and struct in template\`)
  }
}
`,

  // 边界测试 19: 注释中的装饰器（不应被识别）
  'boundary19_decorator_in_comment.ets': `// @Entry
// @Component
export class CommentedDecorator {
  commentedMethod() { return 1; }
}

/*
  @Component
  class NotRealClass {
    notRealMethod() {}
  }
*/

export class RealClass {
  realMethod() { return 2; }
}
`,

  // 边界测试 20: 超长类名和奇怪命名
  'boundary20_long_names.ets': `export class ClassWithVeryLongNameThatMightCauseIssues123 {
  method() { return 1; }
}

export class _UnderscoreStart {
  underscoreMethod() { return 2; }
}

export class $DollarStart {
  dollarMethod() { return 3; }
}

export class AllCapsClassName {
  ALLCAPS() { return 4; }
}
`,

  // 边界测试 21: 方法中的对象字面量
  'boundary21_object_literal.ets': `export class ObjectLiteral {
  method() {
    const obj = {
      class: "value",
      method: function() { return 1; },
      get accessor() { return 2; }
    };
    return obj;
  }
}
`,

  // 边界测试 22: 继承和泛型
  'boundary22_inheritance_generic.ets': `export class Parent<T> {
  parentMethod(): T {
    return null as T;
  }
}

export class Child extends Parent<number> {
  childMethod() { return 1; }
}
`,

  // 边界测试 23: Mixin 和多继承
  'boundary23_mixin.ets': `class Mixin1 {
  mixin1Method() { return 1; }
}

class Mixin2 {
  mixin2Method() { return 2; }
}

export class Combined extends Mixin1 {
  combinedMethod() { return 3; }
}
`,

  // 边界测试 24: 三引号字符串（Python风格）
  'boundary24_triple_quotes.ets': `export class TripleQuote {
  method() {
    const s1 = '''triple single''';
    const s2 = """triple double""";
    return s1 + s2;
  }
}
`,

  // 边界测试 25: 文件结束无换行
  'boundary25_no_newline_at_end.ets': `export class NoNewline {
  method() { return 1; }
}`,
};

// 写入所有测试文件
Object.entries(testFiles).forEach(([filename, content]) => {
  const filepath = path.join(projectDir, 'src', filename);
  fs.writeFileSync(filepath, content);
  console.log(`✅ Created: ${filename} (${content.split('\n').length} lines)`);
});

console.log(`\n✅ Created comprehensive test project with ${Object.keys(testFiles).length} test files`);
