import { createClient } from "@/utils/supabase/client";

export const supabase = createClient();

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function getAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, employer:profiles!employer_id(display_name, avatar_url)')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getEmployerJobs(employerId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createJob(jobData: {
  title: string;
  description: string;
  category: string;
  budget: number;
  employer_id: string;
}) {
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select()
    .single();
  return { data, error };
}

export async function applyForJob(applicationData: {
  job_id: string;
  freelancer_id?: string | null;
  freelancer_address?: string | null;
  applicant_name: string;
  linkedin_url?: string;
  portfolio_url?: string;
}) {
  const { data, error } = await supabase
    .from('applications')
    .insert([applicationData])
    .select()
    .single();
  return { data, error };
}

export async function getFreelancerApplications(freelancerId: string, walletAddress?: string) {
  let query = supabase
    .from('applications')
    .select(`
      *,
      jobs (
        *,
        employer:profiles!employer_id(*)
      )
    `);

  if (walletAddress) {
    query = query.or(`freelancer_id.eq.${freelancerId || '00000000-0000-0000-0000-000000000000'},freelancer_address.eq.${walletAddress}`);
  } else if (freelancerId) {
    query = query.eq('freelancer_id', freelancerId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

// New Actions for Employer Management
export async function getJobApplications(employerId: string) {
  // Fetch applications for all jobs owned by this employer
  const { data, error } = await supabase
    .from('applications')
    .select('*, jobs!inner(*), profiles:freelancer_id(*)')
    .eq('jobs.employer_id', employerId);
  return { data, error };
}

export async function updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected' | 'interviewing') {
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();
  return { data, error };
}

export async function sendMessage(messageData: {
  sender_id: string;
  receiver_id: string;
  job_id: string;
  content: string;
}) {
  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select()
    .single();
  return { data, error };
}

export async function getChatMessages(jobId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(*)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });
  return { data, error };
}
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}
