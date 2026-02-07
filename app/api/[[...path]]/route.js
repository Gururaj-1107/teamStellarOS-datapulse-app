import OpenAI from "openai";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET || "datapulse_secret_2025";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getUser(request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.split(" ")[1], JWT_SECRET);
  } catch {
    return null;
  }
}

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

// ============ SETUP ============
async function handleSetupCheck() {
  try {
    const { data, error } = await supabase.from("users").select("id").limit(1);
    if (error) {
      return json({ setup: false, error: error.message });
    }
    return json({ setup: true, hasData: data && data.length > 0 });
  } catch (e) {
    return json({ setup: false, error: e.message });
  }
}

async function handleSetupSeed() {
  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", "admin@datapulse.com")
      .single();
    if (existing)
      return json({ message: "Seed data already exists", seeded: true });

    const hash = await bcrypt.hash("password123", 10);

    const { data: users, error: ue } = await supabase
      .from("users")
      .insert([
        {
          email: "admin@datapulse.com",
          name: "Admin User",
          password_hash: hash,
          role: "admin",
        },
        {
          email: "sarah@example.com",
          name: "Sarah Johnson",
          password_hash: hash,
          role: "user",
        },
        {
          email: "john@example.com",
          name: "John Smith",
          password_hash: hash,
          role: "user",
        },
      ])
      .select();
    if (ue) return json({ error: ue.message }, 500);

    const { data: courses, error: ce } = await supabase
      .from("courses")
      .insert([
        {
          title: "Python for Beginners",
          description:
            "Master Python programming from scratch with hands-on projects and real-world examples.",
          duration: "8 weeks",
          level: "Beginner",
          enrollments_count: 245,
        },
        {
          title: "Web Development Bootcamp",
          description:
            "Full-stack web development with HTML, CSS, JavaScript, React, and Node.js.",
          duration: "12 weeks",
          level: "Intermediate",
          enrollments_count: 189,
        },
        {
          title: "Data Science Fundamentals",
          description:
            "Learn data analysis, visualization, and machine learning basics with Python.",
          duration: "10 weeks",
          level: "Beginner",
          enrollments_count: 312,
        },
        {
          title: "Mobile App Development",
          description:
            "Build cross-platform mobile apps with React Native and deploy to App Store.",
          duration: "8 weeks",
          level: "Intermediate",
          enrollments_count: 156,
        },
        {
          title: "UI/UX Design Mastery",
          description:
            "Design beautiful, user-friendly interfaces with modern design principles and Figma.",
          duration: "6 weeks",
          level: "Beginner",
          enrollments_count: 198,
        },
      ])
      .select();
    if (ce) return json({ error: ce.message }, 500);

    const sarah = users.find((u) => u.email === "sarah@example.com");
    const john = users.find((u) => u.email === "john@example.com");

    if (sarah && john && courses.length >= 5) {
      await supabase.from("enrollments").insert([
        { user_id: sarah.id, course_id: courses[0].id, progress: 65 },
        { user_id: sarah.id, course_id: courses[2].id, progress: 30 },
        { user_id: john.id, course_id: courses[1].id, progress: 80 },
        { user_id: john.id, course_id: courses[3].id, progress: 45 },
      ]);

      const now = new Date();
      const types = [
        "page_view",
        "course_enroll",
        "course_view",
        "download",
        "chatbot_query",
        "login",
      ];
      const acts = [];
      for (let i = 0; i < 40; i++) {
        const uid = i % 3 === 0 ? sarah.id : john.id;
        acts.push({
          user_id: uid,
          action_type: types[i % types.length],
          details: {
            description: `Sample ${types[i % types.length]} activity`,
          },
          timestamp: new Date(now.getTime() - i * 2400000).toISOString(),
          metadata: {
            source: "web",
            device: i % 2 === 0 ? "desktop" : "mobile",
          },
        });
      }
      await supabase.from("activities").insert(acts);

      await supabase.from("chatbot_queries").insert([
        {
          user_id: sarah.id,
          query: "What are the prerequisites for Python for Beginners?",
          response:
            "No prior experience is needed. This course starts from the very basics of Python programming.",
        },
        {
          user_id: john.id,
          query: "How long is the Web Development Bootcamp?",
          response:
            "The Web Development Bootcamp is 12 weeks long, with approximately 8-10 hours of content per week.",
        },
        {
          user_id: sarah.id,
          query: "Will I get a certificate?",
          response:
            "Yes! Upon completing all course modules and passing the final assessment, you will receive a verified certificate of completion.",
        },
        {
          user_id: john.id,
          query: "What technologies will I learn?",
          response:
            "You will learn HTML5, CSS3, JavaScript ES6+, React, Node.js, Express, and MongoDB.",
        },
      ]);
    }
    return json({ message: "Seed data created successfully", seeded: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// ============ AUTH ============
async function handleSignup(request) {
  try {
    const { name, email, password } = await request.json();
    if (!email || !password || !name)
      return json({ error: "Name, email and password required" }, 400);

    const { data: exists } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();
    if (exists) return json({ error: "Email already registered" }, 409);

    const hash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        name,
        password_hash: hash,
        role: "user",
      })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    await supabase.from("activities").insert({
      user_id: user.id,
      action_type: "signup",
      details: { description: "New user signup" },
      metadata: { source: "web" },
    });

    return json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function handleLogin(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return json({ error: "Email and password required" }, 400);

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (error || !user) return json({ error: "Invalid credentials" }, 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return json({ error: "Invalid credentials" }, 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    await supabase.from("activities").insert({
      user_id: user.id,
      action_type: "login",
      details: { description: "User login" },
      metadata: { source: "web" },
    });

    return json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function handleGetMe(request) {
  const user = getUser(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  return json({ user });
}

// ============ COURSES ============
async function handleGetCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return json({ error: error.message }, 500);
  return json({ courses: data || [] });
}

async function handleGetCourse(request, id) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return json({ error: "Course not found" }, 404);
  return json({ course: data });
}

async function handleEnrollCourse(request) {
  const user = getUser(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  try {
    const { course_id } = await request.json();
    if (!course_id) return json({ error: "course_id required" }, 400);

    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .single();
    if (existing) return json({ error: "Already enrolled" }, 409);

    const { data, error } = await supabase
      .from("enrollments")
      .insert({ user_id: user.id, course_id })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    await supabase
      .rpc("increment_enrollments", { cid: course_id })
      .catch(() => {
        supabase
          .from("courses")
          .select("enrollments_count")
          .eq("id", course_id)
          .single()
          .then(({ data: c }) => {
            if (c)
              supabase
                .from("courses")
                .update({ enrollments_count: (c.enrollments_count || 0) + 1 })
                .eq("id", course_id);
          });
      });

    const { data: course } = await supabase
      .from("courses")
      .select("title")
      .eq("id", course_id)
      .single();
    await supabase.from("activities").insert({
      user_id: user.id,
      action_type: "course_enroll",
      details: {
        course_id,
        course_title: course?.title,
        description: `Enrolled in ${course?.title || "a course"}`,
      },
      metadata: { source: "web" },
    });

    return json({ enrollment: data });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// ============ ACTIVITIES ============
async function handleLogActivity(request) {
  const user = getUser(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  try {
    const { action_type, details, metadata } = await request.json();
    const { data, error } = await supabase
      .from("activities")
      .insert({ user_id: user.id, action_type, details, metadata })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);
    return json({ activity: data });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function handleGetActivities(request) {
  const user = getUser(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  let query = supabase
    .from("activities")
    .select("*, users(name, email)")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (userId) query = query.eq("user_id", userId);
  else if (user.role !== "admin") query = query.eq("user_id", user.id);

  const { data, error } = await query;
  if (error) return json({ error: error.message }, 500);
  return json({ activities: data || [] });
}

// ============ CHATBOT ============
function generateChatResponse(query, courseTitle) {
  const q = query.toLowerCase();
  if (q.includes("prerequisite") || q.includes("requirement"))
    return "No prior experience is needed for most of our beginner courses. For intermediate and advanced courses, we recommend completing the prerequisite courses listed on the course page.";
  if (q.includes("duration") || q.includes("how long"))
    return "Our courses range from 4-12 weeks depending on complexity. Most students spend 5-10 hours per week on coursework. You can learn at your own pace.";
  if (q.includes("certificate") || q.includes("certification"))
    return "Yes! Upon completing all course modules and passing the final assessment, you will receive a verified certificate of completion that you can share on LinkedIn.";
  if (q.includes("cost") || q.includes("price") || q.includes("free"))
    return "We offer both free and premium courses. Basic courses are available at no cost, while premium courses with advanced content start at competitive prices.";
  if (q.includes("job") || q.includes("career"))
    return "Our courses are designed to help you build career-ready skills. Many graduates have gone on to land jobs at top tech companies. We also offer career guidance resources.";
  if (q.includes("help") || q.includes("support"))
    return "I can help you with course information, prerequisites, certificates, enrollment, and more. For technical issues, please reach out to our support team.";
  // TODO: Replace with OpenAI GPT-4 API call for real AI-powered responses
  return `Great question! ${courseTitle ? `For "${courseTitle}", ` : ""}I recommend exploring the course content and practice exercises. Our instructors have designed comprehensive materials to cover this topic thoroughly. Would you like more specific information?`;
}

async function handleChatbot(request) {
  const user = getUser(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  try {
    const { query: q, course_title } = await request.json();
    if (!q) return json({ error: "Query required" }, 400);

    // TODO: Replace with OpenAI API call
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful learning assistant." },
        { role: "user", content: q },
      ],
    });

    const response = completion.choices[0].message.content;

    const { data, error } = await supabase
      .from("chatbot_queries")
      .insert({ user_id: user.id, query: q, response })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    await supabase.from("activities").insert({
      user_id: user.id,
      action_type: "chatbot_query",
      details: { query: q, description: `Asked: ${q.substring(0, 50)}...` },
      metadata: { source: "web" },
    });

    return json({ response, query_id: data?.id });
  } catch (e) {
    console.error("Chatbot error:", e);
    return json({ error: e.message }, 500);
  }
}

async function handleGetQueries(request) {
  const user = getUser(request);
  if (!user || user.role !== "admin")
    return json({ error: "Unauthorized" }, 401);
  const { data, error } = await supabase
    .from("chatbot_queries")
    .select("*, users(name, email)")
    .order("created_at", { ascending: false });
  if (error) return json({ error: error.message }, 500);
  return json({ queries: data || [] });
}

// ============ ANALYTICS ============
async function handleGetAnalytics(request) {
  const user = getUser(request);
  if (!user || user.role !== "admin")
    return json({ error: "Unauthorized" }, 401);
  try {
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    const { count: totalCourses } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });
    const { count: totalQueries } = await supabase
      .from("chatbot_queries")
      .select("*", { count: "exact", head: true });

    const today = new Date().toISOString().split("T")[0];
    const { data: todayActs } = await supabase
      .from("activities")
      .select("user_id")
      .gte("timestamp", today + "T00:00:00");
    const activeToday = new Set((todayActs || []).map((a) => a.user_id)).size;

    const { data: activities } = await supabase
      .from("activities")
      .select("action_type, timestamp, user_id")
      .order("timestamp", { ascending: false })
      .limit(500);
    const { data: courses } = await supabase
      .from("courses")
      .select("title, enrollments_count");
    const { data: allUsers } = await supabase
      .from("users")
      .select("created_at")
      .order("created_at");

    // Aggregate daily active
    const dailyMap = {};
    (activities || []).forEach((a) => {
      const day = a.timestamp?.split("T")[0];
      if (day) {
        if (!dailyMap[day]) dailyMap[day] = new Set();
        dailyMap[day].add(a.user_id);
      }
    });
    const dailyActiveUsers = Object.entries(dailyMap)
      .map(([date, set]) => ({ date, count: set.size }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    // Activity types
    const typeMap = {};
    (activities || []).forEach((a) => {
      typeMap[a.action_type] = (typeMap[a.action_type] || 0) + 1;
    });
    const activityTypes = Object.entries(typeMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Course enrollments
    const courseEnrollments = (courses || []).map((c) => ({
      name: c.title?.substring(0, 15),
      count: c.enrollments_count || 0,
    }));

    // User growth
    const growthMap = {};
    (allUsers || []).forEach((u) => {
      const day = u.created_at?.split("T")[0];
      if (day) growthMap[day] = (growthMap[day] || 0) + 1;
    });
    let cumulative = 0;
    const userGrowth = Object.entries(growthMap)
      .sort()
      .map(([date, count]) => {
        cumulative += count;
        return { date, users: cumulative };
      });

    // TODO: Replace with OpenAI API for real AI insights
    const insights = [
      {
        title: "Peak Usage",
        description:
          "Highest activity between 2-4 PM on weekdays. Consider scheduling new content releases during these hours.",
      },
      {
        title: "Popular Courses",
        description:
          "Data Science Fundamentals has the highest enrollment rate with 312 students. Python courses show 20% growth.",
      },
      {
        title: "Engagement Trend",
        description:
          "User engagement increased 15% this week. Video completion rates are up across all courses.",
      },
      {
        title: "Predicted Growth",
        description:
          "Based on current trends, expect 25% enrollment increase next month. Consider expanding course offerings.",
      },
    ];

    return json({
      totalUsers: totalUsers || 0,
      activeToday,
      totalCourses: totalCourses || 0,
      totalQueries: totalQueries || 0,
      dailyActiveUsers,
      activityTypes,
      courseEnrollments,
      userGrowth,
      insights,
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// ============ USERS (ADMIN) ============
async function handleGetUsers(request) {
  const user = getUser(request);
  if (!user || user.role !== "admin")
    return json({ error: "Unauthorized" }, 401);
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at")
    .order("created_at", { ascending: false });
  if (error) return json({ error: error.message }, 500);

  const usersWithCounts = await Promise.all(
    (data || []).map(async (u) => {
      const { count } = await supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .eq("user_id", u.id);
      return { ...u, activity_count: count || 0 };
    }),
  );

  return json({ users: usersWithCounts });
}

async function handleGetUser(request, id) {
  const user = getUser(request);
  if (!user || user.role !== "admin")
    return json({ error: "Unauthorized" }, 401);

  const { data: userData, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at")
    .eq("id", id)
    .single();
  if (error) return json({ error: "User not found" }, 404);

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", id)
    .order("timestamp", { ascending: false })
    .limit(50);
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(title)")
    .eq("user_id", id);

  return json({
    user: userData,
    activities: activities || [],
    enrollments: enrollments || [],
  });
}

// ============ USER DASHBOARD DATA ============
async function handleGetDashboard(request) {
  const user = getUser(request);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", user.id);
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: false })
    .limit(10);
  const { count: totalActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return json({
    enrollments: enrollments || [],
    activities: activities || [],
    totalActivities: totalActivities || 0,
  });
}

// ============ ROUTER ============
export async function GET(request, { params }) {
  const p = params.path || [];
  const path = p.join("/");

  switch (path) {
    case "setup/check":
      return handleSetupCheck();
    case "auth/me":
      return handleGetMe(request);
    case "courses":
      return handleGetCourses();
    case "activities":
      return handleGetActivities(request);
    case "analytics":
      return handleGetAnalytics(request);
    case "users":
      return handleGetUsers(request);
    case "chatbot/queries":
      return handleGetQueries(request);
    case "dashboard":
      return handleGetDashboard(request);
    default:
      if (p[0] === "courses" && p.length === 2)
        return handleGetCourse(request, p[1]);
      if (p[0] === "users" && p.length === 2)
        return handleGetUser(request, p[1]);
      return json({ error: "Not found" }, 404);
  }
}

export async function POST(request, { params }) {
  const p = params.path || [];
  const path = p.join("/");

  switch (path) {
    case "setup/seed":
      return handleSetupSeed();
    case "auth/signup":
      return handleSignup(request);
    case "auth/login":
      return handleLogin(request);
    case "courses/enroll":
      return handleEnrollCourse(request);
    case "activities":
      return handleLogActivity(request);
    case "chatbot":
      return handleChatbot(request);
    default:
      return json({ error: "Not found" }, 404);
  }
}
