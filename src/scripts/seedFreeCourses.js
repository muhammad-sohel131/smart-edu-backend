const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DB_URL = process.env.DB_URL;

const freeCourses = [
  {
    title: "Python for Beginners: From Zero to Code Hero",
    slug: "python-for-beginners-zero-to-code-hero",
    description: "Start your programming journey with Python 3. Learn variables, data types, conditionals, loops, functions, and fundamental problem-solving techniques through real-world interactive coding exercises.",
    price: 0,
    level: "beginner",
    category: "Artificial Intelligence",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    tags: ["Python", "Programming", "Coding", "Beginner", "Problem Solving"],
    noOfStudents: 85,
    instructorEmail: "kawsar@gmail.com",
    status: "published",
    units: [
      {
        title: "Module 1: Getting Started with Python Setup & Syntax",
        lessons: [
          { title: "Introduction to Python & Development Environment Setup", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 720 },
          { title: "Variables, Data Types & Operators in Python", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 950 },
          { title: "Working with Strings & User Inputs", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 840 },
        ],
      },
      {
        title: "Module 2: Control Flow & Logical Decision Making",
        lessons: [
          { title: "Conditional Statements: if, elif, and else", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 900 },
          { title: "Mastering For and While Loops", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1100 },
          { title: "Hands-on: Building a Number Guessing Game", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1250 },
        ],
      },
      {
        title: "Module 3: Functions, Lists & Next Steps",
        lessons: [
          { title: "Reusable Code with Python Functions & Scope", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1020 },
          { title: "Lists, Tuples & Dictionaries Explained", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", durationSec: 1180 },
          { title: "Course Summary & Recommended Project Roadmap", contentType: "article", contentUrl: "https://docs.python.org/3/tutorial/", durationSec: 600 },
        ],
      },
    ],
  },
  {
    title: "HTML5 & Modern CSS3: Build Responsive Websites",
    slug: "html5-modern-css3-build-responsive-websites",
    description: "Learn how to create clean, responsive, and aesthetically pleasing websites from scratch using semantic HTML5 and modern CSS3 features, including Flexbox, CSS Grid, and media queries.",
    price: 0,
    level: "beginner",
    category: "Web Development",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=mU6anWqZJcc",
    tags: ["HTML5", "CSS3", "Web Design", "Responsive Design", "Flexbox"],
    noOfStudents: 120,
    instructorEmail: "sohel@gmail.com",
    status: "published",
    units: [
      {
        title: "Module 1: Semantic HTML5 Fundamentals",
        lessons: [
          { title: "The Structure of a Modern Webpage", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 650 },
          { title: "Semantic Tags: Header, Nav, Main, Section, Footer", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 820 },
          { title: "Modern Forms, Inputs & Web Accessibility", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 940 },
        ],
      },
      {
        title: "Module 2: CSS3 Styling & Modern Layouts",
        lessons: [
          { title: "CSS Box Model, Colors & Typography Deep Dive", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 910 },
          { title: "Modern Layouts with Flexbox & CSS Grid", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1350 },
          { title: "Responsive Web Design & Mobile-First Media Queries", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1100 },
        ],
      },
      {
        title: "Module 3: Project: Landing Page & Deployment",
        lessons: [
          { title: "Building a Modern Hero Section with Call-to-Action", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1200 },
          { title: "Responsive Cards Grid with Hover Transitions", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc", durationSec: 1150 },
          { title: "Deploying Your Website Live for Free on Vercel", contentType: "article", contentUrl: "https://vercel.com/docs", durationSec: 600 },
        ],
      },
    ],
  },
  {
    title: "Git & GitHub for Beginners: Complete Collaboration Guide",
    slug: "git-github-for-beginners-complete-guide",
    description: "Master Git version control and GitHub from the ground up. Learn how to track code changes, collaborate with teams, create pull requests, resolve merge conflicts, and showcase your developer portfolio.",
    price: 0,
    level: "beginner",
    category: "Cloud & DevOps",
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=RGOj5yH7evk",
    tags: ["Git", "GitHub", "DevOps", "Version Control", "Open Source"],
    noOfStudents: 98,
    instructorEmail: "kawsar@gmail.com",
    status: "published",
    units: [
      {
        title: "Module 1: Git Basics & Local Repositories",
        lessons: [
          { title: "Understanding Version Control & Installing Git", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 600 },
          { title: "The Fundamental Workflow: git init, add, commit & status", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 850 },
          { title: "Undoing Mistakes: git restore, git diff & git reset", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 780 },
        ],
      },
      {
        title: "Module 2: GitHub & Team Collaboration",
        lessons: [
          { title: "Connecting Local Repositories to GitHub via SSH", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 920 },
          { title: "Branching Strategies: git branch, checkout & merge", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 1050 },
          { title: "Creating Pull Requests & Resolving Merge Conflicts", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 1300 },
        ],
      },
      {
        title: "Module 3: Open Source & Developer Profile",
        lessons: [
          { title: "How to Fork & Contribute to Open Source Repositories", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", durationSec: 960 },
          { title: "Building an Impressive GitHub Profile README", contentType: "article", contentUrl: "https://docs.github.com", durationSec: 600 },
        ],
      },
    ],
  },
  {
    title: "Cybersecurity Essentials & Safe Digital Citizenship",
    slug: "cybersecurity-essentials-safe-digital-citizenship",
    description: "Learn the critical principles of digital security, threat defense, safe browsing, data privacy, and online hygiene. Protect yourself and your organization against phishing attacks, ransomware, and identity theft.",
    price: 0,
    level: "beginner",
    category: "Cybersecurity",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    introVideo: "https://www.youtube.com/watch?v=inWWhr5tnEA",
    tags: ["Cybersecurity", "Network Defense", "Data Privacy", "Ethical Hacking", "Digital Safety"],
    noOfStudents: 110,
    instructorEmail: "bristy@gmail.com",
    status: "published",
    units: [
      {
        title: "Module 1: Foundations of Cybersecurity & Threat Defense",
        lessons: [
          { title: "The Modern Threat Landscape: Malware, Ransomware & Social Engineering", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 750 },
          { title: "Password Security, Password Managers & 2FA / MFA", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 850 },
          { title: "Wi-Fi Safety, End-to-End Encryption & Secure Protocols", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 920 },
        ],
      },
      {
        title: "Module 2: Defending Against Social Engineering & Phishing",
        lessons: [
          { title: "How to Spot Phishing Emails, Smishing & Malicious Links", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 980 },
          { title: "Safe Browsing Habits & Privacy Controls on Social Media", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationSec: 860 },
          { title: "Incident Response Checklist: What to Do If Compromised", contentType: "article", contentUrl: "https://cisa.gov", durationSec: 700 },
        ],
      },
    ],
  },
];

async function seedFreeCourses() {
  await mongoose.connect(DB_URL);
  console.log("Connected to MongoDB for seeding free courses.");

  const defaultInstructor = await mongoose.connection.collection('users').findOne({ role: { $in: ["INSTRUCTOR", "instructor"] } });

  for (const courseData of freeCourses) {
    const { units, instructorEmail, ...courseFields } = courseData;

    let instructor = await mongoose.connection.collection('users').findOne({ email: instructorEmail });
    if (!instructor) {
      instructor = defaultInstructor;
    }

    const courseDoc = {
      ...courseFields,
      instructor: instructor._id,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Upsert course
    const existingCourse = await mongoose.connection.collection('courses').findOne({ slug: courseDoc.slug });
    let courseId;

    if (existingCourse) {
      await mongoose.connection.collection('courses').updateOne(
        { _id: existingCourse._id },
        { $set: courseDoc }
      );
      courseId = existingCourse._id;
      console.log(`Updated course: "${courseDoc.title}" (ID: ${courseId})`);

      // Clean old units & lessons
      const oldUnits = await mongoose.connection.collection('units').find({ course: courseId }).toArray();
      for (const u of oldUnits) {
        await mongoose.connection.collection('lessons').deleteMany({ unit: u._id });
      }
      await mongoose.connection.collection('units').deleteMany({ course: courseId });
    } else {
      const inserted = await mongoose.connection.collection('courses').insertOne(courseDoc);
      courseId = inserted.insertedId;
      console.log(`Created course: "${courseDoc.title}" (ID: ${courseId})`);
    }

    // Insert units and lessons
    if (units && units.length > 0) {
      for (let uIdx = 0; uIdx < units.length; uIdx++) {
        const u = units[uIdx];
        const unitDoc = {
          course: courseId,
          title: u.title,
          orderIndex: uIdx + 1,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const insertedUnit = await mongoose.connection.collection('units').insertOne(unitDoc);
        const unitId = insertedUnit.insertedId;

        if (u.lessons && u.lessons.length > 0) {
          for (let lIdx = 0; lIdx < u.lessons.length; lIdx++) {
            const l = u.lessons[lIdx];
            const lessonDoc = {
              unit: unitId,
              title: l.title,
              contentType: l.contentType,
              contentUrl: l.contentUrl,
              durationSec: l.durationSec,
              orderIndex: lIdx + 1,
              isDeleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await mongoose.connection.collection('lessons').insertOne(lessonDoc);
          }
        }
      }
      console.log(`  Added ${units.length} modules for "${courseDoc.title}"`);
    }
  }

  // Also ensure categories exist in categories collection
  const categories = [
    { title: "Artificial Intelligence", image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80" },
    { title: "Web Development", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=600&q=80" },
    { title: "Cloud & DevOps", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" },
    { title: "Cybersecurity", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80" },
  ];

  for (const cat of categories) {
    const existingCat = await mongoose.connection.collection('categories').findOne({ title: cat.title });
    if (!existingCat) {
      await mongoose.connection.collection('categories').insertOne({
        title: cat.title,
        slug: cat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        image: cat.image,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added category: "${cat.title}"`);
    }
  }

  console.log("\nAll free courses and categories seeded successfully!");
  await mongoose.disconnect();
}

seedFreeCourses().catch(console.error);
