#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get package.json version
const packageJson = require('../package.json');
const version = packageJson.version;

// Path to index.ts
const indexPath = path.join(__dirname, '..', 'index.ts');

// Read the file
let content = fs.readFileSync(indexPath, 'utf8');

// Define a static version string to replace
const staticVersionRegex = /const packageVersion = "([\d\.]+|unknown)";/;

// Replace with updated version from package.json
if (staticVersionRegex.test(content)) {
  content = content.replace(staticVersionRegex, `const packageVersion = "${version}";`);
  
  // Write the updated content
  fs.writeFileSync(indexPath, content);
  
  console.log(`Updated version in index.ts to ${version}`);
} else {
  console.error('Could not find static version declaration in index.ts');
  process.exit(1);
}