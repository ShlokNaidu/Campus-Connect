"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, LogOut, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface User {
  id: string
  username: string
  password: string
  role: string
  clubId?: string
}

interface Club {
  id: string
  name: string
  description: string
}

export default function MemberDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userClub, setUserClub] = useState<Club | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    // Get current user
    const user = JSON.parse(localStorage.getItem("currentUser") || "null")
    if (!user || user.role !== "member") {
      window.location.href = "/"
      return
    }
    setCurrentUser(user)

    // Get user's club
    const clubs = JSON.parse(localStorage.getItem("clubs") || "[]")
    const club = clubs.find((c: Club) => c.id === user.clubId)
    setUserClub(club)

    // Load events
    loadEvents()
  }, [])

  const loadEvents = () => {
    const storedEvents = JSON.parse(localStorage.getItem("events") || "[]")
    setEvents(storedEvents)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDate("")
    setTime("")
    setEditingEvent(null)
  }

  const handleCreateEvent = () => {
    if (!title || !description || !date || !time || !currentUser || !userClub) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const newEvent: Event = {
      id: `event-${Date.now()}`,
      title,
      description,
      clubId: currentUser.clubId!,
      clubName: userClub.name,
      date,
      time,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    }

    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))

    toast({
      title: "Success",
      description: "Event created successfully!",
    })

    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description)
    setDate(event.date)
    setTime(event.time)
    setIsCreateDialogOpen(true)
  }

  const handleUpdateEvent = () => {
    if (!title || !description || !date || !time || !editingEvent) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id ? { ...event, title, description, date, time } : event,
    )

    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))

    toast({
      title: "Success",
      description: "Event updated successfully!",
    })

    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter((event) => event.id !== eventId)
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))

    toast({
      title: "Success",
      description: "Event deleted successfully!",
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    window.location.href = "/"
  }

  const userEvents = events.filter((event) => event.createdBy === currentUser?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="animate-fade-in-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Member Dashboard
              </h1>
              <p className="text-green-200">
                {userClub?.name} - {currentUser?.username}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={resetForm}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {editingEvent ? "Update event details" : "Add a new event for your club"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter event title"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter event description"
                        rows={3}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                        className="bg-gradient-to-r from-green-600 to-blue-600"
                      >
                        {editingEvent ? "Update Event" : "Create Event"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Club Info */}
          {userClub && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl animate-fade-in">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{userClub.name}</CardTitle>
                <CardDescription className="text-green-200">{userClub.description}</CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* My Events */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white text-2xl">My Events</CardTitle>
              <CardDescription className="text-green-200">Events you have created</CardDescription>
            </CardHeader>
            <CardContent>
              {userEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-green-200 text-lg">No events created yet</p>
                  <p className="text-gray-400">Click "Create Event" to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userEvents.map((event, index) => (
                    <Card
                      key={event.id}
                      className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-white">{event.title}</h3>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditEvent(event)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-green-200 mb-3">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </div>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                            {event.clubName}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Events */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white text-2xl">All University Events</CardTitle>
              <CardDescription className="text-green-200">Events from all clubs</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-green-200 text-center py-8">No events scheduled</p>
              ) : (
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
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                            {event.clubName}
                          </Badge>
                        </div>
                        <p className="text-green-200 mb-3">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
