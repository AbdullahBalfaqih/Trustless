"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          toast.error("This email is already registered. Please sign in.");
          return;
        }
        
        toast.success("Account created! Please check your email.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Account does not exist, please create an account");
          } else {
            toast.error(error.message);
          }
          return;
        }

        if (data?.session) {
          toast.success("Welcome back!");
          router.push("/dashboard");
        } else {
          toast.error("Account does not exist, please create an account");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <Card className="w-full max-w-md bg-black border-white/10 backdrop-blur-xl relative z-10 rounded-2xl shadow-2xl">
        <CardHeader className="space-y-2 text-center border-b border-white/5 pb-8">
          <CardTitle className="text-2xl font-bold tracking-tight text-white uppercase tracking-widest">
            {isSignUp ? "Create Account" : "Access Hub"}
          </CardTitle>
          <CardDescription className="text-white/40 text-xs">
            {isSignUp ? "Join the on-chain freelance network" : "Securely manage your freelance tasks"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-8">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/40 text-[10px] uppercase font-bold tracking-wider ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl focus:border-white transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Password" className="text-white/40 text-[10px] uppercase font-bold tracking-wider ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl focus:border-white transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-white hover:bg-white/90 text-black font-bold rounded-xl gap-2 mt-4 transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {isSignUp ? "Register" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center border-t border-white/5 pt-6">
          <p className="text-xs text-white/40">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white font-bold hover:underline transition-all"
            >
              {isSignUp ? "Sign In" : "Register Now"}
            </button>
          </p>
          <Link href="/" className="text-[10px] text-white/20 hover:text-white/60 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

function ArrowLeft(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}
