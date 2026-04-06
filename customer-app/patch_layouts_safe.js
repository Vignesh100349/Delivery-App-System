const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(screensDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Convert SafeAreaView from react-native to react-native-safe-area-context
    if (content.includes('SafeAreaView') && !content.includes('react-native-safe-area-context')) {
        // Find existing SafeAreaView import and remove it
        content = content.replace(/SafeAreaView\s*,?\s*/g, (match, offset, full) => {
            // only replace if inside an import statement from 'react-native'
            const before = full.substring(offset - 30, offset);
            const after = full.substring(offset, offset + 50);
            if (before.includes('import {') || after.includes('react-native')) {
               return '';
            }
            return match; // return original if not in import
        });
        
        // Add proper import
        content = `import { SafeAreaView } from 'react-native-safe-area-context';\n` + content;
        
        // Clean up empty imports like `import { } from 'react-native'`
        content = content.replace(/import\s*{\s*,?\s*}\s*from\s*['"]react-native['"];\n/g, '');
        changed = true;
    }

    // 2. Wrap screens that completely lack SafeAreaView with it, but SAFELY.
    if (['HomeScreen.tsx'].includes(file)) {
        if (!content.includes('<SafeAreaView')) {
            // It uses <View style={styles.container}>
            content = content.replace(/<View\s+style=\{styles\.container\}>/, '<SafeAreaView style={styles.container}>');
            const lastView = content.lastIndexOf('</View>');
            content = content.substring(0, lastView) + '</SafeAreaView>' + content.substring(lastView + 7);
            if(!content.includes('react-native-safe-area-context')) {
                content = `import { SafeAreaView } from 'react-native-safe-area-context';\n` + content;
            }
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched ${file}`);
    }
}
