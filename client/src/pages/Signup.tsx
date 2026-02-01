import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Lock, UserPlus, Loader2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { signUp, signInWithGoogle, signInWithFacebook, sendOTP } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    const isPhone = !identifier.includes("@") && identifier.length >= 10;
    if (!isPhone) {
      toast({ title: "Invalid Phone", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await sendOTP(identifier);
    setLoading(false);
    if (error) {
      toast({ title: "OTP Failed", description: error.message, variant: "destructive" });
    } else {
      setOtpSent(true);
      toast({ title: "OTP Sent", description: "Verification code sent to your phone." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    const { error } = await signUp(identifier, password);
    
    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Notify backend to send welcome email via Resend if it's an email signup
      if (identifier.includes("@")) {
        try {
          await fetch("/api/auth/signup-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: identifier }),
          });
        } catch (e) {
          console.error("Failed to trigger welcome email", e);
        }
      }

      toast({
        title: "Account Created!",
        description: "Your account has been successfully created. Welcome to SmartCare!",
      });
      setLocation("/");
    }
    
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google Sign-Up Failed",
        description: error.message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setFacebookLoading(true);
    const { error } = await signInWithFacebook();
    if (error) {
      toast({
        title: "Facebook Sign-Up Failed",
        description: error.message,
        variant: "destructive",
      });
      setFacebookLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-none">
              <div className="bg-primary p-6 text-white text-center rounded-t-xl">
                <UserPlus className="h-12 w-12 mx-auto mb-3" />
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-blue-100 text-sm mt-1">Join SmartCare today</p>
              </div>
              <CardContent className="p-8">
                <div className="space-y-3 mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 font-semibold flex items-center justify-center gap-2"
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading}
                    data-testid="button-google-signup"
                  >
                    {googleLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 font-semibold flex items-center justify-center gap-2 hover:bg-blue-50"
                    onClick={handleFacebookSignUp}
                    disabled={facebookLoading}
                    data-testid="button-facebook-signup"
                  >
                    {facebookLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Continue with Facebook
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with email or phone</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email or Phone Number</label>
                    <div className="relative">
                      {identifier.includes("@") || !identifier ? (
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      ) : (
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      )}
                      <Input
                        type="text"
                        placeholder="you@example.com or +91..."
                        value={identifier}
                        onChange={(e) => { setIdentifier(e.target.value); setOtpSent(false); }}
                        className="pl-10"
                        required
                        data-testid="input-signup-identifier"
                      />
                    </div>
                    {!identifier.includes("@") && identifier.length >= 10 && !otpSent && (
                      <Button 
                        type="button" 
                        variant="link" 
                        className="p-0 h-auto text-xs" 
                        onClick={handleSendOTP}
                        disabled={loading}
                      >
                        Verify phone with OTP
                      </Button>
                    )}
                    {otpSent && <span className="text-xs text-green-600">Verification code sent!</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        data-testid="input-signup-password"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        data-testid="input-signup-confirm"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold"
                    disabled={loading}
                    data-testid="button-signup"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>Create Account</>
                    )}
                  </Button>
                </form>
                <p className="text-center text-gray-600 mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
