"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Activity,
  BookOpen,
  Clock,
  Users,
  Download,
  Play,
  Send,
  Bot,
  X,
  ArrowLeft,
  CheckCircle,
  FileText,
  Video,
} from "lucide-react";

export default function CourseDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
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
    fetchCourse();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const fetchCourse = async () => {
    try {
      const [courseRes, dashRes] = await Promise.all([
        fetch(`/api/courses/${id}`, { headers }),
        fetch("/api/dashboard", { headers }),
      ]);
      const courseData = await courseRes.json();
      const dashData = await dashRes.json();
      setCourse(courseData.course);
      setEnrolled((dashData.enrollments || []).some((e) => e.course_id === id));
      logActivity("course_view", {
        course_id: id,
        course_title: courseData.course?.title,
        description: `Viewed course: ${courseData.course?.title}`,
      });
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

  const handleEnroll = async () => {
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers,
        body: JSON.stringify({ course_id: id }),
      });
      if (res.ok) setEnrolled(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    logActivity("download", {
      course_id: id,
      course_title: course?.title,
      description: `Downloaded notes for: ${course?.title}`,
    });
    alert("Course notes downloaded! (Demo)");
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
        body: JSON.stringify({ query: msg, course_title: course?.title }),
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
      setChatHistory((h) => [...h, { role: "bot", text: "Connection error." }]);
    }
    setChatLoading(false);
  };

  const modules = [
    { title: "Getting Started", duration: "45 min", type: "video" },
    { title: "Core Concepts", duration: "1h 20 min", type: "video" },
    { title: "Hands-on Practice", duration: "2h", type: "exercise" },
    { title: "Advanced Topics", duration: "1h 30 min", type: "video" },
    { title: "Final Project", duration: "3h", type: "project" },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Course not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/courses")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              DataPulse
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Placeholder */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 mx-auto hover:bg-white/30 transition cursor-pointer">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white/60 text-sm">
                    Video Player Placeholder
                  </p>
                </div>
              </div>
            </Card>

            {/* Course Info */}
            <div>
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {course.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.enrollments_count} enrolled
                    </span>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Course Outline */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Course Outline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {modules.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 font-semibold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{m.title}</p>
                      <p className="text-sm text-gray-400">{m.duration}</p>
                    </div>
                    {m.type === "video" ? (
                      <Video className="w-4 h-4 text-gray-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm sticky top-20">
              <CardContent className="p-6 space-y-4">
                {enrolled ? (
                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    disabled
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Enrolled
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-indigo-500 hover:bg-indigo-600"
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" /> Download Course Notes
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setChatOpen(true)}
                >
                  <Bot className="w-4 h-4 mr-2" /> Ask AI Assistant
                </Button>
                <div className="border-t pt-4 space-y-2 text-sm text-gray-500">
                  <p>
                    <strong>Duration:</strong> {course.duration}
                  </p>
                  <p>
                    <strong>Level:</strong> {course.level}
                  </p>
                  <p>
                    <strong>Students:</strong> {course.enrollments_count}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border z-50 flex flex-col max-h-[500px]">
          <div className="px-4 py-3 bg-indigo-500 text-white rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium">Course AI Assistant</span>
            </div>
            <button onClick={() => setChatOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[350px]">
            {chatHistory.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Ask anything about {course.title}!
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
              placeholder="Ask about this course..."
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
