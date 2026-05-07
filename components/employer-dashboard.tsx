"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Users,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Bell,
  PanelLeft,
  LogOut,
  ArrowLeft,
  DollarSign,
  Send,
  X,
  MoreVertical,
  Activity,
  BarChart3,
  Search,
  Settings,
  ChevronRight,
  ShieldAlert
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { getProgram, getEscrowPDA, PROGRAM_ID } from "@/lib/solana-escrow"
import * as anchor from "@coral-xyz/anchor"
import { useAppKitProvider } from "@reown/appkit/react"

export function EmployerDashboard() {
  const router = useRouter()
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("solana")
  const [user, setUser] = useState<any>(null)
  
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [applicants, setApplicants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("my-jobs")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Post Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false)
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    budget: "",
    category: "Development"
  })
  const [isPosting, setIsPosting] = useState(false)

  // Solana States
  const [escrowStates, setEscrowStates] = useState<Record<string, any>>({})

  const fetchData = async (userId: string) => {
    setLoading(true)
    const supabase = createClient()
    
    // Fetch my posted jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*, applications(*)')
      .eq('employer_id', userId)
    setMyJobs(jobs || [])

    // Fetch all applicants for my jobs
    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map(j => j.id)
      const { data: apps } = await supabase
        .from('applications')
        .select('*, jobs(*)')
        .in('job_id', jobIds)
      setApplicants(apps || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        setUser(u)
        fetchData(u.id)
      } else if (isConnected && address) {
        const { data: anon } = await supabase.auth.signInAnonymously()
        if (anon.user) {
          setUser(anon.user)
          fetchData(anon.user.id)
        }
      }
    }
    init()
  }, [isConnected, address])

  // Function to initialize Escrow on Solana
  const handleInitializeEscrow = async (job: any, applicant: any) => {
    if (!isConnected || !walletProvider) {
      toast.error("Please connect your wallet")
      open()
      return
    }

    try {
      const connection = new anchor.web3.Connection("https://api.devnet.solana.com")
      const provider = new anchor.AnchorProvider(connection, walletProvider as any, { preflightCommitment: "confirmed" })
      const program = getProgram(provider)

      const [escrowPDA] = getEscrowPDA(provider.wallet.publicKey)

      toast.loading("Securing funds on Solana...", { id: "escrow" })

      // Mocking token accounts for now - in production you'd get real associated token accounts
      // This is the instruction call to your deployed contract
      await program.methods
        .initializeEscrow(new anchor.BN(job.budget), job.id)
        .accounts({
          employer: provider.wallet.publicKey,
          freelancer: new anchor.web3.PublicKey(applicant.freelancer_address || provider.wallet.publicKey),
          arbitrator: provider.wallet.publicKey, // For demo, employer is the arbitrator or use a fixed admin address
          escrowAccount: escrowPDA,
          employerTokenAccount: provider.wallet.publicKey, 
          vaultTokenAccount: provider.wallet.publicKey,
          mint: provider.wallet.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc()

      toast.success("Payment secured in Trustless Escrow!", { id: "escrow" })
      
      // Update Supabase job status
      const supabase = createClient()
      await supabase.from('jobs').update({ status: 'funded' }).eq('id', job.id)
      fetchData(user.id)

    } catch (err: any) {
      console.error("Escrow Error:", err)
      toast.error(`Escrow Failed: ${err.message}`, { id: "escrow" })
    }
  }

  const handleReleasePayment = async (job: any) => {
    if (!isConnected || !walletProvider) return
    try {
      const connection = new anchor.web3.Connection("https://api.devnet.solana.com")
      const provider = new anchor.AnchorProvider(connection, walletProvider as any, { preflightCommitment: "confirmed" })
      const program = getProgram(provider)
      const [escrowPDA] = getEscrowPDA(provider.wallet.publicKey)

      toast.loading("Releasing funds to freelancer...", { id: "release" })

      await program.methods
        .releasePayment()
        .accounts({
          employer: provider.wallet.publicKey,
          escrowAccount: escrowPDA,
          vaultTokenAccount: provider.wallet.publicKey, // Use real vault account in prod
          freelancerTokenAccount: provider.wallet.publicKey, // Use real freelancer account in prod
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc()

      toast.success("Funds released successfully!", { id: "release" })
      
      const supabase = createClient()
      await supabase.from('jobs').update({ status: 'completed' }).eq('id', job.id)
      fetchData(user.id)
    } catch (err: any) {
      toast.error(`Release Failed: ${err.message}`, { id: "release" })
    }
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsPosting(true)
    const supabase = createClient()
    const { error } = await supabase.from('jobs').insert({
      employer_id: user.id,
      title: newJob.title,
      description: newJob.description,
      budget: parseInt(newJob.budget),
      category: newJob.category,
      status: 'open'
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Job posted successfully!")
      setIsPostJobModalOpen(false)
      setNewJob({ title: "", description: "", budget: "", category: "Development" })
      fetchData(user.id)
    }
    setIsPosting(false)
  }

  function truncate(address: string) { return `${address.slice(0, 6)}...${address.slice(-4)}` }

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "z-50 h-full w-64 border-r border-white/10 bg-black transition-all duration-300 shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full fixed"
      )}>
        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between py-4 border-b border-white/5 mb-6">
             <div className="flex items-center gap-2">
                <div className="size-8 bg-white rounded flex items-center justify-center">
                  <img src="/images/logo.png" alt="Logo" className="w-5 h-5 invert" />
                </div>
                <span className="text-lg font-bold tracking-tight">Trustless</span>
             </div>
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="rounded-lg hover:bg-white/5">
                <PanelLeft className="w-4 h-4 text-white/40" />
             </Button>
          </div>

          <nav className="flex-1 space-y-1">
            <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11", activeTab === "my-jobs" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("my-jobs")}><Briefcase className="w-4 h-4" /> My Opportunities</Button>
            <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11", activeTab === "applicants" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("applicants")}><Users className="w-4 h-4" /> Applicants</Button>
          </nav>

          <div className="pt-4 border-t border-white/10">
             <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all" onClick={() => router.push("/")}>
               <ArrowLeft className="w-4 h-4" />
               <span>Back to Home</span>
             </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0A0A0A]">
        <header className="h-16 border-b border-white/10 bg-black flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="rounded-lg border border-white/10"><PanelLeft className="w-4 h-4" /></Button>
            )}
            <h1 className="font-bold text-lg">Employer Central</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className={cn("rounded-xl border-white/20 h-10 px-4 text-sm bg-white text-black hover:bg-white/90")} onClick={() => open()}>
              {isConnected ? truncate(address!) : "Connect Wallet"}
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black border border-white/10 p-6 rounded-2xl">
                <p className="text-xs text-white/40 mb-1">Active Projects</p>
                <p className="text-4xl font-bold">{myJobs.length}</p>
              </Card>
              <Card className="bg-black border border-white/10 p-6 rounded-2xl">
                <p className="text-xs text-white/40 mb-1">On-chain Escrow</p>
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-bold text-white">0.0</p>
                  <span className="text-xs text-white/40">PUSD</span>
                </div>
              </Card>
              <Card className="bg-black border border-white/10 p-6 rounded-2xl">
                <p className="text-xs text-white/40 mb-1">Verified Status</p>
                <div className="flex items-center gap-2 text-white">
                  <p className="text-xl font-bold">Legacy</p>
                </div>
              </Card>
            </div>

            {activeTab === "my-jobs" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Your Opportunities</h2>
                  <Button 
                    className="bg-white text-black rounded-xl gap-2 font-bold"
                    onClick={() => setIsPostJobModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" /> Post New Job
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {myJobs.map(job => (
                    <Card key={job.id} className="bg-black border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:border-white/30 transition-all">
                      <div className="flex items-center gap-5">
                         <div className="size-10 bg-white/5 rounded flex items-center justify-center border border-white/10"><Briefcase className="w-5 h-5 text-white/20" /></div>
                         <div>
                            <p className="font-bold text-lg">{job.title}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="w-fit border-white/10 text-white/40 text-[10px] px-2 py-0">{job.category}</Badge>
                              <Badge className={cn(job.status === 'funded' ? "bg-white text-black" : "bg-white/5 text-white/40")}>
                                {job.status === 'funded' ? "Active" : "Open"}
                              </Badge>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <p className="text-[10px] text-white/40 mb-1">Budget</p>
                            <p className="font-bold">{job.budget} PUSD</p>
                          </div>
                          {job.status === 'funded' && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-white/5 text-white/40 hover:text-white" onClick={() => toast.info("Arbitration process initiated")}>
                                <ShieldAlert className="w-4 h-4 mr-1" /> Dispute
                              </Button>
                              <Button size="sm" className="rounded-xl bg-white text-black font-bold" onClick={() => handleReleasePayment(job)}>
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Release
                              </Button>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" className="rounded-xl border border-white/10 hover:bg-white/5" onClick={() => setActiveTab("applicants")}>
                          View {job.applications?.length || 0} Applicants
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "applicants" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Job Applicants</h2>
                <div className="grid grid-cols-1 gap-4">
                  {applicants.map(app => (
                    <Card key={app.id} className="bg-black border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-white/30 transition-all">
                      <div className="flex items-center gap-5 mb-4 md:mb-0">
                         <Avatar className="size-12 border border-white/10"><AvatarFallback>{app.freelancer_id?.slice(0,2)}</AvatarFallback></Avatar>
                         <div>
                            <p className="font-bold text-lg">Applicant for {app.jobs?.title}</p>
                            <p className="text-xs text-white/40">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" className="rounded-xl text-white/40 hover:text-white"><MessageSquare className="w-4 h-4 mr-2" /> Chat</Button>
                        
                        {app.jobs?.status !== 'funded' ? (
                          <Button 
                            className="rounded-xl bg-white text-black font-bold px-6 h-11"
                            onClick={() => handleInitializeEscrow(app.jobs, app)}
                          >
                            Accept Applicant
                          </Button>
                        ) : (
                          <Button className="rounded-xl bg-white/5 text-white/40 border border-white/10 font-bold px-6 h-11">
                            Payment Active
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                  {applicants.length === 0 && (
                    <div className="py-20 text-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No applicants yet for your jobs</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Post Job Modal */}
      <Dialog open={isPostJobModalOpen} onOpenChange={setIsPostJobModalOpen}>
        <DialogContent className="bg-black border border-white/20 text-white max-w-xl rounded-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Post New Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePostJob} className="py-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Job Title</label>
              <Input 
                placeholder="e.g. Senior Solana Developer" 
                className="bg-white/5 border-white/10 rounded-xl h-11"
                value={newJob.title}
                onChange={e => setNewJob({...newJob, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Category</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                value={newJob.category}
                onChange={e => setNewJob({...newJob, category: e.target.value})}
              >
                <option value="Development" className="bg-black text-white">Development</option>
                <option value="Design" className="bg-black text-white">Design</option>
                <option value="Marketing" className="bg-black text-white">Marketing</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 ml-1">Budget (PUSD)</label>
                <Input 
                  type="number"
                  placeholder="500" 
                  className="bg-white/5 border-white/10 rounded-xl h-11"
                  value={newJob.budget}
                  onChange={e => setNewJob({...newJob, budget: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 ml-1">Duration</label>
                <Input 
                  placeholder="2 Weeks" 
                  className="bg-white/5 border-white/10 rounded-xl h-11 text-white/40"
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Description</label>
              <textarea 
                placeholder="Describe the project scope..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm min-h-[120px] focus:outline-none focus:ring-1 focus:ring-white/20"
                value={newJob.description}
                onChange={e => setNewJob({...newJob, description: e.target.value})}
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" className="rounded-xl text-white/40" onClick={() => setIsPostJobModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl bg-white text-black font-bold px-8 h-11" disabled={isPosting}>
                {isPosting ? "Posting..." : "Create Opportunity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
