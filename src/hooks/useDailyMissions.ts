import { useState, useEffect, useCallback } from "react";
import { DailyMission, MissionType } from "@/types/missions";
import { MISSION_POOL } from "@/data/missionPool";
import { useInventory } from "@/hooks/useInventory"; // reused for coin updates (optimistically)
import { supabase } from "@/integrations/supabase/client"; // For direct DB updates if needed, but useInventory handles coins well
import { ClassName } from "@/types/game";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const STORAGE_KEY = "acoria_daily_missions";

interface MissionProgressEvent {
    type: MissionType;
    amount?: number; // default 1
    className?: string; // Player's class
    isWin?: boolean;
    finalRound?: number;
}

export function useDailyMissions() {
    const [missions, setMissions] = useState<DailyMission[]>([]);
    // Removed unused lastRefresh variable
    const { setCoins, coins } = useInventory(); // We use this to update local UI immediately
    const { language } = useLanguage();

    // 1. Refill Logic (Run on mount & check time)
    useEffect(() => {
        const loadMissions = () => {
            const data = localStorage.getItem(STORAGE_KEY);
            let state = data ? JSON.parse(data) : { missions: [], lastRefreshDate: "" };

            // Check if we need to refresh (23:00 Threshold)
            const now = new Date();
            const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
            
            // Logic: A "Game Day" starts at 23:00 of the previous day.
            // If now is > 23:00, it counts as "Tomorrow's" game day logically, or rather:
            // Let's stick to the user req: "Yenilenme her 23:00'da"
            // If current time is past 23:00, the "active date" for missions is effectively "Timestamp of today 23:00"
            // If we haven't generated missions for this "23:00 cycle" yet, do it.

            // Simpler approach: Store the "Next Refresh Time" timestamp.
            // If now > NextRefreshTime, generate new ones and set NextRefreshTime to tomorrow 23:00.
            
            let nextRefresh = localStorage.getItem("mission_next_refresh");
            let shouldRefresh = false;

            if (!nextRefresh) {
                shouldRefresh = true;
            } else {
                if (now.getTime() > parseInt(nextRefresh)) {
                    shouldRefresh = true;
                }
            }

            if (shouldRefresh || state.missions.length === 0) {
                const newMissions = generateDailyMissions();
                state = {
                    missions: newMissions,
                    lastRefreshDate:  now.toISOString()
                };
                
                // Set next refresh to today 23:00 OR tomorrow 23:00
                // If now is < 23:00, next refresh is Today 23:00.
                // If now is > 23:00, next refresh is Tomorrow 23:00.
                const targetTest = new Date();
                targetTest.setHours(23, 0, 0, 0);
                
                if (now > targetTest) {
                     // We are past 23:00, so next refresh is tomorrow 23:00
                     targetTest.setDate(targetTest.getDate() + 1);
                }
                
                localStorage.setItem("mission_next_refresh", targetTest.getTime().toString());
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                setMissions(newMissions);
            } else {
                setMissions(state.missions);
            }
        };

        loadMissions();
        
        // Poll every minute to check for 23:00 refresh while app is open
        const interval = setInterval(loadMissions, 60000); 
        return () => clearInterval(interval);
    }, []);

    const generateDailyMissions = (): DailyMission[] => {
        // Select 3 random unique missions
        // 1 Easy (200), 1 Medium (200), 1 Hard (300) OR Random mix
        // User req: "200 ve 300 coin... zorluğuna göre"
        
        const pool = [...MISSION_POOL];
        const selected: DailyMission[] = [];
        
        // Shuffle
        pool.sort(() => Math.random() - 0.5);
        
        // Take 3 unique types if possible
        for (let i = 0; i < 3; i++) {
            if (pool.length > 0) {
                const def = pool.pop()!;
                selected.push({
                    ...def,
                    progress: 0,
                    isClaimed: false,
                    dateKey: new Date().toISOString()
                });
            }
        }
        
        return selected;
    };

    const updateProgress = useCallback((event: MissionProgressEvent) => {
        setMissions(prev => {
            let updated = false;
            const newMissions = prev.map(m => {
                if (m.isClaimed) return m;

                let matches = false;

                // Match Logic
                if (m.type === event.type) matches = true;
                
                // Class Requirement Check
                if (m.classRequirement && m.classRequirement !== event.className) {
                    matches = false;
                }

                // Win requirement check
                if (m.type === "win_class" || m.type === "win_games") {
                    if (!event.isWin) matches = false;
                }

                if (matches) {
                    const inc = event.amount || 1;
                    const newProg = Math.min(m.progress + inc, m.targetCount);
                    if (newProg !== m.progress) {
                        updated = true;
                        return { ...m, progress: newProg };
                    }
                }

                return m;
            });

            if (updated) {
                const state = { missions: newMissions, lastRefreshDate: new Date().toISOString() };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                
                // Toast for completion?
                newMissions.forEach((m, idx) => {
                    const old = prev[idx];
                    if (m.progress >= m.targetCount && old.progress < old.targetCount) {
                        toast.success(
                            language === "tr" ? "Görev Tamamlandı!" : "Mission Completed!", 
                            { description: m.reward + " Coins" }
                        );
                    }
                });
            }
            
            return updated ? newMissions : prev;
        });
    }, [language]);

    const claimReward = useCallback(async (missionId: string) => {
        let rewardAmount = 0;
        
        setMissions(prev => {
            const newMissions = prev.map(m => {
                if (m.id === missionId && !m.isClaimed && m.progress >= m.targetCount) {
                    rewardAmount = m.reward;
                    return { ...m, isClaimed: true };
                }
                return m;
            });
            
            if (rewardAmount > 0) {
                const state = { missions: newMissions, lastRefreshDate: new Date().toISOString() };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
            return newMissions;
        });

        if (rewardAmount > 0) {
            // Update Global/Supabase State via existing hooks/inventory
            // We need to fetch the current user ID for the DB update
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                 // Optimistic UI update
                 setCoins(coins + rewardAmount); 
                 
                 // DB Update
                 await supabase.rpc('increment_coins', { amount: rewardAmount, user_id: user.id });
                 toast.success(language === "tr" ? "Ödül Alındı!" : "Reward Claimed!");
            }
        }
    }, [coins, setCoins, language]);

    return {
        missions,
        updateProgress,
        claimReward
    };
}
