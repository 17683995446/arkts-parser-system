import { ParserService } from './api/services/parserService.js';

console.log('🧪 开始全面测试...\n');

const parser = new ParserService('./comprehensive-test');
const result = parser.parse();

console.log('\n📊 测试结果统计:');
console.log(`总节点数: ${result.nodes.length}`);
console.log(`总链接数: ${result.links.length}`);

console.log('\n📋 节点详情（按类型分组）:');
const files = result.nodes.filter(n => n.type === 'File');
const classes = result.nodes.filter(n => n.type === 'Class');
const components = result.nodes.filter(n => n.type === 'Component');
const methods = result.nodes.filter(n => n.type === 'Method');

console.log(`\n📁 文件 (${files.length}):`);
files.forEach(f => console.log(`  - ${f.path}`));

console.log(`\n🏠 类 (${classes.length}):`);
classes.forEach(c => console.log(`  - ${c.name}`));

console.log(`\n🧩 组件 (${components.length}):`);
components.forEach(c => console.log(`  - ${c.name}`));

console.log(`\n⚙️ 方法 (${methods.length}):`);
methods.forEach(m => console.log(`  - ${m.name} (${m.class || m.file})`));

console.log('\n🔍 预期 vs 实际:');
console.log('边界测试 1: ShouldBeFound 类应该被找到');
console.log('边界测试 2: RegexClass 和 AfterRegex 应该被找到，正则不应干扰');
console.log('边界测试 3: OuterClass 和两个内部类都应该被找到');
console.log('边界测试 4: ConstructorClass 的 constructor 不应被识别为方法');
console.log('边界测试 5: BuilderClass 的 myBuilder 和 anotherBuilder 应该被找到');
