const mongoose = require("mongoose");
const path = require("path");
const bcryptjs = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  console.error("DB_URL is missing in environment variables!");
  process.exit(1);
}

// ================= SCHEMAS =================
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: "INSTRUCTOR" },
    phone: { type: String },
    picture: { type: String },
    intro: { type: String },
    address: { type: String },
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      github: String,
      website: String,
    },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: String, default: "ACTIVE" },
    isVerified: { type: Boolean, default: true },
    auths: [
      {
        provider: String,
        providerId: String,
      },
    ],
    instructorRequest: {
      status: { type: String, default: "approved" },
      note: String,
      requestedAt: Date,
      reviewedAt: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

const InstructorSchema = new mongoose.Schema(
  {
    designation: String,
    enrolledStudent: { type: Number, default: 0 },
    noOfCourse: { type: Number, default: 0 },
    certifications: [String],
    expertise: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

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

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Instructor = mongoose.models.instructor || mongoose.model("instructor", InstructorSchema);
const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);
const Unit = mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

// ================= DATA =================
const INSTRUCTORS_DATA = [
  {
    user: {
      name: "Khadiza Akter Bristi",
      email: "khadiza.bristi@smartedu.com",
      role: "INSTRUCTOR",
      phone: "+880 1789-456123",
      address: "Dhaka, Bangladesh",
      picture: "/images/khadiza.jpg",
      intro: "Senior Microsoft Certified Trainer (MCT) and Corporate Productivity Specialist with 7+ years of experience transforming business workflows. Has mentored over 10,000 corporate professionals across leading banks, telecom, and multinational companies in Microsoft Excel, Power BI, PowerPoint executive storytelling, and Microsoft 365 cloud tools.",
      socialLinks: {
        linkedin: "https://linkedin.com/in/khadiza-akter-bristi",
        facebook: "https://facebook.com/khadiza.bristi",
        website: "https://smartedu.com"
      }
    },
    instructor: {
      designation: "Senior Microsoft Certified Trainer (MCT) & Productivity Expert",
      enrolledStudent: 425,
      expertise: [
        "Microsoft Office",
        "Microsoft Excel",
        "Power BI & DAX",
        "Microsoft PowerPoint",
        "Office Productivity",
        "Data Analysis"
      ],
      certifications: [
        "Microsoft Certified: Power BI Data Analyst Associate",
        "Microsoft Office Specialist (MOS) Expert",
        "Microsoft Certified Trainer (MCT)",
        "Microsoft 365 Certified: Fundamentals"
      ]
    },
    courses: [
      {
        title: "Mastering Microsoft Excel: Advanced Formulas, Dashboards & Power Query",
        slug: "mastering-microsoft-excel-advanced-formulas-dashboards-power-query",
        description: "Transform raw business data into stunning interactive dashboards. Master advanced formulas (XLOOKUP, INDEX/MATCH, dynamic arrays), nested logical functions, PivotTables, Power Query ETL, and modern automation techniques.",
        price: 1800,
        level: "beginner",
        category: "Office Productivity",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=k1xGH0nZNE8",
        tags: ["Microsoft Excel", "Data Analysis", "PivotTables", "Power Query", "Dashboards", "Formulas"],
        noOfStudents: 215,
        badgeTitle: "Tech Virtuoso",
        modules: [
          {
            title: "Module 1: Modern Formula Foundations & Dynamic Arrays",
            lessons: [
              { title: "Core Formula Architecture & Absolute vs Relative Referencing", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 900 },
              { title: "Mastering XLOOKUP, INDEX/MATCH & Two-Way Lookups", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 1200 },
              { title: "FILTER, UNIQUE, SORT: The Power of Dynamic Array Formulas", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 1050 },
              { title: "Excel Top 50 Corporate Formulas Reference Guide", contentType: "pdf", contentUrl: "https://support.microsoft.com/excel", durationSec: 600 }
            ],
            taskTitle: "Lab: Build an Automated Multi-Department Sales Lookup Model",
            taskDescription: "Create a dynamic sales analysis sheet using XLOOKUP and FILTER with interactive drop-down validation.",
            quizTitle: "Quiz: Excel Functions & Formula Assessment",
            questions: [
              {
                prompt: "Which modern function completely replaces VLOOKUP with bidirectional search and no column index numbering?",
                options: [
                  { text: "XLOOKUP", isCorrect: true },
                  { text: "HLOOKUP", isCorrect: false },
                  { text: "LOOKUP2", isCorrect: false },
                  { text: "SEARCH", isCorrect: false }
                ]
              },
              {
                prompt: "What happens when a Dynamic Array formula produces multiple results?",
                options: [
                  { text: "It automatically spills into adjacent neighboring cells", isCorrect: true },
                  { text: "It causes a #VALUE! error", isCorrect: false },
                  { text: "It concatenates all results into a single cell", isCorrect: false },
                  { text: "It requires pressing Ctrl+Shift+Enter", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: PivotTables, Slicers & Dynamic Business Dashboards",
            lessons: [
              { title: "Data Preparation & Formatting Rules for Flawless PivotTables", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 980 },
              { title: "Calculated Fields, Items & Grouping Dates/Numbers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 1100 },
              { title: "Connecting Interactive Slicers & Timelines Across Multiple PivotCharts", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 1250 },
              { title: "Designing Clean Executive UI & KPI Scorecards in Excel", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 1150 }
            ],
            taskTitle: "Hands-on Project: Executive Financial Performance Dashboard",
            taskDescription: "Design a single-page interactive dashboard with interconnected Slicers, KPI cards, and dynamic charting.",
            quizTitle: "Quiz: PivotTables & Dashboard Principles",
            questions: [
              {
                prompt: "To connect one Slicer to multiple PivotTables, which option must be configured?",
                options: [
                  { text: "Report Connections / Filter Connections", isCorrect: true },
                  { text: "Merge Queries", isCorrect: false },
                  { text: "Data Validation Link", isCorrect: false },
                  { text: "Calculated Item Sync", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 3: Power Query ETL & Workflow Automation",
            lessons: [
              { title: "Connecting to Multi-File Folders, CSVs & Web Data Sources", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 1020 },
              { title: "Transforming Dirty Data: Unpivoting, Splitting & Replacing Values", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 1180 },
              { title: "One-Click Automated Monthly Report Refreshes in Excel", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=k1xGH0nZNE8", durationSec: 850 }
            ],
            taskTitle: "Project: 1-Click Automated Folder Consolidation Pipeline",
            taskDescription: "Build a Power Query automation that merges 12 months of dirty sales files into one clean dataset upon refresh.",
            quizTitle: "Quiz: Power Query & Automation Review",
            questions: [
              {
                prompt: "What is the primary benefit of using Power Query over manual copy-pasting?",
                options: [
                  { text: "It records every transformation step and replays them automatically upon data refresh", isCorrect: true },
                  { text: "It writes VBA macro code in the background", isCorrect: false },
                  { text: "It increases file size dramatically", isCorrect: false },
                  { text: "It works only on text files", isCorrect: false }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "Microsoft PowerPoint Mastery: Create Executive & High-Impact Presentations",
        slug: "microsoft-powerpoint-mastery-executive-presentations",
        description: "Learn the art and science of corporate presentation design. Master typography, slide hierarchy, infographics, seamless morph transitions, data charting, and pitching decks that win clients and impress leadership.",
        price: 1200,
        level: "beginner",
        category: "Office Productivity",
        thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=mC1y8c5l3iQ",
        tags: ["PowerPoint", "Presentation Design", "Visual Storytelling", "Slide Master", "Morph Transitions"],
        noOfStudents: 140,
        badgeTitle: "Quick Starter",
        modules: [
          {
            title: "Module 1: Corporate Visual Hierarchy & Slide Master Architecture",
            lessons: [
              { title: "Principles of Visual Hierarchy, Whitespace & Color Psychology", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mC1y8c5l3iQ", durationSec: 850 },
              { title: "Mastering Slide Master: Consistent Brand Fonts, Themes & Layouts", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mC1y8c5l3iQ", durationSec: 1020 },
              { title: "PowerPoint Keyboard Shortcuts & Quick Access Toolbar Setup", contentType: "pdf", contentUrl: "https://support.microsoft.com/powerpoint", durationSec: 600 }
            ],
            taskTitle: "Assignment: Create a 5-Slide Corporate Brand Master Template",
            taskDescription: "Design a reusable master template following brand color guidelines, custom layouts, and clean typography.",
            quizTitle: "Quiz: Slide Architecture & Hierarchy",
            questions: [
              {
                prompt: "Why should corporate slide layouts be configured in the Slide Master view?",
                options: [
                  { text: "To guarantee global design consistency and prevent layout breakage across the deck", isCorrect: true },
                  { text: "To compress video files", isCorrect: false },
                  { text: "To hide slides from the presenter", isCorrect: false },
                  { text: "To enable spell checking", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: Custom Infographics & Morph Cinematic Transitions",
            lessons: [
              { title: "Combining & Fragmenting Shapes for Bespoke Vector Icons", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mC1y8c5l3iQ", durationSec: 960 },
              { title: "Mastering the Morph Transition: Zooming, Rotating & Object Morphing", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mC1y8c5l3iQ", durationSec: 1140 },
              { title: "Transforming Boring Bullet Points into Engaging Storyboards", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mC1y8c5l3iQ", durationSec: 900 }
            ],
            taskTitle: "Pitch Deck Project: Build a 10-Slide Investor Presentation",
            taskDescription: "Deliver a polished investor deck with seamless Morph transitions, custom infographics, and clean data slides.",
            quizTitle: "Quiz: Morph & Motion Assessment",
            questions: [
              {
                prompt: "What naming convention allows PowerPoint Morph to seamlessly transition two completely different shapes between slides?",
                options: [
                  { text: "Prefixing identical names with '!!' in the Selection Pane (e.g. '!!Shape1')", isCorrect: true },
                  { text: "Suffixing with '#morph'", isCorrect: false },
                  { text: "Grouping them with an image", isCorrect: false },
                  { text: "Assigning the same color hex code", isCorrect: false }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "Microsoft Power BI for Business Intelligence & Advanced Analytics",
        slug: "microsoft-power-bi-business-intelligence-advanced-analytics",
        description: "Step-by-step masterclass on building end-to-end business intelligence solutions with Microsoft Power BI. Learn data modeling, Star Schema, DAX measures, automated refreshes, and publishing interactive cloud reports.",
        price: 2500,
        level: "intermediate",
        category: "Artificial Intelligence",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=3u7MQz1EyPY",
        tags: ["Power BI", "Data Analytics", "DAX", "Business Intelligence", "Microsoft", "Reporting"],
        noOfStudents: 110,
        badgeTitle: "Master Architect",
        modules: [
          {
            title: "Module 1: Data Modeling & Star Schema Architecture",
            lessons: [
              { title: "Power BI Desktop Architecture & End-to-End Workflow", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3u7MQz1EyPY", durationSec: 920 },
              { title: "Building Star Schemas: Fact Tables vs Dimension Tables", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3u7MQz1EyPY", durationSec: 1150 },
              { title: "Establishing One-to-Many Relationships & Filter Propagation Rules", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3u7MQz1EyPY", durationSec: 1040 }
            ],
            taskTitle: "Lab: Build a Normalized Star Schema Data Model",
            taskDescription: "Import relational datasets, establish proper cardinality, and eliminate bi-directional cross-filter ambiguities.",
            quizTitle: "Quiz: Data Modeling in Power BI",
            questions: [
              {
                prompt: "Which data modeling design is considered the gold standard for high-performance Power BI reporting?",
                options: [
                  { text: "Star Schema (Central Fact Table surrounded by Dimension Tables)", isCorrect: true },
                  { text: "One single wide flat table with 100+ columns", isCorrect: false },
                  { text: "Snowflake schema with 10 levels of normalization", isCorrect: false },
                  { text: "Unlinked independent tables", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: Core DAX Measures & Time Intelligence Analytics",
            lessons: [
              { title: "Calculated Columns vs DAX Measures: Performance Breakdown", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3u7MQz1EyPY", durationSec: 1080 },
              { title: "The Magic of CALCULATE: Filter Context Modification", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3u7MQz1EyPY", durationSec: 1300 },
              { title: "Time Intelligence: Year-to-Date (YTD), YoY Growth & Rolling Averages", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3u7MQz1EyPY", durationSec: 1220 }
            ],
            taskTitle: "Dashboard Capstone: Executive Sales & Profitability Portal",
            taskDescription: "Create a multi-tab Power BI report with dynamic tooltips, drill-through pages, and publish to Power BI Service.",
            quizTitle: "Quiz: DAX Foundations & Time Intelligence",
            questions: [
              {
                prompt: "What is the primary function in DAX used to modify the existing filter context?",
                options: [
                  { text: "CALCULATE", isCorrect: true },
                  { text: "SUMX", isCorrect: false },
                  { text: "FILTER", isCorrect: false },
                  { text: "RELATED", isCorrect: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    user: {
      name: "Payel Islam",
      email: "payel.islam@smartedu.com",
      role: "INSTRUCTOR",
      phone: "+880 1812-789345",
      address: "Dhaka, Bangladesh",
      picture: "/images/payel.jpg",
      intro: "Senior Network Infrastructure Engineer and Cisco Certified Network Professional (CCNP) with 8+ years of enterprise networking experience. Expert in multi-vendor routing & switching (Cisco, MikroTik, Juniper), firewall security (Fortinet, Palo Alto), Wireshark packet inspection, TCP/IP network troubleshooting, and enterprise WAN/LAN architectures.",
      socialLinks: {
        github: "https://github.com/payel-islam",
        linkedin: "https://linkedin.com/in/payel-islam-net",
        website: "https://smartedu.com"
      }
    },
    instructor: {
      designation: "Senior Network & Security Engineer | Cisco CCNP & CCNA Specialist",
      enrolledStudent: 380,
      expertise: [
        "Computer Networking",
        "Cisco CCNA & CCNP",
        "Network Security",
        "Wireshark Packet Analysis",
        "Routing & Switching",
        "Subnetting & TCP/IP"
      ],
      certifications: [
        "Cisco Certified Network Associate (CCNA 200-301)",
        "Cisco Certified Network Professional (CCNP Enterprise)",
        "Fortinet Certified Associate in Cybersecurity",
        "CompTIA Network+ Certified"
      ]
    },
    courses: [
      {
        title: "Cisco CCNA 200-301: The Complete Computer Networking Masterclass",
        slug: "cisco-ccna-200-301-complete-networking-masterclass",
        description: "Comprehensive, zero-to-hero preparation for the Cisco CCNA 200-301 certification. Master the TCP/IP stack, IPv4 & IPv6 VLSM subnetting, VLANs, Inter-VLAN routing, OSPF, Access Control Lists (ACLs), NAT, and DHCP configuration.",
        price: 3000,
        level: "intermediate",
        category: "Cybersecurity",
        thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=H8W9oMNSuwo",
        tags: ["Cisco", "CCNA", "Networking", "Routing", "Switching", "OSPF", "Subnetting"],
        noOfStudents: 245,
        badgeTitle: "Tech Virtuoso",
        modules: [
          {
            title: "Module 1: Network Fundamentals & IPv4/IPv6 VLSM Subnetting",
            lessons: [
              { title: "The 7-Layer OSI Model vs 4-Layer TCP/IP Protocol Stack", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 960 },
              { title: "Binary to Decimal Conversion & IPv4 Addressing Fundamentals", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 1150 },
              { title: "Variable Length Subnet Masking (VLSM) Mastery with Real Scenarios", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 1350 },
              { title: "CCNA 200-301 Subnetting Cheatsheet & Quick Formula Card", contentType: "pdf", contentUrl: "https://www.cisco.com", durationSec: 600 }
            ],
            taskTitle: "Hands-on Lab: Enterprise IP Addressing Plan Design",
            taskDescription: "Calculate and allocate optimal subnets for 6 corporate departments using VLSM to prevent IP wastage.",
            quizTitle: "Quiz: Subnetting & OSI Architecture Assessment",
            questions: [
              {
                prompt: "Which layer of the OSI model handles logical IP addressing and path determination?",
                options: [
                  { text: "Network Layer (Layer 3)", isCorrect: true },
                  { text: "Data Link Layer (Layer 2)", isCorrect: false },
                  { text: "Transport Layer (Layer 4)", isCorrect: false },
                  { text: "Session Layer (Layer 5)", isCorrect: false }
                ]
              },
              {
                prompt: "How many usable host IP addresses are available in a /26 IPv4 subnet?",
                options: [
                  { text: "62 hosts (2^(32-26) - 2)", isCorrect: true },
                  { text: "64 hosts", isCorrect: false },
                  { text: "30 hosts", isCorrect: false },
                  { text: "126 hosts", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: Layer 2 Switching, VLANs, Trunking & Spanning Tree",
            lessons: [
              { title: "Ethernet Frame Structure & MAC Address Learning Mechanisms", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 890 },
              { title: "Configuring VLANs & 802.1Q Encapsulation Trunks on Cisco Catalyst Switches", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 1200 },
              { title: "Preventing Switching Loops with Spanning Tree Protocol (STP & RSTP)", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 1280 }
            ],
            taskTitle: "Packet Tracer Lab: Multi-Switch Redundant Campus Network",
            taskDescription: "Deploy 3 Catalyst switches with VLAN 10, 20, 99 (Management), configure trunk links, and verify RSTP root bridge convergence.",
            quizTitle: "Quiz: Switching, VLANs & Trunking Assessment",
            questions: [
              {
                prompt: "What is the standard IEEE protocol for VLAN tagging on Ethernet trunk ports?",
                options: [
                  { text: "IEEE 802.1Q", isCorrect: true },
                  { text: "IEEE 802.3ad", isCorrect: false },
                  { text: "IEEE 802.11ax", isCorrect: false },
                  { text: "IEEE 802.1D", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 3: Dynamic IP Routing with OSPF, NAT & Access Control Lists",
            lessons: [
              { title: "Static Routing vs Dynamic Routing: Metric & Administrative Distance", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 1050 },
              { title: "Configuring Single-Area OSPFv2 on Cisco IOS Routers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 1350 },
              { title: "Network Address Translation (NAT / PAT) for Internet Connectivity", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 1100 },
              { title: "Securing Networks with Standard & Extended Access Control Lists (ACLs)", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=H8W9oMNSuwo", durationSec: 1220 }
            ],
            taskTitle: "Comprehensive Capstone: Full Enterprise Branch Office Deployment",
            taskDescription: "Configure an entire enterprise branch in Cisco Packet Tracer: OSPF routing, PAT to ISP, DHCP server, and extended ACL traffic filtering.",
            quizTitle: "Quiz: OSPF, NAT & Network Security",
            questions: [
              {
                prompt: "What is the default Administrative Distance (AD) of OSPF routes in Cisco IOS?",
                options: [
                  { text: "110", isCorrect: true },
                  { text: "90", isCorrect: false },
                  { text: "120", isCorrect: false },
                  { text: "1", isCorrect: false }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "Practical Network Troubleshooting & Wireshark Packet Analysis",
        slug: "practical-network-troubleshooting-wireshark-packet-analysis",
        description: "Learn deep-packet inspection and enterprise network troubleshooting like a pro. Analyze TCP 3-way handshakes, identify packet drops, diagnose slow DNS responses, spot TLS handshakes, and isolate malware traffic using Wireshark filters.",
        price: 1800,
        level: "beginner",
        category: "Cybersecurity",
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=lb1Dw0elw0Q",
        tags: ["Wireshark", "Packet Analysis", "Network Troubleshooting", "TCP/IP", "Cybersecurity", "Network Forensics"],
        noOfStudents: 160,
        badgeTitle: "Problem Solver",
        modules: [
          {
            title: "Module 1: Wireshark Architecture, Capture Filters & Display Filters",
            lessons: [
              { title: "Promiscuous Mode, Port Mirroring (SPAN) & Tap Capture Hardware", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=lb1Dw0elw0Q", durationSec: 920 },
              { title: "BPF Capture Filters vs Real-Time Display Filters: Core Differences", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=lb1Dw0elw0Q", durationSec: 1040 },
              { title: "Essential Wireshark Filter Cheat Sheet for Fast Triage", contentType: "pdf", contentUrl: "https://www.wireshark.org", durationSec: 600 }
            ],
            taskTitle: "Lab: Capture and Filter HTTP, DNS & ARP Broadcasts",
            taskDescription: "Perform live packet capture on your local interface, apply BPF filters, and export PCAP evidence files.",
            quizTitle: "Quiz: Wireshark Filtering Foundations",
            questions: [
              {
                prompt: "Which display filter in Wireshark shows only TCP SYN packets without ACK (connection attempts)?",
                options: [
                  { text: "tcp.flags.syn == 1 and tcp.flags.ack == 0", isCorrect: true },
                  { text: "tcp.syn == true", isCorrect: false },
                  { text: "ip.proto == tcp_syn", isCorrect: false },
                  { text: "port == 80", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: Dissecting TCP 3-Way Handshake, Packet Loss & Latency",
            lessons: [
              { title: "Anatomy of the TCP Handshake: SYN, SYN-ACK, ACK & Sequence Numbers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=lb1Dw0elw0Q", durationSec: 1100 },
              { title: "Diagnosing Network Bottlenecks: Round Trip Time (RTT) & TCP Zero Window", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=lb1Dw0elw0Q", durationSec: 1250 },
              { title: "Identifying Retransmissions, Duplicate ACKs & Packet Loss in Wireshark", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=lb1Dw0elw0Q", durationSec: 1180 }
            ],
            taskTitle: "Case Study: Troubleshoot an Application Latency Incident",
            taskDescription: "Inspect a pre-recorded PCAP dump to pinpoint whether a slow application is caused by network jitter or server compute delay.",
            quizTitle: "Quiz: TCP Performance Analysis",
            questions: [
              {
                prompt: "A TCP Zero Window notification packet sent from a server means:",
                options: [
                  { text: "The server's receive buffer is completely full and it cannot accept more data currently", isCorrect: true },
                  { text: "The physical cable was disconnected", isCorrect: false },
                  { text: "The connection was terminated normally", isCorrect: false },
                  { text: "Encryption failed", isCorrect: false }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "Enterprise Firewall Defense & Network Security Hands-On",
        slug: "enterprise-firewall-defense-network-security-hands-on",
        description: "Deploy, configure, and secure enterprise perimeter defenses. Learn stateful inspection, Next-Generation Firewall (NGFW) policies, SSL inspection, site-to-site IPsec VPNs, client VPNs, and intrusion prevention systems (IPS) against modern threats.",
        price: 2800,
        level: "advanced",
        category: "Cybersecurity",
        thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=inWWhr5tnEA",
        tags: ["Firewall", "Network Security", "VPN", "Cybersecurity", "NGFW", "Defense", "Zero Trust"],
        noOfStudents: 135,
        badgeTitle: "Master Architect",
        modules: [
          {
            title: "Module 1: Enterprise Firewall Architecture & Stateful Security Rules",
            lessons: [
              { title: "Stateless Packet Filters vs Stateful Firewalls vs Layer 7 NGFW", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 980 },
              { title: "Configuring Zone-Based Firewall Policies & Ingress/Egress Rule Ordering", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1220 },
              { title: "Application Control & Deep Packet SSL/TLS Decryption Strategies", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1300 }
            ],
            taskTitle: "Lab: Deploy a Multi-Zone Enterprise Perimeter Policy",
            taskDescription: "Define WAN, DMZ, LAN, and Guest security zones with explicit least-privilege egress rules and logging.",
            quizTitle: "Quiz: Firewall Policies & Stateful Inspection",
            questions: [
              {
                prompt: "Why is SSL/TLS Inspection required on modern Next-Generation Firewalls?",
                options: [
                  { text: "Because over 90% of web traffic is encrypted, hiding malware and command-and-control payloads from inspection", isCorrect: true },
                  { text: "To speed up website loading times", isCorrect: false },
                  { text: "To bypass antivirus scanners", isCorrect: false },
                  { text: "To replace DNS servers", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: Enterprise Site-to-Site IPsec VPNs & Remote Worker SSL VPN",
            lessons: [
              { title: "IPsec Protocol Architecture: IKEv1/IKEv2 Phase 1 & Phase 2 Negotiation", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1140 },
              { title: "Deploying Site-to-Site Encrypted Tunnel with AES-GCM & Pre-Shared Keys", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1280 },
              { title: "Configuring Remote Worker SSL VPN Portals with Multi-Factor Authentication", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 1100 }
            ],
            taskTitle: "Capstone Project: Build an Encrypted Cross-Branch VPN Fabric",
            taskDescription: "Configure a route-based IPsec VPN between HQ and Branch office firewalls with failover and OSPF over VTI.",
            quizTitle: "Quiz: IPsec & VPN Tunneling Assessment",
            questions: [
              {
                prompt: "In IPsec negotiation, what is the role of IKE Phase 1?",
                options: [
                  { text: "To authenticate peers and establish a secure management channel (ISAKMP SA) to negotiate Phase 2", isCorrect: true },
                  { text: "To encrypt the actual user data traffic", isCorrect: false },
                  { text: "To assign dynamic IP addresses to end users", isCorrect: false },
                  { text: "To route packets across the Internet", isCorrect: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    user: {
      name: "Moriam Akter Shila",
      email: "moriam.shila@smartedu.com",
      role: "INSTRUCTOR",
      phone: "+880 1912-345678",
      address: "Dhaka, Bangladesh",
      picture: "/images/moriam.jpg",
      intro: "Certified Digital Marketing Strategist, Growth Hacker, and Social Media Marketing Consultant with 6+ years of experience helping brands scale online revenue. Expert in Performance Marketing (Meta & Google Ads), Search Engine Optimization (SEO), Content Strategy, Inbound Funnels, and Marketing Analytics.",
      socialLinks: {
        linkedin: "https://linkedin.com",
        facebook: "https://facebook.com",
        website: "https://smartedu.com"
      }
    },
    instructor: {
      designation: "Senior Digital Marketing Strategist & Performance Marketing Lead",
      enrolledStudent: 390,
      expertise: [
        "Digital Marketing",
        "Meta & Google Ads",
        "Search Engine Optimization (SEO)",
        "Social Media Marketing",
        "Email & Inbound Funnels",
        "Content Strategy & Analytics"
      ],
      certifications: [
        "Google Certified Digital Marketing Professional",
        "Meta Certified Digital Marketing Associate",
        "HubSpot Inbound Marketing Certified",
        "SEMrush Technical SEO Certified"
      ]
    },
    courses: [
      {
        title: "The Complete Digital Marketing Masterclass: From Strategy to Conversion",
        slug: "complete-digital-marketing-masterclass-strategy-to-conversion",
        description: "Master modern multi-channel digital marketing. Learn audience targeting, high-converting copy, sales funnel design, marketing analytics, and scaling organic and paid customer acquisition.",
        price: 2200,
        level: "beginner",
        category: "Digital Marketing",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=bixR-KIJKYM",
        tags: ["Digital Marketing", "Marketing Strategy", "Social Media", "SEO", "Sales Funnel", "Branding"],
        noOfStudents: 195,
        badgeTitle: "Tech Virtuoso",
        modules: [
          {
            title: "Module 1: Inbound Marketing Foundations & Customer Journey Mapping",
            lessons: [
              { title: "Understanding the Modern Digital Marketing Ecosystem", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 920 },
              { title: "Buyer Persona Development & Intent-Based Funnel Architecture", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1100 },
              { title: "Digital Marketing Strategy Framework Template", contentType: "pdf", contentUrl: "https://hubspot.com", durationSec: 600 }
            ],
            taskTitle: "Lab: Build a Comprehensive Inbound Customer Journey Map",
            taskDescription: "Define top-of-funnel (TOFU), middle-of-funnel (MOFU), and bottom-of-funnel (BOFU) customer touchpoints for a targeted niche.",
            quizTitle: "Quiz: Inbound Marketing Foundations",
            questions: [
              {
                prompt: "What is the primary goal of the Top of the Funnel (TOFU) stage in inbound marketing?",
                options: [
                  { text: "Building awareness and attracting the right audience through valuable educational content", isCorrect: true },
                  { text: "Closing high-ticket sales immediately", isCorrect: false },
                  { text: "Running retargeting discount promotions", isCorrect: false },
                  { text: "Collecting payment details", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: High-Converting Landing Pages, Copywriting & Email Automation",
            lessons: [
              { title: "The Anatomy of a High-Converting Landing Page", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1050 },
              { title: "Psychological Copywriting: Hook, Story & Irresistible Offer", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1200 },
              { title: "Setting Up Drip Email Automation & Lead Nurturing Sequences", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1150 }
            ],
            taskTitle: "Project: Design an End-to-End Email Lead Generation Funnel",
            taskDescription: "Create a 5-step email nurturing sequence integrated with a lead magnet opt-in page.",
            quizTitle: "Quiz: Conversion Rate Optimization & Funnels",
            questions: [
              {
                prompt: "In conversion rate optimization (CRO), what does A/B testing primarily measure?",
                options: [
                  { text: "Comparing two variations of a page to determine which produces higher conversion metrics", isCorrect: true },
                  { text: "Checking site speed on two different browsers", isCorrect: false },
                  { text: "Testing payment gateways for downtime", isCorrect: false },
                  { text: "Translating content into two languages", isCorrect: false }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "Meta Ads & Performance Marketing: Facebook & Instagram Ads Bootcamp",
        slug: "meta-ads-performance-marketing-facebook-instagram-bootcamp",
        description: "Scale your revenue with profitable Facebook and Instagram ad campaigns. Master Meta Business Suite, Pixel/Conversions API setup, CBO/ABO budgets, custom lookalike audiences, and high-ROAS creative testing.",
        price: 2500,
        level: "intermediate",
        category: "Digital Marketing",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=bixR-KIJKYM",
        tags: ["Meta Ads", "Facebook Ads", "Instagram Marketing", "ROAS", "Performance Marketing", "Pixel Setup"],
        noOfStudents: 165,
        badgeTitle: "Problem Solver",
        modules: [
          {
            title: "Module 1: Meta Business Manager, Event Tracking & CAPI Setup",
            lessons: [
              { title: "Setting Up Meta Business Portfolio & Domain Verification", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 880 },
              { title: "Configuring Meta Pixel & Server-Side Conversions API (CAPI)", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1250 },
              { title: "Standard Events, Custom Conversions & Value Tracking", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1020 }
            ],
            taskTitle: "Lab: Configure Server-Side CAPI and Verify Event Quality Score",
            taskDescription: "Implement server-side event tracking and ensure an Event Match Quality score above 8.0 on Meta Business Manager.",
            quizTitle: "Quiz: Meta Tracking & Infrastructure",
            questions: [
              {
                prompt: "Why is Meta Conversions API (CAPI) critical alongside the traditional browser Pixel?",
                options: [
                  { text: "It bypasses browser ad-blockers and iOS privacy restrictions by sending events directly from the server", isCorrect: true },
                  { text: "It reduces Facebook ad costs automatically by 50%", isCorrect: false },
                  { text: "It guarantees viral reach without running paid ads", isCorrect: false },
                  { text: "It replaces the need for a website", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: Campaign Structure, Audience Targeting & Scaling Strategies",
            lessons: [
              { title: "Advantage+ Campaign Budget (CBO) vs Ad Set Budget (ABO)", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1100 },
              { title: "Building High-Intent Custom Audiences & Value-Based Lookalikes (1-5%)", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1200 },
              { title: "Scaling Winning Ad Sets Vertically and Horizontally without Burning Budget", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=bixR-KIJKYM", durationSec: 1300 }
            ],
            taskTitle: "Project: Deploy a Live Multi-Tier Meta Retargeting Campaign",
            taskDescription: "Design a full funnel campaign with separate prospecting, cart abandoner retargeting, and dynamic product ads (DPA).",
            quizTitle: "Quiz: Meta Campaign Scaling & Optimization",
            questions: [
              {
                prompt: "What is the recommended horizontal scaling technique in Meta Ads?",
                options: [
                  { text: "Duplicating successful ad sets to test new lookalike or broad audience angles", isCorrect: true },
                  { text: "Increasing daily budget by 500% in one click", isCorrect: false },
                  { text: "Deleting all active campaigns every 24 hours", isCorrect: false },
                  { text: "Running ads only between 2 AM and 4 AM", isCorrect: false }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "Modern Search Engine Optimization (SEO) & Google Ranking Blueprint",
        slug: "modern-seo-google-ranking-blueprint",
        description: "Rank on Google page 1 with white-hat SEO techniques. Master AI-assisted keyword intent mapping, On-Page optimization, Core Web Vitals, Schema markup, technical audits, and building authoritative backlinks.",
        price: 1900,
        level: "intermediate",
        category: "Digital Marketing",
        thumbnail: "https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?auto=format&fit=crop&w=1200&q=80",
        introVideo: "https://www.youtube.com/watch?v=DvwS7cV9GmQ",
        tags: ["SEO", "Google Ranking", "Keyword Research", "Technical SEO", "Backlinks", "Content Strategy"],
        noOfStudents: 140,
        badgeTitle: "Master Architect",
        modules: [
          {
            title: "Module 1: Keyword Research, Search Intent & Competitor Analysis",
            lessons: [
              { title: "Understanding Google Search Algorithms & Helpful Content System", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=DvwS7cV9GmQ", durationSec: 950 },
              { title: "Finding Low-Competition, High-Value Keywords with SEMrush & Ahrefs", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=DvwS7cV9GmQ", durationSec: 1200 },
              { title: "Mapping Keywords to Search Intent (Informational, Commercial, Transactional)", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=DvwS7cV9GmQ", durationSec: 1040 }
            ],
            taskTitle: "Lab: Build a 100-Keyword Topical Authority Content Map",
            taskDescription: "Group keywords into pillar and cluster topics to establish topical authority in your chosen niche.",
            quizTitle: "Quiz: Keyword Strategy & Search Intent",
            questions: [
              {
                prompt: "Why is matching Search Intent more important than exact-match keyword density in modern SEO?",
                options: [
                  { text: "Because Google's NLP models rank content that directly and comprehensively answers the searcher's specific goal", isCorrect: true },
                  { text: "Because keywords no longer exist in search engines", isCorrect: false },
                  { text: "Because search intent only applies to paid ads", isCorrect: false },
                  { text: "Because keyword stuffing is rewarded", isCorrect: false }
                ]
              }
            ]
          },
          {
            title: "Module 2: Technical SEO, Schema Markup & Authority Backlink Building",
            lessons: [
              { title: "Crawling & Indexing: Robots.txt, XML Sitemaps & Canonical Tags", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=DvwS7cV9GmQ", durationSec: 1120 },
              { title: "Structured Data: Implementing JSON-LD Schema for Rich Snippets", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=DvwS7cV9GmQ", durationSec: 1180 },
              { title: "White-Hat Link Building: Digital PR, Guest Posting & Skyscraper Outreach", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=DvwS7cV9GmQ", durationSec: 1260 }
            ],
            taskTitle: "Capstone: Complete 50-Point Technical SEO Audit of a Live Website",
            taskDescription: "Conduct a full audit using Screaming Frog and Google Search Console, identifying broken links, orphan pages, and Core Web Vital issues.",
            quizTitle: "Quiz: Technical SEO & Authority Assessment",
            questions: [
              {
                prompt: "What is the primary purpose of a 'canonical' tag (rel='canonical')?",
                options: [
                  { text: "To tell search engines which URL represents the master copy of a page, preventing duplicate content issues", isCorrect: true },
                  { text: "To block Google from indexing the website", isCorrect: false },
                  { text: "To increase page load speed by 3x", isCorrect: false },
                  { text: "To translate pages into other languages", isCorrect: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// ================= RUNNER =================
async function seedInstructorsAndCourses() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(DB_URL);
  console.log("Connected successfully to MongoDB.");

  // 1. Ensure Categories exist in CourseCategories collection
  const categoriesToEnsure = [
    "Digital Marketing",
    "Office Productivity",
    "Cybersecurity",
    "Artificial Intelligence",
    "Cloud & DevOps",
    "Web Development",
    "Mobile App Development",
  ];

  for (const catTitle of categoriesToEnsure) {
    const existing = await mongoose.connection.collection("coursecategories").findOne({ title: catTitle });
    if (!existing) {
      await mongoose.connection.collection("coursecategories").insertOne({
        title: catTitle,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`+ Created category: "${catTitle}"`);
    }
  }

  // 2. Fetch badges for course assignment
  const badges = await mongoose.connection.collection("badges").find().toArray();
  const badgeMap = {};
  for (const b of badges) {
    badgeMap[b.title] = b._id;
  }
  const defaultBadgeId = badges[0]?._id;

  // 3. Process Instructors
  for (const item of INSTRUCTORS_DATA) {
    console.log(`\n======================================================`);
    console.log(`Processing Instructor: ${item.user.name} (${item.user.email})`);

    // Check if user exists by email or name
    let user = await User.findOne({
      $or: [
        { email: item.user.email },
        { name: item.user.name }
      ]
    });

    const hashedPassword = await bcryptjs.hash("Instructor@123", 10);

    if (!user) {
      user = await User.create({
        ...item.user,
        password: hashedPassword,
        auths: [{ provider: "credentials", providerId: item.user.email }],
        instructorRequest: {
          status: "approved",
          note: "Auto-approved verified expert instructor",
          requestedAt: new Date(),
          reviewedAt: new Date(),
        },
        isActive: "ACTIVE",
        isVerified: true,
        isDeleted: false,
      });
      console.log(`✅ Created User: ${user.name} (${user._id})`);
    } else {
      user.name = item.user.name;
      user.email = item.user.email;
      user.role = "INSTRUCTOR";
      user.phone = item.user.phone;
      user.address = item.user.address;
      user.picture = item.user.picture;
      user.intro = item.user.intro;
      user.socialLinks = item.user.socialLinks;
      user.isActive = "ACTIVE";
      user.isVerified = true;
      user.isDeleted = false;
      user.instructorRequest = {
        status: "approved",
        note: "Auto-approved verified expert instructor",
        requestedAt: user.instructorRequest?.requestedAt || new Date(),
        reviewedAt: new Date(),
      };
      await user.save();
      console.log(`🔄 Updated User: ${user.name} (${user._id})`);
    }

    // Update or create Instructor document
    const instructorDoc = await Instructor.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        designation: item.instructor.designation,
        enrolledStudent: item.instructor.enrolledStudent,
        noOfCourse: item.courses.length,
        expertise: item.instructor.expertise,
        certifications: item.instructor.certifications,
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Instructor profile synced: "${instructorDoc.designation}" (${instructorDoc._id})`);

    // 4. Seed / Update Courses for this instructor
    for (const courseData of item.courses) {
      console.log(`\n  --> Seeding Course: "${courseData.title}" [${courseData.category}]`);
      const awardBadge = badgeMap[courseData.badgeTitle] || defaultBadgeId;

      let course = await Course.findOne({
        $or: [{ slug: courseData.slug }, { title: courseData.title }]
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
          instructor: user._id,
          status: "published",
          noOfStudents: courseData.noOfStudents,
          isDeleted: false,
          awardOnComplete: awardBadge,
        });
        console.log(`  + Created Course: "${course.title}" (${course._id})`);
      } else {
        course.title = courseData.title;
        course.category = courseData.category;
        course.description = courseData.description;
        course.price = courseData.price;
        course.level = courseData.level;
        course.thumbnail = courseData.thumbnail;
        course.introVideo = courseData.introVideo;
        course.tags = courseData.tags;
        course.instructor = user._id;
        course.status = "published";
        course.isDeleted = false;
        if (awardBadge) course.awardOnComplete = awardBadge;
        await course.save();
        console.log(`  ~ Updated Course: "${course.title}" (${course._id})`);
      }

      // Seed Modules (Units), Lessons, Tasks & Quizzes
      let unitOrder = 1;
      for (const modData of courseData.modules) {
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
        }

        // Task & Quiz
        if (modData.taskTitle) {
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
              description: modData.taskDescription || "Complete the module hands-on assignment.",
              type: "quiz",
              maxPoints: 20,
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              isDeleted: false,
            });
          }

          if (modData.questions && modData.questions.length > 0) {
            let quiz = await Quiz.findOne({
              course: course._id,
              unit: unit._id,
              title: modData.quizTitle,
              isDeleted: false,
            });

            if (!quiz) {
              quiz = await Quiz.create({
                course: course._id,
                unit: unit._id,
                task: task._id,
                title: modData.quizTitle,
                questions: modData.questions,
                passMark: 70,
                isDeleted: false,
              });
            }

            if (!task.quizId) {
              task.quizId = quiz._id;
              await task.save();
            }
          }
        }
      }
      console.log(`  ✓ Curricula, units, lessons & quizzes synced for "${course.title}"`);
    }

    // Refresh course count for instructor
    const actualCount = await Course.countDocuments({ instructor: user._id, isDeleted: false });
    instructorDoc.noOfCourse = actualCount;
    await instructorDoc.save();
  }

  console.log("\n======================================================");
  console.log("🎉 All new instructors & courses successfully seeded!");
  await mongoose.disconnect();
}

seedInstructorsAndCourses().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
