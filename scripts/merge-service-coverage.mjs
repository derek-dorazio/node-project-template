/**
 * Merge pre-existing service coverage files into a single report.
 *
 * Usage (CI — coverage files already exist from separate test jobs):
 *   node scripts/merge-service-coverage.mjs
 *
 * For local dev (runs tests + merges in one command):
 *   npm run test:coverage:service:merged
 *
 * Expects coverage-final.json in:
 *   coverage/service-unit/
 *   coverage/service-integration/
 *   coverage/service-functional-api/
 *
 * Writes merged output to:
 *   coverage/service-merged/
 */

import fs from 'node:fs';
import path from 'node:path';
import istanbulCoverage from 'istanbul-lib-coverage';
import istanbulReport from 'istanbul-lib-report';
import istanbulReports from 'istanbul-reports';

const { createCoverageMap } = istanbulCoverage;
const { createContext } = istanbulReport;
const reports = istanbulReports;

const rootDir = process.cwd();
const coverageRoot = path.join(rootDir, 'coverage');
const serviceMergedDir = path.join(coverageRoot, 'service-merged');

const sources = [
  { label: 'Service unit', dir: path.join(coverageRoot, 'service-unit') },
  { label: 'Service integration', dir: path.join(coverageRoot, 'service-integration') },
  { label: 'Service functional API', dir: path.join(coverageRoot, 'service-functional-api') },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function printSummary(label, summaryPath) {
  const data = readJson(summaryPath);
  const total = data.total;
  console.log('');
  console.log(`${label} coverage summary`);
  console.log(`Statements   : ${total.statements.pct}%`);
  console.log(`Branches     : ${total.branches.pct}%`);
  console.log(`Functions    : ${total.functions.pct}%`);
  console.log(`Lines        : ${total.lines.pct}%`);
}

// Print individual summaries
for (const { label, dir } of sources) {
  const summaryPath = path.join(dir, 'coverage-summary.json');
  if (fs.existsSync(summaryPath)) {
    printSummary(label, summaryPath);
  } else {
    console.log(`\n${label}: no coverage-summary.json found in ${dir}`);
  }
}

// Merge
const coverageMap = createCoverageMap({});

for (const { label, dir } of sources) {
  const finalPath = path.join(dir, 'coverage-final.json');
  if (fs.existsSync(finalPath)) {
    coverageMap.merge(readJson(finalPath));
    console.log(`\nMerged: ${label}`);
  } else {
    console.warn(`\nSkipped (not found): ${label} — ${finalPath}`);
  }
}

fs.rmSync(serviceMergedDir, { recursive: true, force: true });
fs.mkdirSync(serviceMergedDir, { recursive: true });
fs.writeFileSync(
  path.join(serviceMergedDir, 'coverage-final.json'),
  JSON.stringify(coverageMap.toJSON()),
);

const context = createContext({
  dir: serviceMergedDir,
  coverageMap,
});

reports.create('json-summary', { file: 'coverage-summary.json' }).execute(context);
reports.create('lcovonly', { file: 'lcov.info' }).execute(context);
reports.create('clover', { file: 'clover.xml' }).execute(context);
reports.create('html', { subdir: 'lcov-report' }).execute(context);
reports.create('text-summary').execute(context);

printSummary('Merged service', path.join(serviceMergedDir, 'coverage-summary.json'));

console.log('');
console.log(`Merged service coverage written to ${serviceMergedDir}`);
