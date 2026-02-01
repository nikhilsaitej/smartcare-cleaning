import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, LogIn, Loader2, Phone, Sparkles, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(identifier, password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/");
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setFacebookLoading(true);
    const { error } = await signInWithFacebook();
    if (error) {
      toast({
        title: "Facebook Sign-In Failed",
        description: error.message,
        variant: "destructive",
      });
      setFacebookLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-50/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">SmartCare</h1>
                  <p className="text-sm text-orange-600 font-bold uppercase tracking-wider">Cleaning Solutions</p>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-slate-800 leading-tight mb-4">
                Welcome Back to a
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                  Cleaner Tomorrow
                </span>
              </h2>
              <p className="text-slate-600 text-lg">
                Sign in to access your dashboard, manage bookings, and explore our premium cleaning services.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Shield, text: "Secure & encrypted login" },
                { icon: CheckCircle, text: "Access your booking history" },
                { icon: Sparkles, text: "Exclusive member benefits" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-slate-600"
                >
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-xl">
              <div className="flex items-start gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div>
                  <p className="text-slate-600 italic text-sm leading-relaxed">
                    "SmartCare transformed our office! The booking system is seamless and their team is incredibly professional."
                  </p>
                  <p className="text-slate-800 font-semibold mt-2 text-sm">Rajesh Kumar</p>
                  <p className="text-orange-600 text-xs font-bold uppercase tracking-wider">Business Owner, Vijayawada</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-white/80 backdrop-blur-xl overflow-hidden">
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5L20 22l2 1.5V44H0v-2h20v-2H0v-2h20v-2H0v-2h20v-2H0v-2h20v-2z' fill='%23fff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
                }} />
                <div className="relative">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <LogIn className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
                  <p className="text-blue-100 text-center mt-1 text-sm">Sign in to continue your journey</p>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="space-y-3 mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 font-semibold flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 rounded-xl"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    data-testid="button-google-login"
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
                        <span className="text-slate-700">Continue with Google</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 font-semibold flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 rounded-xl"
                    onClick={handleFacebookSignIn}
                    disabled={facebookLoading}
                    data-testid="button-facebook-login"
                  >
                    {facebookLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-slate-700">Continue with Facebook</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2 border-dashed border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      or sign in with credentials
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                      Email or Phone
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm -z-10" />
                      {identifier.includes("@") || !identifier ? (
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      ) : (
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      )}
                      <Input
                        type="text"
                        placeholder="Enter email or phone number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="pl-12 h-14 border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl text-base bg-white/50 backdrop-blur-sm transition-all"
                        required
                        data-testid="input-identifier"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                        Password
                      </label>
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm -z-10" />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 h-14 border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl text-base bg-white/50 backdrop-blur-sm transition-all"
                        required
                        data-testid="input-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 text-white"
                    disabled={loading}
                    data-testid="button-login"
                  >
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In
                        <LogIn className="h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-center text-slate-600">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
                      Create Account
                    </Link>
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Shield className="h-4 w-4" />
                  <span>Protected by enterprise-grade security</span>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-slate-500 text-sm mt-6">
              © 2024 SmartCare Cleaning Solutions. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
