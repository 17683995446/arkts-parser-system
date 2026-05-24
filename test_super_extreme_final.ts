import { DebugParserService } from './api/services/debugParserService.js';

console.log('🔥🔥🔥 第七轮：超级极端复杂项目深度测试');
console.log('================================================================================');
console.log('使用 debugParserService 逐行日志追踪！');
console.log('================================================================================');

const parser = new DebugParserService('./super-extreme-chaos-final', true);
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
let allPassed = true;
const issues = [];

// 检查基本统计
if (files.length !== 7) {
  issues.push('文件数应该是7，实际是' + files.length);
}
if (classes.length < 110) {
  issues.push('类数应该>=110 (3+3+2+3+100+4+2=117)，实际是' + classes.length);
}
if (components.length < 7) {
  issues.push('组件数应该>=7，实际是' + components.length);
}
if (entryComponents.length < 7) {
  issues.push('Entry组件数应该>=7，实际是' + entryComponents.length);
}

// 检查关键类
const importantClasses = ['UserModel', 'OrderModel', 'UserService', 'StringUtils', 'Index'];
for (const clsName of importantClasses) {
  const found = classes.find(c => c.name === clsName);
  if (!found) {
    issues.push('缺少重要类: ' + clsName);
  }
}

// 检查Unicode类
const unicodeClass = classes.find(c => c.name === '中文类名');
if (!unicodeClass) {
  issues.push('缺少Unicode类: 中文类名');
}

// 检查$前缀类
const dollarClass = classes.find(c => c.name === '$DollarStart');
if (!dollarClass) {
  issues.push('缺少$前缀类: $DollarStart');
}

if (issues.length > 0) {
  console.log('\n❌ 发现问题:');
  issues.forEach(issue => console.log('  ❌ ' + issue));
  allPassed = false;
}

if (allPassed) {
  console.log('\n🎉🎉🎉 超级极端复杂测试完美通过！');
} else {
  console.log('\n⚠️  超级极端复杂测试部分检查有问题！');
}
console.log('\n================================================================================');
