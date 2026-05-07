import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Chrome, Mail, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function SignupModal({ isOpen, onClose, redirectTo = "/dashboard" }: SignupModalProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isLogin) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data?.user?.identities?.length === 0) {
          toast.error("This email is already registered. Please sign in.");
          setIsLogin(true);
        } else {
          toast.success("Account created! Check your email.");
          onClose();
        }
      } else {
        // Sign In
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
          onClose();
          router.push(redirectTo);
        } else {
          toast.error("Account does not exist, please create an account");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-5xl bg-black border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl ${
              isLogin ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Visual Side */}
            <motion.div layout className="relative md:w-1/2 p-8 lg:p-12 flex flex-col justify-between overflow-hidden bg-[#050505]">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#4ade80]/10 via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[15rem] h-[15rem] bg-[#4ade80]/10 blur-[100px] rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                  <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
                  <span className="text-xl font-display text-white tracking-tight">Trustless</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-display leading-[1.1] tracking-tight text-white mb-6">
                  {isLogin ? "Welcome back to the " : "Secure your freelance "}
                  <br />
                  <span className="text-white/40">{isLogin ? "Trustless network." : "future on-chain."}</span>
                </h1>
              </div>

              <div className="relative z-10 flex items-center gap-4 text-xs font-mono text-white/40 uppercase tracking-widest">
                <span>Verified by Solana</span>
                <span className="w-1 h-1 rounded-full bg-[#4ade80]" />
                <span>PUSD Integrated</span>
              </div>
            </motion.div>

            {/* Form Side */}
            <motion.div layout className="md:w-1/2 p-8 lg:p-12 bg-white flex flex-col justify-center min-h-[550px]">
              <div className="max-w-sm mx-auto w-full">
                <div className="mb-8">
                  <h2 className="text-3xl font-display text-black mb-2">
                    {isLogin ? "Login" : "Get Started"}
                  </h2>
                  <p className="text-black/60 text-sm">
                    {isLogin ? "Access your account and manage tasks." : "Create your account to start posting opportunities."}
                  </p>
                </div>


                <form className="space-y-4" onSubmit={handleAuth}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        className="w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white font-bold py-4 rounded-xl transition-all hover:bg-black/90 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {isLogin ? "Login" : "Create Account"}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 pt-2">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button 
                      type="button" 
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-black font-bold hover:underline"
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
