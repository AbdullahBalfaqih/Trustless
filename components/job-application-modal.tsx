"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { applyForJob } from "@/lib/supabase-actions"
import { useAppKitAccount } from "@reown/appkit/react"

interface JobApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  jobTitle: string
}

export function JobApplicationModal({ isOpen, onClose, jobId, jobTitle }: JobApplicationModalProps) {
  const { address } = useAppKitAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    applicant_name: "",
    linkedin_url: "",
    portfolio_url: "",
    cover_letter: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.applicant_name) {
      toast.error("Please enter your name")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await applyForJob({
        job_id: jobId,
        applicant_name: formData.applicant_name,
        linkedin_url: formData.linkedin_url,
        portfolio_url: formData.portfolio_url,
        freelancer_address: address || null
      })

      if (error) throw error

      toast.success("Application submitted successfully!")
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-white/20 text-white max-w-lg rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Apply for {jobTitle}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs text-white/40 uppercase tracking-widest">Full Name</Label>
            <Input 
              id="name"
              placeholder="Enter your full name"
              className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-white/30 transition-all"
              value={formData.applicant_name}
              onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-xs text-white/40 uppercase tracking-widest">LinkedIn Profile</Label>
              <Input 
                id="linkedin"
                placeholder="https://linkedin.com/in/..."
                className="bg-white/5 border-white/10 rounded-xl h-11 focus:border-white/30 transition-all text-xs"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio" className="text-xs text-white/40 uppercase tracking-widest">Portfolio Link</Label>
              <Input 
                id="portfolio"
                placeholder="https://your-portfolio.com"
                className="bg-white/5 border-white/10 rounded-xl h-11 focus:border-white/30 transition-all text-xs"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover" className="text-xs text-white/40 uppercase tracking-widest">Cover Note (Optional)</Label>
            <Textarea 
              id="cover"
              placeholder="Tell the employer why you're a good fit..."
              className="bg-white/5 border-white/10 rounded-xl min-h-[100px] focus:border-white/30 transition-all text-sm"
              value={formData.cover_letter}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-xl text-white/40 h-12 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-white text-black rounded-xl h-12 px-10 font-bold hover:bg-white/90 transition-all"
            >
              {isSubmitting ? "Submitting..." : "Send Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
