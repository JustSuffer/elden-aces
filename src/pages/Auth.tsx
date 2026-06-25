import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import logo from "@/assets/acoria-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setIsLoading(false);
      toast.error(result.error.message || "Google ile giriş başarısız");
      return;
    }
    if (result.redirected) return;
    navigate("/menu");
  };

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Get default tab from URL
  const defaultTab = searchParams.get("tab") === "login" ? "login" : "signup";

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/menu");
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message);
      }
      return;
    }
    
    toast.success("Giriş başarılı!");
    navigate("/menu");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    if (signupUsername.length < 3) {
      toast.error("Username must be at least 3 characters!");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, signupUsername);
    
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered");
      } else {
        toast.error(error.message);
      }
      return;
    }
    
    toast.success("Hesap oluşturuldu!");
    navigate("/menu");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-mist opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-border/50">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <img src={logo} alt="ACORIA" className="h-10" />
        <div className="w-20" />
      </div>

      {/* Auth Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <Tabs defaultValue={defaultTab} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-border/50">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Giriş Yap</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Kayıt Ol</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-primary font-cinzel">Tekrar Hoşgeldin</CardTitle>
                <CardDescription>Hesabına erişmek için bilgilerini gir</CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-posta</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Şifre</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary/20 border border-primary/50 hover:bg-primary/30 text-primary" disabled={isLoading}>
                    {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-primary font-cinzel">Hesap Oluştur</CardTitle>
                <CardDescription>ACORIA'ya katıl ve macerana başla</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Kullanıcı Adı</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Bir kullanıcı adı seç"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-posta</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifre</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Şifre Tekrar</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary/20 border border-primary/50 hover:bg-primary/30 text-primary" disabled={isLoading}>
                    {isLoading ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
