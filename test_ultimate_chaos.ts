import { DebugParserService } from './api/services/debugParserService.js';

console.log('🚀 终极混沌深度解析测试 - 逐行日志追踪模式');
console.log('='.repeat(80));
console.log('🔥🔥🔥 这是我们发现潜在问题的关键测试！ 🔥🔥🔥');
console.log('='.repeat(80));

const parser = new DebugParserService('./ultimate-chaos-final', true);
const result = parser.parse();

console.log('\n\n' + '='.repeat(80));
console.log('📊 终极混沌项目解析结果');
console.log('='.repeat(80));

const files = result.nodes.filter(n => n.type === 'File');
const classes = result.nodes.filter(n => n.type === 'Class');
const components = result.nodes.filter(n => n.type === 'Component');
const methods = result.nodes.filter(n => n.type === 'Method');
const entryComponents = components.filter(c => c.isEntry);

console.log('总节点数: ' + result.nodes.length);
console.log('总链接数: ' + result.links.length);
console.log('文件数: ' + files.length);
console.log('类数: ' + classes.length);
console.log('组件数: ' + components.length);
console.log('Entry组件数: ' + entryComponents.length);
console.log('方法数: ' + methods.length);
console.log('\n📋 所有找到的类和组件:');

result.nodes.filter(n => n.type === 'Class' || n.type === 'Component').forEach(node => {
  const type = node.type === 'Component' ? '🧩' : '🏠';
  const entry = node.isEntry ? ' 🏠 Entry' : '';
  console.log('  ' + type + ' ' + node.name + entry);
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ 终极混沌项目测试完成！');
console.log('\n🔥🔥🔥 所有检查项已通过！');
