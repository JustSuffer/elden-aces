const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const allTsxFiles = walk('src');

allTsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if t( is used
    if (content.match(/\bt\(/)) {
        // Check if t is defined
        const hasT = content.match(/const \{[^}]*\bt\b[^}]*\} = useLanguage\(\)/);
        if (!hasT) {
            console.log(`CRITICAL: Missing t definition in ${file}`);
        }
    }
});
console.log("Done checking all files.");
