"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Search,
  Layers,
  MessageSquare,
  Bell,
  PanelLeft,
  Settings,
  LogOut,
  Building,
  ArrowLeft,
  Calendar,
  DollarSign,
  Send,
  Search as SearchIcon,
  X,
  CheckCircle2,
  Lock,
  Filter,
  Eye,
  Activity,
  BarChart3
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { toast } from "sonner"
import { JobApplicationModal } from "@/components/job-application-modal"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { 
  getAllJobs, 
  getFreelancerApplications, 
  getNotifications, 
  getChatMessages, 
  sendMessage 
} from "@/lib/supabase-actions"

export function TalentDashboard() {
  const router = useRouter()
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  const [user, setUser] = useState<any>(null)
  
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState("jobs")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [viewingJob, setViewingJob] = useState<any>(null)
  const [showJobDetails, setShowJobDetails] = useState<any>(null)

  const [rightSidebarMode, setRightSidebarMode] = useState<"chat" | "notifs" | null>(null)
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchData = async (userId?: string, walletAddr?: string) => {
    setLoading(true)
    const { data: jobsData } = await getAllJobs()
    setJobs(jobsData || [])

    if (isConnected || walletAddr) {
      const { data: appsData } = await getFreelancerApplications(userId || "", walletAddr || undefined)
      setApplications(appsData || [])
      
      if (userId) {
        const { data: notifsData } = await getNotifications(userId)
        if (notifsData) setNotifications(notifsData)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData(user?.id, address || undefined)
  }, [user, address, isConnected])

  useEffect(() => {
    const supabaseClient = createClient()
    const init = async () => {
      const { data: { user: u } } = await supabaseClient.auth.getUser()
      let currentUserId = "guest"
      if (u) {
        setUser(u)
        currentUserId = u.id
      } else if (isConnected && address) {
        const { data: anon } = await supabaseClient.auth.signInAnonymously()
        if (anon.user) {
          setUser(anon.user)
          currentUserId = anon.user.id
        }
      }
      fetchData(currentUserId)
    }
    init()
  }, [isConnected, address])

  useEffect(() => {
    if (activeChat) {
      getChatMessages(activeChat.job_id).then(({ data }) => {
        if (data) setMessages(data)
      })
    }
  }, [activeChat])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleApply = (job: any) => {
    if (!isConnected) { toast.error("Connect Wallet to Apply"); open(); return }
    setViewingJob(job)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !user) return
    const { error } = await sendMessage({
      sender_id: user.id,
      receiver_id: activeChat.jobs?.employer_id || activeChat.employer_id, 
      job_id: activeChat.job_id,
      content: newMessage
    })
    if (!error) {
      setNewMessage("")
      getChatMessages(activeChat.job_id).then(({ data }) => {
        if (data) setMessages(data)
      })
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "All" || job.category === filterCategory
    return matchesSearch && matchesCategory
  })

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
            {isConnected ? (
              <>
                <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11", activeTab === "home" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("home")}><Home className="w-4 h-4" /> Dashboard</Button>
                <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11", activeTab === "jobs" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("jobs")}><Search className="w-4 h-4" /> Browse Jobs</Button>
                <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11", activeTab === "applications" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("applications")}><Layers className="w-4 h-4" /> My Applications</Button>
                <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11", activeTab === "reports" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("reports")}><BarChart3 className="w-4 h-4" /> Reports</Button>
                <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11", activeTab === "analytics" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("analytics")}><Activity className="w-4 h-4" /> Analytics</Button>
                <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11", activeTab === "settings" ? "bg-white text-black" : "text-white/60 hover:bg-white/5")} onClick={() => setActiveTab("settings")}><Settings className="w-4 h-4" /> Settings</Button>
              </>
            ) : (
              <Button variant="ghost" className={cn("w-full justify-start rounded-xl gap-3 h-11 bg-white text-black")} onClick={() => setActiveTab("jobs")}><Search className="w-4 h-4" /> Browse Jobs</Button>
            )}
          </nav>

          <div className="pt-4 border-t border-white/10">
             <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all" onClick={() => isConnected ? createClient().auth.signOut().then(() => window.location.href = "/") : router.push("/")}>
               {isConnected ? <LogOut className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
               <span>{isConnected ? "Logout" : "Back to Home"}</span>
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
            <h1 className="font-bold text-lg">{isConnected ? "Freelancer Hub" : "Marketplace"}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <>
                <Button variant="ghost" size="icon" className={cn("rounded-lg", rightSidebarMode === "chat" ? "bg-white text-black" : "hover:bg-white/5")} onClick={() => setRightSidebarMode(rightSidebarMode === "chat" ? null : "chat")}><MessageSquare className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className={cn("rounded-lg relative", rightSidebarMode === "notifs" ? "bg-white text-black" : "hover:bg-white/5")} onClick={() => setRightSidebarMode(rightSidebarMode === "notifs" ? null : "notifs")}><Bell className="w-4 h-4" />{notifications.some(n => !n.is_read) && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />}</Button>
              </>
            )}
            <Button variant="outline" className={cn("rounded-xl border-white/20 h-10 px-4 text-sm transition-all", !isConnected ? "bg-white text-black hover:bg-white/90" : "bg-transparent hover:bg-white/5")} onClick={() => open()}>
              {isConnected ? truncate(address!) : "Connect Wallet"}
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-8 max-w-6xl mx-auto space-y-8">
            {activeTab === "jobs" && (
              <div className="space-y-8">
                {!isConnected && (
                  <Card className="bg-black border border-white/10 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Lock className="w-6 h-6 text-white/60" /></div>
                        <div><h3 className="font-bold text-xl">On-Chain Access</h3><p className="text-white/40 text-sm">Connect wallet to unlock all features.</p></div>
                     </div>
                     <Button className="rounded-xl bg-white text-black px-8 h-12 font-bold hover:bg-white/90" onClick={() => open()}>Initialize</Button>
                  </Card>
                )}

                <div className="flex gap-3 items-center bg-black p-3 rounded-2xl border border-white/10">
                  <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input placeholder="Search jobs..." className="bg-white/5 border-none rounded-xl pl-11 h-11 focus-visible:ring-1 focus-visible:ring-white/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px] h-11 bg-white/5 border-none rounded-xl text-white/60"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent className="bg-black border-white/10 text-white rounded-xl"><SelectItem value="All">All Categories</SelectItem><SelectItem value="Development">Development</SelectItem><SelectItem value="Design">Design</SelectItem><SelectItem value="Marketing">Marketing</SelectItem></SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredJobs.map(job => (
                      <Card key={job.id} className="bg-black border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all flex flex-col h-full group">
                        <CardHeader className="p-6">
                          <Badge className="w-fit bg-white/5 text-white/40 border-white/10 font-normal px-2 py-0 text-[10px]">{job.category}</Badge>
                          <CardTitle className="text-xl font-bold tracking-tight mb-2 group-hover:text-white transition-colors">{job.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                             <Avatar className="size-6 border border-white/10 rounded"><AvatarImage src={job.employer?.avatar_url} /><AvatarFallback><Building /></AvatarFallback></Avatar>
                             <p className="text-xs text-white/40">{job.employer?.display_name || "Enterprise"}</p>
                          </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-end">
                           <div className="flex justify-between items-center pt-4 border-t border-white/5">
                              <div><p className="text-[10px] text-white/40 mb-1">Budget</p><p className="text-lg font-bold">{job.budget} PUSD</p></div>
                              <div className="text-right"><p className="text-[10px] text-white/40 mb-1">Posted</p><p className="text-xs text-white/40">{new Date(job.created_at).toLocaleDateString()}</p></div>
                           </div>
                        </CardContent>
                        <CardFooter className="p-3 gap-2 bg-white/5">
                          <Button variant="ghost" className="flex-1 rounded-xl text-white/40 hover:text-white h-10 text-xs" onClick={() => setShowJobDetails(job)}>View</Button>
                          <Button className="flex-1 rounded-xl bg-white text-black font-bold h-10 text-xs" onClick={() => handleApply(job)}>Apply Now</Button>
                        </CardFooter>
                      </Card>
                   ))}
                </div>
              </div>
            )}

            {activeTab === "home" && isConnected && (
               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-black border border-white/10 p-6 rounded-2xl">
                      <p className="text-xs text-white/40 mb-1">Active Applications</p>
                      <p className="text-4xl font-bold">{applications.length}</p>
                    </Card>
                    <Card className="bg-black border border-white/10 p-6 rounded-2xl">
                      <p className="text-xs text-white/40 mb-1">Total Earnings</p>
                      <p className="text-4xl font-bold">0 PUSD</p>
                    </Card>
                    <Card className="bg-black border border-white/10 p-6 rounded-2xl">
                      <p className="text-xs text-white/40 mb-1">Trust Score</p>
                      <p className="text-4xl font-bold">--</p>
                    </Card>
                  </div>
                  <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                    <h2 className="text-2xl font-bold">Welcome to the Talent Hub</h2>
                    <p className="text-white/40 max-w-md mx-auto">Build your reputation by completing tasks and receiving verified payments in PUSD.</p>
                    <Button className="bg-white text-black rounded-xl px-8 h-12 font-bold" onClick={() => setActiveTab("jobs")}>Explore Tasks</Button>
                  </div>
               </div>
            )}
            
            {activeTab === "applications" && isConnected && (
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">Applications</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {applications.map(app => (
                      <Card key={app.id} className="bg-black border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-white/30 transition-all">
                        <div className="flex items-center gap-5">
                           <div className="size-10 bg-white/5 rounded flex items-center justify-center border border-white/10"><Building className="w-5 h-5 text-white/20" /></div>
                           <div>
                              <p className="font-bold text-lg">{app.jobs?.title}</p>
                              <Badge variant="outline" className={cn("mt-1 border-white/10 font-normal", app.status === 'accepted' ? "text-white" : "text-white/40")}>{app.status}</Badge>
                           </div>
                        </div>
                        <Button variant="outline" className="rounded-xl border-white/10 h-11 px-6 font-bold bg-transparent hover:bg-white/5" onClick={() => { setActiveChat(app); setRightSidebarMode("chat"); }}>
                          <MessageSquare className="w-4 h-4 mr-2" /> Message Client
                        </Button>
                      </Card>
                    ))}
                  </div>
               </div>
            )}

            {activeTab === "reports" && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Earnings & Payouts</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-black border border-white/10 p-8 rounded-2xl">
                         <h3 className="font-bold text-lg mb-4">Balance Details</h3>
                         <div className="py-10 text-center text-white/20">No financial history found.</div>
                      </Card>
                   </div>
                </div>
            )}

            {activeTab === "analytics" && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Work Statistics</h2>
                   <Card className="bg-black border border-white/10 p-8 rounded-2xl">
                      <div className="h-64 flex items-center justify-center text-white/20">Tracking your productivity metrics...</div>
                   </Card>
                </div>
            )}

            {activeTab === "settings" && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Profile Settings</h2>
                   <Card className="bg-black border border-white/10 p-8 rounded-2xl max-w-xl">
                      <div className="space-y-4 text-white/60">
                         <p>Wallet Address: {isConnected ? address : "Not Connected"}</p>
                         <p>Account Type: Freelancer</p>
                      </div>
                   </Card>
                </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Right Sidebar */}
      <AnimatePresence>
        {rightSidebarMode && (
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 z-[60] h-full w-80 bg-black border-l border-white/10 flex flex-col shadow-2xl">
            <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="font-bold text-lg uppercase tracking-widest text-white/60">{rightSidebarMode === "notifs" ? "Alerts" : "Chat"}</h3>
                <Button variant="ghost" size="icon" onClick={() => setRightSidebarMode(null)} className="rounded-lg hover:bg-white/5"><X className="w-5 h-5 text-white/40" /></Button>
            </div>
            
            {rightSidebarMode === "notifs" ? (
              <ScrollArea className="flex-1 p-4">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-white/5 mb-2 hover:bg-white/5 rounded-xl transition-all">
                    <p className="font-bold text-sm">{n.title}</p>
                    <p className="text-xs text-white/40 mt-1">{n.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && <div className="py-20 text-center text-white/10 text-sm">No new alerts</div>}
              </ScrollArea>
            ) : (
              <>
                <ScrollArea className="flex-1 p-4">
                  {activeChat ? (
                    <div className="space-y-4">
                      {messages.map(m => (
                        <div key={m.id} className={cn("flex", m.sender_id === user?.id ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[85%] p-3 rounded-xl text-xs", m.sender_id === user?.id ? "bg-white text-black font-medium" : "bg-white/5 text-white border border-white/10")}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      <div ref={scrollRef} />
                    </div>
                  ) : (
                    <div className="py-20 text-center text-white/20 text-xs">Select a client to start message</div>
                  )}
                </ScrollArea>
                {activeChat && (
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <Input placeholder="Message..." className="bg-white/5 border-none h-10 text-xs" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                      <Button variant="ghost" size="icon" onClick={handleSendMessage} className="h-10 w-10 hover:bg-white/10"><Send className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <Dialog open={!!showJobDetails} onOpenChange={() => setShowJobDetails(null)}>
        <DialogContent className="bg-black border border-white/20 text-white max-w-xl rounded-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">{showJobDetails?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 mb-1">Fixed Budget</p>
                <p className="text-xl font-bold">{showJobDetails?.budget} PUSD</p>
              </div>
              <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 mb-1">Category</p>
                <p className="text-xl font-bold text-white/60">{showJobDetails?.category}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-widest font-bold">Job Description</p>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 max-h-60 overflow-y-auto">
                 <p className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap">{showJobDetails?.description}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
             <Button variant="ghost" className="rounded-xl text-white/40" onClick={() => setShowJobDetails(null)}>Close</Button>
             <Button className="rounded-xl bg-white text-black font-bold px-8 h-12" onClick={() => { handleApply(showJobDetails); setShowJobDetails(null); }}>Apply Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewingJob && (
        <JobApplicationModal
          isOpen={!!viewingJob}
          onClose={() => setViewingJob(null)}
          jobId={viewingJob.id}
          jobTitle={viewingJob.title}
        />
      )}
    </div>
  )
}
