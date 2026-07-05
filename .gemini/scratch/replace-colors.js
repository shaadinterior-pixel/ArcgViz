const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', '..', 'src');

const replacements = [
  { regex: /00E599/gi, replacement: '24B86C' },
  { regex: /00A1FF/gi, replacement: '11998E' },
  { regex: /rgba\(0,\s*229,\s*153,/g, replacement: 'rgba(36,184,108,' },
  { regex: /rgba\(0,\s*161,\s*255,/g, replacement: 'rgba(17,153,142,' },
  // And also some hover states that might be hardcoded like `#00D08A` -> `#1fa35f`
  { regex: /00D08A/gi, replacement: '1fa35f' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let newContent = content;
      
      for (const { regex, replacement } of replacements) {
        newContent = newContent.replace(regex, replacement);
      }
      
      if (content !== newContent) {
        console.log('Updated:', filePath);
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Done!');
