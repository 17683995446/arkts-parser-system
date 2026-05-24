import { DebugParserService } from './api/services/debugParserService.js';

console.log('🔍 测试修复后的正则处理');
const parser = new DebugParserService('./round2-mega-test', true);
const result = parser.parse();

console.log('\n📋 找到的所有类和组件:');
result.nodes.filter(n => n.type === 'Class' || n.type === 'Component').forEach(node => {
  console.log(`  [${node.type}] ${node.name}${node.isEntry ? ' 🏠' : ''}`);
});
