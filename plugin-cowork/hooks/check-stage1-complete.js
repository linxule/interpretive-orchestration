#!/usr/bin/env node

/**
 * PreStage2 Hook: Enforces Sandwich Methodology
 *
 * Prevents using Stage 2 AI collaboration tools without completing Stage 1
 * human foundation. This is non-negotiable for epistemic partnership.
 *
 * Philosophy: AI cannot develop YOUR theoretical sensitivity. Manual
 * engagement creates interpretive depth that makes collaboration meaningful.
 */

const fs = require('fs');
const path = require('path');

// Find project root by looking for .interpretive-orchestration/ directory
function findProjectRoot(startPath) {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    if (fs.existsSync(path.join(currentPath, '.interpretive-orchestration'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
}

// Output structured remediation JSON (machine-readable)
function outputRemediation(code, severity, reason, nextCommands, nextSkills, canBypass, details) {
  const remediation = {
    code,
    severity,
    reason,
    next_commands: nextCommands,
    next_skills: nextSkills,
    can_bypass: canBypass,
    details
  };

  // Output JSON to stderr for machine parsing, human-readable to stdout
  console.error(JSON.stringify(remediation));
}

// Main hook logic
function checkStage1Complete() {
  const projectRoot = findProjectRoot(process.cwd());

  if (!projectRoot) {
    outputRemediation(
      'PROJECT_NOT_FOUND',
      'blocking',
      'No Interpretive Orchestration project found in current directory',
      ['/qual-init'],
      ['project-setup'],
      false,
      { suggestion: 'Run /qual-init first to create a project' }
    );
    console.log('⚠️  No Interpretive Orchestration project found.');
    console.log('   Run /qual-init first to create a project.');
    process.exit(1);
  }

  const configPath = path.join(projectRoot, '.interpretive-orchestration', 'config.json');

  if (!fs.existsSync(configPath)) {
    outputRemediation(
      'CONFIG_NOT_FOUND',
      'blocking',
      'Project configuration not found',
      ['/qual-init'],
      ['project-setup'],
      false,
      { suggestion: 'Run /qual-init to set up your project properly' }
    );
    console.log('⚠️  Project configuration not found.');
    console.log('   Run /qual-init to set up your project properly.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Check if Stage 1 is complete
  if (!config.sandwich_status || !config.sandwich_status.stage1_complete) {
    const stage1Details = config.sandwich_status?.stage1_details || {};
    const documentsCoded = stage1Details.documents_manually_coded || 0;
    const memosWritten = stage1Details.memos_written || 0;

    outputRemediation(
      'STAGE1_INCOMPLETE',
      'blocking',
      'Stage 1 manual coding not complete',
      ['/qual-memo', '/qual-status'],
      ['project-setup', 'gioia-methodology'],
      true,  // Can bypass with explicit reason
      {
        documents_coded: documentsCoded,
        documents_required: 10,
        memos_written: memosWritten,
        memos_recommended: 5,
        suggestion: `Code ${Math.max(0, 10 - documentsCoded)} more documents manually`
      }
    );
    console.log('');
    console.log('📋 METHODOLOGY CHECK: Stage 1 Foundation');
    console.log('');
    console.log('   The sandwich methodology recommends completing manual coding');
    console.log('   before AI collaboration. This builds the theoretical sensitivity');
    console.log('   that makes partnership meaningful.');
    console.log('');
    console.log('   Why this matters:');
    console.log('   • AI cannot develop YOUR theoretical sensitivity');
    console.log('   • Manual coding creates interpretive depth');
    console.log('   • Close reading generates insights AI cannot provide');
    console.log('   • YOU remain the epistemic authority');
    console.log('');
    console.log('   You can bypass this if you have a specific reason (e.g., "I did');
    console.log('   Stage 1 on paper"), but we advise completing the foundation first.');
    console.log('');
    console.log('   📋 Current Stage 1 Progress:');

    // Reuse stage1Details, documentsCoded, memosWritten from above
    const structureCreated = stage1Details.initial_structure_created || false;

    console.log(`   • Documents manually coded: ${documentsCoded}/10+ [${documentsCoded >= 10 ? '✓' : '○'}]`);
    console.log(`   • Initial data structure: [${structureCreated ? '✓' : '○'}]`);
    console.log(`   • Analytical memos: ${memosWritten}/5+ [${memosWritten >= 5 ? '✓' : '○'}]`);
    console.log('');
    console.log('   📚 Need help with Stage 1?');
    console.log('   • Run: /qual-stage1-guide');
    console.log('   • Read: stage1-foundation/README-STAGE1.md');
    console.log('   • Or ask: "How do I complete Stage 1 manual analysis?"');
    console.log('');
    console.log('   💡 Why the methodology recommends this:');
    console.log('   Without Stage 1 depth, Stage 2 becomes mechanical pattern-matching');
    console.log('   (the "calculator mindset"). Partnership requires foundation.');
    console.log('');

    process.exit(1);
  }

  // Stage 1 is complete - allow proceeding
  const stage1Details = config.sandwich_status.stage1_details || {};

  console.log('');
  console.log('✅ Stage 1 Foundation Complete!');
  console.log('');
  console.log(`   🍞 Human bread (top): Established`);
  console.log(`   • Documents manually coded: ${stage1Details.documents_manually_coded || 'N/A'}`);
  console.log(`   • Initial framework: ${stage1Details.initial_structure_created ? 'Built' : 'In progress'}`);
  console.log(`   • Analytical memos: ${stage1Details.memos_written || 0}`);
  console.log('');
  console.log('   🤝 Ready for Stage 2 collaboration!');
  console.log('   Your theoretical sensitivity provides the foundation.');
  console.log('   AI will help you scale while you maintain interpretive authority.');
  console.log('');
  console.log('   Proceeding with epistemic partnership... 💭');
  console.log('');

  process.exit(0);
}

// Run the check
try {
  checkStage1Complete();
} catch (error) {
  console.error('');
  console.error('⚠️  Error checking Stage 1 status:', error.message);
  console.error('');
  console.error('   Please ensure your .interpretive-orchestration/config.json is properly formatted.');
  console.error('');
  process.exit(1);
}
