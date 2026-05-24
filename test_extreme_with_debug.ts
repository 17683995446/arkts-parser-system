import { DebugParserService } from './api/services/debugParserService.js';

console.log('🧪 开始极端场景测试 (带详细日志)\n');
console.log('='.repeat(60));

const parser = new DebugParserService('./extreme-test-project');
const result = parser.parse();

console.log('\n' + '='.repeat(60));
console.log('📊 极端测试结果总结:');
console.log(`- 总节点数: ${result.nodes.length}`);
console.log(`- 总链接数: ${result.links.length}`);

const files = result.nodes.filter(n => n.type === 'File');
const classes = result.nodes.filter(n => n.type === 'Class');
const components = result.nodes.filter(n => n.type === 'Component');
const methods = result.nodes.filter(n => n.type === 'Method');

console.log(`- 文件数: ${files.length}`);
console.log(`- 类数: ${classes.length}`);
console.log(`- 组件数: ${components.length}`);
console.log(`- 方法数: ${methods.length}`);

console.log('\n📋 详细节点列表:');
result.nodes.forEach(node => {
  const extra = node.file ? ` (${node.file})` : node.class ? ` (in ${node.class})` : '';
  const entryFlag = node.isEntry ? ' [ENTRY]' : '';
  console.log(`  [${node.type}] ${node.name}${extra}${entryFlag}`);
});
