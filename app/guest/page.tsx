"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Clock, LogOut, X } from "lucide-react"
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
}

interface Club {
  id: string
  name: string
  description: string
}

export default function GuestDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [notifications, setNotifications] = useState<Event[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load data from localStorage
    const storedEvents = JSON.parse(localStorage.getItem("events") || "[]")
    const storedClubs = JSON.parse(localStorage.getItem("clubs") || "[]")

    setEvents(storedEvents)
    setClubs(storedClubs)

    // Check for new events (created in last 24 hours)
    const now = new Date().getTime()
    const newEvents = storedEvents.filter((event: Event) => {
      const eventCreated = new Date(event.createdAt).getTime()
      return now - eventCreated < 24 * 60 * 60 * 1000 // 24 hours
    })

    if (newEvents.length > 0) {
      setNotifications(newEvents)
      setShowNotification(true)
    }
  }, [])

  const handleLogout = () => {
    console.log("Attempting to log out guest...")
    localStorage.removeItem("currentUser") // Remove the current user from local storage
    console.log("currentUser removed. Redirecting to /")
    window.location.href = "/" // Redirect to the login page
  }

  const dismissNotification = () => {
    setShowNotification(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Floating Notification */}
      {showNotification && notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-white text-sm">New Events!</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={dismissNotification} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {notifications.slice(0, 3).map((event) => (
                <div key={event.id} className="text-sm mb-2 last:mb-0">
                  <p className="font-medium text-white">{event.title}</p>
                  <p className="text-blue-200">{event.clubName}</p>
                </div>
              ))}
              {notifications.length > 3 && (
                <p className="text-xs text-blue-200">+{notifications.length - 3} more events</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header - Added z-index to ensure it's clickable */}
      <header className="relative z-20 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent animate-fade-in-left">
                Guest Dashboard
              </h1>
              <p className="text-blue-200">Medicaps University Club Events</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Clubs Overview */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">University Clubs</CardTitle>
              <CardDescription className="text-blue-200">Active clubs at Medicaps University</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubs.map((club) => (
                  <Card
                    key={club.id}
                    className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl border-l-4 border-l-blue-500"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">{club.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">{club.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Upcoming Events</CardTitle>
              <CardDescription className="text-blue-200">Stay updated with the latest club events</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-blue-200 text-center py-8">No events scheduled at the moment</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl border-l-4 border-l-green-500"
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white text-lg">{event.title}</h3>
                          <Badge variant="secondary">{event.clubName}</Badge>
                        </div>
                        <p className="text-blue-200 mb-3">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-blue-200">
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
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>
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
