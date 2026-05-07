"use client"

import { PremiumDashboard } from "@/components/premium-dashboard"
import data from "./data.json"

export default function Home() {
  return (
    <main className="overflow-hidden">
      <PremiumDashboard data={data} />
    </main>
  )
}
