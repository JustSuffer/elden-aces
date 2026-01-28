import { useState, useEffect } from "react";
import { STORY_REGIONS } from "@/data/storyData";

const STORAGE_KEY = "elden_aces_story_progress";

interface StoryProgress {
  completedLevels: string[];
  unlockedRegions: string[];
}

export const useStoryProgress = () => {
  const [progress, setProgress] = useState<StoryProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Default: Unlock first region(s) or all? Let's unlock Loreas and Typhon by default
    return {
      completedLevels: [],
      unlockedRegions: ["loreas", "typhon"],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const completeLevel = (levelId: string) => {
    if (!progress.completedLevels.includes(levelId)) {
      const newCompleted = [...progress.completedLevels, levelId];
      
      // Check for region unlocks based on completion logic (simplified for now)
      // e.g., if you beat a boss, maybe unlock another region?
      let newUnlocked = [...progress.unlockedRegions];

      // Logic: If you beat Loreas Boss, unlock Nyxia
      if (levelId === "loreas_boss" && !newUnlocked.includes("nyxia")) {
        newUnlocked.push("nyxia");
      }
      
      setProgress({
        completedLevels: newCompleted,
        unlockedRegions: newUnlocked,
      });
    }
  };

  const isLevelCompleted = (levelId: string) => progress.completedLevels.includes(levelId);
  const isRegionUnlocked = (regionId: string) => progress.unlockedRegions.includes(regionId);

  return {
    progress,
    completeLevel,
    isLevelCompleted,
    isRegionUnlocked,
  };
};
