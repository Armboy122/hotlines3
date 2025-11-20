const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const allFiles = getAllFiles(srcDir);
const uiComponentsDir = path.join(srcDir, 'components/ui');
const uiComponents = fs.readdirSync(uiComponentsDir)
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => ({
    name: f,
    path: path.join(uiComponentsDir, f),
    basename: path.basename(f, path.extname(f))
  }));

const usedComponents = new Set();

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  // Check for imports of UI components
  // Patterns: 
  // import ... from "@/components/ui/name"
  // import ... from "../components/ui/name"
  // import ... from "./name" (if inside components/ui)
  
  uiComponents.forEach(comp => {
    if (file === comp.path) return; // Don't count self-usage

    // Simple regex to check if the component name is mentioned in import
    // This is a heuristic, but usually good enough for "is this file used at all"
    // We check for the filename in the import path
    
    const importRegex = new RegExp(`['"](.*/)?${comp.basename}['"]`, 'g');
    if (importRegex.test(content)) {
      usedComponents.add(comp.name);
    }
  });
});

const unusedComponents = uiComponents.filter(c => !usedComponents.has(c.name));

console.log('Unused UI Components:');
unusedComponents.forEach(c => console.log(c.name));

// Check for specific unused exports found by ts-prune
console.log('\nChecking specific exports:');
const specificChecks = [
  { file: 'src/config/navigation.tsx', export: 'NavigationItem' },
  { file: 'src/lib/pdf-generator.ts', export: 'generateMonthlyReport' },
  { file: 'src/lib/pdf-generator.ts', export: 'downloadPDF' }
];

specificChecks.forEach(check => {
    const filePath = path.join(process.cwd(), check.file);
    if (!fs.existsSync(filePath)) return;
    
    let isUsed = false;
    allFiles.forEach(file => {
        if (file === filePath) return;
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes(check.export)) {
            isUsed = true;
            console.log(`${check.export} is used in ${path.relative(process.cwd(), file)}`);
        }
    });
    
    if (!isUsed) {
        console.log(`${check.export} from ${check.file} seems UNUSED`);
    }
});
