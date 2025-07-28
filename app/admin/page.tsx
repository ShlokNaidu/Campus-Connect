"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Plus, Edit, Trash2, Users, Key, Copy, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Club {
  id: string
  name: string
  description: string
}

interface User {
  id: string
  username: string
  password: string
  role: "admin" | "member" | "guest"
  clubId?: string
}

interface Event {
  id: string
  title: string
  description: string
  clubId: string
  clubName: string
  date: string
  time: string
  createdAt: string
  createdBy: string
}

export default function AdminDashboard() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isClubDialogOpen, setIsClubDialogOpen] = useState(false)
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})

  // Form states
  const [clubName, setClubName] = useState("")
  const [clubDescription, setClubDescription] = useState("")
  const [memberUsername, setMemberUsername] = useState("")
  const [memberPassword, setMemberPassword] = useState("")
  const [memberClub, setMemberClub] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    // Check if user is admin
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null")
    if (!currentUser || currentUser.role !== "admin") {
      window.location.href = "/"
      return
    }

    loadData()
  }, [])

  const loadData = () => {
    const storedClubs = JSON.parse(localStorage.getItem("clubs") || "[]")
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const storedEvents = JSON.parse(localStorage.getItem("events") || "[]")

    setClubs(storedClubs)
    setUsers(storedUsers)
    setEvents(storedEvents)
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const generateUsername = (clubId: string) => {
    const club = clubs.find((c) => c.id === clubId)
    if (!club) return ""

    const clubPrefix = club.name.toLowerCase().replace(/\s+/g, "")
    const timestamp = Date.now().toString().slice(-4)
    return `${clubPrefix}_${timestamp}`
  }

  const resetClubForm = () => {
    setClubName("")
    setClubDescription("")
    setEditingClub(null)
  }

  const resetMemberForm = () => {
    setMemberUsername("")
    setMemberPassword("")
    setMemberClub("")
    setEditingUser(null)
  }

  const handleCreateClub = () => {
    if (!clubName || !clubDescription) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const newClub: Club = {
      id: clubName.toLowerCase().replace(/\s+/g, "-"),
      name: clubName,
      description: clubDescription,
    }

    const updatedClubs = [...clubs, newClub]
    setClubs(updatedClubs)
    localStorage.setItem("clubs", JSON.stringify(updatedClubs))

    toast({
      title: "Success",
      description: "Club created successfully!",
    })

    resetClubForm()
    setIsClubDialogOpen(false)
  }

  const handleEditClub = (club: Club) => {
    setEditingClub(club)
    setClubName(club.name)
    setClubDescription(club.description)
    setIsClubDialogOpen(true)
  }

  const handleUpdateClub = () => {
    if (!clubName || !clubDescription || !editingClub) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const updatedClubs = clubs.map((club) =>
      club.id === editingClub.id ? { ...club, name: clubName, description: clubDescription } : club,
    )

    setClubs(updatedClubs)
    localStorage.setItem("clubs", JSON.stringify(updatedClubs))

    // Update events with new club name
    const updatedEvents = events.map((event) =>
      event.clubId === editingClub.id ? { ...event, clubName: clubName } : event,
    )
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))

    toast({
      title: "Success",
      description: "Club updated successfully!",
    })

    resetClubForm()
    setIsClubDialogOpen(false)
  }

  const handleDeleteClub = (clubId: string) => {
    const updatedClubs = clubs.filter((club) => club.id !== clubId)
    setClubs(updatedClubs)
    localStorage.setItem("clubs", JSON.stringify(updatedClubs))

    // Remove club members
    const updatedUsers = users.filter((user) => user.clubId !== clubId)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Remove club events
    const updatedEvents = events.filter((event) => event.clubId !== clubId)
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))

    toast({
      title: "Success",
      description: "Club deleted successfully!",
    })
  }

  const handleAddMember = () => {
    if (!memberUsername.trim() || !memberPassword.trim() || !memberClub) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Check if username already exists
    const existingUser = users.find((u) => u.username.toLowerCase() === memberUsername.toLowerCase())
    if (existingUser) {
      toast({
        title: "Error",
        description: "Username already exists",
        variant: "destructive",
      })
      return
    }

    const club = clubs.find((c) => c.id === memberClub)
    if (!club) {
      toast({
        title: "Error",
        description: "Selected club not found",
        variant: "destructive",
      })
      return
    }

    const newUser: User = {
      id: `member-${Date.now()}`,
      username: memberUsername.trim(),
      password: memberPassword.trim(),
      role: "member",
      clubId: memberClub,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Log the created user for debugging
    console.log("Created new member:", newUser)
    console.log("All users after creation:", updatedUsers)

    toast({
      title: "Success",
      description: `Member ${memberUsername} added to ${club.name}! Credentials: ${memberUsername} / ${memberPassword}`,
      duration: 5000,
    })

    resetMemberForm()
    setIsMemberDialogOpen(false)
  }

  const handleEditMember = (user: User) => {
    setEditingUser(user)
    setMemberUsername(user.username)
    setMemberPassword(user.password)
    setMemberClub(user.clubId || "")
    setIsMemberDialogOpen(true)
  }

  const handleUpdateMember = () => {
    if (!memberUsername.trim() || !memberPassword.trim() || !editingUser) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id
        ? { ...user, username: memberUsername.trim(), password: memberPassword.trim(), clubId: memberClub || undefined }
        : user,
    )

    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    toast({
      title: "Success",
      description: "Member updated successfully!",
    })

    resetMemberForm()
    setIsMemberDialogOpen(false)
  }

  const handleDeleteMember = (userId: string) => {
    const updatedUsers = users.filter((user) => user.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    toast({
      title: "Success",
      description: "Member removed successfully!",
    })
  }

  const handleGenerateCredentials = () => {
    if (!memberClub) {
      toast({
        title: "Error",
        description: "Please select a club first",
        variant: "destructive",
      })
      return
    }

    const username = generateUsername(memberClub)
    const password = generatePassword()

    setMemberUsername(username)
    setMemberPassword(password)

    toast({
      title: "Credentials Generated",
      description: "Username and password have been generated",
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    window.location.href = "/"
  }

  const getClubName = (clubId: string) => {
    const club = clubs.find((c) => c.id === clubId)
    return club ? club.name : "Unknown Club"
  }

  const clubMembers = users.filter((user) => user.role === "member")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="animate-fade-in-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-blue-200">Medicaps University Club Management</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 animate-fade-in-right"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="clubs" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-md border-white/20">
            <TabsTrigger value="clubs" className="data-[state=active]:bg-white/20 text-white">
              Clubs
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-white/20 text-white">
              Members
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-white/20 text-white">
              Events
            </TabsTrigger>
          </TabsList>

          {/* Clubs Tab */}
          <TabsContent value="clubs" className="animate-fade-in">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white text-2xl">Manage Clubs</CardTitle>
                    <CardDescription className="text-blue-200">Add, edit, or remove university clubs</CardDescription>
                  </div>
                  <Dialog open={isClubDialogOpen} onOpenChange={setIsClubDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={resetClubForm}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Club
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle>{editingClub ? "Edit Club" : "Add New Club"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          {editingClub ? "Update club information" : "Create a new club"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clubName">Club Name</Label>
                          <Input
                            id="clubName"
                            value={clubName}
                            onChange={(e) => setClubName(e.target.value)}
                            placeholder="Enter club name"
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clubDescription">Description</Label>
                          <Textarea
                            id="clubDescription"
                            value={clubDescription}
                            onChange={(e) => setClubDescription(e.target.value)}
                            placeholder="Enter club description"
                            rows={3}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsClubDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={editingClub ? handleUpdateClub : handleCreateClub}
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            {editingClub ? "Update Club" : "Add Club"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clubs.map((club, index) => (
                    <Card
                      key={club.id}
                      className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-white">{club.name}</CardTitle>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClub(club)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClub(club.id)}
                              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-200 mb-2">{club.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Users className="h-4 w-4" />
                          {clubMembers.filter((member) => member.clubId === club.id).length} members
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="animate-fade-in">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white text-2xl">Manage Members</CardTitle>
                    <CardDescription className="text-blue-200">
                      Add, edit, or remove club members with credentials
                    </CardDescription>
                  </div>
                  <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={resetMemberForm}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit Member" : "Add New Member"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          {editingUser ? "Update member information" : "Add a new club member with login credentials"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Club</Label>
                          <Select value={memberClub} onValueChange={setMemberClub}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Select a club" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {clubs.map((club) => (
                                <SelectItem key={club.id} value={club.id} className="text-white">
                                  {club.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleGenerateCredentials}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            disabled={!memberClub}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate Credentials
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="memberUsername">Username</Label>
                          <div className="flex gap-2">
                            <Input
                              id="memberUsername"
                              value={memberUsername}
                              onChange={(e) => setMemberUsername(e.target.value)}
                              placeholder="Enter username"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(memberUsername, "Username")}
                              disabled={!memberUsername}
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="memberPassword">Password</Label>
                          <div className="flex gap-2">
                            <Input
                              id="memberPassword"
                              value={memberPassword}
                              onChange={(e) => setMemberPassword(e.target.value)}
                              placeholder="Enter password"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(memberPassword, "Password")}
                              disabled={!memberPassword}
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={editingUser ? handleUpdateMember : handleAddMember}
                            className="bg-gradient-to-r from-green-600 to-blue-600"
                          >
                            {editingUser ? "Update Member" : "Add Member"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clubMembers.map((member, index) => (
                    <Card
                      key={member.id}
                      className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-white text-lg">{member.username}</h3>
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                                {member.clubId ? getClubName(member.clubId) : "No Club Assigned"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Key className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">Password:</span>
                              <code className="bg-gray-800 px-2 py-1 rounded text-green-400 font-mono">
                                {showPasswords[member.id] ? member.password : "••••••••"}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePasswordVisibility(member.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {showPasswords[member.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(member.password, "Password")}
                                className="text-gray-400 hover:text-white"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMember(member)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMember(member.id)}
                              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {clubMembers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No members found</p>
                      <p className="text-gray-500">Add your first club member to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="animate-fade-in">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl">All Events</CardTitle>
                <CardDescription className="text-blue-200">View all events created by club members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <Card
                      key={event.id}
                      className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-white">{event.title}</h3>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                            {event.clubName}
                          </Badge>
                        </div>
                        <p className="text-blue-200 mb-3">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span className="bg-gray-800 px-2 py-1 rounded">{event.date}</span>
                          <span className="bg-gray-800 px-2 py-1 rounded">{event.time}</span>
                          <span>Created: {new Date(event.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {events.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-400 text-lg">No events found</p>
                      <p className="text-gray-500">Events created by club members will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <style jsx>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
