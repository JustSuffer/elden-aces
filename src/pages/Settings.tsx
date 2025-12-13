import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Music, Palette, Mic, MicOff, Upload, Languages } from "lucide-react";
import { useState, useEffect } from "react";
import { AudioManager } from "@/utils/AudioManager";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const Settings = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [volume, setVolume] = useState([70]);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    AudioManager.init();
    setVolume([AudioManager.getVolume() * 100]);
    setIsMuted(AudioManager.getMuted());
  }, []);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    AudioManager.setVolume(value[0] / 100);
  };

  const handleToggleMute = () => {
    const newMuted = AudioManager.toggleMute();
    setIsMuted(newMuted);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large! Maximum 10MB allowed.");
      return;
    }

    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload an audio file (mp3, wav, etc.)");
      return;
    }

    const success = await AudioManager.uploadBackgroundMusic(file);
    if (success) {
      toast.success("Background music uploaded and playing!");
      setMusicEnabled(true);
    } else {
      toast.error("Failed to upload background music");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("menu.back")}
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">{t("settings.title")}</div>
        <div className="w-20" />
      </div>

      {/* Settings Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                {t("settings.language")}
              </CardTitle>
              <CardDescription>{t("settings.languageDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button 
                   variant={language === "tr" ? "default" : "outline"} 
                   onClick={() => setLanguage("tr")}
                   className="flex-1"
                >
                    🇹🇷 Türkçe
                </Button>
                <Button 
                   variant={language === "en" ? "default" : "outline"} 
                   onClick={() => setLanguage("en")}
                   className="flex-1"
                >
                    🇬🇧 English
                </Button>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                {t("settings.audio")}
              </CardTitle>
              <CardDescription>{t("settings.audioDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-effects">{t("settings.soundEffects")}</Label>
                <Switch
                  id="sound-effects"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="music">{t("settings.music")}</Label>
                <Switch
                  id="music"
                  checked={musicEnabled}
                  onCheckedChange={(checked) => {
                    setMusicEnabled(checked);
                    if (!checked) {
                      AudioManager.stopBackgroundMusic();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">{t("settings.volume")}: {volume[0]}%</Label>
                <Slider
                  id="volume"
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bg-music-upload">{t("settings.uploadMusic")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-music-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={() => document.getElementById("bg-music-upload")?.click()}>
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {t("settings.visual")}
              </CardTitle>
              <CardDescription>{t("settings.visualDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animations">{t("settings.animations")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.animationsDesc")}</p>
                </div>
                <Switch
                  id="animations"
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                {t("settings.about")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>ACORIA - Strategic Card Game</p>
              <p>{t("common.version")}</p>
              <p>© 2025 All rights reserved</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
