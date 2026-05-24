import { ParserService } from './api/services/parserService.js';

console.log('🚀 开始巨大规模性能压力测试...');
console.log('🚀 Starting gigantic scale performance stress test...');
console.log('='.repeat(80));

const startTime = Date.now();
const parser = new ParserService('./gigantic-test-project');
const result = parser.parse();
const endTime = Date.now();

console.log('\n📊 性能测试结果 / Performance test results');
console.log('----------------------------------------');
console.log(`⏱️  解析总耗时 / Total parse time: ${endTime - startTime} ms`);
console.log(`📦 总节点数 / Total nodes: ${result.nodes.length}`);
console.log(`🔗 总链接数 / Total links: ${result.links.length}`);

const files = result.nodes.filter(n => n.type === 'File');
const classes = result.nodes.filter(n => n.type === 'Class');
const components = result.nodes.filter(n => n.type === 'Component');
const methods = result.nodes.filter(n => n.type === 'Method');
const entryComponents = components.filter(c => c.isEntry);

console.log('\n📋 节点类型统计 / Node type stats:');
console.log(`  📄 文件 / Files: ${files.length}`);
console.log(`  🏠 类 / Classes: ${classes.length}`);
console.log(`  🧩 组件 / Components: ${components.length}`);
console.log(`  🏠 Entry 组件 / Entry components: ${entryComponents.length}`);
console.log(`  ⚙️  方法 / Methods: ${methods.length}`);

const expectedFiles = 10;
const expectedClasses = 500;
const expectedComponents = 200;
const expectedEntries = 10;

console.log('\n✅ 验证检查 / Validation checks:');
const allPassed = [
  { name: 'Files', expected: expectedFiles, actual: files.length },
  { name: 'Classes', expected: expectedClasses, actual: classes.length },
  { name: 'Components', expected: expectedComponents, actual: components.length },
  { name: 'Entry Components', expected: expectedEntries, actual: entryComponents.length }
];

let allValid = true;
for (const check of allPassed) {
  const passed = check.expected === check.actual;
  console.log(`  ${passed ? '✅' : '❌'} ${check.name}: expected ${check.expected}, got ${check.actual}`);
  if (!passed) allValid = false;
}

console.log('\n' + '='.repeat(80));
console.log(allValid ? '🎉 所有检查通过！系统性能优秀！All checks passed! Excellent system performance!' 
                     : '❌ 部分检查失败！Some checks failed!');
console.log('\n');
