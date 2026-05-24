import { ParserService } from './api/services/parserService.js';

console.log('🚀 开始超级边界测试...');
console.log('='.repeat(80));

const parser = new ParserService('./super-extreme-test');
const result = parser.parse();

console.log('\n📊 测试结果：');
console.log(`  总节点数: ${result.nodes.length}`);
console.log(`  总链接数: ${result.links.length}`);

const files = result.nodes.filter(n => n.type === 'File');
const classes = result.nodes.filter(n => n.type === 'Class');
const components = result.nodes.filter(n => n.type === 'Component');
const methods = result.nodes.filter(n => n.type === 'Method');
const entryComponents = components.filter(c => c.isEntry);

console.log('\n📋 节点类型统计:');
console.log(`  📄 文件: ${files.length}`);
console.log(`  🏠 类: ${classes.length}`);
console.log(`  🧩 组件: ${components.length}`);
console.log(`  🏠 Entry组件: ${entryComponents.length}`);
console.log(`  ⚙️  方法: ${methods.length}`);

console.log('\n📝 所有找到的节点:');
result.nodes.filter(n => n.type !== 'File').forEach(node => {
  const entry = node.isEntry ? ' 🏠' : '';
  const file = node.file ? ` (${node.file})` : '';
  console.log(`  [${node.type}] ${node.name}${entry}${file}`);
});

console.log('\n✅ 超级边界测试完成！');
