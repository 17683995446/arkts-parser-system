#!/usr/bin/env tsx
/**
 * 综合测试脚本 - 运行所有测试项目
 */

import { ParserService } from './api/services/parserService.js';

interface TestResult {
  name: string;
  passed: boolean;
  stats: {
    files: number;
    classes: number;
    components: number;
    methods: number;
    entries: number;
    totalNodes: number;
    totalLinks: number;
  };
  duration: number;
  details?: string;
}

async function runTest(name: string, projectPath: string): Promise<TestResult> {
  const startTime = Date.now();
  const parser = new ParserService(projectPath);
  const graphData = parser.parse();
  const endTime = Date.now();
  const duration = endTime - startTime;

  const stats = {
    files: graphData.nodes.filter(n => n.type === 'File').length,
    classes: graphData.nodes.filter(n => n.type === 'Class').length,
    components: graphData.nodes.filter(n => n.type === 'Component').length,
    methods: graphData.nodes.filter(n => n.type === 'Method').length,
    entries: graphData.nodes.filter(n => n.type === 'Component' && (n as any).isEntry).length,
    totalNodes: graphData.nodes.length,
    totalLinks: graphData.links.length
  };

  return {
    name,
    passed: true,
    stats,
    duration
  };
}

async function main() {
  console.log('='.repeat(80));
  console.log('🎯 ArkTS Parser - Comprehensive Test Suite');
  console.log('='.repeat(80));
  console.log('');

  const tests = [
    { name: 'Sample Project', path: './sample-project' },
    { name: 'Real HarmonyOS Project', path: './real-harmonyos-project' },
    { name: 'Large Test Project', path: './large-test-project' },
    { name: 'Edge Case Test Project', path: './edge-case-test-project' },
    { name: 'Chaos Test Project', path: './chaos-test-project' },
    { name: 'Mega Test Project', path: './mega-test-project' },
    { name: 'Extreme Chaos Test Project', path: './extreme-chaos-test-project' },
  ];

  const results: TestResult[] = [];
  let totalDuration = 0;

  for (const test of tests) {
    try {
      console.log(`Running: ${test.name}...`);
      const result = await runTest(test.name, test.path);
      results.push(result);
      totalDuration += result.duration;
      console.log(`  ✅ ${result.stats.files} files, ${result.stats.totalNodes} nodes in ${result.duration}ms`);
    } catch (error) {
      console.log(`  ❌ Failed: ${(error as Error).message}`);
      results.push({
        name: test.name,
        passed: false,
        stats: { files: 0, classes: 0, components: 0, methods: 0, entries: 0, totalNodes: 0, totalLinks: 0 },
        duration: 0,
        details: (error as Error).message
      });
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('📊 Summary');
  console.log('='.repeat(80));
  console.log('');

  const passedTests = results.filter(r => r.passed).length;
  const totalNodes = results.reduce((sum, r) => sum + r.stats.totalNodes, 0);
  const totalFiles = results.reduce((sum, r) => sum + r.stats.files, 0);

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passedTests}/${results.length}`);
  console.log(`Total Files: ${totalFiles}`);
  console.log(`Total Nodes: ${totalNodes}`);
  console.log(`Total Time: ${totalDuration}ms`);
  console.log('');

  console.log('Per-Test Results:');
  console.log('');
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${result.name}`);
    if (result.passed) {
      console.log(`     Files: ${result.stats.files}, Classes: ${result.stats.classes}, Components: ${result.stats.components}, Methods: ${result.stats.methods}`);
      console.log(`     Nodes: ${result.stats.totalNodes}, Links: ${result.stats.totalLinks}, Time: ${result.duration}ms`);
    } else {
      console.log(`     Error: ${result.details}`);
    }
    console.log('');
  });

  console.log('='.repeat(80));

  if (passedTests === results.length) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️ ${results.length - passedTests} test(s) failed`);
  }

  console.log('='.repeat(80));
}

main().catch(console.error);
