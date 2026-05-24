import * as fs from 'fs';
import * as path from 'path';

const projectDir = './ultimate-chaos-final';
const srcDir = path.join(projectDir, 'src');
if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true });
}
fs.mkdirSync(srcDir, { recursive: true });

console.log('🚀 创建终极混沌测试项目! 🔥🔥🔥');
console.log('包含极端场景: 注释地狱、未闭合字符串、嵌套地狱、正则地狱、字符串中的字符串!');

// 文件1: 注释地狱（多种注释组合
const commentsHell = `// 注释地狱文件 🔥
// 多行注释前的一行
/* 普通多行注释 */
export class NormalClass1 {
  method() {
    const str1 = "/* 这不是注释中的注释 /* 嵌套注释 */ 字符串中还有另一个注释";
    // 单行注释后的一行
    const str2 = '// 这也不是单行注释';
    const str3 = "/* 这也不是多行注释内容 */";
    return str1 + str2;
  }
}

@Entry
@Component
export struct RealComponent1 {
  build() {
    Text('真组件1');
  }
}

// 这个是真注释中的假类
// export class FakeInComment { method() {} }
export class NormalClass2 {
  method() {
    const regex = /class/; // 正则
    return regex;
  }
}
`;

// 文件2: 字符串地狱（未闭合字符串、未闭合注释等边界情况
const stringHell = `// 字符串地狱文件 🔥🔥
export class StringHell {
  method() {
    // 未闭合字符串测试
    const s1 = "未闭合字符串...";
// 这应该不会被吞掉！
export class ShouldExist1 {
  shouldExistMethod() { return "在后面"; }
}
`;

// 文件3: 嵌套地狱（深度嵌套类方法
const nestingHell = `// 嵌套地狱文件 🔥
export class NestingHell {
  level1() {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            if (true) {
              if (true) {
                if (true) {
                  // 深度 7层嵌套
                  const nested = {
                    a: 1, b: { c: 2, d: { e: 3 } }
                  };
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
export struct AfterNesting {
  build() {
    Column() {
      Column() {
        Column() {
          Text('三层嵌套!');
        }
      }
    }
  }
}
`;

// 文件4: 正则地狱
const regexHell = `// 正则地狱文件 🔥
export class RegexHell {
  method() {
    // 各种类型正则表达式
    const r1 = /class/;
    const r2 = /class struct /;
    const r3 = /class{/;
    const r4 = /\\w+class/;
    const r5 = /class\\s+struct/g;
    const r6 = /\\/class/;
    const r7 = /class.*struct/;
    const r8 = /class.*{/;
    return r1;
  }
}

@Entry
@Component
export struct AfterRegex {
  build() {
    Text('正则之后的组件');
  }
}

export class AfterRegexClass {
  method() { return "完成!"; }
}
`;

// 文件5: 特殊字符地狱
const specialCharsHell = `// 特殊字符地狱文件 🔥
export class SpecialClass {
  method() {
    const str1 = "$美元$$多个$test$";
    const str2 = "$符号混合$class$";
    const str3 = "$struct$";
    return str1;
  }
}
export class $NormalClassWithDollar {
  $dollarMethod() { return "yes"; }
}
@Entry
@Component
export struct RealComponent {
  build() {
    Text('$');
  }
}
`;

// 文件6: 超长代码块地狱
let longClass = "export class LongClass {\n";
for (let i = 1; i <= 200; i++) {
  longClass += `  method${i}() { return ${i}; }\n`;
}
longClass += "}\n";

longClass += "\n@Entry\n@Component\nexport struct AfterLongClass {\n  build() { Text('after'); }\n}";

// 文件7: 装饰器地狱
const decoratorHell = `// 装饰器地狱 🔥
/* 这不是装饰器 */ const decorator1 = "@Entry";
const decorator2 = "@Component";
/* 装饰器地狱 */ export class NotComponent {
  normalMethod() { return "no"; }
}

@Entry
@Entry
@Entry
@Component
@Component
export struct MultipleDecorators {
  build() {
    Text('多个装饰器');
  }
}
`;

// 文件9: 空类、空方法
const emptyClass = `// 空类文件 🔥
export class EmptyClass1 {}
export class EmptyClass2 { method() {} }
export class NormalAfterEmpty {
  method() { return "yes"; }
}
`;

// 写入所有文件
fs.writeFileSync(path.join(srcDir, '1_comments.ets'), commentsHell);
fs.writeFileSync(path.join(srcDir, '2_strings.ets'), stringHell);
fs.writeFileSync(path.join(srcDir, '3_nesting.ets'), nestingHell);
fs.writeFileSync(path.join(srcDir, '4_regex.ets'), regexHell);
fs.writeFileSync(path.join(srcDir, '5_special.ets'), specialCharsHell);
fs.writeFileSync(path.join(srcDir, '6_long.ets'), longClass);
fs.writeFileSync(path.join(srcDir, '7_decorators.ets'), decoratorHell);
fs.writeFileSync(path.join(srcDir, '9_empty.ets'), emptyClass);

console.log('✅ 终极混沌测试项目创建完成！');
console.log('🔥 8个极端混沌测试文件已创建！');
console.log('🔥🔥🔥');
