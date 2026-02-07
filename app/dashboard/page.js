"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Activity,
  BookOpen,
  Download,
  MessageSquare,
  LogOut,
  User,
  BarChart3,
  Menu,
  X,
  Send,
  Bot,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const chatEndRef = useRef(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u) {
      router.push("/login");
      return;
    }
    if (u.role === "admin") {
      router.push("/admin/dashboard");
      return;
    }
    setUser(u);
    fetchDashboard();
    logActivity("page_view", {
      page: "dashboard",
      description: "Viewed dashboard",
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard", { headers });
      const data = await res.json();
      setEnrollments(data.enrollments || []);
      setActivities(data.activities || []);
      setTotalActivities(data.totalActivities || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const logActivity = async (type, details) => {
    try {
      await fetch("/api/activities", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action_type: type,
          details,
          metadata: { source: "web" },
        }),
      });
    } catch (e) {}
  };

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || chatLoading) return;
    const msg = chatMsg.trim();
    setChatHistory((h) => [...h, { role: "user", text: msg }]);
    setChatMsg("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers,
        body: JSON.stringify({ query: msg }),
      });
      const data = await res.json();
      setChatHistory((h) => [
        ...h,
        {
          role: "bot",
          text: data.response || "Sorry, I could not process that.",
        },
      ]);
    } catch (e) {
      setChatHistory((h) => [
        ...h,
        { role: "bot", text: "Connection error. Please try again." },
      ]);
    }
    setChatLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">
                DataPulse
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-indigo-600 font-medium text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/courses")}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Courses
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Profile
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            <button
              onClick={() => {
                router.push("/dashboard");
                setMobileMenu(false);
              }}
              className="block w-full text-left py-2 text-indigo-600 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                router.push("/courses");
                setMobileMenu(false);
              }}
              className="block w-full text-left py-2 text-gray-600"
            >
              Courses
            </button>
            <button
              onClick={() => {
                router.push("/profile");
                setMobileMenu(false);
              }}
              className="block w-full text-left py-2 text-gray-600"
            >
              Profile
            </button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">Continue your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: BookOpen,
              label: "Enrolled Courses",
              val: enrollments.length,
              color: "indigo",
            },
            {
              icon: Activity,
              label: "Total Activities",
              val: totalActivities,
              color: "emerald",
            },
            {
              icon: Download,
              label: "Downloads",
              val: activities.filter((a) => a.action_type === "download")
                .length,
              color: "amber",
            },
            {
              icon: MessageSquare,
              label: "Chat Queries",
              val: activities.filter((a) => a.action_type === "chatbot_query")
                .length,
              color: "pink",
            },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${s.color}-50`}
                >
                  <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.val}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/courses")}
              className="text-indigo-500"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {enrollments.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  You haven't enrolled in any courses yet.
                </p>
                <Button
                  onClick={() => router.push("/courses")}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((e) => (
                <Card
                  key={e.id}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/courses/${e.course_id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {e.courses?.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {e.courses?.level}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-indigo-600">
                          {e.progress}%
                        </span>
                      </div>
                      <Progress value={e.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {user?.role === "admin" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 8).map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                      >
                        ...
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Chatbot FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 z-50"
      >
        {chatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border z-50 flex flex-col max-h-[500px]">
          <div className="px-4 py-3 bg-indigo-500 text-white rounded-t-xl flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-medium">DataPulse AI Assistant</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[350px]">
            {chatHistory.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Ask me anything about courses!
              </p>
            )}
            {chatHistory.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${m.role === "user" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChat} className="p-3 border-t flex gap-2">
            <Input
              placeholder="Type your question..."
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              className="text-sm"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-500 hover:bg-indigo-600 px-3"
              disabled={chatLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
