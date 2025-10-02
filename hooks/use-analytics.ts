"use client"

import useSWR from "swr"

const fetcher = async (url: string) => {
  const token = localStorage.getItem("token")
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    throw new Error("Failed to fetch analytics")
  }

  return res.json()
}

export function useAnalytics() {
  const { data, error, mutate } = useSWR("/api/analytics", fetcher)

  return {
    analytics: data?.analytics || null,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
