const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    if (file === 'HomeScreen.tsx' || file === 'CartScreen.tsx') continue; // Handled manually safely

    const filePath = path.join(screensDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.match(/import\s+{.*SafeAreaView.*}\s+from\s+['"]react-native['"];/)) {
        // Strip SafeAreaView from the react-native import precisely
        content = content.replace(/(import\s+{.*?)(SafeAreaView,?\s*)(.*?}\s+from\s+['"]react-native['"];)/g, '$1$3');
        // Clean up trailing/leading commas resulting from the removal
        content = content.replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');

        // Insert new safe-area-context import
        if (!content.includes('react-native-safe-area-context')) {
            content = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + content;
        }

        // Drop the legacy Android manual padding if it exists
        content = content.replace(/paddingTop:\s*Platform\.OS\s*===\s*['"]android['"]\s*\?\s*StatusBar\.currentHeight\s*:\s*0\s*,?/g, '');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Safe Area Context: ${file}`);
    }
}
