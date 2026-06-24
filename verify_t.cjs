const fs = require('fs');
const glob = require('glob'); // Need to install glob or just use simple fs.readdirSync if recursive

function findMissingUseLanguage() {
    // Just a quick manual array since we know the files
    const files = [
        "src/components/BackgroundMusic.tsx",
        "src/components/game/CardSelectionPopup.tsx",
        "src/components/game/ClassInfoPanel.tsx",
        "src/components/game/DeckCounter.tsx",
        "src/components/game/DeckSelectionScreen.tsx",
        "src/components/game/DiceRollPopup.tsx",
        "src/components/game/GameMatch.tsx",
        "src/components/game/ReadyPopup.tsx",
        "src/components/game/SpecialCardInfoPanel.tsx",
        "src/components/game/VictoryPopup.tsx",
        "src/components/game/GameMenuModal.tsx",
        "src/components/ui/TutorialOverlay.tsx",
        "src/pages/CardLibrary.tsx",
        "src/pages/Credits.tsx",
        "src/pages/DeckBuilder.tsx",
        "src/pages/HowToPlay.tsx",
        "src/pages/Landing.tsx",
        "src/pages/Menu.tsx",
        "src/pages/Play.tsx",
        "src/pages/Profile.tsx",
        "src/pages/Settings.tsx",
        "src/pages/StoryMode.tsx",
        "src/pages/GameArena.tsx"
    ];

    let allGood = true;

    files.forEach(file => {
        if (!fs.existsSync(file)) return;
        const content = fs.readFileSync(file, 'utf8');
        
        // Check if t is used
        if (content.match(/\bt\(/)) {
            // Check if t is defined
            const hasT = content.includes('const { t }') || content.includes('const { t, language }') || content.includes('const { t,');
            if (!hasT) {
                console.log(`CRITICAL: Missing t definition in ${file}`);
                allGood = false;
            }
        }
    });

    if (allGood) {
        console.log("All files with t() have const { t } defined!");
    }
}

findMissingUseLanguage();
