const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src', 'pages', 'admin');
const sharedFile = path.join(__dirname, 'src', 'components', 'ui', 'shared.jsx');

const replacements = [
  { from: /your portfolio/gi, to: 'my portfolio' },
  { from: /Your portfolio/g, to: 'My portfolio' },
  { from: /your resume/gi, to: 'my resume' },
  { from: /Your resume/g, to: 'My resume' },
  { from: /Your Resume/g, to: 'My Resume' },
  { from: /Your Name/g, to: 'My Name' },
  { from: /your password/gi, to: 'my password' },
  { from: /your admin/gi, to: 'my admin' },
  { from: /you@example.com/g, to: 'me@example.com' },
  { from: /Are you sure you want to/gi, to: 'Are you sure to' },
  { from: /Are you sure you want to delete/gi, to: 'Confirm deleting' },
  { from: /Changes you make/gi, to: 'Changes I make' },
  { from: /You can view/gi, to: 'I can view' },
  { from: /Type your/gi, to: 'Type my' },
  { from: /What is your/gi, to: 'What is my' },
  { from: /Enter your/gi, to: 'Enter my' },
  { from: /Upload your/gi, to: 'Upload my' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  replacements.forEach(({ from, to }) => {
    newContent = newContent.replace(from, to);
  });
  
  // Custom tweaks for "me only" feeling
  newContent = newContent.replace(/you want to/gi, 'I want to');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(adminDir);
processFile(sharedFile);

console.log('Text replacement complete.');
