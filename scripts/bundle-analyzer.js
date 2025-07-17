#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Analyzes bundle size and identifies optimization opportunities
 * Following MetaSystemsAgent patterns for build optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUNDLE_SIZE_LIMITS = {
  warning: 5 * 1024 * 1024, // 5MB
  error: 10 * 1024 * 1024,  // 10MB
};

const ASSET_SIZE_LIMITS = {
  image: 500 * 1024,        // 500KB
  font: 100 * 1024,         // 100KB
  audio: 1 * 1024 * 1024,   // 1MB
};

class BundleAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      bundleSize: 0,
      assets: [],
      dependencies: [],
      recommendations: [],
      timestamp: Date.now(),
    };
  }

  /**
   * Run complete bundle analysis
   */
  async analyze() {
    console.log('🔍 Starting bundle analysis...\n');
    
    try {
      // Analyze bundle size
      await this.analyzeBundleSize();
      
      // Analyze assets
      await this.analyzeAssets();
      
      // Analyze dependencies
      await this.analyzeDependencies();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Generate report
      this.generateReport();
      
      console.log('✅ Bundle analysis complete!');
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      process.exit(1);
    }
  }

  /**
   * Analyze bundle size
   */
  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size...');
    
    try {
      // Build the bundle for analysis
      console.log('Building bundle...');
      execSync('npx expo export --platform web --dev false', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      
      // Find bundle files
      const distPath = path.join(this.projectRoot, 'dist');
      const bundleFiles = this.findBundleFiles(distPath);
      
      let totalSize = 0;
      bundleFiles.forEach(file => {
        const stats = fs.statSync(file);
        totalSize += stats.size;
      });
      
      this.results.bundleSize = totalSize;
      
      console.log(`Bundle size: ${this.formatBytes(totalSize)}`);
      
      if (totalSize > BUNDLE_SIZE_LIMITS.error) {
        console.log('⚠️  Bundle size exceeds error threshold!');
      } else if (totalSize > BUNDLE_SIZE_LIMITS.warning) {
        console.log('⚠️  Bundle size exceeds warning threshold');
      } else {
        console.log('✅ Bundle size is within limits');
      }
      
    } catch (error) {
      console.error('Failed to analyze bundle size:', error);
    }
  }

  /**
   * Find bundle files
   */
  findBundleFiles(distPath) {
    const bundleFiles = [];
    
    if (!fs.existsSync(distPath)) {
      return bundleFiles;
    }
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.css')) {
          bundleFiles.push(filePath);
        }
      });
    };
    
    walkDir(distPath);
    return bundleFiles;
  }

  /**
   * Analyze assets
   */
  async analyzeAssets() {
    console.log('🖼️  Analyzing assets...');
    
    const assetsPath = path.join(this.projectRoot, 'assets');
    const appAssetsPath = path.join(this.projectRoot, 'app/assets');
    
    // Analyze both asset directories
    [assetsPath, appAssetsPath].forEach(assetDir => {
      if (fs.existsSync(assetDir)) {
        this.analyzeAssetDirectory(assetDir);
      }
    });
    
    // Sort assets by size
    this.results.assets.sort((a, b) => b.size - a.size);
    
    console.log(`Found ${this.results.assets.length} assets`);
    
    // Show largest assets
    const largestAssets = this.results.assets.slice(0, 10);
    largestAssets.forEach(asset => {
      console.log(`  ${asset.name}: ${this.formatBytes(asset.size)}`);
    });
  }

  /**
   * Analyze asset directory
   */
  analyzeAssetDirectory(dir) {
    const walkDir = (currentDir) => {
      const files = fs.readdirSync(currentDir);
      
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          walkDir(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          const relativePath = path.relative(this.projectRoot, filePath);
          
          let type = 'other';
          if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
            type = 'image';
          } else if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) {
            type = 'font';
          } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
            type = 'audio';
          }
          
          this.results.assets.push({
            name: relativePath,
            size: stats.size,
            type,
            path: filePath,
          });
        }
      });
    };
    
    walkDir(dir);
  }

  /**
   * Analyze dependencies
   */
  async analyzeDependencies() {
    console.log('📚 Analyzing dependencies...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log('package.json not found');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Analyze each dependency
    Object.keys(dependencies).forEach(dep => {
      try {
        const depPath = path.join(this.projectRoot, 'node_modules', dep);
        if (fs.existsSync(depPath)) {
          const size = this.getDirectorySize(depPath);
          this.results.dependencies.push({
            name: dep,
            version: dependencies[dep],
            size,
          });
        }
      } catch (error) {
        // Skip dependencies that can't be analyzed
      }
    });
    
    // Sort by size
    this.results.dependencies.sort((a, b) => b.size - a.size);
    
    console.log(`Analyzed ${this.results.dependencies.length} dependencies`);
    
    // Show largest dependencies
    const largestDeps = this.results.dependencies.slice(0, 10);
    largestDeps.forEach(dep => {
      console.log(`  ${dep.name}: ${this.formatBytes(dep.size)}`);
    });
  }

  /**
   * Get directory size
   */
  getDirectorySize(dir) {
    let totalSize = 0;
    
    const walkDir = (currentDir) => {
      try {
        const files = fs.readdirSync(currentDir);
        
        files.forEach(file => {
          const filePath = path.join(currentDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            walkDir(filePath);
          } else {
            totalSize += stats.size;
          }
        });
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    walkDir(dir);
    return totalSize;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Bundle size recommendations
    if (this.results.bundleSize > BUNDLE_SIZE_LIMITS.error) {
      recommendations.push({
        type: 'critical',
        category: 'bundle',
        title: 'Bundle size is too large',
        description: 'Consider code splitting, tree shaking, and removing unused dependencies',
        impact: 'high',
      });
    }
    
    // Asset recommendations
    const largeImages = this.results.assets.filter(
      asset => asset.type === 'image' && asset.size > ASSET_SIZE_LIMITS.image
    );
    
    if (largeImages.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'assets',
        title: `${largeImages.length} large images detected`,
        description: 'Consider optimizing images with compression or WebP format',
        impact: 'medium',
        files: largeImages.map(img => img.name),
      });
    }
    
    // Font recommendations
    const largeFonts = this.results.assets.filter(
      asset => asset.type === 'font' && asset.size > ASSET_SIZE_LIMITS.font
    );
    
    if (largeFonts.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'assets',
        title: `${largeFonts.length} large fonts detected`,
        description: 'Consider using system fonts or optimizing font files',
        impact: 'low',
        files: largeFonts.map(font => font.name),
      });
    }
    
    // Dependency recommendations
    const largeDependencies = this.results.dependencies.filter(
      dep => dep.size > 1 * 1024 * 1024 // 1MB
    );
    
    if (largeDependencies.length > 0) {
      recommendations.push({
        type: 'info',
        category: 'dependencies',
        title: `${largeDependencies.length} large dependencies found`,
        description: 'Review if all features of these dependencies are needed',
        impact: 'medium',
        files: largeDependencies.map(dep => `${dep.name}@${dep.version}`),
      });
    }
    
    // Duplicate assets
    const assetNames = this.results.assets.map(asset => path.basename(asset.name));
    const duplicates = assetNames.filter((name, index) => assetNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'assets',
        title: `${duplicates.length} duplicate asset names found`,
        description: 'Consider consolidating similar assets',
        impact: 'low',
      });
    }
    
    this.results.recommendations = recommendations;
    
    console.log(`Generated ${recommendations.length} recommendations`);
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n📊 Bundle Analysis Report');
    console.log('=' .repeat(50));
    
    console.log(`\n📦 Bundle Size: ${this.formatBytes(this.results.bundleSize)}`);
    console.log(`🖼️  Assets: ${this.results.assets.length} files`);
    console.log(`📚 Dependencies: ${this.results.dependencies.length} packages`);
    
    // Asset breakdown
    const assetsByType = this.groupAssetsByType();
    console.log('\n🗂️  Asset Breakdown:');
    Object.entries(assetsByType).forEach(([type, assets]) => {
      const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
      console.log(`  ${type}: ${assets.length} files, ${this.formatBytes(totalSize)}`);
    });
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} ${rec.title}`);
        console.log(`     ${rec.description}`);
        if (rec.files && rec.files.length > 0) {
          console.log(`     Files: ${rec.files.slice(0, 3).join(', ')}${rec.files.length > 3 ? '...' : ''}`);
        }
      });
    }
    
    // Save detailed report
    const reportPath = path.join(this.projectRoot, 'bundle-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Group assets by type
   */
  groupAssetsByType() {
    const groups = {};
    
    this.results.assets.forEach(asset => {
      if (!groups[asset.type]) {
        groups[asset.type] = [];
      }
      groups[asset.type].push(asset);
    });
    
    return groups;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze();
}

module.exports = BundleAnalyzer;