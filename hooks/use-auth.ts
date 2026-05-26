"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"

export function useAuth() {
  const { currentUser, login, logout } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  return {
    user: currentUser,
    isLoading,
    isAdmin: currentUser?.role === "admin",
    isViewer: currentUser?.role === "viewer",
    login,
    logout,
  }
}
