#!/usr/bin/env node

/**
 * 🔄 Plumber SaaS Update Management Script
 * Personal assistant for handling dependency updates smartly
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const COLORS = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => console.log(`${color}${message}${COLORS.reset}`);

class UpdateManager {
  constructor() {
    this.packagePath = join(process.cwd(), 'package.json');
    this.pkg = JSON.parse(readFileSync(this.packagePath, 'utf8'));
  }

  async analyzeUpdates() {
    log(COLORS.blue, '\n🔍 Analyzing available updates...\n');
    
    try {
      const output = execSync('npx npm-check-updates', { encoding: 'utf8' });
      return this.parseUpdateOutput(output);
    } catch (error) {
      log(COLORS.red, '❌ Failed to check updates');
      return { safe: [], minor: [], major: [] };
    }
  }

  parseUpdateOutput(output) {
    const lines = output.split('\n').filter(line => line.includes('→'));
    const updates = { safe: [], minor: [], major: [], critical: [] };

    lines.forEach(line => {
      const match = line.match(/\s*(.+?)\s+\^?(\d+\.\d+\.\d+)\s*→\s*\^?(\d+\.\d+\.\d+)/);
      if (!match) return;

      const [, pkg, current, latest] = match;
      const [currMajor, currMinor, currPatch] = current.split('.').map(Number);
      const [latestMajor, latestMinor, latestPatch] = latest.split('.').map(Number);

      const update = { pkg: pkg.trim(), current, latest };

      // Classify update type
      if (latestMajor > currMajor) {
        // Major version change - requires careful review
        updates.major.push(update);
      } else if (latestMinor > currMinor) {
        // Minor version change - new features, test required
        updates.minor.push(update);
      } else if (latestPatch > currPatch) {
        // Patch version - safe updates
        updates.safe.push(update);
      }

      // Mark critical framework updates
      if (['next', 'react', 'react-dom', 'typescript'].includes(pkg.trim())) {
        updates.critical.push(update);
      }
    });

    return updates;
  }

  async runSafeUpdates(updates) {
    if (updates.safe.length === 0) {
      log(COLORS.green, '✅ No safe updates available');
      return true;
    }

    log(COLORS.yellow, `\n🔄 Applying ${updates.safe.length} safe updates...`);
    updates.safe.forEach(update => {
      log(COLORS.blue, `  • ${update.pkg}: ${update.current} → ${update.latest}`);
    });

    try {
      execSync('npm run update-safe', { stdio: 'inherit' });
      execSync('npm install', { stdio: 'inherit' });
      
      log(COLORS.yellow, '\n🧪 Testing updates...');
      execSync('npm run test-after-update', { stdio: 'inherit' });
      
      log(COLORS.green, '✅ Safe updates completed successfully!');
      return true;
    } catch (error) {
      log(COLORS.red, '❌ Safe updates failed - rolling back...');
      execSync('git checkout package.json package-lock.json', { stdio: 'inherit' });
      return false;
    }
  }

  reportMajorUpdates(updates) {
    if (updates.major.length === 0 && updates.critical.length === 0) {
      return;
    }

    log(COLORS.red, '\n⚠️  MAJOR UPDATES REQUIRE REVIEW:\n');

    [...updates.major, ...updates.critical].forEach(update => {
      const type = updates.critical.some(c => c.pkg === update.pkg) ? '[CRITICAL]' : '[MAJOR]';
      log(COLORS.yellow, `  ${type} ${update.pkg}: ${update.current} → ${update.latest}`);
      
      // Provide specific guidance
      if (update.pkg === 'next') {
        log(COLORS.blue, '    → Requires Next.js migration codemod');
      } else if (update.pkg.includes('react')) {
        log(COLORS.blue, '    → May require React migration patterns');
      } else if (update.pkg === 'typescript') {
        log(COLORS.blue, '    → May introduce new type checking rules');
      }
    });

    log(COLORS.yellow, '\n💬 Schedule a session to handle these together!');
    log(COLORS.blue, 'Command: "Let\'s update [package-name] together"');
  }

  generateUpdateReport() {
    const timestamp = new Date().toISOString().split('T')[0];
    return {
      date: timestamp,
      safeUpdatesApplied: true,
      majorUpdatesDetected: true,
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }
}

// Main execution
async function main() {
  const manager = new UpdateManager();
  
  log(COLORS.bold, '🚀 Plumber SaaS Update Manager');
  
  const updates = await manager.analyzeUpdates();
  
  // Auto-apply safe updates
  const safeSuccess = await manager.runSafeUpdates(updates);
  
  // Report major updates for review
  manager.reportMajorUpdates(updates);
  
  // Show summary
  log(COLORS.green, '\n📊 Update Summary:');
  log(COLORS.blue, `  Safe updates: ${updates.safe.length} ${safeSuccess ? '✅' : '❌'}`);
  log(COLORS.yellow, `  Minor updates: ${updates.minor.length} (review needed)`);
  log(COLORS.red, `  Major updates: ${updates.major.length} (session needed)`);
  
  if (updates.major.length > 0) {
    log(COLORS.yellow, '\n🤝 Ready to collaborate on major updates!');
  } else {
    log(COLORS.green, '\n🎉 All updates handled automatically!');
  }
}

main().catch(console.error);