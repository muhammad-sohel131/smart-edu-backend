const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("DB_URL is missing!");
  process.exit(1);
}

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB for seeding mixed quizzes.");

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
  const Unit = mongoose.model('Unit', new mongoose.Schema({}, { strict: false }));
  const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
  const Quiz = mongoose.model('Quiz', new mongoose.Schema({}, { strict: false }));

  // 1. Cloud DevOps Mastery - Module 1
  const devopsCourse = await Course.findOne({ slug: "cloud-devops-mastery-docker-kubernetes-cicd" });
  if (devopsCourse) {
    const devopsUnit1 = await Unit.findOne({ course: devopsCourse._id }).sort({ order: 1 });
    if (devopsUnit1) {
      const devopsQuizTask = await Task.findOne({ unit: devopsUnit1._id, type: "quiz" });
      if (devopsQuizTask && devopsQuizTask.quizId) {
        const questions = [
          {
            type: "mcq",
            prompt: "How does a Docker container differ architecturally from a traditional Virtual Machine (VM)?",
            options: [
              {
                text: "Containers share the host OS kernel and isolate user spaces, while VMs require a dedicated hypervisor and guest OS.",
                isCorrect: true,
              },
              {
                text: "Containers have their own hardware BIOS and CPU emulation.",
                isCorrect: false,
              },
              {
                text: "VMs are lighter and launch faster than Docker containers.",
                isCorrect: false,
              },
              {
                text: "Containers can only run on Linux, never on macOS or Windows.",
                isCorrect: false,
              },
            ],
            perCorrectPoint: 2,
          },
          {
            type: "mcq",
            prompt: "What is the primary benefit of Multi-Stage builds in a Dockerfile?",
            options: [
              {
                text: "Separating build tools from runtime artifacts, producing drastically smaller and more secure production images.",
                isCorrect: true,
              },
              {
                text: "Running multiple operating systems inside a single container.",
                isCorrect: false,
              },
              {
                text: "Allowing Docker to bypass Linux kernel security namespaces.",
                isCorrect: false,
              },
              {
                text: "Increasing container image size for caching.",
                isCorrect: false,
              },
            ],
            perCorrectPoint: 2,
          },
          {
            type: "mcq",
            prompt: "Which Docker instruction should be used to define the fixed executable that will always run when a container starts?",
            options: [
              { text: "ENTRYPOINT", isCorrect: true },
              { text: "RUN", isCorrect: false },
              { text: "ENV", isCorrect: false },
              { text: "LABEL", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            type: "mcq",
            prompt: "Which CLI command runs a container in detached mode with host port 80 mapped to container port 8080?",
            options: [
              { text: "docker run -d -p 80:8080 <image-name>", isCorrect: true },
              { text: "docker run -it -port 8080 <image-name>", isCorrect: false },
              { text: "docker start -expose 80 <image-name>", isCorrect: false },
              { text: "docker attach -p 8080:80 <image-name>", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            type: "short",
            prompt: "Explain the key difference between the `COPY` and `ADD` instructions in a Dockerfile, and why `COPY` is generally recommended for security and best practices.",
            options: [],
            perCorrectPoint: 5,
          },
          {
            type: "short",
            prompt: "Describe how Docker utilizes Linux Namespaces and Control Groups (cgroups) under the hood to achieve process isolation and resource limitation.",
            options: [],
            perCorrectPoint: 5,
          },
          {
            type: "short",
            prompt: "Differentiate between Docker Named Volumes and Bind Mounts. In what production deployment scenario should you strictly prefer a Named Volume?",
            options: [],
            perCorrectPoint: 5,
          },
        ];

        const totalMaxPoints = questions.reduce((sum, q) => sum + (q.perCorrectPoint || 0), 0);

        await Quiz.findByIdAndUpdate(devopsQuizTask.quizId, {
          title: "Docker Architecture & Containerization Master Quiz (MCQ & Short Answer)",
          questions,
          passMark: 70,
        });

        devopsQuizTask.title = "Docker Architecture & Containerization Master Quiz (MCQ & Short Answer)";
        devopsQuizTask.maxPoints = totalMaxPoints;
        await devopsQuizTask.save();

        console.log(`✅ DevOps Module 1 quiz updated with ${questions.length} questions (4 MCQ, 3 Short) | Max points: ${totalMaxPoints}`);
      }
    }
  }

  // 2. Full-Stack Next.js 15 Course - Module 1
  const nextCourse = await Course.findOne({ slug: "full-stack-web-development-nextjs-nodejs" });
  if (nextCourse) {
    const nextUnit1 = await Unit.findOne({ course: nextCourse._id }).sort({ order: 1 });
    if (nextUnit1) {
      const nextQuizTask = await Task.findOne({ unit: nextUnit1._id, type: "quiz" });
      if (nextQuizTask && nextQuizTask.quizId) {
        const nextQuestions = [
          {
            type: "mcq",
            prompt: "In Next.js 15 App Router, what is the default rendering paradigm for components inside the `app` directory?",
            options: [
              { text: "React Server Components (RSC) rendered exclusively on the server", isCorrect: true },
              { text: "Client Components hydrated immediately on the client browser", isCorrect: false },
              { text: "Legacy Single Page Application (SPA) CSR rendering", isCorrect: false },
              { text: "Static export HTML without hydration support", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            type: "mcq",
            prompt: "Which directive must be placed at the very top of a file to declare a component as a Client Component in Next.js?",
            options: [
              { text: "'use client'", isCorrect: true },
              { text: "'use browser'", isCorrect: false },
              { text: "'client-side'", isCorrect: false },
              { text: "'use strict'", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            type: "mcq",
            prompt: "What is the primary role of Server Actions in Next.js 15?",
            options: [
              { text: "Asynchronous functions executed on the server, typically used for form submissions and data mutations without manual API routes", isCorrect: true },
              { text: "Client-side state management replacing Redux", isCorrect: false },
              { text: "CSS styling and animations compiler", isCorrect: false },
              { text: "Database connection pool optimizer on the client", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            type: "short",
            prompt: "Explain the architecture of React Server Components (RSC) vs Client Components. When should you convert a Server Component into a Client Component using `'use client'`?",
            options: [],
            perCorrectPoint: 5,
          },
          {
            type: "short",
            prompt: "How does Partial Prerendering (PPR) in Next.js 15 combine static shell generation with dynamic streaming components via React Suspense?",
            options: [],
            perCorrectPoint: 5,
          },
        ];

        const totalPoints = nextQuestions.reduce((sum, q) => sum + (q.perCorrectPoint || 0), 0);

        await Quiz.findByIdAndUpdate(nextQuizTask.quizId, {
          title: "Next.js 15 App Router & React 19 Architecture Quiz (MCQ & Short Answer)",
          questions: nextQuestions,
          passMark: 70,
        });

        nextQuizTask.title = "Next.js 15 App Router & React 19 Architecture Quiz (MCQ & Short Answer)";
        nextQuizTask.maxPoints = totalPoints;
        await nextQuizTask.save();

        console.log(`✅ Next.js Module 1 quiz updated with ${nextQuestions.length} questions (3 MCQ, 2 Short) | Max points: ${totalPoints}`);
      }
    }
  }

  await mongoose.disconnect();
  console.log("Seeding mixed quizzes complete.");
}

main().catch(console.error);
