import { useState, useEffect, useCallback } from "react";
import { translations, Language } from "@/lib/translations";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("tr"); // Default to Turkish

  useEffect(() => {
    const stored = localStorage.getItem("acoria-lang") as Language;
    if (stored && (stored === "en" || stored === "tr")) {
      setLanguage(stored);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("acoria-lang", lang);
    // Force simple reload or context update? 
    // Ideally we use a Context, but for now a hook + state in pages works if pages re-render.
    // Actually, if we use this hook in multiple places, they won't sync without Context.
    // But since this is a simple app, we can just use window.location.reload() or a Custom Event if needed.
    // For now, let's dispatch a custom event so other hooks update?
    // Or simpler: The user changes language in Settings, effectively reloading the view or when they navigate back it re-mounts.
    window.dispatchEvent(new Event("language-change"));
  };

  // Listen for changes from other components (like Settings)
  useEffect(() => {
    const handleStorageChange = () => {
         const stored = localStorage.getItem("acoria-lang") as Language;
         if (stored) setLanguage(stored);
    };
    window.addEventListener("language-change", handleStorageChange);
    return () => window.removeEventListener("language-change", handleStorageChange);
  }, []);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[language][key] || key;
  }, [language]);

  return { language, setLanguage: changeLanguage, t };
}
