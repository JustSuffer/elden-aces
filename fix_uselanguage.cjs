const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'src/pages/CardLibrary.tsx',
    'src/components/game/GameMatch.tsx',
    'src/components/game/ReadyPopup.tsx',
    'src/pages/Play.tsx',
    'src/pages/Profile.tsx',
    'src/components/game/DeckCounter.tsx',
    'src/pages/StoryMode.tsx',
    'src/components/BackgroundMusic.tsx',
    'src/pages/Checkout.tsx'
];

filesToCheck.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Check for import
    if (!content.includes('import { useLanguage } from')) {
        content = 'import { useLanguage } from "@/hooks/useLanguage";\n' + content;
        changed = true;
    }

    // Identify component name and insert const { t } = useLanguage();
    const componentNameMatch = content.match(/const ([A-Z][a-zA-Z0-9_]*) = \([^\)]*\) => {/);
    if (componentNameMatch) {
        const insertionPoint = componentNameMatch.index + componentNameMatch[0].length;
        if (!content.includes('const { t } = useLanguage();')) {
            content = content.slice(0, insertionPoint) + '\n  const { t } = useLanguage();' + content.slice(insertionPoint);
            changed = true;
        }
    } else {
        // Fallback for export const GameMatch = ({...}) => {
        const fallbackMatch = content.match(/export const ([A-Z][a-zA-Z0-9_]*) = \([^\)]*\) => {/);
        if (fallbackMatch) {
            const insertionPoint = fallbackMatch.index + fallbackMatch[0].length;
            if (!content.includes('const { t } = useLanguage();')) {
                content = content.slice(0, insertionPoint) + '\n  const { t } = useLanguage();' + content.slice(insertionPoint);
                changed = true;
            }
        }
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
