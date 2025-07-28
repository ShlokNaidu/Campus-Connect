"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users, Shield, UserCheck, Eye, EyeOff, Sparkles } from "lucide-react"

interface User {
  id: string
  username: string
  password: string
  role: "admin" | "member" | "guest"
  clubId?: string
}

interface Club {
  id: string
  name: string
  description: string
}

const defaultClubs: Club[] = [
  { id: "stic", name: "STIC", description: "Student Technical Innovation Club" },
  { id: "gdg", name: "GDG", description: "Google Developer Group" },
  { id: "aws", name: "AWS", description: "Amazon Web Services Club" },
  { id: "acm", name: "ACM", description: "Association for Computing Machinery" },
  { id: "ieee", name: "IEEE", description: "Institute of Electrical and Electronics Engineers" },
]

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "member" | "guest">("guest")
  const [selectedClub, setSelectedClub] = useState("")
  const [clubs, setClubs] = useState<Club[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize clubs
    const storedClubs = localStorage.getItem("clubs")
    if (!storedClubs) {
      localStorage.setItem("clubs", JSON.stringify(defaultClubs))
      setClubs(defaultClubs)
    } else {
      setClubs(JSON.parse(storedClubs))
    }

    // Initialize default admin if not exists
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const adminExists = existingUsers.some((user: User) => user.role === "admin")

    if (!adminExists) {
      const defaultAdmin: User = {
        id: "admin-1",
        username: "admin",
        password: "admin123",
        role: "admin",
      }
      existingUsers.push(defaultAdmin)
      localStorage.setItem("users", JSON.stringify(existingUsers))
    }
  }, [])

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      })
      return
    }

    if (role === "member" && !selectedClub) {
      toast({
        title: "Error",
        description: "Please select a club for member login",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get all users from localStorage
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
      let authenticatedUser = null

      if (role === "admin") {
        // Admin login
        authenticatedUser = allUsers.find(
          (user: User) =>
            user.username.toLowerCase() === username.toLowerCase() &&
            user.password === password &&
            user.role === "admin",
        )
      } else if (role === "member") {
        // Member login - check username, password, role, and club
        authenticatedUser = allUsers.find(
          (user: User) =>
            user.username.toLowerCase() === username.toLowerCase() &&
            user.password === password &&
            user.role === "member" &&
            user.clubId === selectedClub,
        )

        // Debug logging for member login
        console.log("Member login attempt:", {
          searchingFor: { username: username.toLowerCase(), password, role: "member", clubId: selectedClub },
          availableMembers: allUsers.filter((u) => u.role === "member"),
          found: authenticatedUser,
        })
      } else if (role === "guest") {
        // Guest login - find existing or create new
        const existingGuest = allUsers.find(
          (user: User) => user.username.toLowerCase() === username.toLowerCase() && user.role === "guest",
        )

        if (existingGuest) {
          // Check password for existing guest
          if (existingGuest.password === password) {
            authenticatedUser = existingGuest
          }
        } else {
          // Create new guest
          const newGuest: User = {
            id: `guest-${Date.now()}`,
            username: username,
            password: password,
            role: "guest",
          }
          allUsers.push(newGuest)
          localStorage.setItem("users", JSON.stringify(allUsers))
          authenticatedUser = newGuest
        }
      }

      if (authenticatedUser) {
        // Success - store current user and redirect
        localStorage.setItem("currentUser", JSON.stringify(authenticatedUser))

        toast({
          title: "Login Successful!",
          description: `Welcome ${authenticatedUser.username}!`,
        })

        // Redirect after short delay
        setTimeout(() => {
          if (role === "admin") {
            window.location.href = "/admin"
          } else if (role === "member") {
            window.location.href = "/member"
          } else {
            window.location.href = "/guest"
          }
        }, 1000)
      } else {
        // Login failed
        let errorMessage = "Invalid username or password."

        if (role === "member") {
          errorMessage =
            "Invalid credentials or you're not a member of the selected club. Please check with your admin."
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Something went wrong during login",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Medicaps University
          </CardTitle>
          <CardDescription className="text-blue-100">Club Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all duration-300 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Login as</Label>
            <Select value={role} onValueChange={(value: "admin" | "member" | "guest") => setRole(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:bg-white/20 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="guest" className="text-white hover:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Guest
                  </div>
                </SelectItem>
                <SelectItem value="member" className="text-white hover:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Club Member
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === "member" && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-white">Select Club</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:bg-white/20 transition-all duration-300">
                  <SelectValue placeholder="Choose your club" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id} className="text-white hover:bg-gray-800">
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
