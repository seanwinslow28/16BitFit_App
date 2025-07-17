#!/usr/bin/env node

/**
 * Test Report Generator
 * Creates comprehensive test reports and coverage analysis
 * Following MetaSystemsAgent patterns for quality assurance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestReportGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.reportDir = path.join(this.projectRoot, 'test-reports');
    this.coverageDir = path.join(this.projectRoot, 'coverage');
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {},
      testResults: [],
      coverage: {},
      recommendations: [],
    };
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport() {
    console.log('📋 Generating comprehensive test report...\n');
    
    try {
      // Ensure report directory exists
      if (!fs.existsSync(this.reportDir)) {
        fs.mkdirSync(this.reportDir, { recursive: true });
      }

      // Run tests with coverage
      await this.runTests();
      
      // Analyze coverage
      await this.analyzeCoverage();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Create reports
      await this.createHtmlReport();
      await this.createJsonReport();
      await this.createMarkdownReport();
      
      // Display summary
      this.displaySummary();
      
      console.log('✅ Test report generated successfully!');
      
    } catch (error) {
      console.error('❌ Test report generation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Run tests with coverage
   */
  async runTests() {
    console.log('🧪 Running tests with coverage...');
    
    try {
      // Run Jest with coverage
      const output = execSync(
        'npm test -- --coverage --watchAll=false --testResultsProcessor=jest-junit --coverageReporters=json --coverageReporters=lcov --coverageReporters=text --coverageReporters=html',
        { 
          cwd: this.projectRoot,
          encoding: 'utf8',
          maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        }
      );
      
      this.results.testOutput = output;
      
      // Parse test results
      this.parseTestResults();
      
    } catch (error) {
      console.error('Test execution failed:', error.message);
      
      // Still try to parse partial results
      this.parseTestResults();
      
      // Mark as failed
      this.results.summary.failed = true;
      this.results.summary.error = error.message;
    }
  }

  /**
   * Parse test results
   */
  parseTestResults() {
    try {
      // Try to read Jest results
      const jestResultsPath = path.join(this.projectRoot, 'jest-results.json');
      if (fs.existsSync(jestResultsPath)) {
        const jestResults = JSON.parse(fs.readFileSync(jestResultsPath, 'utf8'));
        
        this.results.summary = {
          totalTests: jestResults.numTotalTests,
          passedTests: jestResults.numPassedTests,
          failedTests: jestResults.numFailedTests,
          skippedTests: jestResults.numPendingTests,
          testSuites: jestResults.numTotalTestSuites,
          passedSuites: jestResults.numPassedTestSuites,
          failedSuites: jestResults.numFailedTestSuites,
          runtime: jestResults.runTime,
          success: jestResults.success,
        };
        
        this.results.testResults = jestResults.testResults;
      } else {
        // Parse from output
        this.parseOutputResults();
      }
    } catch (error) {
      console.warn('Failed to parse test results:', error);
      this.parseOutputResults();
    }
  }

  /**
   * Parse results from output
   */
  parseOutputResults() {
    const output = this.results.testOutput || '';
    
    // Basic regex parsing
    const testMatch = output.match(/Tests:\s+(\d+) failed,\s+(\d+) passed,\s+(\d+) total/);
    const suiteMatch = output.match(/Test Suites:\s+(\d+) failed,\s+(\d+) passed,\s+(\d+) total/);
    
    if (testMatch) {
      this.results.summary = {
        totalTests: parseInt(testMatch[3]),
        passedTests: parseInt(testMatch[2]),
        failedTests: parseInt(testMatch[1]),
        skippedTests: 0,
        testSuites: suiteMatch ? parseInt(suiteMatch[3]) : 0,
        passedSuites: suiteMatch ? parseInt(suiteMatch[2]) : 0,
        failedSuites: suiteMatch ? parseInt(suiteMatch[1]) : 0,
        success: parseInt(testMatch[1]) === 0,
      };
    }
  }

  /**
   * Analyze coverage
   */
  async analyzeCoverage() {
    console.log('📊 Analyzing test coverage...');
    
    try {
      const coverageJsonPath = path.join(this.coverageDir, 'coverage-final.json');
      if (fs.existsSync(coverageJsonPath)) {
        const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
        
        // Calculate overall coverage
        let totalStatements = 0;
        let coveredStatements = 0;
        let totalBranches = 0;
        let coveredBranches = 0;
        let totalFunctions = 0;
        let coveredFunctions = 0;
        let totalLines = 0;
        let coveredLines = 0;
        
        const fileCoverage = {};
        
        Object.entries(coverageData).forEach(([file, coverage]) => {
          const fileName = path.relative(this.projectRoot, file);
          
          fileCoverage[fileName] = {
            statements: {
              total: Object.keys(coverage.s).length,
              covered: Object.values(coverage.s).filter(count => count > 0).length,
              pct: 0,
            },
            branches: {
              total: Object.keys(coverage.b).length,
              covered: Object.values(coverage.b).filter(branch => branch.some(count => count > 0)).length,
              pct: 0,
            },
            functions: {
              total: Object.keys(coverage.f).length,
              covered: Object.values(coverage.f).filter(count => count > 0).length,
              pct: 0,
            },
            lines: {
              total: Object.keys(coverage.l).length,
              covered: Object.values(coverage.l).filter(count => count > 0).length,
              pct: 0,
            },
          };
          
          // Calculate percentages
          fileCoverage[fileName].statements.pct = 
            fileCoverage[fileName].statements.total > 0 ? 
            (fileCoverage[fileName].statements.covered / fileCoverage[fileName].statements.total) * 100 : 100;
          
          fileCoverage[fileName].branches.pct = 
            fileCoverage[fileName].branches.total > 0 ? 
            (fileCoverage[fileName].branches.covered / fileCoverage[fileName].branches.total) * 100 : 100;
          
          fileCoverage[fileName].functions.pct = 
            fileCoverage[fileName].functions.total > 0 ? 
            (fileCoverage[fileName].functions.covered / fileCoverage[fileName].functions.total) * 100 : 100;
          
          fileCoverage[fileName].lines.pct = 
            fileCoverage[fileName].lines.total > 0 ? 
            (fileCoverage[fileName].lines.covered / fileCoverage[fileName].lines.total) * 100 : 100;
          
          // Add to totals
          totalStatements += fileCoverage[fileName].statements.total;
          coveredStatements += fileCoverage[fileName].statements.covered;
          totalBranches += fileCoverage[fileName].branches.total;
          coveredBranches += fileCoverage[fileName].branches.covered;
          totalFunctions += fileCoverage[fileName].functions.total;
          coveredFunctions += fileCoverage[fileName].functions.covered;
          totalLines += fileCoverage[fileName].lines.total;
          coveredLines += fileCoverage[fileName].lines.covered;
        });
        
        this.results.coverage = {
          overall: {
            statements: {
              total: totalStatements,
              covered: coveredStatements,
              pct: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 100,
            },
            branches: {
              total: totalBranches,
              covered: coveredBranches,
              pct: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 100,
            },
            functions: {
              total: totalFunctions,
              covered: coveredFunctions,
              pct: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 100,
            },
            lines: {
              total: totalLines,
              covered: coveredLines,
              pct: totalLines > 0 ? (coveredLines / totalLines) * 100 : 100,
            },
          },
          files: fileCoverage,
        };
      }
    } catch (error) {
      console.warn('Failed to analyze coverage:', error);
    }
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Test coverage recommendations
    if (this.results.coverage.overall) {
      const { statements, branches, functions, lines } = this.results.coverage.overall;
      
      if (statements.pct < 70) {
        recommendations.push({
          type: 'critical',
          category: 'coverage',
          title: 'Low statement coverage',
          description: `Statement coverage is ${statements.pct.toFixed(1)}%. Target: 70%+`,
          impact: 'high',
        });
      }
      
      if (branches.pct < 70) {
        recommendations.push({
          type: 'warning',
          category: 'coverage',
          title: 'Low branch coverage',
          description: `Branch coverage is ${branches.pct.toFixed(1)}%. Target: 70%+`,
          impact: 'medium',
        });
      }
      
      if (functions.pct < 70) {
        recommendations.push({
          type: 'warning',
          category: 'coverage',
          title: 'Low function coverage',
          description: `Function coverage is ${functions.pct.toFixed(1)}%. Target: 70%+`,
          impact: 'medium',
        });
      }
      
      // Identify files with low coverage
      const lowCoverageFiles = Object.entries(this.results.coverage.files)
        .filter(([_, coverage]) => coverage.statements.pct < 50)
        .map(([file, _]) => file);
      
      if (lowCoverageFiles.length > 0) {
        recommendations.push({
          type: 'warning',
          category: 'coverage',
          title: 'Files with low coverage',
          description: `${lowCoverageFiles.length} files have less than 50% coverage`,
          impact: 'medium',
          files: lowCoverageFiles.slice(0, 10),
        });
      }
    }
    
    // Test failure recommendations
    if (this.results.summary.failedTests > 0) {
      recommendations.push({
        type: 'critical',
        category: 'tests',
        title: 'Failed tests detected',
        description: `${this.results.summary.failedTests} tests are failing`,
        impact: 'high',
      });
    }
    
    // Test performance recommendations
    if (this.results.summary.runtime > 30000) {
      recommendations.push({
        type: 'warning',
        category: 'performance',
        title: 'Slow test execution',
        description: `Tests took ${(this.results.summary.runtime / 1000).toFixed(1)}s to run`,
        impact: 'low',
      });
    }
    
    // Test count recommendations
    if (this.results.summary.totalTests < 50) {
      recommendations.push({
        type: 'info',
        category: 'tests',
        title: 'Consider adding more tests',
        description: `Only ${this.results.summary.totalTests} tests found. Consider adding more comprehensive tests`,
        impact: 'medium',
      });
    }
    
    this.results.recommendations = recommendations;
  }

  /**
   * Create HTML report
   */
  async createHtmlReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>16BitFit Test Report</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #0D0D0D; color: #92CC41; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; margin-bottom: 10px; }
        .subtitle { font-size: 14px; color: #666; }
        .section { margin-bottom: 30px; border: 2px solid #92CC41; padding: 20px; }
        .section-title { font-size: 18px; margin-bottom: 15px; color: #F7D51D; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { text-align: center; padding: 10px; border: 1px solid #666; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
        .success { color: #92CC41; }
        .warning { color: #F7D51D; }
        .error { color: #E53935; }
        .coverage-bar { width: 100%; height: 20px; background: #333; border-radius: 10px; overflow: hidden; }
        .coverage-fill { height: 100%; background: linear-gradient(90deg, #E53935 0%, #F7D51D 50%, #92CC41 100%); }
        .recommendations { list-style: none; padding: 0; }
        .recommendation { padding: 10px; margin-bottom: 10px; border-left: 4px solid; }
        .recommendation.critical { border-color: #E53935; background: rgba(229, 57, 53, 0.1); }
        .recommendation.warning { border-color: #F7D51D; background: rgba(247, 213, 29, 0.1); }
        .recommendation.info { border-color: #92CC41; background: rgba(146, 204, 65, 0.1); }
        .files-table { width: 100%; border-collapse: collapse; }
        .files-table th, .files-table td { padding: 10px; border: 1px solid #666; text-align: left; }
        .files-table th { background: #333; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">🎮 16BitFit Test Report</div>
            <div class="subtitle">Generated on ${new Date(this.results.timestamp).toLocaleString()}</div>
        </div>
        
        <div class="section">
            <div class="section-title">Test Summary</div>
            <div class="summary">
                <div class="metric">
                    <div class="metric-value ${this.results.summary.success ? 'success' : 'error'}">
                        ${this.results.summary.success ? '✅' : '❌'}
                    </div>
                    <div class="metric-label">Overall Status</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.results.summary.totalTests || 0}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="metric">
                    <div class="metric-value success">${this.results.summary.passedTests || 0}</div>
                    <div class="metric-label">Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value error">${this.results.summary.failedTests || 0}</div>
                    <div class="metric-label">Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.results.summary.testSuites || 0}</div>
                    <div class="metric-label">Test Suites</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.results.summary.runtime ? (this.results.summary.runtime / 1000).toFixed(1) : 0}s</div>
                    <div class="metric-label">Runtime</div>
                </div>
            </div>
        </div>
        
        ${this.results.coverage.overall ? `
        <div class="section">
            <div class="section-title">Coverage Report</div>
            <div class="summary">
                <div class="metric">
                    <div class="metric-value">${this.results.coverage.overall.statements.pct.toFixed(1)}%</div>
                    <div class="metric-label">Statements</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${this.results.coverage.overall.statements.pct}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.results.coverage.overall.branches.pct.toFixed(1)}%</div>
                    <div class="metric-label">Branches</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${this.results.coverage.overall.branches.pct}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.results.coverage.overall.functions.pct.toFixed(1)}%</div>
                    <div class="metric-label">Functions</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${this.results.coverage.overall.functions.pct}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.results.coverage.overall.lines.pct.toFixed(1)}%</div>
                    <div class="metric-label">Lines</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${this.results.coverage.overall.lines.pct}%"></div>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
        
        ${this.results.recommendations.length > 0 ? `
        <div class="section">
            <div class="section-title">Recommendations</div>
            <ul class="recommendations">
                ${this.results.recommendations.map(rec => `
                    <li class="recommendation ${rec.type}">
                        <strong>${rec.title}</strong><br>
                        ${rec.description}
                        ${rec.files ? `<br><small>Files: ${rec.files.slice(0, 3).join(', ')}${rec.files.length > 3 ? '...' : ''}</small>` : ''}
                    </li>
                `).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
</body>
</html>
    `;
    
    fs.writeFileSync(path.join(this.reportDir, 'test-report.html'), html);
  }

  /**
   * Create JSON report
   */
  async createJsonReport() {
    fs.writeFileSync(
      path.join(this.reportDir, 'test-report.json'),
      JSON.stringify(this.results, null, 2)
    );
  }

  /**
   * Create Markdown report
   */
  async createMarkdownReport() {
    const md = `# 16BitFit Test Report

Generated on ${new Date(this.results.timestamp).toLocaleString()}

## Test Summary

- **Total Tests**: ${this.results.summary.totalTests || 0}
- **Passed**: ${this.results.summary.passedTests || 0}
- **Failed**: ${this.results.summary.failedTests || 0}
- **Test Suites**: ${this.results.summary.testSuites || 0}
- **Runtime**: ${this.results.summary.runtime ? (this.results.summary.runtime / 1000).toFixed(1) : 0}s
- **Status**: ${this.results.summary.success ? '✅ PASSED' : '❌ FAILED'}

${this.results.coverage.overall ? `
## Coverage Report

| Metric | Coverage |
|--------|----------|
| Statements | ${this.results.coverage.overall.statements.pct.toFixed(1)}% |
| Branches | ${this.results.coverage.overall.branches.pct.toFixed(1)}% |
| Functions | ${this.results.coverage.overall.functions.pct.toFixed(1)}% |
| Lines | ${this.results.coverage.overall.lines.pct.toFixed(1)}% |
` : ''}

${this.results.recommendations.length > 0 ? `
## Recommendations

${this.results.recommendations.map(rec => `
### ${rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️'} ${rec.title}

${rec.description}

${rec.files ? `**Files**: ${rec.files.slice(0, 5).join(', ')}${rec.files.length > 5 ? '...' : ''}` : ''}
`).join('')}
` : ''}

---
*Report generated by 16BitFit Test Suite*
`;
    
    fs.writeFileSync(path.join(this.reportDir, 'test-report.md'), md);
  }

  /**
   * Display summary
   */
  displaySummary() {
    console.log('\n📊 Test Report Summary');
    console.log('=' .repeat(50));
    
    console.log(`\n📝 Tests: ${this.results.summary.totalTests || 0} total`);
    console.log(`✅ Passed: ${this.results.summary.passedTests || 0}`);
    console.log(`❌ Failed: ${this.results.summary.failedTests || 0}`);
    console.log(`⏱️  Runtime: ${this.results.summary.runtime ? (this.results.summary.runtime / 1000).toFixed(1) : 0}s`);
    
    if (this.results.coverage.overall) {
      console.log(`\n📊 Coverage:`);
      console.log(`   Statements: ${this.results.coverage.overall.statements.pct.toFixed(1)}%`);
      console.log(`   Branches: ${this.results.coverage.overall.branches.pct.toFixed(1)}%`);
      console.log(`   Functions: ${this.results.coverage.overall.functions.pct.toFixed(1)}%`);
      console.log(`   Lines: ${this.results.coverage.overall.lines.pct.toFixed(1)}%`);
    }
    
    if (this.results.recommendations.length > 0) {
      console.log(`\n💡 Recommendations: ${this.results.recommendations.length}`);
      this.results.recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`   ${icon} ${rec.title}`);
      });
    }
    
    console.log(`\n📄 Reports generated in: ${this.reportDir}`);
    console.log(`   - HTML: test-report.html`);
    console.log(`   - JSON: test-report.json`);
    console.log(`   - Markdown: test-report.md`);
  }
}

// Run report generation if called directly
if (require.main === module) {
  const generator = new TestReportGenerator();
  generator.generateReport();
}

module.exports = TestReportGenerator;