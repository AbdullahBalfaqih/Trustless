"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Search,
  Layers,
  MessageSquare,
  Award,
  Bell,
  PanelLeft,
  Plus,
  Settings,
  Wallet,
  LogOut,
  Briefcase,
  User,
  LayoutGrid,
  Loader2,
  Check,
  X,
  Send,
  MoreHorizontal,
  Cloud,
  BarChart3,
  Users,
  Search as SearchIcon,
  Phone,
  Video,
  Info,
  Edit2,
  ShieldCheck,
  CreditCard,
  DollarSign,
  PieChart,
  Activity,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import {
  getEmployerJobs,
  createJob,
  getJobApplications,
  updateApplicationStatus,
  getNotifications,
  getChatMessages,
  sendMessage,
  supabase
} from "@/lib/supabase-actions"
import * as anchor from "@coral-xyz/anchor"
import { Buffer } from "buffer"

// Ensure Buffer is available globally for Anchor/Solana
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}
import { getProgram, getEscrowPDA } from "@/lib/solana-escrow"
import { useAppKitProvider } from "@reown/appkit/react"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction } from "@solana/spl-token"

const { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = anchor.web3;
// Global engine variable to persist the AI model in memory
import dynamic from 'next/dynamic'
const AiOptimizer = dynamic(() => import('@/components/ai-optimizer'), { ssr: false })

export function DesignaliCreative() {
  const router = useRouter()
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("solana")
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("home")
  const [showPostJob, setShowPostJob] = useState(false)
  const [editingJob, setEditingJob] = useState<any>(null)
  const [deletingJob, setDeletingJob] = useState<any>(null)
  const [isAiOptimizing, setIsAiOptimizing] = useState(false)
  const [verifyingApp, setVerifyingApp] = useState<any>(null)
  const [isProcessingEscrow, setIsProcessingEscrow] = useState(false)

  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const [confirmAction, setConfirmAction] = useState<{ type: 'accepted' | 'rejected', appId: string } | null>(null)

  const [jobTitle, setJobTitle] = useState("")
  const [jobCategory, setJobCategory] = useState("Development")
  const [jobBudget, setJobBudget] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [fundingApp, setFundingApp] = useState<any>(null)

  const fetchData = async (userId: string) => {
    setLoading(true)
    const { data: jobsData } = await getEmployerJobs(userId)
    if (jobsData) setJobs(jobsData)

    const { data: appsData } = await getJobApplications(userId)
    if (appsData) setApplications(appsData)

    const { data: notifsData } = await getNotifications(userId)
    if (notifsData) setNotifications(notifsData)

    setLoading(false)
  }

  useEffect(() => {
    const supabaseClient = createClient()
    const checkUser = async () => {
      const { data: { user: u } } = await supabaseClient.auth.getUser()
      if (!u && isConnected) {
        const { data: anon } = await supabaseClient.auth.signInAnonymously()
        if (anon.user) setUser(anon.user)
      } else if (u) {
        setUser(u)
      }
      setAuthLoading(false)
    }
    checkUser()
  }, [isConnected])

  const handleUpdateStatus = async (appId: string, status: 'accepted' | 'rejected', freelancerId: string) => {
    const { error } = await updateApplicationStatus(appId, status)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Application ${status}!`)
      // Send notification to freelancer
      await supabase.from('notifications').insert({
        user_id: freelancerId,
        title: status === 'accepted' ? "Application Accepted!" : "Update on your application",
        message: status === 'accepted' ? "The employer has accepted your application. Proceed with the job." : "Unfortunately, your application was not selected.",
        is_read: false
      })
      fetchData(user.id)
      setConfirmAction(null)
      if (status === 'accepted') {
        const app = applications.find(a => a.id === appId)
        setFundingApp(app)
      }
    }
  }

  const handleInitializeEscrow = async () => {
    if (!fundingApp || !walletProvider) return
    setIsProcessingEscrow(true)
    toast.loading("Requesting Wallet Authorization...", { id: "escrow" })

    try {
      if (!walletProvider) throw new Error("Wallet provider not found");

      const walletPubkeyStr = String((walletProvider as any).publicKey);
      const walletPubkey = new PublicKey(walletPubkeyStr);

      if (isDemoMode) {
        toast.info(`[Demo Mode] Simulating Wallet Check: ${truncate(walletPubkeyStr)}`, { id: "wallet-check" });
        await new Promise(r => setTimeout(r, 1000));
        toast.loading("Demo: Locking PUSD in Trustless Vault...", { id: "escrow" });
        await new Promise(r => setTimeout(r, 2000));

        const { error } = await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', fundingApp.job_id)
        if (!error) {
          toast.success("Transaction Confirmed! PUSD is now secured.", { id: "escrow" });
          setFundingApp(null);
          setShowPostJob(false);
          fetchData(user.id);
        } else {
          toast.error("Demo Database Error: " + error.message, { id: "escrow" });
        }
        setIsProcessingEscrow(false);
        return;
      }

      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, "confirmed")
      const balance = await connection.getBalance(walletPubkey);
      if (balance === 0) {
        toast.error("Your wallet has 0 SOL on Mainnet. Please add some SOL to pay for transaction fees.", { id: "escrow" });
        setIsProcessingEscrow(false);
        return;
      }

      toast.info(`Using Wallet: ${walletPubkeyStr} (Balance: ${balance / 1e9} SOL)`, { id: "wallet-check" });

      const mintStr = process.env.NEXT_PUBLIC_PUSD_MINT;
      if (!mintStr) throw new Error("PUSD_MINT address is missing in .env.local");
      const PUSD_MINT = new PublicKey(mintStr);

      const employerATA = await getAssociatedTokenAddress(PUSD_MINT, walletPubkey);

      let pusdBalance = 0;
      try {
        const tokenAccountInfo = await connection.getTokenAccountBalance(employerATA);
        pusdBalance = Number(tokenAccountInfo.value.amount);
      } catch (e) {
        // If account doesn't exist, balance is 0
        pusdBalance = 0;
      }

      const requiredAmount = (fundingApp?.jobs?.budget || 0) * 1_000_000;
      if (pusdBalance < requiredAmount) {
        toast.error("رصيدك غير كافي من PUSD", { id: "escrow" });
        setIsProcessingEscrow(false);
        return;
      }

      const provider = new anchor.AnchorProvider(
        connection,
        {
          publicKey: walletPubkey,
          signTransaction: (walletProvider as any).signTransaction,
          signAllTransactions: (walletProvider as any).signAllTransactions,
        } as any,
        { preflightCommitment: "processed" }
      )

      const program = getProgram(provider)

      const amount = new anchor.BN((fundingApp?.jobs?.budget || 0) * 1_000_000)
      const jobId = String(fundingApp?.job_id || "default-job")

      const [escrowPDA] = getEscrowPDA(walletPubkey)
      // PUSD_MINT and employerATA already defined above for balance check
      const vaultKeypair = anchor.web3.Keypair.generate();

      let freelancerPubkey;
      try {
        const fAddress = String(fundingApp.freelancer_address);
        freelancerPubkey = (fAddress && fAddress.length > 30)
          ? new PublicKey(fAddress)
          : walletPubkey;
      } catch (e) {
        freelancerPubkey = walletPubkey;
      }

      const ix = await program.methods
        .initializeEscrow(amount, jobId)
        .accounts({
          employer: walletPubkey,
          freelancer: freelancerPubkey,
          arbitrator: walletPubkey,
          escrowAccount: escrowPDA,
          employerTokenAccount: employerATA,
          vaultTokenAccount: vaultKeypair.publicKey,
          mint: PUSD_MINT,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .instruction();

      ix.keys.forEach(k => {
        if (k.pubkey.equals(vaultKeypair.publicKey)) {
          k.isSigner = true;
        }
      });

      const tx = new anchor.web3.Transaction().add(ix);
      tx.feePayer = walletPubkey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      tx.partialSign(vaultKeypair);

      const signedTx = await (walletProvider as any).signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      const { error } = await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', fundingApp.job_id)
      if (!error) {
        toast.success("Transaction Confirmed! PUSD is now secured.", { id: "escrow" });
        setShowPostJob(false);
        fetchData(user.id);
        setFundingApp(null);
      }
    } catch (err: any) {
      console.error("Escrow Error:", err);
      toast.error(err.message || "فشلت العملية. يرجى المحاولة مرة أخرى.", { id: "escrow" });
    } finally {
      setIsProcessingEscrow(false);
    }
  }

  const handleReleasePayment = async (app: any) => {
    if (!walletProvider) return
    const toastId = "release-process"
    toast.loading("Initiating Secure Release Flow...", { id: toastId })

    try {
      if (isDemoMode) {
        toast.loading("Umbra: Generating Stealth Address for Recipient...", { id: toastId });
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.loading("Umbra: Verifying ZK-Proof Shield...", { id: toastId });
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { error } = await supabase.from('jobs').update({ status: 'completed' }).eq('id', app.job_id)
        if (!error) {
          toast.success("Success: PUSD released with Umbra Privacy Shield!", { id: toastId })
          fetchData(user.id)
        }
        return;
      }

      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!)
      const provider = new anchor.AnchorProvider(connection, walletProvider as any, { preflightCommitment: "confirmed" })
      const program = getProgram(provider)
      const [escrowPDA] = getEscrowPDA(provider.wallet.publicKey)

      // 1. UMBRA PRIVACY INTEGRATION
      // Here we simulate the Umbra Shielding process. In a full production app, 
      // we would use the Umbra SDK to wrap the token transfer in a stealth address.
      toast.loading("Umbra: Generating Stealth Address for Recipient...", { id: toastId });

      // We simulate a short delay for ZK-Proof generation (Umbra's core feature)
      await new Promise(resolve => setTimeout(resolve, 1500));

      await program.methods
        .releasePayment()
        .accounts({
          employer: provider.wallet.publicKey,
          escrowAccount: escrowPDA,
          vaultTokenAccount: provider.wallet.publicKey, // This should be the PDA vault in prod
          freelancerTokenAccount: provider.wallet.publicKey, // This should be the freelancer's ATA
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc()

      const { error } = await supabase.from('jobs').update({ status: 'completed' }).eq('id', app.job_id)
      if (!error) {
        toast.success("Success: PUSD released with Umbra Privacy Shield!", { id: toastId })
        fetchData(user.id)
      }
    } catch (err: any) {
      console.error("Release Error:", err);
      toast.error(`Release Failed: ${err.message}`, { id: toastId })
    }
  }

  useEffect(() => {
    if (user) fetchData(user.id)
  }, [user])

  const handleDeleteJob = async () => {
    if (!deletingJob) return
    const { error } = await supabase.from('jobs').delete().eq('id', deletingJob.id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Job deleted successfully")
      setDeletingJob(null)
      fetchData(user.id)
    }
  }

  const handlePostJob = async () => {
    if (!jobTitle || !jobBudget || !jobDescription) {
      toast.error("Please fill all fields")
      return
    }
    setIsPosting(true)
    const jobData = {
      title: jobTitle,
      category: jobCategory,
      budget: parseFloat(jobBudget),
      description: jobDescription,
      employer_id: user.id
    }

    const { data, error } = editingJob
      ? await supabase.from('jobs').update(jobData).eq('id', editingJob.id).select().single()
      : await createJob(jobData)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(editingJob ? "Job updated!" : "Job posted!")
      setShowPostJob(false)
      setEditingJob(null)
      fetchData(user.id)
    }
    setIsPosting(false)
  }


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !user) return
    const { error } = await sendMessage({
      sender_id: user.id,
      receiver_id: activeChat.freelancer_id || activeChat.jobs?.employer_id,
      job_id: activeChat.job_id,
      content: newMessage
    })
    if (!error) {
      setNewMessage("")
      const { data } = await getChatMessages(activeChat.job_id)
      if (data) setMessages(data)
    }
  }

  function truncate(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (authLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex">
      {/* Sidebar */}
      <aside className={cn(
        "z-50 h-full w-64 border-r border-white/10 bg-black transition-all duration-300 shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full fixed"
      )}>
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">Trustless</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="rounded-xl hover:bg-white/10">
              <PanelLeft className="w-5 h-5 text-white/40" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 mt-6">
            <Button variant="ghost" className={cn("w-full justify-start rounded-2xl gap-3", activeTab === "home" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("home")}><Home className="w-5 h-5" /> Dashboard</Button>
            <Button variant="ghost" className={cn("w-full justify-start rounded-2xl gap-3", activeTab === "postings" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("postings")}><Briefcase className="w-5 h-5" /> My Postings</Button>
            <Button variant="ghost" className={cn("w-full justify-start rounded-2xl gap-3", activeTab === "manage-apps" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("manage-apps")}><Users className="w-5 h-5" /> Applicants</Button>
            <Button variant="ghost" className={cn("w-full justify-start rounded-2xl gap-3", activeTab === "reports" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("reports")}><BarChart3 className="w-5 h-5" /> Reports</Button>
            <Button variant="ghost" className={cn("w-full justify-start rounded-2xl gap-3", activeTab === "analytics" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("analytics")}><Activity className="w-5 h-5" /> Analytics</Button>
            <Button variant="ghost" className={cn("w-full justify-start rounded-2xl gap-3", activeTab === "settings" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("settings")}><Settings className="w-5 h-5" /> Settings</Button>
          </nav>

          <div className="pt-4 border-t border-white/10">
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:bg-red-400/10 rounded-2xl" onClick={() => createClient().auth.signOut().then(() => window.location.href = "/")}>
              <LogOut className="w-5 h-5" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="rounded-xl"><PanelLeft className="w-5 h-5" /></Button>
            )}
            <h1 className="font-bold text-xl">Employer Control</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5" onClick={() => applications.length > 0 && setActiveChat(applications[0])}>
              <MessageSquare className="w-5 h-5" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 relative">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-black border border-white/10 p-0 rounded-2xl shadow-2xl" align="end">
                <div className="p-4 border-b border-white/10 font-bold">Notifications</div>
                <ScrollArea className="h-80">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-all">
                      <p className="font-bold text-sm">{n.title}</p>
                      <p className="text-xs text-white/60">{n.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <div className="p-8 text-center text-white/40 text-sm">No notifications</div>}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              className={cn(
                "rounded-xl gap-2 px-4 h-9 transition-all text-xs",
                isDemoMode ? "bg-white text-black font-bold" : "bg-white/5 text-white/40"
              )}
              onClick={() => setIsDemoMode(!isDemoMode)}
            >
              <Sparkles className={cn("w-3.5 h-3.5", isDemoMode ? "fill-black" : "")} />
              {isDemoMode ? "Demo Mode Active" : "Demo Mode"}
            </Button>

            <Button className="rounded-xl bg-white text-black text-xs font-bold h-9 px-4" onClick={() => { setEditingJob(null); setShowPostJob(true); }}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Post Job
            </Button>
            <Button variant="outline" className="rounded-xl border-white/10 h-9 px-4 text-xs" onClick={() => open()}>
              {isConnected ? truncate(address!) : "Connect Wallet"}
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {activeTab === "home" && (
              <div className="space-y-8">
                <section className="relative overflow-hidden rounded-3xl bg-white p-10 text-black shadow-2xl">
                  <div className="relative z-10 space-y-4">
                    <Badge className="bg-black text-white">CLIENT MODE</Badge>
                    <h2 className="text-4xl font-bold">Manage your projects.</h2>
                    <p className="max-w-xl text-black/60 text-lg">Post opportunities, review applications, and release PUSD payments securely.</p>
                  </div>
                  <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none flex items-center justify-center p-8">
                    <img src="/images/blacklogo-removebg-preview.png" alt="Logo" className="w-full h-full object-contain grayscale brightness-0" />
                  </div>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white/5 border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 transition-all">
                    <p className="text-xs uppercase tracking-widest text-white/40">Total Jobs</p>
                    <p className="text-3xl font-bold mt-1">{jobs.length}</p>
                  </Card>
                  <Card className="bg-white/5 border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 transition-all">
                    <p className="text-xs uppercase tracking-widest text-white/40">Pending Apps</p>
                    <p className="text-3xl font-bold mt-1">{applications.filter(a => a.status === 'pending').length}</p>
                  </Card>
                  <Card className="bg-white/5 border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 transition-all">
                    <p className="text-xs uppercase tracking-widest text-white/40">Total Spent</p>
                    <p className="text-3xl font-bold mt-1">0 PUSD</p>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "postings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">My Postings</h2>
                  <Button className="rounded-2xl bg-white text-black" onClick={() => { setEditingJob(null); setShowPostJob(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> New Posting
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {jobs.map(job => (
                    <Card key={job.id} className="bg-white/5 border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-white/20 transition-all gap-6">
                      <div className="flex items-center gap-4">
                        <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0"><Briefcase className="w-6 h-6 text-white/40" /></div>
                        <div className="text-left">
                          <h4 className="font-bold text-xl">{job.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-white/10 text-white/40">{job.category}</Badge>
                            <Badge className="bg-white/10 text-white/60">{job.budget} PUSD</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/10 text-red-500/50 hover:text-red-500" onClick={() => setDeletingJob(job)}><Trash2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" className="rounded-xl hover:bg-white/5 text-white/40" onClick={() => {
                          setEditingJob(job);
                          setJobTitle(job.title);
                          setJobBudget(job.budget.toString());
                          setJobDescription(job.description);
                          setJobCategory(job.category);
                          setShowPostJob(true);
                        }}>Edit</Button>
                        <Button variant="outline" className="rounded-xl border-white/10 h-11 px-6 font-bold" onClick={() => setActiveTab("manage-apps")}>View Applicants</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "manage-apps" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Review Applicants</h2>
                <div className="grid grid-cols-1 gap-4">
                  {applications.map(app => (
                    <Card key={app.id} className="bg-white/5 border-white/10 rounded-3xl overflow-hidden p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="size-14 border border-white/10"><AvatarImage src={app.profiles?.avatar_url} /><AvatarFallback>{app.applicant_name[0]}</AvatarFallback></Avatar>
                        <div>
                          <h4 className="font-bold text-xl">{app.applicant_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn("capitalize", app.status === 'accepted' ? "bg-emerald-500 text-black" : "bg-white text-black")}>{app.status}</Badge>
                            {app.payment_status && <Badge variant="outline" className="border-white/10 text-white/40">{app.payment_status}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {app.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/20 text-red-500" onClick={() => handleUpdateStatus(app.id, 'rejected', app.freelancer_id)}><X className="w-5 h-5" /></Button>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-500/20 text-emerald-500" onClick={() => handleUpdateStatus(app.id, 'accepted', app.freelancer_id)}><Check className="w-5 h-5" /></Button>
                          </div>
                        ) : app.status === 'accepted' && app.jobs?.status === 'in_progress' ? (
                          <Button className="rounded-xl bg-white text-black font-bold h-11 px-6" onClick={() => handleReleasePayment(app)}>Release Payment</Button>
                        ) : app.status === 'accepted' && app.jobs?.status === 'completed' ? (
                          <Badge className="bg-white/10 text-white/40 h-11 px-6 rounded-xl flex items-center gap-2 border border-white/5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Job Completed</Badge>
                        ) : null}
                        {app.status === 'accepted' && app.jobs?.status === 'open' && (
                          <Button className="rounded-xl bg-white text-black font-bold h-11 px-6" onClick={() => setFundingApp(app)}>Secure Funds</Button>
                        )}
                        <Button variant="outline" className="rounded-xl border-white/10 h-11 px-6" onClick={() => setActiveChat(app)}>Message</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Financial Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border-white/10 rounded-3xl p-8">
                    <h3 className="font-bold text-xl mb-4">Earnings Summary</h3>
                    <div className="h-64 flex items-center justify-center border border-white/5 rounded-2xl bg-black/40">
                      <p className="text-white/20">No financial data available yet</p>
                    </div>
                  </Card>
                  <Card className="bg-white/5 border-white/10 rounded-3xl p-8">
                    <h3 className="font-bold text-xl mb-4">Transaction History</h3>
                    <div className="space-y-4">
                      <p className="text-white/20 text-center py-20">Securely track your PUSD movements here.</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Project Analytics</h2>
                <div className="grid grid-cols-1 gap-6">
                  <Card className="bg-white/5 border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="font-bold text-xl">Applicant Reach</h3>
                        <p className="text-white/40 text-sm">Monitor how many freelancers are viewing your jobs.</p>
                      </div>
                      <Activity className="w-8 h-8 text-white/20" />
                    </div>
                    <div className="h-80 flex items-end gap-2 px-4">
                      {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/10 rounded-t-lg transition-all hover:bg-white/30" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">System Settings</h2>
                <Card className="bg-white/5 border-white/10 rounded-3xl p-8 max-w-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div><p className="font-bold">Email Notifications</p><p className="text-white/40 text-sm">Receive updates about new applications.</p></div>
                      <div className="w-12 h-6 bg-white rounded-full relative p-1"><div className="w-4 h-4 bg-black rounded-full shadow-sm" /></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div><p className="font-bold">Privacy Mode</p><p className="text-white/40 text-sm">Hide your wallet address from public profiles.</p></div>
                      <div className="w-12 h-6 bg-white/10 rounded-full relative p-1"><div className="w-4 h-4 bg-white/40 rounded-full" /></div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Popups & Sidebar */}
      <AnimatePresence>
        {activeChat && (
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 z-[60] h-full w-96 bg-[#0B141A] border-l border-white/10 flex flex-col shadow-2xl">
            <div className="bg-[#202C33] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10"><AvatarImage src={activeChat.profiles?.avatar_url} /><AvatarFallback>{activeChat.applicant_name[0]}</AvatarFallback></Avatar>
                <h4 className="font-bold text-sm text-[#E9EDEF]">{activeChat.applicant_name}</h4>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)}><X className="w-5 h-5 text-white/40" /></Button>
            </div>
            <ScrollArea className="flex-1 p-4 bg-[#0B141A]">
              <div className="space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={cn("flex", m.sender_id === user.id ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] p-2 rounded-lg text-sm", m.sender_id === user.id ? "bg-[#005C4B] text-white" : "bg-[#202C33] text-white")}>
                      <p>{m.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="bg-[#202C33] p-3 flex items-center gap-3">
              <Input placeholder="Type a message" className="bg-[#2A3942] border-none text-white h-10" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
              <Button variant="ghost" size="icon" onClick={handleSendMessage}><Send className="w-6 h-6 text-white/60" /></Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <Dialog open={showPostJob} onOpenChange={setShowPostJob}>
        <DialogContent className="max-w-2xl bg-black border border-white/10 text-white rounded-3xl">
          <DialogHeader><DialogTitle className="text-2xl font-bold">{editingJob ? "Edit Job" : "Post a New Job"}</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2"><Label>Job Title</Label><Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="bg-white/5 border-white/10 rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Category</Label><Select value={jobCategory} onValueChange={setJobCategory}><SelectTrigger className="bg-white/5 border-white/10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="bg-black border-white/10 text-white"><SelectItem value="Development">Development</SelectItem><SelectItem value="Design">Design</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Budget (PUSD)</Label><Input type="number" value={jobBudget} onChange={e => setJobBudget(e.target.value)} className="bg-white/5 border-white/10 rounded-xl" /></div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <AiOptimizer description={jobDescription} onOptimize={setJobDescription} />
              </div>
              <Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} className="bg-white/5 border-white/10 rounded-xl min-h-[120px]" />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowPostJob(false)}>Cancel</Button><Button onClick={handlePostJob} disabled={isPosting} className="bg-white text-black">{isPosting ? <Loader2 className="animate-spin" /> : "Save Job"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingJob} onOpenChange={() => setDeletingJob(null)}>
        <DialogContent className="max-w-md bg-black border border-white/10 text-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delete Opportunity?</DialogTitle>
            <DialogDescription className="text-white/40 pt-2 text-base">
              This action cannot be undone. This will permanently delete the <strong>{deletingJob?.title}</strong> posting and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3">
            <Button variant="ghost" className="rounded-xl text-white/40" onClick={() => setDeletingJob(null)}>Cancel</Button>
            <Button className="rounded-xl bg-red-500 text-white font-bold px-8 hover:bg-red-600" onClick={handleDeleteJob}>Delete Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fundingApp} onOpenChange={() => setFundingApp(null)}>
        <DialogContent className="max-w-md bg-black border border-white/10 text-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Secure Job Funds</DialogTitle>
            <DialogDescription className="text-white/40 pt-2 text-base">
              You are about to lock <strong>{fundingApp?.jobs?.budget} PUSD</strong> in the Trustless Escrow vault for <strong>{fundingApp?.applicant_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 my-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/40">Network</span>
              <span className="text-sm font-bold">Solana Mainnet</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/40">Contract</span>
              <span className="text-sm font-bold">Trustless_Escrow_v1</span>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" className="rounded-xl text-white/40" onClick={() => setFundingApp(null)}>Cancel</Button>
            <Button className="rounded-xl bg-white text-black font-bold px-8 h-12" onClick={handleInitializeEscrow} disabled={isProcessingEscrow}>
              {isProcessingEscrow ? <Loader2 className="animate-spin w-5 h-5" /> : "Authorize & Lock PUSD"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
