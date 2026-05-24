import { DebugParserService } from './api/services/debugParserService.js';

console.log('🚀 第八轮：真实鸿蒙应用项目深度解析测试');
console.log('=============================================================');
console.log('使用DebugParserService，逐行日志追踪！');
console.log('=============================================================');

const parser = new DebugParserService('./real-harmony-app', true);
const result = parser.parse();

console.log('\n\n=============================================================');
console.log('📊 真实鸿蒙项目解析结果统计');
console.log('=============================================================');

const files = result.nodes.filter(n => n.type === 'File');
const classes = result.nodes.filter(n => n.type === 'Class');
const components = result.nodes.filter(n => n.type === 'Component');
const methods = result.nodes.filter(n => n.type === 'Method');
const entryComponents = components.filter(c => c.isEntry);

console.log('  📄 文件数:', files.length);
console.log('  🏠 类数:', classes.length);
console.log('  🧩 组件数:', components.length);
console.log('  🏠 Entry组件数:', entryComponents.length);
console.log('  ⚙️  方法数:', methods.length);
console.log('  📦 总节点数:', result.nodes.length);
console.log('  🔗 总链接数:', result.links.length);

console.log('\n📋 找到的类和组件：');
result.nodes.filter(n => n.type === 'Class' || n.type === 'Component').forEach(node => {
  const typeIcon = node.type === 'Class' ? '🏠' : '🧩';
  const entryIcon = node.isEntry ? ' 🏠 Entry' : '';
  console.log('  ' + typeIcon + ' [' + node.type + '] ' + node.name + entryIcon);
});

console.log('\n📋 找到的方法：');
methods.forEach(method => {
  console.log('  ⚙️  ' + method.name);
});

console.log('\n=============================================================');

// 验证结果
const issues = [];

// 验证文件
if (files.length !== 10) {
  issues.push('文件数不对。期望 10，实际 ' + files.length);
}

// 验证类和组件
const expectedClasses = [
  'ProductModel', 'OrderModel', 'OrderItemModel', 
  'UserModel', 'CategoryService', 'CartService', 
  'CommonConstants', 'StringUtils', 'NumberUtils'
];

const expectedComponents = ['Index', 'HomePage', 'ProductComponent'];

expectedClasses.forEach(clsName => {
  const found = classes.find(c => c.name === clsName);
  if (!found) {
    issues.push('未找到预期类: ' + clsName);
  }
});

expectedComponents.forEach(compName => {
  const found = components.find(c => c.name === compName);
  if (!found) {
    issues.push('未找到预期组件: ' + compName);
  }
});

// 验证Entry组件
const entryComp = components.find(c => c.name === 'Index' && c.isEntry);
if (!entryComp) {
  issues.push('Index组件应标记为Entry');
}

if (issues.length > 0) {
  console.log('\n❌ 发现问题:');
  issues.forEach(issue => console.log('  ❌ ' + issue));
} else {
  console.log('\n🎉🎉🎉 真实鸿蒙应用项目解析完美通过！');
  console.log('   所有预期类和组件都找到！');
}

console.log('\n=============================================================');
