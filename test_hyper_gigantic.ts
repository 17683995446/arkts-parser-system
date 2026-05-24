import { ParserService } from './api/services/parserService.js';

console.log('🚀 第五轮：超大型项目测试');
console.log('================================================================================');
console.log('测试项目: Hyper Gigantic');
console.log('================================================================================');

const start = Date.now();
const parser = new ParserService('./hyper-gigantic-test');
const result = parser.parse();
const end = Date.now();

const files = result.nodes.filter(n => n.type === 'File');
const classes = result.nodes.filter(n => n.type === 'Class');
const components = result.nodes.filter(n => n.type === 'Component');
const methods = result.nodes.filter(n => n.type === 'Method');
const entryComponents = components.filter(c => c.isEntry);

console.log('\n📊 结果统计:');
console.log('  总节点数: ' + result.nodes.length);
console.log('  总链接数: ' + result.links.length);
console.log('  耗时: ' + (end - start) + 'ms');

console.log('\n📋 详细统计:');
console.log('  📄 文件: ' + files.length);
console.log('  🏠 类: ' + classes.length);
console.log('  🧩 组件: ' + components.length);
console.log('  🏠 Entry组件: ' + entryComponents.length);
console.log('  ⚙️  方法: ' + methods.length);

console.log('\n================================================================================');

if (files.length === 100 && classes.length === 2500 && components.length === 2500) {
  console.log('\n🎉🎉🎉 超大型项目完美通过！');
} else {
  console.log('\n⚠️ 超大型项目统计有问题！');
}
