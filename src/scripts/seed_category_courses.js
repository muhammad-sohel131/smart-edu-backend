const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  console.error("DB_URL is missing in environment variables!");
  process.exit(1);
}

// ================= SCHEMAS =================
const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    noOfStudents: { type: Number, default: 0 },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    category: { type: String, index: true },
    thumbnail: { type: String },
    introVideo: { type: String },
    tags: [{ type: String }],
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    isDeleted: { type: Boolean, default: false },
    awardOnComplete: { type: mongoose.Schema.Types.ObjectId, ref: "Badge" },
  },
  { timestamps: true, versionKey: false }
);

const UnitSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    orderIndex: { type: Number, required: true, default: 1 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LessonSchema = new mongoose.Schema(
  {
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    title: { type: String, required: true },
    contentType: {
      type: String,
      enum: ["video", "article", "pdf", "audio", "link"],
      required: true,
    },
    contentUrl: { type: String, required: true },
    durationSec: { type: Number, default: 600 },
    orderIndex: { type: Number, required: true, default: 1 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mcq", "short"], required: true, default: "mcq" },
    prompt: { type: String, required: true },
    options: { type: [OptionSchema] },
    perCorrectPoint: { type: Number, default: 5 },
  },
  { _id: false }
);

const QuizSchema = new mongoose.Schema(
  {
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", index: true },
    title: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
    passMark: { type: Number, default: 70 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const TaskSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["quiz", "video", "pdf"], required: true },
    maxPoints: { type: Number, default: 20 },
    dueDate: { type: Date },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);
const Unit = mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

// Helper to make slug
function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// 20 Comprehensive Courses (4 per Category)
const COURSES_DATA = [
  // =========================================================================
  // 1. WEB DEVELOPMENT (4 COURSES)
  // =========================================================================
  {
    category: "Web Development",
    title: "Modern Full-Stack Next.js 15, React 19 & Tailwind CSS",
    slug: "modern-full-stack-nextjs-15-react-19-tailwind",
    description: "Build ultra-fast, production-grade applications using Next.js 15 App Router, React 19 Server Components, Server Actions, and Tailwind CSS v4 styling.",
    price: 3200,
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
    tags: ["Next.js", "React 19", "Tailwind CSS", "Full Stack", "TypeScript"],
    noOfStudents: 412,
    badgeTitle: "Full-Stack Pioneer",
    modules: [
      {
        title: "Module 1: Next.js 15 App Router & Server Components",
        lessons: [
          { title: "App Router Directory Structure & Layout Hierarchy", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 900 },
          { title: "RSC vs Client Components: Zero-Bundle Size Paradigms", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 1100 },
          { title: "Official Next.js 15 Migration & Performance Cheatsheet", contentType: "pdf", contentUrl: "https://nextjs.org/docs", durationSec: 600 }
        ],
        taskTitle: "Hands-on Lab: Build Dynamic Dashboard Layout with RSC",
        taskDescription: "Create a nested layout route with loading states, suspense boundaries, and streaming data.",
        quizTitle: "Quiz: App Router & Component Lifecycle Assessment",
        questions: [
          {
            prompt: "By default in Next.js 15 App Router, all components inside the app folder are:",
            options: [
              { text: "React Server Components (RSC)", isCorrect: true },
              { text: "Client Components", isCorrect: false },
              { text: "Pure JavaScript functions without JSX", isCorrect: false },
              { text: "Static HTML strings", isCorrect: false }
            ]
          },
          {
            prompt: "Which directive must be placed at the very top of a file to convert it to a Client Component?",
            options: [
              { text: "'use client'", isCorrect: true },
              { text: "'use strict'", isCorrect: false },
              { text: "'client-side'", isCorrect: false },
              { text: "'enable browser'", isCorrect: false }
            ]
          },
          {
            prompt: "What is the primary performance benefit of React Server Components?",
            options: [
              { text: "Zero JavaScript bundle sent to the client for server-only logic and libraries", isCorrect: true },
              { text: "Automatic WebSocket connection to MongoDB", isCorrect: false },
              { text: "They run on the user's GPU", isCorrect: false },
              { text: "They replace CSS styling completely", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Server Actions, Route Handlers & Data Mutations",
        lessons: [
          { title: "Building Type-Safe Server Actions for Form Submissions", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 1050 },
          { title: "Optimistic UI Updates with useOptimistic & useTransition", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 1250 },
          { title: "Deep Dive: Revalidation with revalidatePath and revalidateTag", contentType: "article", contentUrl: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations", durationSec: 750 }
        ],
        taskTitle: "Practical Task: Implement Secure Server Action CRUD Flow",
        taskDescription: "Implement end-to-end form validation with Zod and persist entities to MongoDB via Server Actions.",
        quizTitle: "Quiz: Server Actions & Cache Invalidation",
        questions: [
          {
            prompt: "What method is used in Next.js to purge cached data for a specific route path after a mutation?",
            options: [
              { text: "revalidatePath()", isCorrect: true },
              { text: "clearBrowserCache()", isCorrect: false },
              { text: "flushAll()", isCorrect: false },
              { text: "reload()", isCorrect: false }
            ]
          },
          {
            prompt: "Which React 19 hook allows you to immediately show expected mutation results before server response?",
            options: [
              { text: "useOptimistic", isCorrect: true },
              { text: "useFuture", isCorrect: false },
              { text: "useInstantState", isCorrect: false },
              { text: "usePrediction", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Authentication, Middleware & Production Deployment",
        lessons: [
          { title: "NextAuth / Auth.js v5 with JWT & Secure HttpOnly Cookies", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 1400 },
          { title: "Route Protection with Edge Proxy & Middleware", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 980 },
          { title: "Production Vercel Deployment & Core Web Vitals Optimization", contentType: "article", contentUrl: "https://vercel.com/docs", durationSec: 800 }
        ],
        taskTitle: "Capstone Project: Deploy Production Next.js App to Vercel",
        taskDescription: "Configure environment variables, edge proxy, and achieve 95+ score on Google Lighthouse.",
        quizTitle: "Quiz: Next.js Security & Vercel Deployment",
        questions: [
          {
            prompt: "Which cookie setting prevents malicious JavaScript from reading sensitive authentication tokens?",
            options: [
              { text: "httpOnly: true", isCorrect: true },
              { text: "secure: false", isCorrect: false },
              { text: "sameSite: 'none'", isCorrect: false },
              { text: "readable: true", isCorrect: false }
            ]
          },
          {
            prompt: "What is the purpose of Next.js middleware / proxy?",
            options: [
              { text: "Intercept requests before they complete to enforce auth, redirects, or headers", isCorrect: true },
              { text: "Compress video files into WebM format", isCorrect: false },
              { text: "Compile TypeScript code in real-time in the browser", isCorrect: false },
              { text: "Generate CSS grid animations", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Web Development",
    title: "Full-Stack MERN Architecture with TypeScript & Redux Toolkit",
    slug: "full-stack-mern-architecture-typescript-redux",
    description: "Master full-stack JavaScript: MongoDB aggregation pipelines, Express 5 REST APIs with TypeScript, React 19 frontend, and Redux Toolkit state.",
    price: 2800,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=7CqJlxBYj-M",
    tags: ["MERN", "MongoDB", "Express", "Node.js", "Redux"],
    noOfStudents: 380,
    badgeTitle: "Master Architect",
    modules: [
      {
        title: "Module 1: Express 5, TypeScript Setup & RESTful APIs",
        lessons: [
          { title: "Clean Modular Express Architecture with Services & Controllers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=7CqJlxBYj-M", durationSec: 1100 },
          { title: "Mongoose Data Modeling, Indexing & Aggregation Pipelines", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=7CqJlxBYj-M", durationSec: 1300 },
          { title: "Architecture Blueprint: Scalable Enterprise Express API Structure", contentType: "pdf", contentUrl: "https://expressjs.com", durationSec: 650 }
        ],
        taskTitle: "Backend Lab: Implement Express Modular Routing & Mongoose Model",
        taskDescription: "Design a complete RESTful API for products with filtering, search, pagination, and sorting.",
        quizTitle: "Quiz: Express & MongoDB Data Modeling",
        questions: [
          {
            prompt: "Which HTTP status code signifies a resource was successfully created?",
            options: [
              { text: "201 Created", isCorrect: true },
              { text: "200 OK", isCorrect: false },
              { text: "204 No Content", isCorrect: false },
              { text: "301 Moved", isCorrect: false }
            ]
          },
          {
            prompt: "In MongoDB Mongoose, which method allows executing complex multi-stage data transformations?",
            options: [
              { text: "aggregate()", isCorrect: true },
              { text: "filterAll()", isCorrect: false },
              { text: "mapReducePipeline()", isCorrect: false },
              { text: "transform()", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: React 19, Redux Toolkit & RTK Query",
        lessons: [
          { title: "Global State Management with Redux Toolkit Slices", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=7CqJlxBYj-M", durationSec: 1200 },
          { title: "RTK Query: Auto-Caching, Polling & Optimistic Mutations", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=7CqJlxBYj-M", durationSec: 1400 },
          { title: "Comparative Guide: Redux Toolkit vs React Query vs Zustand", contentType: "article", contentUrl: "https://redux-toolkit.js.org", durationSec: 700 }
        ],
        taskTitle: "Frontend Lab: Integrate RTK Query with Global Store",
        taskDescription: "Connect React frontend components with RTK Query endpoints, handling loading skeletons and error states.",
        quizTitle: "Quiz: Redux Toolkit & Client Caching",
        questions: [
          {
            prompt: "What feature of RTK Query automatically prevents duplicate API requests across multiple components?",
            options: [
              { text: "Automatic Request Deduplication & Caching", isCorrect: true },
              { text: "Local storage syncing", isCorrect: false },
              { text: "Service Worker proxies", isCorrect: false },
              { text: "CSS transition queues", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: JWT Security, Role-Based Access & Cloud Payouts",
        lessons: [
          { title: "Dual Token System: Access Token & Refresh Token Rotation", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=7CqJlxBYj-M", durationSec: 1350 },
          { title: "Role-Based Access Control (RBAC): Admin, Instructor, Student", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=7CqJlxBYj-M", durationSec: 1150 },
          { title: "End-to-End Production Deployment with PM2 & MongoDB Atlas", contentType: "article", contentUrl: "https://nodejs.org", durationSec: 800 }
        ],
        taskTitle: "Capstone: Implement Full-Stack RBAC & Refresh Token Rotation",
        taskDescription: "Build automatic Axios interceptor to seamlessly renew expired access tokens using refresh cookies.",
        quizTitle: "Quiz: JWT Authentication & System Hardening",
        questions: [
          {
            prompt: "Why should refresh tokens have a longer lifespan than access tokens?",
            options: [
              { text: "To allow seamless re-authentication without prompting user logins constantly", isCorrect: true },
              { text: "Because refresh tokens are smaller in byte size", isCorrect: false },
              { text: "To make HTTP headers faster", isCorrect: false },
              { text: "Because they do not contain user IDs", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Web Development",
    title: "Mastering TypeScript 5 & Advanced JavaScript Engineering",
    slug: "mastering-typescript-5-advanced-javascript-engineering",
    description: "Deep dive into TypeScript 5 type system: generics, conditional types, decorators, async concurrency, and clean architectural patterns.",
    price: 1800,
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc80456c6d0?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=gieEQFIfgYc",
    tags: ["TypeScript", "JavaScript", "Software Architecture", "Clean Code"],
    noOfStudents: 290,
    badgeTitle: "Tech Virtuoso",
    modules: [
      {
        title: "Module 1: Deep Type Systems, Generics & Utility Types",
        lessons: [
          { title: "Generic Constraints, Inferred Types & Mapped Types", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=gieEQFIfgYc", durationSec: 1100 },
          { title: "Conditional Types and the 'infer' Keyword Explained", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=gieEQFIfgYc", durationSec: 1300 },
          { title: "Cheatsheet: TypeScript 5.x Key Structural Types & Modifiers", contentType: "pdf", contentUrl: "https://www.typescriptlang.org/docs/", durationSec: 500 }
        ],
        taskTitle: "Type Challenge: Build Type-Safe DeepPartial & DeepReadonly Utilities",
        taskDescription: "Write recursive conditional mapped types to enforce strict immutability across nested object graphs.",
        quizTitle: "Quiz: Generics & Mapped Types Assessment",
        questions: [
          {
            prompt: "What does the 'infer' keyword do inside a TypeScript conditional type?",
            options: [
              { text: "Declares a type variable to be deduced from the matched type structure", isCorrect: true },
              { text: "Forces runtime type checking in browser", isCorrect: false },
              { text: "Converts any variable to string", isCorrect: false },
              { text: "Disables strict null checks", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: JavaScript Concurrency, Memory & V8 Engine",
        lessons: [
          { title: "The Event Loop, Microtasks, Macrotasks & Call Stack", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=gieEQFIfgYc", durationSec: 1200 },
          { title: "Memory Management, Garbage Collection & Memory Leak Profiling", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=gieEQFIfgYc", durationSec: 1400 },
          { title: "Guide: Profiling Node.js Memory Heaps using Chrome DevTools", contentType: "article", contentUrl: "https://v8.dev", durationSec: 600 }
        ],
        taskTitle: "Practical Lab: Detect and Eliminate Event-Listener Memory Leaks",
        taskDescription: "Use Chrome DevTools heap snapshots to pinpoint retained closures and fix dangling references.",
        quizTitle: "Quiz: JavaScript Runtime Internals",
        questions: [
          {
            prompt: "Which queue has higher execution priority in the JavaScript event loop?",
            options: [
              { text: "Microtask Queue (Promises, queueMicrotask)", isCorrect: true },
              { text: "Macrotask Queue (setTimeout, setInterval)", isCorrect: false },
              { text: "Animation Frame Queue", isCorrect: false },
              { text: "Garbage Collector Queue", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Design Patterns, SOLID Principles & Automated Testing",
        lessons: [
          { title: "Implementing Factory, Singleton & Observer in TypeScript", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=gieEQFIfgYc", durationSec: 1300 },
          { title: "Unit Testing & Mocking with Vitest & React Testing Library", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=gieEQFIfgYc", durationSec: 1250 },
          { title: "Clean Code Handbook: SOLID Applied to Modern TypeScript", contentType: "article", contentUrl: "https://martinfowler.com", durationSec: 750 }
        ],
        taskTitle: "Capstone Project: Refactor Legacy Service to Clean Dependency Injection",
        taskDescription: "Decouple database drivers from business domains using TypeScript interfaces and dependency injection.",
        quizTitle: "Quiz: Design Patterns & Architecture",
        questions: [
          {
            prompt: "In SOLID principles, what does the 'D' (Dependency Inversion) state?",
            options: [
              { text: "High-level modules should depend on abstractions, not concrete implementations", isCorrect: true },
              { text: "Databases must be inverted using NoSQL", isCorrect: false },
              { text: "Duplicate code should always be removed", isCorrect: false },
              { text: "Deployment should happen automatically", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Web Development",
    title: "Responsive Web Design Masterclass: HTML5, CSS Grid & Flexbox",
    slug: "responsive-web-design-html5-css-grid-flexbox",
    description: "Learn modern semantic HTML5, CSS Grid, Flexbox, media queries, CSS variables, and accessibility to build breathtaking responsive layouts.",
    price: 0,
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=mU6anWqZJcc",
    tags: ["HTML5", "CSS3", "Responsive Design", "Flexbox", "CSS Grid"],
    noOfStudents: 620,
    badgeTitle: "Quick Starter",
    modules: [
      {
        title: "Module 1: Semantic HTML5 Structure & Web Accessibility (a11y)",
        lessons: [
          { title: "Mastering Semantic Elements: main, section, article, nav, header", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 850 },
          { title: "Building Accessible Forms with Proper Labels & ARIA Attributes", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1050 },
          { title: "WCAG 2.2 Accessibility Checklist for Frontend Developers", contentType: "pdf", contentUrl: "https://www.w3.org/WAI/standards-guidelines/wcag/", durationSec: 500 }
        ],
        taskTitle: "HTML Challenge: Refactor Non-Semantic Markup to Semantic HTML5",
        taskDescription: "Replace generic divs with appropriate semantic landmarks and ensure 100% keyboard accessibility.",
        quizTitle: "Quiz: Semantic HTML & Accessibility",
        questions: [
          {
            prompt: "Which HTML5 tag is most appropriate for a self-contained blog post or news story?",
            options: [
              { text: "<article>", isCorrect: true },
              { text: "<section>", isCorrect: false },
              { text: "<div>", isCorrect: false },
              { text: "<span>", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Modern CSS Layouts with Flexbox & CSS Grid",
        lessons: [
          { title: "Flexbox Mastery: justify-content, align-items, flex-grow & shrink", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1200 },
          { title: "CSS Grid: grid-template-columns, minmax, auto-fit & grid-areas", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1350 },
          { title: "Visual Guide: When to Choose Flexbox vs When to Choose CSS Grid", contentType: "article", contentUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS", durationSec: 600 }
        ],
        taskTitle: "Grid Challenge: Build a Responsive E-Commerce Product Catalog",
        taskDescription: "Create a fluid grid layout that transitions from 1 column on mobile to 4 columns on desktop without media queries.",
        quizTitle: "Quiz: Flexbox vs CSS Grid Concepts",
        questions: [
          {
            prompt: "What is the primary difference between CSS Grid and Flexbox?",
            options: [
              { text: "CSS Grid is 2-dimensional (rows and columns), while Flexbox is 1-dimensional", isCorrect: true },
              { text: "Flexbox only works in Chrome", isCorrect: false },
              { text: "Grid cannot handle responsive layouts", isCorrect: false },
              { text: "Flexbox requires JavaScript to calculate widths", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Responsive Media Queries & Micro-Animations",
        lessons: [
          { title: "Mobile-First Media Queries & Fluid Typography with clamp()", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1100 },
          { title: "Smooth CSS Transitions, Keyframe Animations & GPU Acceleration", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1250 },
          { title: "CSS Variables (Custom Properties) & Dark Mode Theming Guide", contentType: "article", contentUrl: "https://css-tricks.com", durationSec: 700 }
        ],
        taskTitle: "Final Project: Complete Portfolio Website Deployment",
        taskDescription: "Build a responsive personal portfolio with dark mode toggle and deploy live on GitHub Pages or Vercel.",
        quizTitle: "Quiz: CSS Responsive Design & Animations",
        questions: [
          {
            prompt: "Which CSS function enables fluid font sizes between a minimum and maximum threshold?",
            options: [
              { text: "clamp()", isCorrect: true },
              { text: "range()", isCorrect: false },
              { text: "scale()", isCorrect: false },
              { text: "limit()", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. ARTIFICIAL INTELLIGENCE (4 COURSES)
  // =========================================================================
  {
    category: "Artificial Intelligence",
    title: "Generative AI, Large Language Models (LLMs) & LangChain",
    slug: "generative-ai-llms-langchain-rag-architecture",
    description: "Build cutting-edge AI systems: Prompt Engineering, LangChain agents, Vector Databases (Pinecone/Chroma), RAG architecture, and fine-tuning.",
    price: 3500,
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=aircAruvnKk",
    tags: ["Generative AI", "LangChain", "LLMs", "RAG", "Python"],
    noOfStudents: 520,
    badgeTitle: "Grandmaster Legend",
    modules: [
      {
        title: "Module 1: LLM Foundations, Embeddings & Vector Databases",
        lessons: [
          { title: "Attention Is All You Need: Transformer Architecture Simplified", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1300 },
          { title: "Text Embeddings, Cosine Similarity & Vector Search with Pinecone", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1450 },
          { title: "Architectural Guide: Vector Indexing & Embedding Models Comparison", contentType: "pdf", contentUrl: "https://huggingface.co", durationSec: 700 }
        ],
        taskTitle: "AI Lab: Build a Semantic Similarity Search Engine",
        taskDescription: "Generate OpenAI text-embedding-3-small vectors and store them in ChromaDB to query document similarity.",
        quizTitle: "Quiz: Embeddings & Vector Math",
        questions: [
          {
            prompt: "What mathematical metric is most commonly used to measure directional similarity between two embedding vectors?",
            options: [
              { text: "Cosine Similarity", isCorrect: true },
              { text: "Manhattan Distance only", isCorrect: false },
              { text: "Hamming Weight", isCorrect: false },
              { text: "Linear Regression slope", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: LangChain Framework & Retrieval-Augmented Generation (RAG)",
        lessons: [
          { title: "Building RAG Pipelines: Document Loaders, Splitters & Retrievers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1400 },
          { title: "Chat Memory, Conversational Chains & Hallucination Mitigation", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1350 },
          { title: "RAG Evaluation Best Practices: Context Relevance & Faithfulness", contentType: "article", contentUrl: "https://python.langchain.com", durationSec: 650 }
        ],
        taskTitle: "Practical Task: Construct a 'Chat with Your PDF' RAG System",
        taskDescription: "Ingest a 50-page PDF, chunk it into semantically coherent documents, and build a conversational Q&A bot.",
        quizTitle: "Quiz: RAG Architecture & Context Retrieval",
        questions: [
          {
            prompt: "What is the main purpose of Retrieval-Augmented Generation (RAG)?",
            options: [
              { text: "Supply private, up-to-date domain context to the LLM at inference time to prevent hallucinations", isCorrect: true },
              { text: "Retrain the entire model weights from scratch", isCorrect: false },
              { text: "Compress audio files into text", isCorrect: false },
              { text: "Bypass API billing limits", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Autonomous AI Agents, Tool Calling & Full-Stack Deployment",
        lessons: [
          { title: "Function Calling & Tool Use with OpenAI & Claude 3.5 Sonnet", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1500 },
          { title: "Building Multi-Agent Workflows with LangGraph", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1600 },
          { title: "Deploying Enterprise AI APIs with FastAPI, Docker & Streamlit", contentType: "article", contentUrl: "https://fastapi.tiangolo.com", durationSec: 800 }
        ],
        taskTitle: "Capstone: Build an Autonomous Web-Research & Summarization Agent",
        taskDescription: "Create an agent that executes web searches, scrapes pages, and drafts synthesized executive research reports.",
        quizTitle: "Quiz: AI Agents & Tool Calling",
        questions: [
          {
            prompt: "In LangChain / LangGraph, what distinguishes an 'Agent' from a standard 'Chain'?",
            options: [
              { text: "An agent uses the LLM as a reasoning engine to dynamically decide which action or tool to take", isCorrect: true },
              { text: "Chains can only be written in C++", isCorrect: false },
              { text: "Agents do not require prompts", isCorrect: false },
              { text: "Chains cannot communicate with databases", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Artificial Intelligence",
    title: "Deep Learning & Neural Networks with PyTorch from Scratch",
    slug: "deep-learning-neural-networks-pytorch-scratch",
    description: "Hands-on deep learning: mathematical foundations of backprop, CNNs, RNNs, transfer learning, and transformer architectures in PyTorch.",
    price: 2900,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=aircAruvnKk",
    tags: ["PyTorch", "Deep Learning", "Neural Networks", "Computer Vision"],
    noOfStudents: 340,
    badgeTitle: "Tech Virtuoso",
    modules: [
      {
        title: "Module 1: Tensors, Autograd & Multi-Layer Perceptrons",
        lessons: [
          { title: "PyTorch Tensor Operations & GPU Hardware Acceleration", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1200 },
          { title: "Automatic Differentiation with torch.autograd & Loss Functions", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1350 },
          { title: "Mathematical Primer: Gradient Descent, Learning Rates & Optimizers", contentType: "pdf", contentUrl: "https://pytorch.org", durationSec: 600 }
        ],
        taskTitle: "PyTorch Lab: Train an MLP from Scratch on MNIST",
        taskDescription: "Build a multi-layer perceptron using nn.Module, CrossEntropyLoss, and Adam optimizer reaching 98%+ accuracy.",
        quizTitle: "Quiz: PyTorch Fundamentals & Optimization",
        questions: [
          {
            prompt: "What does calling 'loss.backward()' do in PyTorch?",
            options: [
              { text: "Computes the gradients of the loss with respect to all model parameters with requires_grad=True", isCorrect: true },
              { text: "Updates the weights of the model", isCorrect: false },
              { text: "Deletes the neural network graph from RAM", isCorrect: false },
              { text: "Reverses the training loop order", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Convolutional Neural Networks (CNNs) & Computer Vision",
        lessons: [
          { title: "Convolution Kernels, Stride, Padding & Pooling Layers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1300 },
          { title: "Transfer Learning with Pretrained ResNet & EfficientNet", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1450 },
          { title: "Data Augmentation Techniques with Torchvision Transforms", contentType: "article", contentUrl: "https://pytorch.org/vision", durationSec: 650 }
        ],
        taskTitle: "Vision Task: Train a High-Accuracy Image Classifier with ResNet50",
        taskDescription: "Fine-tune pretrained weights on custom image classes and generate confusion matrix metrics.",
        quizTitle: "Quiz: CNNs & Image Processing",
        questions: [
          {
            prompt: "What is the primary function of Max Pooling in a CNN?",
            options: [
              { text: "Downsamples spatial dimensions, reducing parameters and computation while preserving dominant features", isCorrect: true },
              { text: "Multiplies image colors by 2", isCorrect: false },
              { text: "Converts images from RGB to Grayscale", isCorrect: false },
              { text: "Calculates the loss function", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Transformers, Self-Attention & Fine-Tuning",
        lessons: [
          { title: "Scaled Dot-Product Attention & Multi-Head Attention Mechanics", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1500 },
          { title: "Hugging Face Transformers: Tokenizers & Trainer API", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1400 },
          { title: "Model Export with ONNX & TensorRT for Low-Latency Serving", contentType: "article", contentUrl: "https://huggingface.co/docs", durationSec: 750 }
        ],
        taskTitle: "Capstone: Fine-tune DistilBERT for Sentiment Analysis",
        taskDescription: "Fine-tune a pretrained Hugging Face transformer on custom text reviews with evaluation benchmarking.",
        quizTitle: "Quiz: Transformers & Attention Mechanisms",
        questions: [
          {
            prompt: "In Self-Attention, what are the three key matrices calculated for each token?",
            options: [
              { text: "Queries (Q), Keys (K), Values (V)", isCorrect: true },
              { text: "Inputs, Hidden, Outputs", isCorrect: false },
              { text: "Weights, Biases, Gradients", isCorrect: false },
              { text: "Tokens, Vectors, Layers", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Artificial Intelligence",
    title: "Python Data Science & Machine Learning Bootcamp",
    slug: "python-data-science-machine-learning-bootcamp",
    description: "Master real-world data science: NumPy, Pandas, Matplotlib, Seaborn, Feature Engineering, and Machine Learning models using Scikit-Learn.",
    price: 2200,
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    tags: ["Data Science", "Python", "Pandas", "Scikit-Learn", "Machine Learning"],
    noOfStudents: 450,
    badgeTitle: "Problem Solver",
    modules: [
      {
        title: "Module 1: Data Manipulation & Wrangling with Pandas",
        lessons: [
          { title: "DataFrames, Series, Filtering, Slicing & GroupBy Aggregations", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1150 },
          { title: "Handling Missing Data, Imputation & Outlier Detection", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1250 },
          { title: "Complete Pandas 2.x High-Performance Cheatsheet", contentType: "pdf", contentUrl: "https://pandas.pydata.org", durationSec: 500 }
        ],
        taskTitle: "Data Task: Clean & Analyze a 100,000-Row Customer Dataset",
        taskDescription: "Clean missing records, normalize categorical columns, and aggregate customer lifetime value.",
        quizTitle: "Quiz: Pandas Data Operations",
        questions: [
          {
            prompt: "Which Pandas method is used to compute summary statistics (count, mean, std, min, max) for numeric columns?",
            options: [
              { text: "df.describe()", isCorrect: true },
              { text: "df.summary()", isCorrect: false },
              { text: "df.stats()", isCorrect: false },
              { text: "df.info()", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Exploratory Data Analysis & Statistical Visualization",
        lessons: [
          { title: "Plotting with Matplotlib & Aesthetic Styling with Seaborn", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1200 },
          { title: "Correlation Heatmaps, Boxplots & Distribution Histograms", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1100 },
          { title: "Guide to Data Storytelling & Dashboarding in Jupyter Notebooks", contentType: "article", contentUrl: "https://seaborn.pydata.org", durationSec: 600 }
        ],
        taskTitle: "Visualization Task: Generate Complete EDA Report with Insights",
        taskDescription: "Create interactive visual charts revealing customer churn patterns across demographics.",
        quizTitle: "Quiz: Statistical Data Analysis",
        questions: [
          {
            prompt: "What does a correlation coefficient of +1.0 between two variables indicate?",
            options: [
              { text: "A perfect positive linear relationship", isCorrect: true },
              { text: "No relationship at all", isCorrect: false },
              { text: "An inverse relationship", isCorrect: false },
              { text: "That both variables equal zero", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Scikit-Learn Supervised & Unsupervised Learning",
        lessons: [
          { title: "Linear & Logistic Regression: Model Training, Evaluation & ROC Curves", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1350 },
          { title: "Random Forests, Gradient Boosting (XGBoost) & Hyperparameter Tuning", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1450 },
          { title: "Model Validation: K-Fold Cross-Validation & Metric Selection", contentType: "article", contentUrl: "https://scikit-learn.org", durationSec: 700 }
        ],
        taskTitle: "Capstone: Build End-to-End Loan Default Prediction Model",
        taskDescription: "Train an XGBoost classifier with GridSearchCV, achieving >88% F1-score with balanced recall.",
        quizTitle: "Quiz: Machine Learning Algorithms",
        questions: [
          {
            prompt: "Why is Accuracy often a misleading evaluation metric for highly imbalanced datasets?",
            options: [
              { text: "A model predicting only the majority class can have high accuracy while failing to detect the minority class", isCorrect: true },
              { text: "Accuracy calculation takes too much CPU time", isCorrect: false },
              { text: "Accuracy only works with integer numbers", isCorrect: false },
              { text: "Accuracy requires deep neural networks", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Artificial Intelligence",
    title: "Computer Vision with OpenCV, YOLO & Deep Learning",
    slug: "computer-vision-opencv-yolo-deep-learning",
    description: "Build intelligent visual systems: real-time object detection with YOLOv8, facial recognition, image segmentation, and edge AI deployment.",
    price: 2600,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=aircAruvnKk",
    tags: ["Computer Vision", "OpenCV", "YOLO", "AI", "Python"],
    noOfStudents: 310,
    badgeTitle: "Code Explorer",
    modules: [
      {
        title: "Module 1: Image Processing & Filtering with OpenCV",
        lessons: [
          { title: "Image Matrix Representation, Color Spaces (BGR, RGB, HSV)", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1050 },
          { title: "Edge Detection with Canny, Gaussian Blurs & Thresholding", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1200 },
          { title: "OpenCV 4.x Python Quick-Reference & Essential Algorithms", contentType: "pdf", contentUrl: "https://docs.opencv.org", durationSec: 550 }
        ],
        taskTitle: "Vision Lab: Build an Automated Document Scanner",
        taskDescription: "Use contour detection and perspective transforms to detect and crop receipts and business cards automatically.",
        quizTitle: "Quiz: Image Manipulation with OpenCV",
        questions: [
          {
            prompt: "What is the default color channel ordering in standard OpenCV when reading an image?",
            options: [
              { text: "BGR (Blue, Green, Red)", isCorrect: true },
              { text: "RGB (Red, Green, Blue)", isCorrect: false },
              { text: "CMYK", isCorrect: false },
              { text: "Grayscale", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Real-Time Object Detection with YOLOv8",
        lessons: [
          { title: "YOLO Architecture: Single-Shot Detection, Bounding Boxes & Confidence", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1300 },
          { title: "Training Custom YOLOv8 Models with Roboflow Datasets", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1450 },
          { title: "Evaluating Object Detection: IoU, Precision, Recall & mAP@50", contentType: "article", contentUrl: "https://ultralytics.com", durationSec: 650 }
        ],
        taskTitle: "Detection Task: Train a Custom PPE Safety Equipment Detector",
        taskDescription: "Annotate dataset, train YOLOv8 model, and export weights for real-time webcam video stream inference.",
        quizTitle: "Quiz: Object Detection Metrics",
        questions: [
          {
            prompt: "What metric measures the overlap between a predicted bounding box and the ground-truth annotation?",
            options: [
              { text: "Intersection over Union (IoU)", isCorrect: true },
              { text: "Mean Squared Error", isCorrect: false },
              { text: "Cosine Similarity", isCorrect: false },
              { text: "Binary Cross-Entropy", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Facial Recognition, Feature Tracking & Edge AI",
        lessons: [
          { title: "Facial Landmark Detection with MediaPipe & FaceNet Embeddings", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1350 },
          { title: "Multi-Object Tracking using DeepSORT & ByteTrack Algorithms", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1400 },
          { title: "Optimizing Vision Pipelines for Raspberry Pi & Jetson Nano", contentType: "article", contentUrl: "https://developer.nvidia.com", durationSec: 750 }
        ],
        taskTitle: "Capstone: Build a Real-Time Attendance System with Facial Recognition",
        taskDescription: "Implement webcam face matching against stored student profiles with automatic attendance logging.",
        quizTitle: "Quiz: Facial Recognition & Tracking",
        questions: [
          {
            prompt: "How does FaceNet represent a human face for identification?",
            options: [
              { text: "As a 128-dimensional or 512-dimensional vector embedding in Euclidean space", isCorrect: true },
              { text: "As a plain JPEG screenshot", isCorrect: false },
              { text: "As a string of ASCII characters", isCorrect: false },
              { text: "By counting the number of pixels", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. CLOUD & DEVOPS (4 COURSES)
  // =========================================================================
  {
    category: "Cloud & DevOps",
    title: "Docker & Kubernetes Architecture for Production Microservices",
    slug: "docker-kubernetes-production-microservices",
    description: "Production containerization: multi-stage Docker builds, Kubernetes cluster management, Helm charts, ingress controllers, and zero-downtime rolling updates.",
    price: 3000,
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=hQcFE0RD0cQ",
    tags: ["Docker", "Kubernetes", "DevOps", "Microservices", "Containers"],
    noOfStudents: 480,
    badgeTitle: "Master Architect",
    modules: [
      {
        title: "Module 1: Production Docker Containerization",
        lessons: [
          { title: "Multi-Stage Dockerfiles for Minimal, Secure Production Images", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1100 },
          { title: "Docker Compose for Multi-Container Networking & Volume Persistence", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1250 },
          { title: "Container Security Best Practices: Rootless Containers & Image Scanning", contentType: "pdf", contentUrl: "https://docs.docker.com", durationSec: 600 }
        ],
        taskTitle: "Docker Lab: Containerize Full-Stack App with Multi-Stage Build",
        taskDescription: "Reduce Docker image size from 1.2GB to under 90MB with Alpine and multi-stage Node.js build.",
        quizTitle: "Quiz: Docker Optimization & Security",
        questions: [
          {
            prompt: "What is the primary benefit of multi-stage Docker builds?",
            options: [
              { text: "Leaves behind compilers and dev dependencies, producing small and secure final production images", isCorrect: true },
              { text: "Allows containers to run without Docker installed", isCorrect: false },
              { text: "Encrypts the host operating system", isCorrect: false },
              { text: "Increases CPU clock speed", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Kubernetes Core Architecture & Workloads",
        lessons: [
          { title: "Control Plane, Nodes, Pods, Deployments & ReplicaSets", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1350 },
          { title: "ConfigMaps, Secrets, Persistent Volumes & StatefulSets", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1400 },
          { title: "Declarative YAML Manifests & kubectl Command Mastery", contentType: "article", contentUrl: "https://kubernetes.io/docs", durationSec: 700 }
        ],
        taskTitle: "K8s Lab: Deploy High-Availability Microservices with Health Probes",
        taskDescription: "Deploy 3-replica Node.js deployment with livenessProbe, readinessProbe, and zero-downtime rolling update strategy.",
        quizTitle: "Quiz: Kubernetes Pod Lifecycle",
        questions: [
          {
            prompt: "Which probe determines if a Pod is ready to start accepting network traffic from a Service?",
            options: [
              { text: "readinessProbe", isCorrect: true },
              { text: "livenessProbe", isCorrect: false },
              { text: "startupProbe only", isCorrect: false },
              { text: "healthCheckProbe", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Ingress, Helm Packaging & Cluster Monitoring",
        lessons: [
          { title: "NGINX Ingress Controller, TLS Certificates with cert-manager", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1400 },
          { title: "Packaging Cloud Applications into Helm Charts with Values Overrides", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1300 },
          { title: "Cluster Observability: Prometheus Metrics & Grafana Dashboards", contentType: "article", contentUrl: "https://helm.sh", durationSec: 750 }
        ],
        taskTitle: "Capstone: Deploy Complete Microservices Stack via Custom Helm Chart",
        taskDescription: "Create a Helm chart with automated SSL termination and dynamic replica scaling.",
        quizTitle: "Quiz: Helm & Ingress Architecture",
        questions: [
          {
            prompt: "What is Helm in the Kubernetes ecosystem?",
            options: [
              { text: "The package manager for Kubernetes that defines, installs, and upgrades complex apps", isCorrect: true },
              { text: "A physical hardware server", isCorrect: false },
              { text: "A programming language that replaces Python", isCorrect: false },
              { text: "A database query language", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Cloud & DevOps",
    title: "AWS Cloud Solutions Architect: Complete Hands-On Guide",
    slug: "aws-cloud-solutions-architect-complete-guide",
    description: "Design resilient, highly scalable cloud infrastructures on Amazon Web Services: EC2, S3, RDS, Lambda, VPC networking, and IAM security.",
    price: 3200,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=hQcFE0RD0cQ",
    tags: ["AWS", "Cloud Computing", "Solutions Architect", "DevOps", "Infrastructure"],
    noOfStudents: 410,
    badgeTitle: "Master Architect",
    modules: [
      {
        title: "Module 1: AWS Fundamentals, IAM & Virtual Private Cloud (VPC)",
        lessons: [
          { title: "AWS Global Infrastructure: Regions, Availability Zones & Edge Locations", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1100 },
          { title: "Designing Secure VPCs: Public Subnets, Private Subnets & NAT Gateways", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1350 },
          { title: "IAM Principle of Least Privilege: Roles, Policies & Multi-Factor Auth", contentType: "pdf", contentUrl: "https://aws.amazon.com/architecture", durationSec: 600 }
        ],
        taskTitle: "VPC Lab: Build a High-Availability Multi-AZ Network Topology",
        taskDescription: "Create custom VPC with 2 public subnets, 2 private subnets, internet gateway, and route tables.",
        quizTitle: "Quiz: AWS Networking & IAM",
        questions: [
          {
            prompt: "Which AWS service allows instances in private subnets to access the internet while preventing incoming connections?",
            options: [
              { text: "NAT Gateway", isCorrect: true },
              { text: "Internet Gateway directly", isCorrect: false },
              { text: "Route 53", isCorrect: false },
              { text: "Elastic Load Balancer", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Compute, Storage & Managed Databases",
        lessons: [
          { title: "EC2 Sizing, Auto Scaling Groups & Application Load Balancers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1400 },
          { title: "Amazon S3 Storage Classes, Lifecycle Policies & Cross-Region Replication", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1200 },
          { title: "Managed Relational & NoSQL Databases: Amazon RDS Multi-AZ & DynamoDB", contentType: "article", contentUrl: "https://docs.aws.amazon.com", durationSec: 750 }
        ],
        taskTitle: "Compute Lab: Deploy Fault-Tolerant Auto-Scaling Web Fleet behind ALB",
        taskDescription: "Configure launch template with user-data script, dynamic scaling policies, and target groups.",
        quizTitle: "Quiz: AWS Compute & Storage Scaling",
        questions: [
          {
            prompt: "What happens when an Amazon RDS Multi-AZ deployment detects an outage on the primary database?",
            options: [
              { text: "It automatically fails over to the standby replica without manual intervention", isCorrect: true },
              { text: "All data is permanently deleted", isCorrect: false },
              { text: "It stops accepting traffic until support calls", isCorrect: false },
              { text: "It converts into an S3 bucket", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Serverless Architecture & Global Content Delivery",
        lessons: [
          { title: "Serverless Microservices with AWS Lambda, API Gateway & EventBridge", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1450 },
          { title: "Low-Latency Global Distribution with Amazon CloudFront CDN", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1100 },
          { title: "Architectural Well-Architected Framework: Cost, Security & Reliability", contentType: "article", contentUrl: "https://aws.amazon.com/well-architected", durationSec: 800 }
        ],
        taskTitle: "Capstone: Deploy Serverless Image Processing Pipeline with S3 & Lambda",
        taskDescription: "Trigger automated image resizing and watermark embedding whenever a file is uploaded to S3.",
        quizTitle: "Quiz: Serverless & Content Delivery",
        questions: [
          {
            prompt: "What is the primary pricing benefit of AWS Lambda over continuous EC2 instances?",
            options: [
              { text: "You only pay for compute time consumed when code is executing, with zero charge when idle", isCorrect: true },
              { text: "Lambda servers are completely free forever without limits", isCorrect: false },
              { text: "Lambda has no internet access costs", isCorrect: false },
              { text: "Lambda requires upfront 3-year commitments", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Cloud & DevOps",
    title: "CI/CD Pipeline Automation with GitHub Actions & ArgoCD",
    slug: "cicd-pipeline-automation-github-actions-argocd",
    description: "Automate delivery pipelines: GitHub Actions workflows, automated testing, container build caches, security vulnerability scanning, and GitOps deployments.",
    price: 2400,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=RGOj5yH7evk",
    tags: ["CI/CD", "GitHub Actions", "GitOps", "ArgoCD", "DevOps"],
    noOfStudents: 360,
    badgeTitle: "Tech Virtuoso",
    modules: [
      {
        title: "Module 1: GitHub Actions Foundations & Workflows",
        lessons: [
          { title: "YAML Workflow Triggers, Matrix Builds & Environment Secrets", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 1050 },
          { title: "Automated Linting, Unit Testing & Code Coverage Reporting", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 1200 },
          { title: "GitHub Actions Reusable Workflows & Composite Actions Pattern", contentType: "pdf", contentUrl: "https://docs.github.com/actions", durationSec: 600 }
        ],
        taskTitle: "CI Task: Build a Multi-Stage Matrix Test Runner for PRs",
        taskDescription: "Create a GitHub Actions workflow testing code on Node 18, 20, and 22 across Ubuntu and macOS runners.",
        quizTitle: "Quiz: GitHub Actions Workflows",
        questions: [
          {
            prompt: "Where should sensitive API keys and deployment credentials be stored for GitHub Actions?",
            options: [
              { text: "GitHub Repository Secrets / Environments Secrets", isCorrect: true },
              { text: "Hardcoded directly into the workflow YAML file", isCorrect: false },
              { text: "In the public README.md file", isCorrect: false },
              { text: "In browser localStorage", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Automated Docker Builds & Security Scanning",
        lessons: [
          { title: "Building & Pushing Images to Docker Hub / GHCR with Buildx & Cache", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 1250 },
          { title: "Container Vulnerability Scanning with Trivy & Snyk in CI", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 1350 },
          { title: "Automated Semantic Versioning & GitHub Release Automation", contentType: "article", contentUrl: "https://github.com/features/actions", durationSec: 650 }
        ],
        taskTitle: "Security Lab: Implement Vulnerability Gate in CI Pipeline",
        taskDescription: "Configure Trivy in GitHub Actions to block pull request merges if Critical or High CVEs are found.",
        quizTitle: "Quiz: Pipeline Security & Artifact Caching",
        questions: [
          {
            prompt: "What does Docker Buildx cache do inside a CI/CD pipeline?",
            options: [
              { text: "Reuses unchanged image layers between workflow runs to dramatically speed up build times", isCorrect: true },
              { text: "Deletes old git commit history", isCorrect: false },
              { text: "Compresses video files", isCorrect: false },
              { text: "Encrypts the source code repository", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: GitOps Deployment Pipelines with ArgoCD",
        lessons: [
          { title: "GitOps Philosophy: Git as the Single Source of Truth for State", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 1400 },
          { title: "Installing ArgoCD on K8s & Syncing Declarative Application State", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 1350 },
          { title: "Canary Deployments & Automated Rollbacks with Argo Rollouts", contentType: "article", contentUrl: "https://argo-cd.readthedocs.io", durationSec: 800 }
        ],
        taskTitle: "Capstone: Implement Full GitOps Deployment with ArgoCD",
        taskDescription: "Connect Git repository manifests to ArgoCD, demonstrating automatic synchronization upon git push.",
        quizTitle: "Quiz: GitOps & Declarative Operations",
        questions: [
          {
            prompt: "In a GitOps workflow, how are changes deployed to a production Kubernetes cluster?",
            options: [
              { text: "By committing desired infrastructure manifests to Git, which an agent (ArgoCD) reconciles to the cluster", isCorrect: true },
              { text: "By developers manually SSHing into the server and running commands", isCorrect: false },
              { text: "By sending an email to the hosting provider", isCorrect: false },
              { text: "Through manual copy-pasting via FTP", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Cloud & DevOps",
    title: "Terraform & Infrastructure as Code (IaC) Masterclass",
    slug: "terraform-infrastructure-as-code-masterclass",
    description: "Automate multi-cloud infrastructure: HashiCorp Terraform HCL, state management, remote backends, reusable modules, and production CI/CD automation.",
    price: 2600,
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=hQcFE0RD0cQ",
    tags: ["Terraform", "Infrastructure as Code", "AWS", "DevOps", "Cloud"],
    noOfStudents: 290,
    badgeTitle: "Master Architect",
    modules: [
      {
        title: "Module 1: Terraform Architecture, Providers & HCL Syntax",
        lessons: [
          { title: "Infrastructure as Code Philosophy & Declarative vs Imperative Tools", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1100 },
          { title: "Terraform Core Workflow: init, plan, apply & destroy", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1250 },
          { title: "HCL Language Basics: Variables, Outputs, Locals & Data Sources", contentType: "pdf", contentUrl: "https://developer.hashicorp.com/terraform", durationSec: 550 }
        ],
        taskTitle: "Terraform Lab: Provision AWS S3 Bucket with Versioning via Code",
        taskDescription: "Write parameterized Terraform manifests to create S3 storage with public access blocks and lifecycle rules.",
        quizTitle: "Quiz: Terraform Core Commands",
        questions: [
          {
            prompt: "Which command shows the execution plan of changes Terraform will make before applying them?",
            options: [
              { text: "terraform plan", isCorrect: true },
              { text: "terraform execute", isCorrect: false },
              { text: "terraform show-future", isCorrect: false },
              { text: "terraform test", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: State Management & Remote Backends with State Locking",
        lessons: [
          { title: "The Critical Role of terraform.tfstate & Drift Detection", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1300 },
          { title: "Remote State Storage with S3 & Distributed Locking with DynamoDB", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1400 },
          { title: "Resolving State Discrepancies & terraform import for Existing Resources", contentType: "article", contentUrl: "https://developer.hashicorp.com", durationSec: 650 }
        ],
        taskTitle: "Backend Task: Configure S3 + DynamoDB Remote State Backend",
        taskDescription: "Eliminate race conditions by setting up S3 backend encryption with DynamoDB table state locking.",
        quizTitle: "Quiz: Terraform State & Locking",
        questions: [
          {
            prompt: "Why is state locking critical when multiple engineers work on Terraform simultaneously?",
            options: [
              { text: "Prevents concurrent execution from corrupting the state file", isCorrect: true },
              { text: "Encrypts user passwords in cleartext", isCorrect: false },
              { text: "Stops git merge conflicts permanently", isCorrect: false },
              { text: "Allows servers to run faster", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Modular Architecture & Production CI/CD Integration",
        lessons: [
          { title: "Designing Clean, Reusable Multi-Tier Infrastructure Modules", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1450 },
          { title: "Multi-Environment Deployment Strategies: Workspaces vs Terragrunt", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1350 },
          { title: "Automating Terraform Pipelines with GitHub Actions & OIDC Auth", contentType: "article", contentUrl: "https://registry.terraform.io", durationSec: 800 }
        ],
        taskTitle: "Capstone: Provision Complete Production VPC & EKS Cluster via Modules",
        taskDescription: "Build modular infrastructure repository with dev, staging, and prod environment parameterization.",
        quizTitle: "Quiz: Terraform Modules & GitOps",
        questions: [
          {
            prompt: "What is the primary benefit of creating custom Terraform modules?",
            options: [
              { text: "Encapsulates reusable infrastructure patterns and reduces duplication across environments", isCorrect: true },
              { text: "Eliminates the need for cloud providers", isCorrect: false },
              { text: "Converts YAML files to Python", isCorrect: false },
              { text: "Makes terraform free of cost", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 4. CYBERSECURITY (4 COURSES)
  // =========================================================================
  {
    category: "Cybersecurity",
    title: "Ethical Hacking & Web Application Penetration Testing",
    slug: "ethical-hacking-web-application-penetration-testing",
    description: "Hands-on offensive security: Burp Suite, OWASP Top 10 vulnerabilities (SQLi, XSS, SSRF, IDOR), authentication bypass, and bug bounty hunting.",
    price: 3400,
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
    tags: ["Cybersecurity", "Ethical Hacking", "Penetration Testing", "OWASP", "Bug Bounty"],
    noOfStudents: 490,
    badgeTitle: "Tech Virtuoso",
    modules: [
      {
        title: "Module 1: Reconnaissance, Network Mapping & Burp Suite Setup",
        lessons: [
          { title: "Passive & Active Reconnaissance: Subdomain Enumeration & OSINT", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1200 },
          { title: "Configuring Burp Suite Professional, Intercept Proxy & Extensions", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1350 },
          { title: "Legal & Ethical Framework: Scopes, ROE & Responsible Disclosure", contentType: "pdf", contentUrl: "https://owasp.org", durationSec: 600 }
        ],
        taskTitle: "Recon Lab: Map Target Attack Surface with Amass, Sublist3r & Nmap",
        taskDescription: "Perform structured reconnaissance against a lab target, compiling open ports and exposed services.",
        quizTitle: "Quiz: Reconnaissance & Proxy Fundamentals",
        questions: [
          {
            prompt: "What is the key difference between passive reconnaissance and active reconnaissance?",
            options: [
              { text: "Passive recon gathers info without sending packets directly to the target systems; active recon interacts directly", isCorrect: true },
              { text: "Passive recon is illegal; active recon is not", isCorrect: false },
              { text: "Passive recon requires physical access to servers", isCorrect: false },
              { text: "Active recon only works on Windows machines", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: OWASP Top 10 Vulnerabilities Exploitation",
        lessons: [
          { title: "SQL Injection: Union-Based, Blind & Error-Based Exploits", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1400 },
          { title: "Cross-Site Scripting (XSS): Stored, Reflected & DOM-Based Payloads", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1300 },
          { title: "Server-Side Request Forgery (SSRF) & Insecure Direct Object References (IDOR)", contentType: "article", contentUrl: "https://portswigger.net/web-security", durationSec: 800 }
        ],
        taskTitle: "Exploit Lab: Bypass Authentication using SQL Injection & IDOR",
        taskDescription: "Exploit vulnerable lab endpoints to extract database version and access unauthorized user profiles.",
        quizTitle: "Quiz: Web Vulnerabilities Exploitation",
        questions: [
          {
            prompt: "What is an IDOR (Insecure Direct Object Reference) vulnerability?",
            options: [
              { text: "When an application provides direct access to objects based on user-supplied input without access control validation", isCorrect: true },
              { text: "When an image file fails to load on a webpage", isCorrect: false },
              { text: "A hardware defect in the server power supply", isCorrect: false },
              { text: "An error in the CSS stylesheet", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: API Security, Privilege Escalation & Bug Bounty Reporting",
        lessons: [
          { title: "Hacking Modern REST & GraphQL APIs: JWT Manipulation & Mass Assignment", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1450 },
          { title: "Automated Fuzzing with ffuf & Writing Proof-of-Concept Scripts", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1250 },
          { title: "Writing High-Impact Bug Bounty Vulnerability Reports for HackerOne", contentType: "article", contentUrl: "https://hackerone.com", durationSec: 750 }
        ],
        taskTitle: "Capstone: Complete Black-Box Web Application Penetration Test",
        taskDescription: "Conduct comprehensive penetration test on isolated test environment and author CVSS-scored executive report.",
        quizTitle: "Quiz: API Security & Remediation",
        questions: [
          {
            prompt: "What is the most effective architectural defense against SQL Injection?",
            options: [
              { text: "Using Parameterized Queries (Prepared Statements) with an ORM/ODM", isCorrect: true },
              { text: "Blacklisting the word 'SELECT' in inputs", isCorrect: false },
              { text: "Encrypting the database hard drive", isCorrect: false },
              { text: "Hiding the database port number", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Cybersecurity",
    title: "SOC Analyst & Threat Intelligence: Wireshark & SIEM Defense",
    slug: "soc-analyst-threat-intelligence-wireshark-siem",
    description: "Defensive security operations: network traffic analysis with Wireshark, SIEM alert investigation (Splunk), threat hunting, and incident response.",
    price: 2800,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=inWWhr5tnEA",
    tags: ["SOC", "Wireshark", "SIEM", "Splunk", "Threat Hunting"],
    noOfStudents: 320,
    badgeTitle: "Problem Solver",
    modules: [
      {
        title: "Module 1: Network Traffic Analysis & Packet Inspection with Wireshark",
        lessons: [
          { title: "Analyzing TCP 3-Way Handshakes, DNS Queries & HTTP Headers in PCAPs", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1250 },
          { title: "Detecting Port Scans, ARP Spoofing & Data Exfiltration in Network Traces", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1350 },
          { title: "Wireshark Display Filters Reference & Protocol Anomaly Detection", contentType: "pdf", contentUrl: "https://www.wireshark.org", durationSec: 500 }
        ],
        taskTitle: "PCAP Lab: Investigate Malware Infection from Network Dump",
        taskDescription: "Identify C2 IP addresses, exfiltrated credentials, and infected host machine from captured packet dump.",
        quizTitle: "Quiz: Wireshark Packet Inspection",
        questions: [
          {
            prompt: "What TCP flag combination indicates a connection termination request?",
            options: [
              { text: "FIN / ACK", isCorrect: true },
              { text: "SYN / ACK", isCorrect: false },
              { text: "RST / SYN", isCorrect: false },
              { text: "URG / PSH", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: SIEM Operations & Log Investigation with Splunk",
        lessons: [
          { title: "Splunk Search Processing Language (SPL) for Security Triage", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1300 },
          { title: "Correlating Windows Event Logs (Event ID 4624, 4625, 4688) for Breaches", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1450 },
          { title: "MITRE ATT&CK Framework Mapping & Threat Intelligence Feeds", contentType: "article", contentUrl: "https://attack.mitre.org", durationSec: 700 }
        ],
        taskTitle: "SOC Task: Detect Brute Force and Privilege Escalation in Splunk",
        taskDescription: "Write SPL queries alerting on >10 failed logins followed by successful admin logon.",
        quizTitle: "Quiz: Windows Logs & SIEM Detection",
        questions: [
          {
            prompt: "In Windows Security Event Logs, which Event ID indicates an unsuccessful account logon attempt?",
            options: [
              { text: "Event ID 4625", isCorrect: true },
              { text: "Event ID 4624", isCorrect: false },
              { text: "Event ID 1102", isCorrect: false },
              { text: "Event ID 7045", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Incident Response Lifecycle & Digital Forensics",
        lessons: [
          { title: "NIST Incident Response Phases: Preparation, Detection, Containment & Recovery", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1400 },
          { title: "Live System Forensics: RAM Dumping, Process Trees & Persistence Mechanisms", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1350 },
          { title: "Authoring Professional Post-Incident Root Cause Analysis (RCA) Reports", contentType: "article", contentUrl: "https://csrc.nist.gov", durationSec: 800 }
        ],
        taskTitle: "Capstone: Simulated Ransomware Containment & Forensics Investigation",
        taskDescription: "Isolate compromised virtual machine, dump memory, identify persistence registry keys, and remediate.",
        quizTitle: "Quiz: Incident Response Framework",
        questions: [
          {
            prompt: "According to NIST SP 800-61, what is the immediate priority once an active intrusion is verified?",
            options: [
              { text: "Containment to prevent further spread and damage", isCorrect: true },
              { text: "Deleting all log files", isCorrect: false },
              { text: "Contacting the media immediately", isCorrect: false },
              { text: "Formatting all company computers", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Cybersecurity",
    title: "Network Security, Firewalls & Zero Trust Architecture",
    slug: "network-security-firewalls-zero-trust-architecture",
    description: "Enterprise defensive networking: pfSense firewalls, IDS/IPS (Snort/Suricata), VPN tunnel encryption, and Zero Trust security principles.",
    price: 2200,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
    tags: ["Network Security", "Zero Trust", "Firewalls", "VPN", "Cybersecurity"],
    noOfStudents: 300,
    badgeTitle: "Problem Solver",
    modules: [
      {
        title: "Module 1: Enterprise Firewall Architecture & pfSense Setup",
        lessons: [
          { title: "Stateful Packet Inspection vs Next-Gen Application Firewalls", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1100 },
          { title: "Configuring pfSense: Rule Hierarchies, DMZs & NAT Forwarding", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1250 },
          { title: "Enterprise DMZ Architecture & Internal Segmentation Blueprint", contentType: "pdf", contentUrl: "https://www.pfsense.org", durationSec: 600 }
        ],
        taskTitle: "Firewall Lab: Configure DMZ and Segregated Guest VLAN on pfSense",
        taskDescription: "Create isolated network zones preventing guest WiFi from communicating with internal database servers.",
        quizTitle: "Quiz: Firewall Rules & NAT",
        questions: [
          {
            prompt: "In firewall rules, which policy should always serve as the final default catch-all rule?",
            options: [
              { text: "Implicit Deny All / Drop All", isCorrect: true },
              { text: "Permit All Traffic", isCorrect: false },
              { text: "Forward to DNS server", isCorrect: false },
              { text: "Broadcast to all subnets", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Intrusion Detection & Prevention (IDS/IPS) with Snort",
        lessons: [
          { title: "Signature-Based vs Anomaly-Based Intrusion Detection Systems", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1300 },
          { title: "Writing Custom Snort Rules to Block Malicious Web Exploits", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1350 },
          { title: "Evasion Techniques: Fragmentation, Encryption & How to Counter Them", contentType: "article", contentUrl: "https://www.snort.org", durationSec: 650 }
        ],
        taskTitle: "Snort Lab: Author Custom Rule to Detect SQL Injection in HTTP Traffic",
        taskDescription: "Write rule detecting keywords like 'UNION SELECT' inside HTTP GET requests and trigger drop alerts.",
        quizTitle: "Quiz: Intrusion Detection Systems",
        questions: [
          {
            prompt: "What is the difference between an IDS and an IPS?",
            options: [
              { text: "An IDS alerts on suspicious traffic; an IPS sits in-line and actively blocks/drops malicious packets", isCorrect: true },
              { text: "An IDS is hardware; an IPS is only software", isCorrect: false },
              { text: "An IPS cannot inspect IP addresses", isCorrect: false },
              { text: "They are completely identical acronyms", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Zero Trust Architecture & Encrypted Tunnels",
        lessons: [
          { title: "The Zero Trust Tenet: 'Never Trust, Always Verify' Architecture", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1400 },
          { title: "Site-to-Site & Remote Access VPNs with WireGuard & OpenVPN", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1300 },
          { title: "Micro-Segmentation, Identity-Aware Proxies & Software-Defined Perimeters", contentType: "article", contentUrl: "https://csrc.nist.gov", durationSec: 750 }
        ],
        taskTitle: "Capstone: Deploy High-Performance WireGuard VPN with Multi-Factor Auth",
        taskDescription: "Configure modern WireGuard encrypted VPN server with client certificate authentication.",
        quizTitle: "Quiz: Zero Trust Principles",
        questions: [
          {
            prompt: "What is the core assumption of the Zero Trust Security model?",
            options: [
              { text: "Threats exist both outside and inside the network; no user or device is trusted implicitly by location", isCorrect: true },
              { text: "All employees inside the physical building can be trusted completely", isCorrect: false },
              { text: "Firewalls are no longer needed", isCorrect: false },
              { text: "Passwords should be disabled entirely", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Cybersecurity",
    title: "Cybersecurity Essentials & Safe Digital Citizenship",
    slug: "cybersecurity-essentials-safe-digital-citizenship",
    description: "Foundational cybersecurity: passwords, MFA/2FA, phishing detection, malware defense, social engineering, Wi-Fi security, and safe digital practices.",
    price: 0,
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=inWWhr5tnEA",
    tags: ["Cybersecurity", "Online Safety", "Beginner", "Privacy", "Security Awareness"],
    noOfStudents: 680,
    badgeTitle: "Quick Starter",
    modules: [
      {
        title: "Module 1: Password Security, Multi-Factor Auth & Identity Protection",
        lessons: [
          { title: "Password Entropy, Password Managers & Why Passwords Fail", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 800 },
          { title: "2FA / MFA: Authenticator Apps vs SMS vs Hardware Security Keys", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 950 },
          { title: "Personal Digital Security Audit Checklist & Password Vault Guide", contentType: "pdf", contentUrl: "https://www.cisa.gov", durationSec: 450 }
        ],
        taskTitle: "Security Challenge: Configure Hardware/App-Based MFA on All Accounts",
        taskDescription: "Audit your online footprint, enable authenticator 2FA, and store backup codes safely.",
        quizTitle: "Quiz: Authentication & Identity Safety",
        questions: [
          {
            prompt: "Why is SMS-based two-factor authentication considered less secure than Authenticator Apps or FIDO keys?",
            options: [
              { text: "SMS is vulnerable to SIM Swapping attacks and SS7 interception", isCorrect: true },
              { text: "SMS uses too much cellular data", isCorrect: false },
              { text: "SMS does not work on smartphones", isCorrect: false },
              { text: "SMS messages cannot be received abroad", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Spotting Phishing, Smishing & Social Engineering",
        lessons: [
          { title: "Anatomy of a Phishing Email: Deceptive Headers, Spoofed Domains & Links", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 900 },
          { title: "Social Engineering Tactics: Urgency, Authority & Pretexting Scams", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 950 },
          { title: "How to Safely Inspect Links & Email Headers Without Getting Compromised", contentType: "article", contentUrl: "https://krebsonsecurity.com", durationSec: 600 }
        ],
        taskTitle: "Practical Task: Analyze 5 Suspicious Emails in Safe Sandbox",
        taskDescription: "Inspect SPF, DKIM, DMARC records and uncover hidden redirect URLs without executing payloads.",
        quizTitle: "Quiz: Phishing Recognition",
        questions: [
          {
            prompt: "What is the safest immediate action when receiving an urgent email asking to verify account credentials?",
            options: [
              { text: "Never click links in the email; manually navigate to the official website via your browser bookmark", isCorrect: true },
              { text: "Click the link quickly to verify before the deadline", isCorrect: false },
              { text: "Reply to the email with your password", isCorrect: false },
              { text: "Forward the email to all your friends", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Wi-Fi Safety, Device Encryption & Safe Browsing",
        lessons: [
          { title: "Public Wi-Fi Dangers: Evil Twin APs, Man-in-the-Middle & VPN Defense", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1000 },
          { title: "Full Disk Encryption: BitLocker, FileVault & Encrypted Cloud Storage", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1100 },
          { title: "Browser Security Settings, Ad Blockers & DNS-over-HTTPS Protection", contentType: "article", contentUrl: "https://eff.org", durationSec: 650 }
        ],
        taskTitle: "Final Project: Implement Complete Endpoint Hardening on Your PC",
        taskDescription: "Enable full-disk encryption, configure encrypted DNS, and disable risky automated remote services.",
        quizTitle: "Quiz: Network & Endpoint Hygiene",
        questions: [
          {
            prompt: "What does HTTPS ensure between your browser and the website server?",
            options: [
              { text: "Encryption in transit and verification of server identity, preventing eavesdropping on network traffic", isCorrect: true },
              { text: "Guarantees the website has no viruses", isCorrect: false },
              { text: "Makes page downloads 10 times faster", isCorrect: false },
              { text: "Prevents ads from appearing", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 5. MOBILE APP DEVELOPMENT (4 COURSES)
  // =========================================================================
  {
    category: "Mobile App Development",
    title: "Cross-Platform Mobile App Development with Flutter & Dart",
    slug: "cross-platform-mobile-app-development-flutter-dart",
    description: "Build high-performance iOS and Android apps from a single codebase with Flutter 3, Dart, Clean Architecture, BLoC, and Firebase integration.",
    price: 3200,
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=x0uinJvhNxI",
    tags: ["Flutter", "Dart", "Mobile", "iOS", "Android"],
    noOfStudents: 490,
    badgeTitle: "Tech Virtuoso",
    modules: [
      {
        title: "Module 1: Dart OOP & Flutter Widget Tree Architecture",
        lessons: [
          { title: "Dart 3 Deep Dive: Pattern Matching, Records & Sound Null Safety", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI", durationSec: 1150 },
          { title: "Stateless vs Stateful Widgets: Lifecycle & Rendering Pipeline", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI", durationSec: 1300 },
          { title: "Visual Catalog: Essential Layout Widgets (Row, Column, Stack, ListView)", contentType: "pdf", contentUrl: "https://docs.flutter.dev", durationSec: 600 }
        ],
        taskTitle: "Flutter Lab: Build a Responsive Mobile Profile & Portfolio UI",
        taskDescription: "Create a multi-tab profile screen with custom app bars, slivers, and adaptive iOS/Android styling.",
        quizTitle: "Quiz: Flutter Widgets & Dart Language",
        questions: [
          {
            prompt: "What is the primary difference between a StatelessWidget and a StatefulWidget in Flutter?",
            options: [
              { text: "StatefulWidget maintains mutable state and can re-render when setState() is called; StatelessWidget is immutable", isCorrect: true },
              { text: "StatelessWidget only runs on Android", isCorrect: false },
              { text: "StatefulWidget cannot have child widgets", isCorrect: false },
              { text: "StatelessWidget takes more memory", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: BLoC State Management & Clean Architecture",
        lessons: [
          { title: "The BLoC Pattern: Events, States, Streams & Reactive Programming", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI", durationSec: 1400 },
          { title: "Separation of Concerns: Presentation, Domain & Data Layers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI", durationSec: 1350 },
          { title: "Dependency Injection with get_it & Error Handling with dartz/fpdart", contentType: "article", contentUrl: "https://bloclibrary.dev", durationSec: 700 }
        ],
        taskTitle: "Architecture Task: Refactor State to Clean BLoC Implementation",
        taskDescription: "Migrate an existing setState() counter application to robust BLoC pattern with unit testing.",
        quizTitle: "Quiz: BLoC State Management",
        questions: [
          {
            prompt: "In the BLoC pattern, how does the UI communicate user actions to the business logic?",
            options: [
              { text: "By adding Events to the BLoC sink", isCorrect: true },
              { text: "By calling global JavaScript functions", isCorrect: false },
              { text: "By directly modifying widget variables", isCorrect: false },
              { text: "By reloading the operating system", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Firebase Backend, Offline Caching & App Store Deployment",
        lessons: [
          { title: "Firebase Authentication, Cloud Firestore & Realtime Listeners", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI", durationSec: 1450 },
          { title: "Local Offline Data Persistence with Hive / Isar Database", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI", durationSec: 1250 },
          { title: "Google Play Store & Apple App Store Production Release Checklist", contentType: "article", contentUrl: "https://docs.flutter.dev/deployment", durationSec: 800 }
        ],
        taskTitle: "Capstone: Build an End-to-End E-Commerce App with Cloud Checkout",
        taskDescription: "Develop full mobile store app with product catalog, cart persistence, and Stripe/SSLCommerz payments.",
        quizTitle: "Quiz: Flutter Deployment & Native APIs",
        questions: [
          {
            prompt: "Which command builds a production-ready optimized Android App Bundle in Flutter?",
            options: [
              { text: "flutter build appbundle", isCorrect: true },
              { text: "flutter run --debug", isCorrect: false },
              { text: "flutter test --release", isCorrect: false },
              { text: "flutter compile native", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Mobile App Development",
    title: "React Native & Expo: Build iOS & Android Mobile Apps",
    slug: "react-native-expo-build-ios-android-apps",
    description: "Build cross-platform mobile apps using React Native, Expo Router, NativeWind, TypeScript, gesture animations, and native device APIs.",
    price: 2900,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
    tags: ["React Native", "Expo", "Mobile App", "iOS", "Android"],
    noOfStudents: 370,
    badgeTitle: "Master Architect",
    modules: [
      {
        title: "Module 1: Expo Setup, Core Components & NativeWind Styling",
        lessons: [
          { title: "Expo Router File-Based Routing & Native Navigation Stacks", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc", durationSec: 1100 },
          { title: "Core Mobile Components: View, Text, FlatList, Pressable & Modal", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc", durationSec: 1250 },
          { title: "Styling React Native with NativeWind (Tailwind CSS for Mobile)", contentType: "pdf", contentUrl: "https://docs.expo.dev", durationSec: 550 }
        ],
        taskTitle: "Mobile Task: Build an Instagram-Style Feed with Infinite Scroll",
        taskDescription: "Create a smooth FlatList feed with virtualized rendering, pull-to-refresh, and like animations.",
        quizTitle: "Quiz: React Native Core Components",
        questions: [
          {
            prompt: "Why should FlatList be used instead of ScrollView for long lists of dynamic data?",
            options: [
              { text: "FlatList only renders items currently visible on screen (lazy rendering), preserving memory", isCorrect: true },
              { text: "ScrollView does not support text", isCorrect: false },
              { text: "FlatList automatically uploads data to the cloud", isCorrect: false },
              { text: "ScrollView cannot be styled with CSS", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Native Device APIs: Camera, Geolocation & Notifications",
        lessons: [
          { title: "Accessing Camera & Photo Library with expo-camera & expo-image-picker", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc", durationSec: 1300 },
          { title: "GPS Tracking & Interactive Maps with expo-location & react-native-maps", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc", durationSec: 1400 },
          { title: "Local & Push Notifications Setup with Expo Notifications Service", contentType: "article", contentUrl: "https://docs.expo.dev/versions/latest/sdk/notifications/", durationSec: 700 }
        ],
        taskTitle: "Device Lab: Implement Real-Time Delivery Tracking with Maps & GPS",
        taskDescription: "Track device GPS coordinates and render a real-time driver marker with route polyline on MapView.",
        quizTitle: "Quiz: Native Mobile APIs",
        questions: [
          {
            prompt: "What must mobile apps always request before accessing the device camera or location?",
            options: [
              { text: "Explicit Runtime Permissions from the user", isCorrect: true },
              { text: "Credit card payment approval", isCorrect: false },
              { text: "Apple Developer account login", isCorrect: false },
              { text: "A physical SIM card restart", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: Smooth Gestures, Reanimated & App Store Builds (EAS)",
        lessons: [
          { title: "60fps Gesture Animations with React Native Reanimated & Gesture Handler", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc", durationSec: 1450 },
          { title: "State Management with Zustand & Offline Persistence with AsyncStorage", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc", durationSec: 1200 },
          { title: "Cloud Builds & OTA Updates with Expo Application Services (EAS Build)", contentType: "article", contentUrl: "https://expo.dev/eas", durationSec: 800 }
        ],
        taskTitle: "Capstone: Deploy React Native Mobile App via EAS Build",
        taskDescription: "Configure eas.json, generate production Android APK and iOS ipa binary builds in the cloud.",
        quizTitle: "Quiz: EAS Build & Native Performance",
        questions: [
          {
            prompt: "What does React Native Reanimated do to achieve silky 60fps animations?",
            options: [
              { text: "Runs animation calculations directly on the UI thread, bypassing the JavaScript bridge bottleneck", isCorrect: true },
              { text: "Increases screen refresh rate automatically", isCorrect: false },
              { text: "Lowers image resolution to 240p", isCorrect: false },
              { text: "Turns off mobile Wi-Fi", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Mobile App Development",
    title: "Modern Android Development with Kotlin & Jetpack Compose",
    slug: "modern-android-development-kotlin-jetpack-compose",
    description: "Native Android development: Kotlin coroutines, declarative UI with Jetpack Compose, MVVM clean architecture, Room database, and Retrofit.",
    price: 2500,
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=fis26HvvDII",
    tags: ["Android", "Kotlin", "Jetpack Compose", "Mobile", "MVVM"],
    noOfStudents: 280,
    badgeTitle: "Code Explorer",
    modules: [
      {
        title: "Module 1: Kotlin Concurrency, Coroutines & Flow",
        lessons: [
          { title: "Kotlin OOP, Extension Functions & Null Safety Operator (?.)", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=fis26HvvDII", durationSec: 1100 },
          { title: "Asynchronous Kotlin with Coroutines: Suspend Functions, Dispatchers & Jobs", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=fis26HvvDII", durationSec: 1300 },
          { title: "Kotlin Standard Library Reference & Functional Programming Best Practices", contentType: "pdf", contentUrl: "https://kotlinlang.org/docs", durationSec: 550 }
        ],
        taskTitle: "Kotlin Lab: Implement Async Data Fetching with Coroutine Exception Handling",
        taskDescription: "Fetch remote JSON data concurrently using async/await and Dispatchers.IO safely.",
        quizTitle: "Quiz: Kotlin Language & Coroutines",
        questions: [
          {
            prompt: "Which Coroutine Dispatcher is optimized for disk I/O and network operations in Android?",
            options: [
              { text: "Dispatchers.IO", isCorrect: true },
              { text: "Dispatchers.Main", isCorrect: false },
              { text: "Dispatchers.Unconfined", isCorrect: false },
              { text: "Dispatchers.Default only", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Declarative UI Design with Jetpack Compose",
        lessons: [
          { title: "Composable Functions, State Hoisting & Recomposition Optimization", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=fis26HvvDII", durationSec: 1350 },
          { title: "Material 3 Design System, Themes, Typography & Dynamic Colors", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=fis26HvvDII", durationSec: 1250 },
          { title: "Managing Navigation in Compose with Navigation Compose & Type-Safe Routes", contentType: "article", contentUrl: "https://developer.android.com/jetpack/compose", durationSec: 700 }
        ],
        taskTitle: "Compose Task: Build an Interactive Material 3 Dashboard",
        taskDescription: "Create a multi-screen app with LazyColumn, card animations, and dynamic theme switching.",
        quizTitle: "Quiz: Jetpack Compose Recomposition",
        questions: [
          {
            prompt: "What happens during 'Recomposition' in Jetpack Compose?",
            options: [
              { text: "Compose re-executes only the composable functions whose state has changed to update the UI", isCorrect: true },
              { text: "The entire Android application restarts from the launcher", isCorrect: false },
              { text: "The phone screen turns off", isCorrect: false },
              { text: "All XML layouts are regenerated", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: MVVM Architecture, Room Database & Retrofit Networking",
        lessons: [
          { title: "ViewModel & StateFlow: Preserving State Across Configuration Changes", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=fis26HvvDII", durationSec: 1400 },
          { title: "Local SQLite Storage with Room: Entities, DAOs & TypeConverters", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=fis26HvvDII", durationSec: 1450 },
          { title: "Publishing to Google Play Console: App Bundles, Proguard & Signing Keys", contentType: "article", contentUrl: "https://developer.android.com", durationSec: 800 }
        ],
        taskTitle: "Capstone: Build Offline-First News Reader with Room & Retrofit",
        taskDescription: "Implement repository pattern syncing remote API articles to local Room database for offline reading.",
        quizTitle: "Quiz: Android Architecture & Room",
        questions: [
          {
            prompt: "Why should UI state be held in an Android ViewModel instead of directly inside the Activity?",
            options: [
              { text: "ViewModels survive configuration changes (such as screen rotation) without losing data", isCorrect: true },
              { text: "Activities cannot run Kotlin code", isCorrect: false },
              { text: "ViewModels are required to make HTTP requests", isCorrect: false },
              { text: "ViewModels speed up internet bandwidth", isCorrect: false }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Mobile App Development",
    title: "iOS App Development with Swift 6 & SwiftUI",
    slug: "ios-app-development-swift-6-swiftui",
    description: "Modern native iOS development: Swift 6 concurrency, SwiftUI declarative views, NavigationStack, SwiftData persistence, and TestFlight deployment.",
    price: 3400,
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=comQ1-x2a1Q",
    tags: ["iOS", "Swift", "SwiftUI", "Apple", "Mobile"],
    noOfStudents: 310,
    badgeTitle: "Tech Virtuoso",
    modules: [
      {
        title: "Module 1: Swift 6 Language Essentials & Modern Syntax",
        lessons: [
          { title: "Optionas, Nil Coalescing, Enums with Associated Values & Structs", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=comQ1-x2a1Q", durationSec: 1150 },
          { title: "Swift 6 Concurrency: async/await, Actors & Structured Task Groups", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=comQ1-x2a1Q", durationSec: 1300 },
          { title: "Protocol-Oriented Programming (POP) vs Classical Object-Oriented Design", contentType: "pdf", contentUrl: "https://docs.swift.org", durationSec: 550 }
        ],
        taskTitle: "Swift Lab: Implement Thread-Safe Cache with Swift Actor",
        taskDescription: "Protect shared mutable state against data races using Swift 6 actor model and async operations.",
        quizTitle: "Quiz: Swift 6 Concurrency & Actors",
        questions: [
          {
            prompt: "What is the primary purpose of an 'actor' in Swift 6?",
            options: [
              { text: "Protects its mutable state by ensuring only one task can access its properties at any given time", isCorrect: true },
              { text: "Plays video files on the screen", isCorrect: false },
              { text: "Acts as a database driver for SQL", isCorrect: false },
              { text: "Animates buttons", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 2: Declarative UI Design with SwiftUI",
        lessons: [
          { title: "View Composition, Layout Modifiers & GeometryReader", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=comQ1-x2a1Q", durationSec: 1300 },
          { title: "State Management: @State, @Binding, @Observable macro & @Environment", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=comQ1-x2a1Q", durationSec: 1400 },
          { title: "Fluid Native Animations, Transitions & MatchedGeometryEffect", contentType: "article", contentUrl: "https://developer.apple.com/xcode/swiftui/", durationSec: 650 }
        ],
        taskTitle: "SwiftUI Task: Build an Apple Fitness-Style Activity Tracker Interface",
        taskDescription: "Design ring progress charts, smooth spring animations, and card expansion with matchedGeometryEffect.",
        quizTitle: "Quiz: SwiftUI State & Lifecycle",
        questions: [
          {
            prompt: "Which macro introduced in modern Swift replaces ObservableObject for clean reactive state management?",
            options: [
              { text: "@Observable", isCorrect: true },
              { text: "@Reactive", isCorrect: false },
              { text: "@ModelView", isCorrect: false },
              { text: "@Stateful", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Module 3: SwiftData Persistence & App Store Distribution",
        lessons: [
          { title: "Seamless Local Data Storage with SwiftData: @Model & ModelContext", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=comQ1-x2a1Q", durationSec: 1450 },
          { title: "URLSession Networking with Codable JSON Serialization", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=comQ1-x2a1Q", durationSec: 1250 },
          { title: "App Store Connect, TestFlight Beta Testing & Apple Review Guidelines", contentType: "article", contentUrl: "https://developer.apple.com/app-store/", durationSec: 800 }
        ],
        taskTitle: "Capstone: Build Complete Personal Finance Tracker for iOS",
        taskDescription: "Implement expense management with SwiftData persistent storage, category filters, and chart summaries.",
        quizTitle: "Quiz: SwiftData & App Store Connect",
        questions: [
          {
            prompt: "What is SwiftData designed to replace in modern iOS development?",
            options: [
              { text: "Core Data", isCorrect: true },
              { text: "SwiftUI", isCorrect: false },
              { text: "Xcode", isCorrect: false },
              { text: "CocoaPods", isCorrect: false }
            ]
          }
        ]
      }
    ]
  }
];

// ================= SEED RUNNER =================
async function seedAll() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(DB_URL);
  console.log("Connected successfully.");

  // 1. Get Instructor
  const instructor =
    (await mongoose.connection.collection("users").findOne({ role: "INSTRUCTOR" })) ||
    (await mongoose.connection.collection("users").findOne({ role: "SUPER_ADMIN" }));
  if (!instructor) {
    throw new Error("No instructor found in database!");
  }
  console.log(`Using instructor: ${instructor.name} (ID: ${instructor._id})`);

  // 2. Get Badges mapping
  const badges = await mongoose.connection.collection("badges").find().toArray();
  const badgeMap = {};
  for (const b of badges) {
    badgeMap[b.title] = b._id;
  }

  // 3. Ensure all 5 categories exist in CourseCategory
  const distinctCategories = [
    "Web Development",
    "Artificial Intelligence",
    "Cloud & DevOps",
    "Cybersecurity",
    "Mobile App Development",
  ];

  for (const catTitle of distinctCategories) {
    const existingCat = await mongoose.connection.collection("coursecategories").findOne({ title: catTitle });
    if (!existingCat) {
      await mongoose.connection.collection("coursecategories").insertOne({
        title: catTitle,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created category: ${catTitle}`);
    }
  }

  console.log(`\nStarting to seed/update 20 courses (4 per category)...`);

  let coursesCreated = 0;
  let coursesUpdated = 0;
  let totalUnits = 0;
  let totalLessons = 0;
  let totalTasks = 0;
  let totalQuizzes = 0;

  for (const courseData of COURSES_DATA) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing: "${courseData.title}" [${courseData.category}]`);

    const awardBadgeId = badgeMap[courseData.badgeTitle] || badges[0]?._id;

    // Check if course already exists by slug or title
    let course = await Course.findOne({
      $or: [{ slug: courseData.slug }, { title: courseData.title }],
    });

    if (!course) {
      course = await Course.create({
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        price: courseData.price,
        level: courseData.level,
        category: courseData.category,
        thumbnail: courseData.thumbnail,
        introVideo: courseData.introVideo,
        tags: courseData.tags,
        instructor: instructor._id,
        status: "published",
        noOfStudents: courseData.noOfStudents || Math.floor(100 + Math.random() * 400),
        isDeleted: false,
        awardOnComplete: awardBadgeId,
      });
      coursesCreated++;
      console.log(`+ Created Course: "${course.title}" (${course._id})`);
    } else {
      // Update existing course metadata to ensure proper status & category
      course.category = courseData.category;
      course.thumbnail = courseData.thumbnail;
      course.introVideo = courseData.introVideo;
      course.status = "published";
      course.isDeleted = false;
      course.price = courseData.price;
      course.level = courseData.level;
      if (awardBadgeId) course.awardOnComplete = awardBadgeId;
      await course.save();
      coursesUpdated++;
      console.log(`~ Updated Course: "${course.title}" (${course._id})`);
    }

    // Now seed Modules (Units), Lessons, Tasks & Quizzes
    let unitOrder = 1;
    for (const modData of courseData.modules) {
      // Check if unit exists
      let unit = await Unit.findOne({
        course: course._id,
        title: modData.title,
        isDeleted: false,
      });

      if (!unit) {
        unit = await Unit.create({
          course: course._id,
          title: modData.title,
          orderIndex: unitOrder++,
          isDeleted: false,
        });
      }
      totalUnits++;

      // Lessons
      let lessonOrder = 1;
      for (const lesData of modData.lessons) {
        const existingLesson = await Lesson.findOne({
          unit: unit._id,
          title: lesData.title,
          isDeleted: false,
        });

        if (!existingLesson) {
          await Lesson.create({
            unit: unit._id,
            title: lesData.title,
            contentType: lesData.contentType,
            contentUrl: lesData.contentUrl,
            durationSec: lesData.durationSec || 600,
            orderIndex: lessonOrder++,
            isDeleted: false,
          });
        }
        totalLessons++;
      }

      // Task & Quiz
      let task = await Task.findOne({
        course: course._id,
        unit: unit._id,
        title: modData.taskTitle,
        isDeleted: false,
      });

      if (!task) {
        task = await Task.create({
          course: course._id,
          unit: unit._id,
          title: modData.taskTitle,
          description: modData.taskDescription,
          type: "quiz",
          maxPoints: modData.questions.length * 10,
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          isDeleted: false,
        });
      }
      totalTasks++;

      // Quiz linked to this task
      let quiz = await Quiz.findOne({
        course: course._id,
        unit: unit._id,
        title: modData.quizTitle,
        isDeleted: false,
      });

      if (!quiz) {
        quiz = await Quiz.create({
          unit: unit._id,
          course: course._id,
          task: task._id,
          title: modData.quizTitle,
          questions: modData.questions.map((q) => ({
            type: "mcq",
            prompt: q.prompt,
            options: q.options,
            perCorrectPoint: 10,
          })),
          passMark: 70,
          isDeleted: false,
        });
      }
      totalQuizzes++;

      // Connect task to quiz
      if (!task.quizId || task.quizId.toString() !== quiz._id.toString()) {
        task.quizId = quiz._id;
        await task.save();
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`SEEDING COMPLETED SUCCESSFULLY! 🎉`);
  console.log(`- New Courses Created: ${coursesCreated}`);
  console.log(`- Courses Updated/Refreshed: ${coursesUpdated}`);
  console.log(`- Total Modules (Units) Seeded: ${totalUnits}`);
  console.log(`- Total Lessons Seeded: ${totalLessons}`);
  console.log(`- Total Tasks Seeded: ${totalTasks}`);
  console.log(`- Total MCQ Quizzes Seeded: ${totalQuizzes}`);
  console.log(`==================================================\n`);

  await mongoose.disconnect();
}

seedAll().catch((err) => {
  console.error("FATAL SEED ERROR:", err);
  process.exit(1);
});
