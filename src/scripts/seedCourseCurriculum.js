const mongoose = require("mongoose");
require("dotenv").config();

const DB_URL = process.env.DB_URL;

const CourseSchema = new mongoose.Schema({
  title: String,
  slug: String,
  category: String,
  isDeleted: Boolean,
}, { strict: false });

const UnitSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  orderIndex: { type: Number, required: true, default: 1 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  title: { type: String, required: true },
  contentType: {
    type: String,
    enum: ["video", "article", "pdf", "audio", "link"],
    required: true,
  },
  contentUrl: { type: String, required: true },
  durationSec: { type: Number },
  orderIndex: { type: Number, required: true, default: 1 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["quiz", "video", "pdf"], required: true },
  maxPoints: Number,
  dueDate: Date,
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const QuizSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  title: { type: String, required: true },
  questions: [{
    type: { type: String, enum: ["mcq", "short"], required: true },
    prompt: { type: String, required: true },
    options: [{ text: String, isCorrect: Boolean }],
    perCorrectPoint: Number,
  }],
  passMark: { type: Number, default: 50 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);
const Unit = mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);

const coursesCurriculumData = [
  {
    // 1. Flutter & Dart
    courseQuery: { title: /Flutter & Dart/i },
    modules: [
      {
        title: "Module 1: Dart Language & Reactive UI Foundations",
        orderIndex: 1,
        lessons: [
          {
            title: "Dart 3 Fundamentals: OOP, Null Safety & Pattern Matching",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/Ej_Pcr4uC2Q",
            durationSec: 1380, // 23 mins
            orderIndex: 1,
          },
          {
            title: "Dart Language Cheatsheet & Asynchronous Programming Guide.pdf",
            contentType: "pdf",
            contentUrl: "https://dart.dev/guides/language/cheatsheet.pdf",
            durationSec: 420, // 7 mins read
            orderIndex: 2,
          },
          {
            title: "Audio Lecture: The Philosophy of Reactive Declarative UI in Flutter",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            durationSec: 660, // 11 mins
            orderIndex: 3,
          },
          {
            title: "Setting up Flutter SDK, Android Studio & VS Code Extensions",
            contentType: "article",
            contentUrl: "https://docs.flutter.dev/get-started/install",
            durationSec: 360,
            orderIndex: 4,
          },
        ],
        quiz: {
          title: "Dart Syntax & OOP Mastery Quiz",
          questions: [
            {
              type: "mcq",
              prompt: "What keyword is used in Dart to denote that a variable cannot be null?",
              options: [
                { text: "required", isCorrect: false },
                { text: "nonnull", isCorrect: false },
                { text: "Using type without '?' (e.g. String vs String?)", isCorrect: true },
                { text: "final!", isCorrect: false },
              ],
              perCorrectPoint: 10,
            },
            {
              type: "mcq",
              prompt: "Which widget is the root of most Material Design Flutter apps?",
              options: [
                { text: "Scaffold", isCorrect: false },
                { text: "MaterialApp", isCorrect: true },
                { text: "Container", isCorrect: false },
                { text: "Center", isCorrect: false },
              ],
              perCorrectPoint: 10,
            },
          ],
        },
      },
      {
        title: "Module 2: Widget Architecture & Responsive Layouts",
        orderIndex: 2,
        lessons: [
          {
            title: "Building Pixel-Perfect Layouts with Flex, Column, Row & Stack",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/1gDhl4leEzA",
            durationSec: 1620, // 27 mins
            orderIndex: 1,
          },
          {
            title: "StatelessWidget vs StatefulWidget Lifecycle Deep Dive",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/AqCMFXEmf3w",
            durationSec: 1200, // 20 mins
            orderIndex: 2,
          },
          {
            title: "Flutter Responsive Design Guidelines & Breakpoints.pdf",
            contentType: "pdf",
            contentUrl: "https://docs.flutter.dev/ui/layout",
            durationSec: 480,
            orderIndex: 3,
          },
          {
            title: "Audio Podcast: Managing Complexity in Deep Flutter Widget Trees",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            durationSec: 720,
            orderIndex: 4,
          },
        ],
      },
      {
        title: "Module 3: Advanced State Management (BLoC & Riverpod)",
        orderIndex: 3,
        lessons: [
          {
            title: "Mastering the BLoC Pattern with Streams & Event Transformers",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/hTExXxx5Iwk",
            durationSec: 1950, // 32.5 mins
            orderIndex: 1,
          },
          {
            title: "State Management Architecture & Decision Matrix Blueprint.pdf",
            contentType: "pdf",
            contentUrl: "https://raw.githubusercontent.com/felangel/bloc/master/docs/architecture.pdf",
            durationSec: 360,
            orderIndex: 2,
          },
          {
            title: "Audio Discussion: Riverpod vs Bloc in Enterprise Flutter Apps",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            durationSec: 840,
            orderIndex: 3,
          },
        ],
      },
      {
        title: "Module 4: REST APIs, Offline Persistence & Store Deployment",
        orderIndex: 4,
        lessons: [
          {
            title: "Robust Networking with Dio: JWT Interceptors, Retries & Caching",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/8v_5m6s6dLE",
            durationSec: 1800, // 30 mins
            orderIndex: 1,
          },
          {
            title: "Local Database Storage with Hive & SQLite Integration",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/zKQy4x6A5Fk",
            durationSec: 1440,
            orderIndex: 2,
          },
          {
            title: "Google Play & Apple App Store Production Release Checklist.pdf",
            contentType: "pdf",
            contentUrl: "https://docs.flutter.dev/deployment/android",
            durationSec: 400,
            orderIndex: 3,
          },
        ],
      },
    ],
  },

  {
    // 2. Cybersecurity & Ethical Hacking
    courseQuery: { title: /Cybersecurity & Ethical Hacking/i },
    modules: [
      {
        title: "Module 1: Networking Protocols & Packet Analysis",
        orderIndex: 1,
        lessons: [
          {
            title: "TCP/IP Protocol Suite, OSI Model & Wireshark Packet Inspection",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/3Kq1MIfTWCE",
            durationSec: 1500, // 25 mins
            orderIndex: 1,
          },
          {
            title: "Wireshark Display Filters & Network Attack Signatures.pdf",
            contentType: "pdf",
            contentUrl: "https://www.wireshark.org/docs/dfref/",
            durationSec: 450,
            orderIndex: 2,
          },
          {
            title: "Audio Briefing: Anatomy of Zero-Day Exploits & Advanced Persistent Threats",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            durationSec: 780,
            orderIndex: 3,
          },
        ],
        quiz: {
          title: "Network Security & Protocol Analysis Quiz",
          questions: [
            {
              type: "mcq",
              prompt: "Which protocol is responsible for resolving IP addresses to MAC addresses?",
              options: [
                { text: "DNS", isCorrect: false },
                { text: "ARP", isCorrect: true },
                { text: "DHCP", isCorrect: false },
                { text: "ICMP", isCorrect: false },
              ],
              perCorrectPoint: 10,
            },
            {
              type: "mcq",
              prompt: "What is the standard port used for secure HTTPS traffic?",
              options: [
                { text: "80", isCorrect: false },
                { text: "8080", isCorrect: false },
                { text: "443", isCorrect: true },
                { text: "22", isCorrect: false },
              ],
              perCorrectPoint: 10,
            },
          ],
        },
      },
      {
        title: "Module 2: Reconnaissance, Port Scanning & Linux for Hackers",
        orderIndex: 2,
        lessons: [
          {
            title: "Nmap Advanced Scanning Techniques & NSE Vulnerability Scripts",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/4t4kBkMsDbQ",
            durationSec: 1650,
            orderIndex: 1,
          },
          {
            title: "Linux Command Line & Bash Automation for Penetration Testers",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/v_1zB2WwVls",
            durationSec: 1350,
            orderIndex: 2,
          },
          {
            title: "Penetration Testing Methodology & Scope of Work Framework.pdf",
            contentType: "pdf",
            contentUrl: "https://owasp.org/www-project-web-security-testing-guide/",
            durationSec: 400,
            orderIndex: 3,
          },
          {
            title: "Audio Guide: OPSEC & Staying Anonymous During Reconnaissance",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            durationSec: 600,
            orderIndex: 4,
          },
        ],
      },
      {
        title: "Module 3: Web Application Exploits (OWASP Top 10)",
        orderIndex: 3,
        lessons: [
          {
            title: "Hands-on SQL Injection (SQLi) & Cross-Site Scripting (XSS)",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/2_lswM1S264",
            durationSec: 1800,
            orderIndex: 1,
          },
          {
            title: "Server-Side Request Forgery (SSRF) & Broken Access Controls",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/q0_pZg0L41o",
            durationSec: 1500,
            orderIndex: 2,
          },
          {
            title: "OWASP Top 10 Security Vulnerabilities and Countermeasures Handbook.pdf",
            contentType: "pdf",
            contentUrl: "https://owasp.org/Top10/",
            durationSec: 500,
            orderIndex: 3,
          },
        ],
      },
      {
        title: "Module 4: Defensive Engineering & Incident Response",
        orderIndex: 4,
        lessons: [
          {
            title: "Configuring Firewalls, SIEM Alerting & Snort IDS/IPS",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/inWWhr5tnEA",
            durationSec: 1600,
            orderIndex: 1,
          },
          {
            title: "NIST Incident Handling & Digital Forensics Readiness Guide.pdf",
            contentType: "pdf",
            contentUrl: "https://csrc.nist.gov/pubs/sp/800/61/r2/final",
            durationSec: 420,
            orderIndex: 2,
          },
          {
            title: "Audio Debrief: Case Study on SolarWinds & Modern Supply Chain Attacks",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
            durationSec: 750,
            orderIndex: 3,
          },
        ],
      },
    ],
  },

  {
    // 3. Cloud DevOps Mastery
    courseQuery: { title: /Cloud DevOps/i },
    modules: [
      {
        title: "Module 1: Containerization with Docker Engine",
        orderIndex: 1,
        lessons: [
          {
            title: "Docker Architecture, Namespaces, Cgroups & Multi-Stage Builds",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/hQcFE0RD0cQ",
            durationSec: 1560,
            orderIndex: 1,
          },
          {
            title: "Docker CLI Commands & Production Dockerfile Best Practices.pdf",
            contentType: "pdf",
            contentUrl: "https://docs.docker.com/get-started/overview/",
            durationSec: 360,
            orderIndex: 2,
          },
          {
            title: "Audio Masterclass: Monolithic Architecture to Cloud Microservices",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
            durationSec: 690,
            orderIndex: 3,
          },
          {
            title: "Orchestrating Multi-Container Applications with Docker Compose",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/HG6yIjNapSA",
            durationSec: 1440,
            orderIndex: 4,
          },
        ],
        quiz: {
          title: "Docker Architecture & Containerization Quiz",
          questions: [
            {
              type: "mcq",
              prompt: "What is the primary benefit of multi-stage Docker builds?",
              options: [
                { text: "They make the build run twice as fast", isCorrect: false },
                { text: "They drastically reduce the final image size by excluding build tools", isCorrect: true },
                { text: "They allow running multiple containers from one Dockerfile", isCorrect: false },
                { text: "They automatically publish images to Docker Hub", isCorrect: false },
              ],
              perCorrectPoint: 10,
            },
            {
              type: "mcq",
              prompt: "Which Linux kernel feature provides process isolation for Docker containers?",
              options: [
                { text: "Namespaces and cgroups", isCorrect: true },
                { text: "iptables only", isCorrect: false },
                { text: "Hypervisor virtualization", isCorrect: false },
                { text: "Systemd init services", isCorrect: false },
              ],
              perCorrectPoint: 10,
            },
          ],
        },
      },
      {
        title: "Module 2: Kubernetes Cluster Orchestration",
        orderIndex: 2,
        lessons: [
          {
            title: "Kubernetes Core Architecture: Master Node, Worker Nodes, Etcd & Kubelet",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/X48VuDVv0do",
            durationSec: 1800,
            orderIndex: 1,
          },
          {
            title: "Managing Deployments, Services, ConfigMaps & Secrets in Production",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/8v_5m6s6dLE",
            durationSec: 1650,
            orderIndex: 2,
          },
          {
            title: "Kubectl Cheat Sheet & Manifest Reference Manual.pdf",
            contentType: "pdf",
            contentUrl: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/",
            durationSec: 420,
            orderIndex: 3,
          },
          {
            title: "Audio Lecture: Zero-Downtime Rolling Updates & Canary Deployments",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
            durationSec: 720,
            orderIndex: 4,
          },
        ],
      },
      {
        title: "Module 3: Infrastructure as Code (IaC) with Terraform",
        orderIndex: 3,
        lessons: [
          {
            title: "Automating AWS Cloud Infrastructure using Terraform & HCL",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/SLB_c_ayRMo",
            durationSec: 1850,
            orderIndex: 1,
          },
          {
            title: "Terraform State Management, Remote Backends & DynamoDB Locking.pdf",
            contentType: "pdf",
            contentUrl: "https://developer.hashicorp.com/terraform/docs",
            durationSec: 380,
            orderIndex: 2,
          },
          {
            title: "Modular Terraform Architecture for Multi-Environment Setups",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/YcTfR463p6E",
            durationSec: 1400,
            orderIndex: 3,
          },
        ],
      },
      {
        title: "Module 4: Enterprise CI/CD with GitHub Actions & ArgoCD",
        orderIndex: 4,
        lessons: [
          {
            title: "Designing Robust CI/CD Pipelines: Testing, Linting & Auto-Publishing",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/R8_veQiYBjI",
            durationSec: 1720,
            orderIndex: 1,
          },
          {
            title: "GitOps Workflows with ArgoCD & Kubernetes Helm Charts.pdf",
            contentType: "pdf",
            contentUrl: "https://helm.sh/docs/",
            durationSec: 390,
            orderIndex: 2,
          },
          {
            title: "Audio Podcast: Observability, Prometheus Metrics & Grafana Dashboards",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
            durationSec: 810,
            orderIndex: 3,
          },
        ],
      },
    ],
  },

  {
    // 4. Python, AI & Machine Learning
    courseQuery: { title: /Python.*AI/i },
    modules: [
      {
        title: "Module 1: Advanced Python & Scientific Computing",
        orderIndex: 1,
        lessons: [
          {
            title: "Modern Python 3.12: Functional Tools, Generators, Metaclasses & Typing",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/aircAruvnKk",
            durationSec: 1600,
            orderIndex: 1,
          },
          {
            title: "NumPy & Pandas High Performance Data Wrangling Manual.pdf",
            contentType: "pdf",
            contentUrl: "https://pandas.pydata.org/docs/",
            durationSec: 420,
            orderIndex: 2,
          },
          {
            title: "Audio Lecture: Mathematical Intuition Behind Vectors & Matrix Multiplications",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
            durationSec: 660,
            orderIndex: 3,
          },
          {
            title: "Exploratory Data Analysis (EDA) & Visualizations with Seaborn",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/r-uOLxNrNk8",
            durationSec: 1450,
            orderIndex: 4,
          },
        ],
        quiz: {
          title: "Python Data Science Foundations Quiz",
          questions: [
            {
              type: "mcq",
              prompt: "What is the primary advantage of NumPy arrays over standard Python lists?",
              options: [
                { text: "They can hold any arbitrary data types", isCorrect: false },
                { text: "Contiguous memory layout allowing SIMD vectorized operations in C", isCorrect: true },
                { text: "They are immutable", isCorrect: false },
                { text: "They automatically run on the GPU", isCorrect: false },
              ],
              perCorrectPoint: 10,
            },
          ],
        },
      },
      {
        title: "Module 2: Classical Machine Learning with Scikit-Learn",
        orderIndex: 2,
        lessons: [
          {
            title: "Supervised Learning: Linear Regression, Logistic Regression & Support Vector Machines",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/GwIo3gDZCVQ",
            durationSec: 1850,
            orderIndex: 1,
          },
          {
            title: "Ensemble Models: Random Forests, Gradient Boosting & XGBoost Tuning",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/0B5eIE_1vpU",
            durationSec: 1600,
            orderIndex: 2,
          },
          {
            title: "Machine Learning Evaluation Metrics & Feature Engineering Guide.pdf",
            contentType: "pdf",
            contentUrl: "https://scikit-learn.org/stable/modules/model_evaluation.html",
            durationSec: 360,
            orderIndex: 3,
          },
          {
            title: "Audio Discussion: Bias-Variance Tradeoff & Overfitting Prevention",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
            durationSec: 580,
            orderIndex: 4,
          },
        ],
      },
      {
        title: "Module 3: Deep Learning & Neural Networks with PyTorch",
        orderIndex: 3,
        lessons: [
          {
            title: "PyTorch Tensors, Autograd & Building Multi-Layer Perceptrons (MLP)",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/V_xro1bcAuA",
            durationSec: 1950,
            orderIndex: 1,
          },
          {
            title: "Convolutional Neural Networks (CNNs) for Computer Vision & Image Recognition",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/HGwBXDKFk9I",
            durationSec: 1750,
            orderIndex: 2,
          },
          {
            title: "Deep Learning Architectures & Loss Functions Cheatsheet.pdf",
            contentType: "pdf",
            contentUrl: "https://pytorch.org/tutorials/",
            durationSec: 400,
            orderIndex: 3,
          },
          {
            title: "Audio Lecture: Gradient Descent, Adam Optimizer & Learning Rate Scheduling",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
            durationSec: 720,
            orderIndex: 4,
          },
        ],
      },
      {
        title: "Module 4: Generative AI, LLMs & Retrieval-Augmented Generation (RAG)",
        orderIndex: 4,
        lessons: [
          {
            title: "Transformers Architecture, Self-Attention & Large Language Models",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/kCc8FmEb1nY",
            durationSec: 2100,
            orderIndex: 1,
          },
          {
            title: "Building Production RAG Systems with LangChain, Pinecone & OpenAI APIs",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/LhnCs76vffw",
            durationSec: 1900,
            orderIndex: 2,
          },
          {
            title: "Generative AI System Design & Vector Embeddings Reference Guide.pdf",
            contentType: "pdf",
            contentUrl: "https://platform.openai.com/docs/guides/embeddings",
            durationSec: 420,
            orderIndex: 3,
          },
        ],
      },
    ],
  },

  {
    // 5. Full-Stack Web Development Next.js 15 & Node.js
    courseQuery: { title: /Next\.js/i },
    modules: [
      {
        title: "Module 1: Next.js 15 App Router & React 19 Essentials",
        orderIndex: 1,
        lessons: [
          {
            title: "Next.js 15 Architecture: Server Components, Client Components & Streaming",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/wm5gMKuwSYk",
            durationSec: 1650,
            orderIndex: 1,
          },
          {
            title: "React 19 Actions, useActionState, useOptimistic & Forms Handling",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/843nec-IvW0",
            durationSec: 1500,
            orderIndex: 2,
          },
          {
            title: "Next.js 15 App Router Architecture Blueprint & Caching Matrix.pdf",
            contentType: "pdf",
            contentUrl: "https://nextjs.org/docs",
            durationSec: 400,
            orderIndex: 3,
          },
          {
            title: "Audio Podcast: Why Server Components are the Future of Web Engineering",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
            durationSec: 680,
            orderIndex: 4,
          },
        ],
        quiz: {
          title: "Next.js 15 App Router Architecture Quiz",
          questions: [
            {
              type: "mcq",
              prompt: "By default in the Next.js 15 app router, components are executed on which side?",
              options: [
                { text: "Client side only", isCorrect: false },
                { text: "Server side (React Server Components)", isCorrect: true },
                { text: "Service Worker", isCorrect: false },
                { text: "Static generation only", isCorrect: false },
              ],
              perCorrectPoint: 10,
            },
          ],
        },
      },
      {
        title: "Module 2: Scalable Backend with Node.js, Express & TypeScript",
        orderIndex: 2,
        lessons: [
          {
            title: "Modular Clean Architecture in Express & TypeScript",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/zQnBQ4tB3ZA",
            durationSec: 1800,
            orderIndex: 1,
          },
          {
            title: "MongoDB Schema Design, Indexing & Aggregation Pipelines",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/Kkht32G9bBo",
            durationSec: 1600,
            orderIndex: 2,
          },
          {
            title: "RESTful API Security, Zod Validation & Global Error Handling.pdf",
            contentType: "pdf",
            contentUrl: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.pdf",
            durationSec: 360,
            orderIndex: 3,
          },
          {
            title: "Audio Interview: Database Indexing Strategies That Prevent Outages",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
            durationSec: 750,
            orderIndex: 4,
          },
        ],
      },
      {
        title: "Module 3: Authentication, SSLCommerz Payments & WebSockets",
        orderIndex: 3,
        lessons: [
          {
            title: "HttpOnly Cookie JWT Authentication with Refresh Token Rotation",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/mbsmsi7l3r4",
            durationSec: 1900,
            orderIndex: 1,
          },
          {
            title: "Integrating SSLCommerz & Stripe with Secure Webhook Verification",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/1r-F3FIONl8",
            durationSec: 1700,
            orderIndex: 2,
          },
          {
            title: "Payment Gateway Architecture & Webhook Idempotency Reference.pdf",
            contentType: "pdf",
            contentUrl: "https://developer.sslcommerz.com/doc/v4/",
            durationSec: 420,
            orderIndex: 3,
          },
          {
            title: "Real-Time Notifications with Socket.io & Redis Pub/Sub",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/AS79oJ3Fcf0",
            durationSec: 1550,
            orderIndex: 4,
          },
        ],
      },
      {
        title: "Module 4: Testing, Docker & Cloud Production Deployment",
        orderIndex: 4,
        lessons: [
          {
            title: "Automated Testing with Vitest, React Testing Library & Playwright",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/gAkwW2tuIqE",
            durationSec: 1650,
            orderIndex: 1,
          },
          {
            title: "Production Deployment on AWS / Vercel with Custom Domains & SSL.pdf",
            contentType: "pdf",
            contentUrl: "https://vercel.com/docs",
            durationSec: 380,
            orderIndex: 2,
          },
          {
            title: "Audio Masterclass: Zero-Downtime Releases & Performance Auditing",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
            durationSec: 800,
            orderIndex: 3,
          },
        ],
      },
    ],
  },

  {
    // 6. Mern Stack
    courseQuery: { title: /Mern Stack/i },
    modules: [
      {
        title: "Module 1: React 18 Core & Component Lifecycle",
        orderIndex: 1,
        lessons: [
          {
            title: "React Component Patterns, Hooks (useState, useEffect, useMemo)",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
            durationSec: 1500,
            orderIndex: 1,
          },
          {
            title: "Modern React Hooks & Performance Optimization Handbook.pdf",
            contentType: "pdf",
            contentUrl: "https://react.dev",
            durationSec: 360,
            orderIndex: 2,
          },
          {
            title: "Audio Overview: State Management from Redux Toolkit to Zustand",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
            durationSec: 620,
            orderIndex: 3,
          },
        ],
      },
      {
        title: "Module 2: Node.js & Express API Development",
        orderIndex: 2,
        lessons: [
          {
            title: "Express Middleware, Routing & Async Error Handlers",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/Oe421EPjeBE",
            durationSec: 1600,
            orderIndex: 1,
          },
          {
            title: "RESTful API Standards & HTTP Status Codes Reference.pdf",
            contentType: "pdf",
            contentUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
            durationSec: 300,
            orderIndex: 2,
          },
        ],
      },
      {
        title: "Module 3: MongoDB Database & Full-Stack Deployment",
        orderIndex: 3,
        lessons: [
          {
            title: "Connecting React to Express & MongoDB CRUD Operations",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/7CqJlxBYj-M",
            durationSec: 1800,
            orderIndex: 1,
          },
          {
            title: "MERN Stack Full Application Deployment Guide.pdf",
            contentType: "pdf",
            contentUrl: "https://render.com/docs",
            durationSec: 350,
            orderIndex: 2,
          },
          {
            title: "Audio Tech Talk: Secrets Management & Environment Security",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            durationSec: 540,
            orderIndex: 3,
          },
        ],
      },
    ],
  },

  {
    // 7. Web Development (previously uncategorized)
    courseQuery: { title: /^Web Development$/i },
    categoryFix: "Web Development",
    modules: [
      {
        title: "Module 1: HTML5 Semantics & Modern CSS3 Grid/Flexbox",
        orderIndex: 1,
        lessons: [
          {
            title: "Semantic HTML5, Accessibility (a11y) & SEO Essentials",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/kUMe1FH4CHE",
            durationSec: 1400,
            orderIndex: 1,
          },
          {
            title: "CSS Grid & Flexbox Comprehensive Visual Guide.pdf",
            contentType: "pdf",
            contentUrl: "https://css-tricks.com/snippets/css/complete-guide-grid/",
            durationSec: 320,
            orderIndex: 2,
          },
          {
            title: "Audio Lecture: The Modern Web Standards & Browser Rendering Engine",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            durationSec: 600,
            orderIndex: 3,
          },
        ],
      },
      {
        title: "Module 2: Modern JavaScript (ES6+ & Async/Await)",
        orderIndex: 2,
        lessons: [
          {
            title: "JavaScript Deep Dive: Closures, Event Loop & Promises",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/hdI2bqOjy3c",
            durationSec: 1700,
            orderIndex: 1,
          },
          {
            title: "JavaScript Array Methods & Modern Syntax Pocket Manual.pdf",
            contentType: "pdf",
            contentUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
            durationSec: 350,
            orderIndex: 2,
          },
          {
            title: "Audio Discussion: Writing Maintainable, Clean JavaScript Code",
            contentType: "audio",
            contentUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            durationSec: 580,
            orderIndex: 3,
          },
        ],
      },
      {
        title: "Module 3: Responsive Web Projects & Production Hosting",
        orderIndex: 3,
        lessons: [
          {
            title: "Building an Interactive Portfolio Website with Dark Mode",
            contentType: "video",
            contentUrl: "https://www.youtube.com/embed/G3e-cpL7ofc",
            durationSec: 1900,
            orderIndex: 1,
          },
          {
            title: "Git, GitHub & Web Hosting Deployment Guide.pdf",
            contentType: "pdf",
            contentUrl: "https://git-scm.com/docs",
            durationSec: 300,
            orderIndex: 2,
          },
        ],
      },
    ],
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB:", DB_URL ? "URL present" : "URL missing");
    await mongoose.connect(DB_URL);
    console.log("Connected successfully to DB!");

    for (const cData of coursesCurriculumData) {
      const course = await Course.findOne(cData.courseQuery);
      if (!course) {
        console.warn("Course not found for query:", cData.courseQuery);
        continue;
      }

      console.log(`\n========================================`);
      console.log(`Processing Course: "${course.title}" (ID: ${course._id})`);

      if (cData.categoryFix) {
        course.category = cData.categoryFix;
        await course.save();
        console.log(`  Updated category to: "${cData.categoryFix}"`);
      }

      // Delete existing units, lessons, tasks, quizzes for clean update
      const existingUnits = await Unit.find({ course: course._id });
      const unitIds = existingUnits.map(u => u._id);

      await Lesson.deleteMany({ unit: { $in: unitIds } });
      await Task.deleteMany({ course: course._id });
      await Quiz.deleteMany({ course: course._id });
      await Unit.deleteMany({ course: course._id });
      console.log(`  Cleared old units and lessons.`);

      let totalLessonsInserted = 0;
      let totalDuration = 0;

      for (const mData of cData.modules) {
        const unit = await Unit.create({
          course: course._id,
          title: mData.title,
          orderIndex: mData.orderIndex,
        });

        console.log(`  + Created Unit [${unit.orderIndex}]: "${unit.title}"`);

        for (const lData of mData.lessons) {
          await Lesson.create({
            unit: unit._id,
            title: lData.title,
            contentType: lData.contentType,
            contentUrl: lData.contentUrl,
            durationSec: lData.durationSec,
            orderIndex: lData.orderIndex,
          });
          totalLessonsInserted++;
          totalDuration += lData.durationSec || 0;
        }

        console.log(`    -> Inserted ${mData.lessons.length} lessons (Video, PDF, Audio, Article)`);

        // If module has quiz, create task and quiz
        if (mData.quiz) {
          const task = await Task.create({
            course: course._id,
            unit: unit._id,
            title: mData.quiz.title,
            description: "Test your knowledge on this module concepts.",
            type: "quiz",
            maxPoints: mData.quiz.questions.reduce((sum, q) => sum + (q.perCorrectPoint || 10), 0),
          });

          const quiz = await Quiz.create({
            course: course._id,
            unit: unit._id,
            task: task._id,
            title: mData.quiz.title,
            questions: mData.quiz.questions,
            passMark: 50,
          });

          task.quizId = quiz._id;
          await task.save();
          console.log(`    -> Created Quiz & Task: "${mData.quiz.title}"`);
        }
      }

      console.log(`  Course Total: ${totalLessonsInserted} lessons, ${(totalDuration / 60).toFixed(0)} minutes.`);
    }

    console.log("\n========================================");
    console.log("All courses successfully populated with rich realistic curriculum!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding course curriculum:", error);
    process.exit(1);
  }
}

seed();
