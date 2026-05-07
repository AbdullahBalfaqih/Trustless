"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Bell,
  Settings,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Download,
  Plus,
  LayoutGrid,
  List,
  ChevronRight,
  TrendingUp,
  Users,
  FileText,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface DashboardData {
  id: number
  header: string
  type: string
  status: string
  target: string
  limit: string
  reviewer: string
}

interface PremiumDashboardProps {
  data: DashboardData[]
}

export function PremiumDashboard({ data }: PremiumDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.header.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [data, searchQuery])

  const stats = useMemo(() => {
    const total = data.length
    const done = data.filter((item) => item.status === "Done").length
    const inProcess = data.filter((item) => item.status === "In Process").length
    const completionRate = Math.round((done / total) * 100)
    return { total, done, inProcess, completionRate }
  }, [data])

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 p-6 lg:p-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Project Dashboard
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure Infrastructure • Jeddah Tower Arena
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-[300px] bg-white/5 border-white/10 focus:border-indigo-500/50 rounded-xl transition-all"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Documents"
            value={stats.total}
            icon={<FileText className="w-5 h-5" />}
            color="indigo"
          />
          <StatCard
            title="Completed"
            value={stats.done}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="emerald"
            percentage={stats.completionRate}
          />
          <StatCard
            title="In Progress"
            value={stats.inProcess}
            icon={<Clock className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            title="Active Reviewers"
            value="12"
            icon={<Users className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn("px-3 rounded-md transition-all", viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white")}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn("px-3 rounded-md transition-all", viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white")}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
              <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground px-3 py-1">
                {filteredData.length} Results
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg border-white/10 bg-white/5 hover:bg-white/10">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {viewMode === "grid" ? (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
              >
                {filteredData.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <TaskCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {filteredData.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.01 }}
                  >
                    <TaskListRow item={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, percentage }: { title: string, value: string | number, icon: React.ReactNode, color: string, percentage?: number }) {
  const colorMap: any = {
    indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
  }

  const iconColor: any = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
  }

  return (
    <Card className={cn("bg-gradient-to-br border shadow-2xl relative overflow-hidden group", colorMap[color])}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className={cn("w-12 h-12", iconColor[color])}>{icon}</div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg bg-white/5 border border-white/10", iconColor[color])}>
            {icon}
          </div>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {percentage !== undefined && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-medium text-emerald-400">+{percentage}%</span>
              <Progress value={percentage} className="w-16 h-1 bg-white/10" indicatorClassName="bg-emerald-500" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TaskCard({ item }: { item: DashboardData }) {
  return (
    <Card className="bg-white/[0.03] border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-300 group overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <Badge className={cn(
            "rounded-md px-2 py-0 text-[10px] font-bold uppercase tracking-wider",
            item.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
          )}>
            {item.type}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0c0c0c] border-white/10 text-white">
              <DropdownMenuItem className="focus:bg-white/10">Edit</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10">Share</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-red-500/20 text-red-400">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-indigo-400 transition-colors">
            {item.header}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            Primary reviewer: <span className="text-white/80">{item.reviewer}</span>
          </p>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.status === "Done" ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ) : (
              <Clock className="w-3 h-3 text-amber-500" />
            )}
            {item.status}
          </div>
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold">
              {item.reviewer[0]}
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold">
              +1
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TaskListRow({ item }: { item: DashboardData }) {
  return (
    <div className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all">
      <div className="flex items-center gap-4 flex-1">
        <div className={cn(
          "p-2 rounded-lg bg-white/5",
          item.status === "Done" ? "text-emerald-400" : "text-amber-400"
        )}>
          {item.status === "Done" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>
        <div className="flex flex-col">
          <span className="font-medium group-hover:text-indigo-400 transition-colors">{item.header}</span>
          <span className="text-xs text-muted-foreground">{item.type} • ID: #{item.id}</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Reviewer</span>
          <span className="text-sm">{item.reviewer}</span>
        </div>
        <Badge className={cn(
          "w-24 justify-center py-1",
          item.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        )}>
          {item.status}
        </Badge>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
