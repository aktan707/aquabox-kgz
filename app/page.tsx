"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    router.push("/dashboard")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = login(username, password)
    if (success) {
      toast.success("Добро пожаловать!")
      router.push("/dashboard")
    } else {
      toast.error("Неверный логин или пароль")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 glow">
            <Droplets className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AquaBox</h1>
          <p className="text-muted-foreground mt-1">Система учёта автомойки</p>
        </div>

        <Card className="glass-card border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Вход в систему</CardTitle>
            <CardDescription>
              Введите логин и пароль для входа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 text-muted-foreground" />
                    ) : (
                      <Eye className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="h-12 mt-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Демо доступ: <span className="text-foreground">admin / admin123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
