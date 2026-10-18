"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = __importDefault(require("./app/config/cloudinary"));
const env_1 = require("./app/config/env");
const user_model_1 = require("./app/modules/user/user.model");
const course_model_1 = require("./app/modules/course/course.model");
const category_model_1 = require("./app/modules/category/category.model");
const unit_model_1 = require("./app/modules/unit/unit.model");
const lesson_model_1 = require("./app/modules/lesson/lesson.model");
const event_model_1 = require("./app/modules/event/event.model");
const fs_1 = __importDefault(require("fs"));
function uploadLocalImage(filePath, publicId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (fs_1.default.existsSync(filePath)) {
                console.log(`Uploading ${filePath} to Cloudinary...`);
                const result = yield cloudinary_1.default.uploader.upload(filePath, {
                    folder: "asia-lms/courses",
                    public_id: publicId,
                    overwrite: true,
                });
                console.log(`Uploaded ${publicId}: ${result.secure_url}`);
                return result.secure_url;
            }
        }
        catch (err) {
            console.warn(`Failed to upload ${filePath}:`, err);
        }
        return "";
    });
}
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log("Connected to MongoDB for tech data seeding.");
        // 1. Get Instructor (use existing instructor or Super Admin)
        const instructor = (yield user_model_1.User.findOne({ role: "INSTRUCTOR" })) || (yield user_model_1.User.findOne({ role: "SUPER_ADMIN" }));
        if (!instructor) {
            throw new Error("No instructor or admin found in DB!");
        }
        console.log(`Using instructor: ${instructor.name} (${instructor._id})`);
        // 2. Upload generated local images to Cloudinary
        const brainDir = "C:\\Users\\Barisal Laptop House\\.gemini\\antigravity-ide\\brain\\be767fd2-40a2-40e6-851a-a4b5577f5ee8";
        const webDevImg = yield uploadLocalImage(`${brainDir}\\course_web_dev_1791632445590.jpg`, "course_web_dev");
        const aiPythonImg = yield uploadLocalImage(`${brainDir}\\course_ai_python_1791632466988.jpg`, "course_ai_python");
        const devopsImg = yield uploadLocalImage(`${brainDir}\\course_cloud_devops_1791632489489.jpg`, "course_cloud_devops");
        // Fallbacks if upload fails or for other courses
        const cyberSecImg = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80";
        const flutterImg = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80";
        const summitImg = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
        const workshopImg = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80";
        const hackathonImg = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80";
        // 3. Seed Tech Categories
        const techCategories = [
            { title: "Web Development", image: webDevImg || "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=600&q=80" },
            { title: "Artificial Intelligence", image: aiPythonImg || "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80" },
            { title: "Cloud & DevOps", image: devopsImg || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" },
            { title: "Cybersecurity", image: cyberSecImg },
            { title: "Mobile App Development", image: flutterImg },
        ];
        for (const cat of techCategories) {
            yield category_model_1.CourseCategory.findOneAndUpdate({ title: cat.title }, { title: cat.title, image: cat.image, isDeleted: false }, { upsert: true, new: true });
            console.log(`Category verified: ${cat.title}`);
        }
        // 4. Seed Tech Courses
        const techCourses = [
            {
                title: "Full-Stack Web Development with Next.js 15 & Node.js",
                slug: "full-stack-web-development-nextjs-nodejs",
                description: "Master modern full-stack web engineering with Next.js 15 App Router, React 19, TypeScript, Express, MongoDB, and Tailwind CSS. Learn to build production-ready, scalable platforms with seamless authentication and server actions.",
                price: 4500,
                level: "intermediate",
                category: "Web Development",
                thumbnail: webDevImg || "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80",
                introVideo: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
                tags: ["Next.js", "React", "TypeScript", "Node.js", "Full-Stack"],
                noOfStudents: 142,
                instructor: instructor._id,
                status: "published",
                units: [
                    {
                        title: "Introduction to Next.js 15 & App Architecture",
                        lessons: [
                            { title: "Next.js 15 App Router Architecture", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 900 },
                            { title: "Server vs Client Components in React 19", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 1200 },
                            { title: "Project Structure & Environment Setup", contentType: "article", contentUrl: "https://nextjs.org/docs", durationSec: 600 },
                        ],
                    },
                    {
                        title: "Backend API, MongoDB & Authentication",
                        lessons: [
                            { title: "Designing RESTful APIs with Express & TypeScript", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 1500 },
                            { title: "Mongoose Modeling & Data Relationships", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 1400 },
                            { title: "Securing APIs with JWT & Refresh Tokens", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", durationSec: 1600 },
                        ],
                    },
                ],
            },
            {
                title: "Mastering Python, AI & Generative Machine Learning",
                slug: "mastering-python-ai-generative-machine-learning",
                description: "A complete professional roadmap to Artificial Intelligence using Python. Cover data processing with NumPy and Pandas, classical ML algorithms with Scikit-Learn, Deep Learning with PyTorch, and building applications with LLMs and LangChain.",
                price: 5500,
                level: "beginner",
                category: "Artificial Intelligence",
                thumbnail: aiPythonImg || "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
                introVideo: "https://www.youtube.com/watch?v=aircAruvnKk",
                tags: ["Python", "Machine Learning", "AI", "PyTorch", "Data Science"],
                noOfStudents: 230,
                instructor: instructor._id,
                status: "published",
                units: [
                    {
                        title: "Python for Data Science Fundamentals",
                        lessons: [
                            { title: "Advanced Python Data Structures & OOP", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1100 },
                            { title: "NumPy & Vectorized Computing", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1300 },
                            { title: "Data Manipulation with Pandas", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1500 },
                        ],
                    },
                    {
                        title: "Machine Learning & Neural Networks",
                        lessons: [
                            { title: "Supervised & Unsupervised Learning", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 1800 },
                            { title: "Deep Learning Foundations with PyTorch", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=aircAruvnKk", durationSec: 2100 },
                        ],
                    },
                ],
            },
            {
                title: "Cloud DevOps Mastery: Docker, Kubernetes & CI/CD",
                slug: "cloud-devops-mastery-docker-kubernetes-cicd",
                description: "Accelerate your infrastructure engineering skills. Learn containerization with Docker, orchestration with Kubernetes, infrastructure as code (IaC), and automated CI/CD pipelines with GitHub Actions for cloud-native deployment.",
                price: 4800,
                level: "advanced",
                category: "Cloud & DevOps",
                thumbnail: devopsImg || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
                introVideo: "https://www.youtube.com/watch?v=hQcFE0RD0cQ",
                tags: ["DevOps", "Docker", "Kubernetes", "AWS", "CI/CD"],
                noOfStudents: 98,
                instructor: instructor._id,
                status: "published",
                units: [
                    {
                        title: "Containerization with Docker",
                        lessons: [
                            { title: "Docker Architecture & Multi-Stage Builds", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1400 },
                            { title: "Docker Compose for Multi-Service Applications", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1200 },
                        ],
                    },
                    {
                        title: "Kubernetes Cluster Management",
                        lessons: [
                            { title: "Pods, Deployments, and Services", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1800 },
                            { title: "Ingress Controllers & Helm Charts", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=hQcFE0RD0cQ", durationSec: 1700 },
                        ],
                    },
                ],
            },
            {
                title: "Cybersecurity & Ethical Hacking: Network Defense",
                slug: "cybersecurity-ethical-hacking-network-defense",
                description: "Hands-on cybersecurity bootcamp covering penetration testing, network sniffing, vulnerability scanning, web security (OWASP Top 10), and defensive countermeasures to safeguard enterprise systems.",
                price: 3999,
                level: "beginner",
                category: "Cybersecurity",
                thumbnail: cyberSecImg,
                introVideo: "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
                tags: ["Cybersecurity", "Ethical Hacking", "Networking", "Linux", "Security"],
                noOfStudents: 185,
                instructor: instructor._id,
                status: "published",
                units: [
                    {
                        title: "Networking & Security Essentials",
                        lessons: [
                            { title: "TCP/IP Protocol Suite & Wireshark Analysis", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1600 },
                            { title: "Linux Command Line for Hackers", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", durationSec: 1400 },
                        ],
                    },
                ],
            },
            {
                title: "Cross-Platform Mobile App Development with Flutter & Dart",
                slug: "cross-platform-mobile-app-development-flutter-dart",
                description: "Build beautiful, natively compiled mobile applications for iOS and Android from a single codebase. Learn state management with Bloc/Provider, REST API integration, animations, and responsive UI design.",
                price: 3800,
                level: "intermediate",
                category: "Mobile App Development",
                thumbnail: flutterImg,
                introVideo: "https://www.youtube.com/watch?v=x0uinJvhNxI",
                tags: ["Flutter", "Dart", "Mobile", "iOS", "Android"],
                noOfStudents: 110,
                instructor: instructor._id,
                status: "published",
                units: [
                    {
                        title: "Dart Language & Flutter UI Basics",
                        lessons: [
                            { title: "Dart OOP & Asynchronous Programming", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI", durationSec: 1300 },
                            { title: "Building Responsive Flutter Layouts", contentType: "video", contentUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI", durationSec: 1500 },
                        ],
                    },
                ],
            },
        ];
        for (const c of techCourses) {
            const { units } = c, courseData = __rest(c, ["units"]);
            const courseDoc = yield course_model_1.Course.findOneAndUpdate({ slug: courseData.slug }, courseData, { upsert: true, new: true });
            console.log(`Course upserted: ${courseDoc.title} (${courseDoc._id})`);
            // Add units & lessons
            if (units && units.length > 0) {
                for (let uIdx = 0; uIdx < units.length; uIdx++) {
                    const unitData = units[uIdx];
                    const unitDoc = yield unit_model_1.Unit.findOneAndUpdate({ course: courseDoc._id, orderIndex: uIdx + 1 }, { course: courseDoc._id, title: unitData.title, orderIndex: uIdx + 1, isDeleted: false }, { upsert: true, new: true });
                    if (unitData.lessons && unitData.lessons.length > 0) {
                        for (let lIdx = 0; lIdx < unitData.lessons.length; lIdx++) {
                            const lessonData = unitData.lessons[lIdx];
                            yield lesson_model_1.Lesson.findOneAndUpdate({ unit: unitDoc._id, orderIndex: lIdx + 1 }, Object.assign(Object.assign({}, lessonData), { unit: unitDoc._id, orderIndex: lIdx + 1, isDeleted: false }), { upsert: true, new: true });
                        }
                    }
                }
            }
        }
        // 5. Seed Tech Events
        const techEvents = [
            {
                title: "Global Tech & AI Summit 2025: Building Next-Gen LLM Apps",
                description: "Join leading industry AI researchers and software engineers discussing practical Generative AI applications, multi-agent frameworks, and high-scale cloud production architectures. Includes networking session and Q&A.",
                duration: 180,
                eventDate: new Date("2026-11-20T10:00:00.000Z"),
                location: "Hybrid & Online (Dhaka, Bangladesh)",
                organizer: instructor._id,
                price: 0,
                pointsReward: 50,
                thumbnail: summitImg,
                isDeleted: false,
            },
            {
                title: "Next.js 15 & Cloud Native Performance Masterclass",
                description: "A deep dive hands-on workshop on Next.js 15 caching primitives, Partial Prerendering (PPR), Server Actions, and distributed edge deployments for blistering fast web experiences.",
                duration: 120,
                eventDate: new Date("2026-11-05T14:00:00.000Z"),
                location: "Live Interactive Workshop (Virtual)",
                organizer: instructor._id,
                price: 499,
                pointsReward: 30,
                thumbnail: workshopImg,
                isDeleted: false,
            },
            {
                title: "Cyber Defense Hackathon & Red Team Challenge",
                description: "Compete in an intense 4-hour Capture The Flag (CTF) tournament designed for aspiring security researchers. Test your skills in network penetration, web vulnerability exploitation, and digital forensics.",
                duration: 240,
                eventDate: new Date("2026-12-01T09:00:00.000Z"),
                location: "Tech Innovation Hub, Banani, Dhaka",
                organizer: instructor._id,
                price: 0,
                pointsReward: 100,
                thumbnail: hackathonImg,
                isDeleted: false,
            },
        ];
        for (const e of techEvents) {
            yield event_model_1.Event.findOneAndUpdate({ title: e.title }, e, { upsert: true, new: true });
            console.log(`Event upserted: ${e.title}`);
        }
        console.log("\n✅ ALL TECH DATA SEEDED SUCCESSFULLY!");
        yield mongoose_1.default.disconnect();
    });
}
seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
