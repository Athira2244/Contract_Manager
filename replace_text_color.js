const fs = require('fs');
const path = require('path');

const targetDir = 'd:\\Contract manager\\Contract-ui\\contract-manager\\src';

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.css')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/#1B679A/gi, '#1E516E');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated color in ${filePath}`);
    }
}

processDir(targetDir);
console.log('Text color replacement completed.');
