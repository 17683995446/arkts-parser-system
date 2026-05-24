import * as fs from 'fs';
import * as path from 'path';

const projectDir = './hyper-gigantic-test';
const srcDir = path.join(projectDir, 'src');

if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true });
}
fs.mkdirSync(srcDir, { recursive: true });

console.log('🚀 第五轮：创建超超大型压力测试项目');
console.log('='.repeat(80));
console.log('🔥🔥🔥 这是极端规模测试！');
console.log('='.repeat(80));

// 创建100个文件，每个50个类和组件
const totalFiles = 100;
let totalClasses = 0;
let totalComponents = 0;

for (let fileIndex = 1; fileIndex <= totalFiles; fileIndex++) {
  const fileName = `hyper_file_${String(fileIndex).padStart(3, '0')}.ets`;
  const filePath = path.join(srcDir, fileName);
  let content = `// 超超大型测试文件 #${fileIndex}\n\n`;

  // 25个类
  for (let classIndex = 1; classIndex <= 25; classIndex++) {
    const className = `HyperClass_${fileIndex}_${classIndex}`;
    content += `export class ${className} {\n`;
    content += `  method_${fileIndex}_${classIndex}_1() { return 'test'; }\n`;
    content += `  method_${fileIndex}_${classIndex}_2() { return 'test2'; }\n`;
    content += `  method_${fileIndex}_${classIndex}_3() { return 'test3'; }\n`;
    content += `}\n\n`;
    totalClasses++;
  }

  // 25个组件
  for (let componentIndex = 1; componentIndex <= 25; componentIndex++) {
    const componentName = `HyperComponent_${fileIndex}_${componentIndex}`;
    const isEntry = componentIndex === 1; // 每个文件的第一个组件为 Entry
    content += isEntry ? '@Entry\n' : '';
    content += '@Component\n';
    content += `export struct ${componentName} {\n`;
    content += `  build() { Column() { Text('test'); } }\n`;
    content += `  helperMethod${fileIndex}_${componentIndex}() { return 'helper'; }\n`;
    content += `}\n\n`;
    totalComponents++;
  }

  fs.writeFileSync(filePath, content);
  if (fileIndex % 10 === 0) {
    console.log(`  📦 已创建 ${fileIndex}/${totalFiles} 个文件`);
  }
}

console.log('\n✅ 超超大型压力测试项目创建完成！');
console.log('='.repeat(80));
console.log('📊 项目统计:');
console.log(`  📄 文件数: ${totalFiles}`);
console.log(`  🏠 类数: ${totalClasses}`);
console.log(`  🧩 组件数: ${totalComponents}`);
console.log('='.repeat(80));
