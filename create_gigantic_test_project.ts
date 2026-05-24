import * as fs from 'fs';
import * as path from 'path';

const projectDir = './gigantic-test-project';
const srcDir = path.join(projectDir, 'src');

if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

console.log('🚀 创建巨大规模测试项目...');
console.log('🚀 Generating gigantic test project...');

// 生成10个文件，每个文件包含100个类/组件
for (let fileIndex = 1; fileIndex <= 10; fileIndex++) {
  let content = `// Gigantic Test File ${fileIndex}\n`;
  
  // 每个文件生成50个类
  for (let classIndex = 1; classIndex <= 50; classIndex++) {
    content += `
export class GiganticClass${fileIndex}_${classIndex} {
  method1() { return "test"; }
  method2() { return "test"; }
  method3() { return "test"; }
  method4() { return "test"; }
}
`;
  }
  
  // 每个文件生成20个组件
  for (let compIndex = 1; compIndex <= 20; compIndex++) {
    const isEntry = compIndex === 1;
    content += `
${isEntry ? '@Entry\n' : ''}@Component
export struct GiganticComponent${fileIndex}_${compIndex} {
  build() {
    Column() { Text("Test"); }
  }
  
  helperMethod${compIndex}() { return "helper"; }
}
`;
  }
  
  // 写入文件
  const filePath = path.join(srcDir, `gigantic_file_${fileIndex}.ets`);
  fs.writeFileSync(filePath, content);
  console.log(`  ✅ Created ${filePath}`);
}

console.log('\n🎉 巨大规模测试项目创建完成！');
console.log('🎉 Gigantic test project created successfully!');
console.log(`📦 Total files: 10`);
console.log(`📦 Total classes: 500`);
console.log(`📦 Total components: 200`);
