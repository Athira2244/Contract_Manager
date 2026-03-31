const fs = require('fs');
const path = require('path');

const replacements = {
    '#0F172A': '#1B679A',
    '#1E293B': '#114A72',
    '#334155': '#1A5D8B',
    '#475569': '#30779E',
    '#64748B': '#488EB4',
    '#94A3B8': '#78ADCC',
    '#CBD5E1': '#B3D2E3',
    '#E2E8F0': '#CFE3EE',
    '#F1F5F9': '#E8F2F8',
    '#F8FAFC': '#F4F9FB',
    '#FAFAFA': '#F7FAFB',
    '#3B82F6': '#36BEF6',
    '#38BDF8': '#36BEF6',
    '#10B981': '#25B14C',
    '#065F46': '#156D2E',
    '#ECFDF5': '#E3F6E8',
    '#F59E0B': '#FED206',
    '#92400E': '#8B7501',
    '#FFFBEB': '#FFFCE0',
    '#EF4444': '#E50A86',
    '#991B1B': '#890650',
    '#FEF2F2': '#FCE4F2',
    '#DC2626': '#C80975',
    '#FECACA': '#F3B2D7',
    '#FCA5A5': '#ED88C2',
};

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

    for (const [oldHex, newHex] of Object.entries(replacements)) {
        const lowerRegex = new RegExp(oldHex.toLowerCase(), 'g');
        const upperRegex = new RegExp(oldHex.toUpperCase(), 'g');
        content = content.replace(lowerRegex, newHex).replace(upperRegex, newHex);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated colors in ${filePath}`);
    }
}

processDir(targetDir);
console.log('Rizo brand palette injection standard completed.');
