import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const files = [
  'Kimi_Agent_Deployment_v14/index.html',
  'Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js',
  'Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css',
];

const bannedTerms = [
  '二类医疗器械',
  '二类医疗器械认证',
  '黄十字',
  '国家黄十字',
  '国家背书',
  '专利',
  '软著',
  '医生',
  '医护',
  '治疗',
  '医疗器械',
  '数智中医',
];

const findings = [];

for (const file of files) {
  const absolutePath = resolve(root, file);
  const content = readFileSync(absolutePath, 'utf8');

  for (const term of bannedTerms) {
    if (content.includes(term)) {
      findings.push({ file, term });
    }
  }
}

if (findings.length > 0) {
  console.error('Compliance check failed. Found banned terms:');
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.term}`);
  }
  process.exit(1);
}

console.log('Compliance check passed. No banned terms found in deployed entry files.');
