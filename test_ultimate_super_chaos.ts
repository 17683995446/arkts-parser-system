import { DebugParserService } from './api/services/debugParserService.js';

console.log('🔥🔥🔥 第六轮：终极超级混乱项目深度测试');
console.log('================================================================================');
console.log('使用 debugParserService 逐行日志追踪！');
console.log('================================================================================');

const parser = new DebugParserService('./ultimate-super-chaos', true);
const result = parser.parse();

console.log('\n\n================================================================================');
console.log('📊 测试结果统计');
console.log('================================================================================');

const files = result.nodes.filter(n => n.type === 'File');
const classes = result.nodes.filter(n => n.type === 'Class');
const components = result.nodes.filter(n => n.type === 'Component');
const methods = result.nodes.filter(n => n.type === 'Method');
const entryComponents = components.filter(c => c.isEntry);

console.log('  📄 文件数: ' + files.length);
console.log('  🏠 类数: ' + classes.length);
console.log('  🧩 组件数: ' + components.length);
console.log('  🏠 Entry组件数: ' + entryComponents.length);
console.log('  ⚙️  方法数: ' + methods.length);
console.log('  📦 总节点数: ' + result.nodes.length);
console.log('  🔗 总链接数: ' + result.links.length);

console.log('\n📋 找到的类和组件列表:');
result.nodes.filter(n => n.type === 'Class' || n.type === 'Component').forEach(node => {
  const typeIcon = node.type === 'Class' ? '🏠' : '🧩';
  const entryIcon = node.isEntry ? '🏠' : '';
  console.log('  ' + typeIcon + ' [' + node.type + '] ' + node.name + ' ' + entryIcon);
});

console.log('\n================================================================================');

// 检查预期结果
const expectedFiles = 7;
const expectedClasses = 62; // 1+2+2+1+2+50+4 = 62
const expectedComponents = 6;
const expectedEntryComponents = 5;

let allPassed = true;
if (files.length !== expectedFiles) { allPassed = false; }
if (classes.length < expectedClasses - 2) { allPassed = false; }
if (components.length < expectedComponents - 1) { allPassed = false; }
if (entryComponents.length < expectedEntryComponents - 1) { allPassed = false; }

if (allPassed) {
  console.log('\n🎉🎉🎉 终极超级混乱测试完美通过！');
} else {
  console.log('\n⚠️  终极超级混乱测试部分检查有问题！');
}
console.log('\n================================================================================');
