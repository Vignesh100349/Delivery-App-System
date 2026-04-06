const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(screensDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Remove SafeAreaView from react-native import if it exists
    if (content.match(/import\s+{.*SafeAreaView.*}\s+from\s+['"]react-native['"];/)) {
        content = content.replace(/(import\s+{.*?)(SafeAreaView,\s*|\s*,\s*SafeAreaView|\s*SafeAreaView\s*)(.*?}\s+from\s+['"]react-native['"];)/g, (match, p1, p2, p3) => {
            // Cleanup commas if needed
            let newP1P3 = p1 + p3;
            newP1P3 = newP1P3.replace(/{\s*,/, '{').replace(/,\s*}/, '}').replace(/{\s*}/, '{}');
            return newP1P3;
        });
        changed = true;
    }

    // Add SafeAreaView from react-native-safe-area-context if not present
    if (!content.includes("from 'react-native-safe-area-context'") && (content.includes('<SafeAreaView') || changed)) {
        content = content.replace(/(import\s+.*?from\s+['"]react-native['"];)/, "$1\nimport { SafeAreaView } from 'react-native-safe-area-context';");
        changed = true;
    }

    // If file uses View at the root and has standard container style, wrap it with SafeAreaView
    // This targets HomeScreen, CartScreen, OrdersScreen which used <View style={styles.container}>
    // or checks for existing Platform.OS === 'android' ? StatusBar.currentHeight
    if (['HomeScreen.tsx', 'CartScreen.tsx', 'OrdersScreen.tsx', 'PaymentMethodsScreen.tsx', 'SubCategoryScreen.tsx'].includes(file)) {
        if (!content.includes('<SafeAreaView')) {
            // Attempt to replace the main root <View style={styles.container}> with <SafeAreaView style={styles.container}>
            content = content.replace(/<View style={styles\.container}>/, '<SafeAreaView style={styles.container}>');
            
            // Also replace the closing </View> for that container.
            // Since this is risky with strict regex, we'll replace the LAST </View> in the file.
            const lastViewIndex = content.lastIndexOf('</View>');
            if (lastViewIndex !== -1) {
                content = content.substring(0, lastViewIndex) + '</SafeAreaView>' + content.substring(lastViewIndex + 7);
            }
            if (!content.includes("from 'react-native-safe-area-context'")) {
               content = content.replace(/(import\s+.*?from\s+['"]react-native['"];)/, "$1\nimport { SafeAreaView } from 'react-native-safe-area-context';");
            }

            // Remove manual paddingTop hacks in these specific screens
            // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            content = content.replace(/paddingTop:\s*Platform\.OS\s*===\s*['"]android['"]\s*\?\s*StatusBar\.currentHeight\s*:\s*0\s*,?/g, '');
            // paddingBottom: Platform.OS === 'android' ? 20 : 0,
            content = content.replace(/paddingBottom:\s*Platform\.OS\s*===\s*['"]android['"]\s*\?\s*20\s*:\s*0\s*,?/g, '');

            changed = true;
        }
    } else {
        // Also remove manual padding hacks in other screens
        if (content.includes("Platform.OS === 'android' ? StatusBar.currentHeight")) {
            content = content.replace(/paddingTop:\s*Platform\.OS\s*===\s*['"]android['"]\s*\?\s*StatusBar\.currentHeight\s*:\s*0\s*,?/g, '');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched ${file}`);
    }
}
console.log("All mobile edges dynamically adjusted!");
