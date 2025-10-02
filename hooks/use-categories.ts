"use client"

import useSWR from "swr"

const fetcher = async (url: string) => {
  const token = localStorage.getItem("token")
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    throw new Error("Failed to fetch categories")
  }

  return res.json()
}

export function useCategories() {
  const { data, error, mutate } = useSWR("/api/categories", fetcher)

  const createCategory = async (categoryData: { name: string; color: string }) => {
    const token = localStorage.getItem("token")
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(categoryData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to create category")
    }

    mutate()
    return res.json()
  }

  const updateCategory = async (categoryId: string, updates: { name?: string; color?: string }) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`/api/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to update category")
    }

    mutate()
    return res.json()
  }

  const deleteCategory = async (categoryId: string) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to delete category")
    }

    mutate()
    return res.json()
  }

  return {
    categories: data?.categories || [],
    isLoading: !error && !data,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    mutate,
  }
}
