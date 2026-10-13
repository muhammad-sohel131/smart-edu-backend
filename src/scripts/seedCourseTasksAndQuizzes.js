const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("DB_URL is missing in environment variables!");
  process.exit(1);
}

// Schemas
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
    perCorrectPoint: { type: Number, default: 2 },
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
    maxPoints: { type: Number, default: 10 },
    dueDate: { type: Date },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const UnitSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    orderIndex: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
const Unit = mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

// Course specific curriculum tasks and quizzes definitions
const courseCurriculumData = {
  // 1. Flutter Course
  "Cross-Platform Mobile App Development with Flutter & Dart": [
    {
      unitIndex: 1, // Module 1
      quiz: {
        title: "Dart Syntax & OOP Mastery Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What is the primary difference between 'const' and 'final' in Dart?",
            options: [
              { text: "'const' is compile-time constant, whereas 'final' is initialized only once at runtime.", isCorrect: true },
              { text: "'final' variables can be reassigned multiple times inside functions.", isCorrect: false },
              { text: "'const' is exclusively reserved for primitive integers and doubles.", isCorrect: false },
              { text: "There is no difference; they are exact aliases in modern Dart 3.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which Dart keyword is used to enforce sound null safety by asserting a nullable variable is non-null?",
            options: [
              { text: "The null assertion operator (!)", isCorrect: true },
              { text: "The late keyword with question mark (?)", isCorrect: false },
              { text: "The required modifier", isCorrect: false },
              { text: "The dynamic cast operator (as dynamic)", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In Dart, what feature allows sharing code across classes without multiple inheritance?",
            options: [
              { text: "Mixins (using the 'with' keyword)", isCorrect: true },
              { text: "Dynamic prototypes", isCorrect: false },
              { text: "Virtual base classes", isCorrect: false },
              { text: "Static pointer references", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What return type is expected from an asynchronous Dart function declaring the 'async' modifier?",
            options: [
              { text: "Future<T>", isCorrect: true },
              { text: "StreamController<T>", isCorrect: false },
              { text: "Promise<T>", isCorrect: false },
              { text: "Synchronous void callback", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "How does a factory constructor differ from a generative constructor in Dart?",
            options: [
              { text: "A factory constructor does not always create a new instance and can return cached instances or subtypes.", isCorrect: true },
              { text: "A factory constructor cannot accept parameters.", isCorrect: false },
              { text: "A factory constructor cannot access class fields.", isCorrect: false },
              { text: "Factory constructors are deprecated in Flutter 3.x.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Assignment 1: Dart OOP Design Patterns & CLI Calculator",
        type: "pdf",
        maxPoints: 15,
        description: "Implement a modular command-line application in Dart that applies Factory Constructors, Abstract Classes, and Mixins. Submit a GitHub repository link alongside a 2-page PDF explaining your class hierarchy and unit tests.",
      },
    },
    {
      unitIndex: 2, // Module 2
      quiz: {
        title: "Flutter Widgets & Responsive Layouts Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "Which widget is ideal for rendering an infinitely scrolling list with memory-efficient lazy loading?",
            options: [
              { text: "ListView.builder", isCorrect: true },
              { text: "SingleChildScrollView containing Column", isCorrect: false },
              { text: "Stack with positioned children", isCorrect: false },
              { text: "Wrap with fixed spacing", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "When building responsive layouts across Mobile and Tablet, which widget provides immediate constraints information?",
            options: [
              { text: "LayoutBuilder", isCorrect: true },
              { text: "FittedBox", isCorrect: false },
              { text: "Align", isCorrect: false },
              { text: "AspectRatio", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the role of 'BuildContext' in the Flutter widget tree?",
            options: [
              { text: "It represents the locator and handle to the location of a widget in the widget tree.", isCorrect: true },
              { text: "It executes background network requests on a separate isolate.", isCorrect: false },
              { text: "It is an external database ORM adapter.", isCorrect: false },
              { text: "It compiles Dart code to machine bytecode.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which widget is used to place children on top of each other in overlapping layers?",
            options: [
              { text: "Stack", isCorrect: true },
              { text: "Flex", isCorrect: false },
              { text: "Row", isCorrect: false },
              { text: "GridView", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What happens when 'setState()' is called inside a StatefulWidget?",
            options: [
              { text: "It flags the Element as dirty and schedules a call to the build() method.", isCorrect: true },
              { text: "It destroys the widget and rebuilds the entire application from main().", isCorrect: false },
              { text: "It directly reloads Flutter assets from disk.", isCorrect: false },
              { text: "It resets all state variables to their default initial values.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Practical Task 2: Responsive E-Commerce Product Catalog Demo",
        type: "video",
        maxPoints: 20,
        description: "Develop a responsive e-commerce catalog page featuring a sticky search bar, category chips, and a responsive product grid. Record a 2-3 minute screen recording demonstrating fluid transitions on both mobile and tablet viewport sizes.",
      },
    },
    {
      unitIndex: 3, // Module 3
      quiz: {
        title: "BLoC & Riverpod State Architecture Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What is the foundational architectural principle of the BLoC (Business Logic Component) pattern?",
            options: [
              { text: "Separation of presentation from business logic using reactive Streams (Sinks for events, Streams for states).", isCorrect: true },
              { text: "Writing all UI and network code directly in the State object.", isCorrect: false },
              { text: "Bypassing the Flutter widget tree with direct native platform channels.", isCorrect: false },
              { text: "Storing state in global mutable singleton classes.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In Riverpod, what modifier ensures a provider automatically disposes its state when no longer listened to?",
            options: [
              { text: ".autoDispose", isCorrect: true },
              { text: ".family", isCorrect: false },
              { text: ".override", isCorrect: false },
              { text: ".disposeNow", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What widget in flutter_bloc should you use when you only want to execute side effects (like showing a SnackBar or Dialog) on state changes?",
            options: [
              { text: "BlocListener", isCorrect: true },
              { text: "BlocBuilder", isCorrect: false },
              { text: "RepositoryProvider", isCorrect: false },
              { text: "MultiBlocProvider", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Why is the equatable package recommended when working with BLoC states?",
            options: [
              { text: "It provides value equality comparison without requiring manual '==' and 'hashCode' overrides.", isCorrect: true },
              { text: "It automatically generates SQLite database migrations.", isCorrect: false },
              { text: "It handles JSON serialization in background threads.", isCorrect: false },
              { text: "It compresses network payloads.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which Riverpod provider type is designed specifically for managing complex asynchronous states with Future/Stream support?",
            options: [
              { text: "AsyncNotifierProvider", isCorrect: true },
              { text: "StateProvider", isCorrect: false },
              { text: "ChangeNotifierProvider", isCorrect: false },
              { text: "SimpleProvider", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Practical Task 3: State-Driven Cart & Offline Persistence Architecture Report",
        type: "pdf",
        maxPoints: 20,
        description: "Architect a shopping cart feature using BLoC or Riverpod with offline persistence (Hive or HydratedBloc). Submit your architecture data-flow diagram, unit test coverage report, and implementation breakdown in PDF.",
      },
    },
    {
      unitIndex: 4, // Module 4
      quiz: {
        title: "Flutter Production Deployment & Optimization Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What command creates an optimized, obfuscated release Android App Bundle (AAB) in Flutter?",
            options: [
              { text: "flutter build appbundle --release --obfuscate --split-debug-info=/<symbols-path>", isCorrect: true },
              { text: "flutter run --release --android", isCorrect: false },
              { text: "flutter compile native-apk", isCorrect: false },
              { text: "flutter export android-bundle", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What tool does Flutter provide to inspect frame rendering, UI jank, and memory leaks?",
            options: [
              { text: "Flutter DevTools (Performance & Memory Profiler)", isCorrect: true },
              { text: "Postman", isCorrect: false },
              { text: "Docker Desktop", isCorrect: false },
              { text: "Webpack Analyzer", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "How should sensitive API secrets and keys be securely stored in a Flutter production application?",
            options: [
              { text: "Using compile-time environment variables (--dart-define) and flutter_secure_storage with keychain/keystore.", isCorrect: true },
              { text: "Hardcoded directly as plaintext constants in lib/constants.dart.", isCorrect: false },
              { text: "Committed directly in the public AndroidManifest.xml file.", isCorrect: false },
              { text: "Stored in SharedPreferences with no encryption.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the primary benefit of the Dio HTTP package over the standard http package in Flutter?",
            options: [
              { text: "Interceptors, global error handling, request cancellation, and file progress tracking.", isCorrect: true },
              { text: "It replaces the Flutter rendering engine.", isCorrect: false },
              { text: "It allows direct MongoDB connections from the phone.", isCorrect: false },
              { text: "It automatically publishes apps to Google Play.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the purpose of ProGuard/R8 rules when publishing a Flutter Android app?",
            options: [
              { text: "Code shrinking, optimization, and obfuscation while keeping necessary third-party plugin classes.", isCorrect: true },
              { text: "Converting Dart code to Swift for iOS.", isCorrect: false },
              { text: "Auto-generating app launcher icons.", isCorrect: false },
              { text: "Installing SSL certificates on the test device.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Capstone Project: Production Flutter Application Walkthrough & APK",
        type: "video",
        maxPoints: 30,
        description: "Submit a comprehensive end-to-end video walkthrough demonstrating your fully functional Flutter app: authentication flow, live REST API integration, offline caching, dark/light theme switching, and smooth animations.",
      },
    },
  ],

  // 2. Cybersecurity Course
  "Cybersecurity & Ethical Hacking: Network Defense": [
    {
      unitIndex: 1,
      quiz: {
        title: "Network Security & Protocol Analysis Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What sequence of packets establishes a reliable TCP connection?",
            options: [
              { text: "SYN, SYN-ACK, ACK", isCorrect: true },
              { text: "ACK, FIN, RST", isCorrect: false },
              { text: "SYN, ACK, PUSH", isCorrect: false },
              { text: "HELLO, VERIFY, CONNECT", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which attack vector manipulates ARP caches to intercept traffic between a victim and the default gateway?",
            options: [
              { text: "ARP Spoofing / Poisoning", isCorrect: true },
              { text: "DNS Amplification", isCorrect: false },
              { text: "SQL Injection", isCorrect: false },
              { text: "Buffer Overflow", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In Wireshark, which filter expression displays exclusively HTTP POST requests?",
            options: [
              { text: "http.request.method == \"POST\"", isCorrect: true },
              { text: "tcp.port == 80 && post", isCorrect: false },
              { text: "ip.proto == http-post", isCorrect: false },
              { text: "packet.type == \"POST\"", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What key cryptographic enhancement was introduced in TLS 1.3 over TLS 1.2?",
            options: [
              { text: "Removal of outdated cipher suites and mandatory 1-RTT handshake with forward secrecy.", isCorrect: true },
              { text: "Re-introducing RC4 encryption for speed.", isCorrect: false },
              { text: "Allowing plain text transmission of passwords.", isCorrect: false },
              { text: "Disabling AES-GCM.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the primary role of DNSSEC in domain resolution?",
            options: [
              { text: "Provides cryptographic authentication of DNS data to prevent DNS spoofing and cache poisoning.", isCorrect: true },
              { text: "Encrypts all DNS queries end-to-end to hide browsing history.", isCorrect: false },
              { text: "Accelerates page rendering in Chrome.", isCorrect: false },
              { text: "Generates free SSL certificates automatically.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 1: Wireshark PCAP Packet Forensics & Rogue ARP Analysis",
        type: "pdf",
        maxPoints: 15,
        description: "Analyze the simulated incident PCAP capture file. Identify the rogue MAC address conducting ARP poisoning, extract intercepted credentials, and write an incident triage report in PDF format.",
      },
    },
    {
      unitIndex: 2,
      quiz: {
        title: "Reconnaissance, Nmap & Linux Hardening Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What flag in Nmap performs a stealthy TCP SYN (Half-Open) scan?",
            options: [
              { text: "-sS", isCorrect: true },
              { text: "-sT", isCorrect: false },
              { text: "-sU", isCorrect: false },
              { text: "-sX", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which command lists all listening ports with associated process IDs in modern Linux?",
            options: [
              { text: "ss -tulpn", isCorrect: true },
              { text: "ps -ef | grep open", isCorrect: false },
              { text: "ls -la /ports", isCorrect: false },
              { text: "cat /etc/services", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What does the SUID (Set User ID) permission bit allow on a Linux executable file?",
            options: [
              { text: "It allows unprivileged users to execute the file with the permissions of the file owner (often root).", isCorrect: true },
              { text: "It permanently encrypts the executable file.", isCorrect: false },
              { text: "It marks the file as read-only for administrators.", isCorrect: false },
              { text: "It hides the file from the ls command.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which tool is commonly used to automate OSINT reconnaissance on subdomains and DNS records?",
            options: [
              { text: "Amass / Sublist3r", isCorrect: true },
              { text: "Gzip", isCorrect: false },
              { text: "Nginx", isCorrect: false },
              { text: "Vim", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "How does an attacker exploit insecure cron jobs for Linux privilege escalation?",
            options: [
              { text: "By modifying a root-owned script or binary scheduled to run at regular intervals if permissions are world-writable.", isCorrect: true },
              { text: "By restarting the Linux kernel remotely.", isCorrect: false },
              { text: "By sending ICMP echo requests.", isCorrect: false },
              { text: "By filling up the disk space.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 2: Target Vulnerability Assessment & Hardening Audit Report",
        type: "pdf",
        maxPoints: 20,
        description: "Conduct authorized port scanning and service enumeration against the target sandbox machine. Document open ports, potential CVE vulnerabilities, and security hardening recommendations in PDF.",
      },
    },
    {
      unitIndex: 3,
      quiz: {
        title: "OWASP Top 10 Web Exploits & Defenses Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "Which secure coding technique is the most effective defense against SQL Injection?",
            options: [
              { text: "Parameterized Queries / Prepared Statements", isCorrect: true },
              { text: "Client-side regex validation only", isCorrect: false },
              { text: "Converting inputs to uppercase strings", isCorrect: false },
              { text: "Storing database passwords in base64", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What HTTP header instructs modern browsers to block Cross-Site Scripting (XSS) by restricting executable script domains?",
            options: [
              { text: "Content-Security-Policy (CSP)", isCorrect: true },
              { text: "X-Frame-Options", isCorrect: false },
              { text: "Strict-Transport-Security", isCorrect: false },
              { text: "Access-Control-Allow-Origin", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is an IDOR (Insecure Direct Object Reference) vulnerability?",
            options: [
              { text: "When an application exposes direct references to database objects (like user IDs in URLs) without verifying user authorization.", isCorrect: true },
              { text: "When an SSL certificate has expired.", isCorrect: false },
              { text: "When an API uses JSON instead of XML.", isCorrect: false },
              { text: "When database passwords are too short.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which vulnerability occurs when an attacker forces a web server to make unauthorized requests to internal infrastructure?",
            options: [
              { text: "Server-Side Request Forgery (SSRF)", isCorrect: true },
              { text: "Cross-Site Request Forgery (CSRF)", isCorrect: false },
              { text: "Clickjacking", isCorrect: false },
              { text: "DNS Cache Poisoning", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Why should session tokens and JWTs be stored in HttpOnly, Secure cookies rather than localStorage?",
            options: [
              { text: "To prevent malicious client-side JavaScript (via XSS) from reading and stealing the session tokens.", isCorrect: true },
              { text: "Because localStorage cannot store strings longer than 100 characters.", isCorrect: false },
              { text: "Cookies are faster than localStorage in CPU benchmarks.", isCorrect: false },
              { text: "Browser localStorage is deprecated in HTML5.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 3: Web Exploit Remediation & Proof of Concept (PoC) Video",
        type: "video",
        maxPoints: 20,
        description: "Submit a 3-5 minute video demonstrating the identification and remediation of an SQL Injection and Reflected XSS vulnerability in the sandbox web application, confirming secure validation.",
      },
    },
    {
      unitIndex: 4,
      quiz: {
        title: "SOC Operations, SIEM & Incident Handling Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What are the six phases of the NIST Computer Security Incident Handling Guide (SP 800-61)?",
            options: [
              { text: "Preparation, Detection & Analysis, Containment, Eradication, Recovery, Post-Incident Activity.", isCorrect: true },
              { text: "Scan, Exploit, Pivot, Exfiltrate, Delete, Repeat.", isCorrect: false },
              { text: "Plan, Code, Build, Test, Deploy, Monitor.", isCorrect: false },
              { text: "Initiate, Authorize, Review, Audit, Close, Archive.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the primary function of a Security Information and Event Management (SIEM) system?",
            options: [
              { text: "Aggregating, correlating, and analyzing log data across disparate enterprise systems in real time for threat detection.", isCorrect: true },
              { text: "Replacing software firewalls with physical routers.", isCorrect: false },
              { text: "Backing up employee desktop wallpaper.", isCorrect: false },
              { text: "Encrypting company email signatures.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is a 'Zero Trust' network architecture based upon?",
            options: [
              { text: "'Never trust, always verify' — strict identity authentication and authorization for every request, internal or external.", isCorrect: true },
              { text: "Trusting all devices physically connected inside the office LAN.", isCorrect: false },
              { text: "Disabling firewalls between internal microservices.", isCorrect: false },
              { text: "Using passwords with 64 random characters.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What framework provides a globally accessible knowledge base of adversary tactics, techniques, and procedures (TTPs)?",
            options: [
              { text: "MITRE ATT&CK Framework", isCorrect: true },
              { text: "IEEE 802.11 standards", isCorrect: false },
              { text: "W3C HTML guidelines", isCorrect: false },
              { text: "ISO 9001 Quality Framework", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What action should immediately follow containing a compromised endpoint infected with malware?",
            options: [
              { text: "Forensic image capture of memory and disk, followed by root-cause eradication and vulnerability patching before re-admission.", isCorrect: true },
              { text: "Formatting the computer immediately with no logs preserved.", isCorrect: false },
              { text: "Reconnecting it to the main production network to see if it still transmits.", isCorrect: false },
              { text: "Emailing the malware file to customer support.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Capstone Defense: Enterprise SOC Incident Response Plan & Playbook",
        type: "pdf",
        maxPoints: 30,
        description: "Draft an enterprise-grade Incident Response Playbook for detecting, containing, and recovering from an active Ransomware attack across cloud servers. Submit the finalized technical PDF documentation.",
      },
    },
  ],

  // 3. DevOps Course
  "Cloud DevOps Mastery: Docker, Kubernetes & CI/CD": [
    {
      unitIndex: 1,
      quiz: {
        title: "Docker Architecture & Containerization Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "How does a Docker container differ architecturally from a traditional Virtual Machine (VM)?",
            options: [
              { text: "Containers share the host OS kernel and isolate user spaces, while VMs require a dedicated hypervisor and guest OS.", isCorrect: true },
              { text: "Containers have their own hardware BIOS and CPU emulation.", isCorrect: false },
              { text: "VMs are lighter and launch faster than Docker containers.", isCorrect: false },
              { text: "Containers can only run on Linux, never on macOS or Windows.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the primary benefit of Multi-Stage builds in a Dockerfile?",
            options: [
              { text: "Separating build tools from runtime artifacts, producing drastically smaller and more secure production images.", isCorrect: true },
              { text: "Running multiple operating systems inside a single container.", isCorrect: false },
              { text: "Allowing Docker to bypass Linux kernel security namespaces.", isCorrect: false },
              { text: "Increasing container image size for caching.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What Docker instruction should be used to define the fixed executable that will always run when a container starts?",
            options: [
              { text: "ENTRYPOINT", isCorrect: true },
              { text: "RUN", isCorrect: false },
              { text: "ENV", isCorrect: false },
              { text: "LABEL", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which command runs a container in detached mode with port 80 on host mapped to port 8080 inside container?",
            options: [
              { text: "docker run -d -p 80:8080 <image-name>", isCorrect: true },
              { text: "docker run -it -port 8080 <image-name>", isCorrect: false },
              { text: "docker start -expose 80 <image-name>", isCorrect: false },
              { text: "docker attach -p 8080:80 <image-name>", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the security risk of running container processes as root (default)?",
            options: [
              { text: "If a container escape vulnerability occurs, the attacker immediately gains root access to the host machine.", isCorrect: true },
              { text: "Root containers cannot listen on HTTP ports.", isCorrect: false },
              { text: "Docker cannot compress images built by root.", isCorrect: false },
              { text: "There is no security difference.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 1: Multi-Stage Dockerfile Optimization & Image Security Audit",
        type: "pdf",
        maxPoints: 15,
        description: "Create a hardened multi-stage Dockerfile for a TypeScript Node.js backend. Run Trivy vulnerability scanner on the output image and submit your optimization comparison report in PDF.",
      },
    },
    {
      unitIndex: 2,
      quiz: {
        title: "Kubernetes Cluster Architecture & Orchestration Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "Which Kubernetes component is the single source of truth and distributed key-value store for cluster state?",
            options: [
              { text: "etcd", isCorrect: true },
              { text: "kube-scheduler", isCorrect: false },
              { text: "kube-proxy", isCorrect: false },
              { text: "containerd", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What controller in Kubernetes automatically scales Pod replicas based on CPU/memory utilization?",
            options: [
              { text: "Horizontal Pod Autoscaler (HPA)", isCorrect: true },
              { text: "Cluster Autoscaler", isCorrect: false },
              { text: "DaemonSet Controller", isCorrect: false },
              { text: "StatefulSet Controller", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which Service type in Kubernetes exposes the application externally by provisioning a cloud provider load balancer?",
            options: [
              { text: "LoadBalancer", isCorrect: true },
              { text: "ClusterIP", isCorrect: false },
              { text: "NodePort", isCorrect: false },
              { text: "ExternalName", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the difference between a Liveness Probe and a Readiness Probe in Kubernetes?",
            options: [
              { text: "Liveness restarts failing containers; Readiness determines if the Pod is ready to receive network traffic.", isCorrect: true },
              { text: "They are exact synonyms in Kubernetes.", isCorrect: false },
              { text: "Readiness probe kills the pod immediately on boot.", isCorrect: false },
              { text: "Liveness probe only checks disk space.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What Kubernetes object is designed for stateful workloads requiring persistent hostnames and ordered deployments?",
            options: [
              { text: "StatefulSet", isCorrect: true },
              { text: "Deployment", isCorrect: false },
              { text: "ReplicaSet", isCorrect: false },
              { text: "Job", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 2: Microservices Cluster Deployment & Zero-Downtime Rollout Demo",
        type: "video",
        maxPoints: 20,
        description: "Deploy a multi-pod application on Kubernetes with Ingress routing. Record a 3-minute video executing a rolling update while running a live continuous curl test showing zero dropped requests.",
      },
    },
    {
      unitIndex: 3,
      quiz: {
        title: "Infrastructure as Code (IaC) with Terraform Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "Why is remote state storage (e.g. AWS S3 + DynamoDB) mandatory for enterprise Terraform teams?",
            options: [
              { text: "It prevents concurrent state corruption via state locking and provides a centralized source of truth.", isCorrect: true },
              { text: "Terraform does not work without S3.", isCorrect: false },
              { text: "It compiles HCL code into C++.", isCorrect: false },
              { text: "It automatically purchases cloud domain names.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What command generates an execution plan showing exactly what cloud resources will be created or destroyed?",
            options: [
              { text: "terraform plan", isCorrect: true },
              { text: "terraform apply -auto-approve", isCorrect: false },
              { text: "terraform refresh", isCorrect: false },
              { text: "terraform init", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is 'Configuration Drift' in Infrastructure as Code?",
            options: [
              { text: "Discrepancy when real cloud infrastructure is modified out-of-band (via Web Console) without matching code updates.", isCorrect: true },
              { text: "When Terraform code has syntax errors.", isCorrect: false },
              { text: "Moving code from GitHub to GitLab.", isCorrect: false },
              { text: "Upgrading Terraform CLI versions.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which Terraform block is used to import reusable modules across multiple environments (staging, production)?",
            options: [
              { text: "module \"<name>\" { source = \"...\" }", isCorrect: true },
              { text: "import \"<name>\"", isCorrect: false },
              { text: "package \"<name>\"", isCorrect: false },
              { text: "require \"<name>\"", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "How should sensitive cloud credentials (AWS Secret Keys) be passed into Terraform?",
            options: [
              { text: "Using Environment variables (AWS_SECRET_ACCESS_KEY) or IAM OIDC roles, never hardcoded in .tf files.", isCorrect: true },
              { text: "Hardcoded directly into variables.tf.", isCorrect: false },
              { text: "Committed into public GitHub repositories.", isCorrect: false },
              { text: "Printed in terraform.tfstate.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 3: Modular AWS VPC & High-Availability Architecture Plan",
        type: "pdf",
        maxPoints: 20,
        description: "Write modular Terraform configurations provisioning a multi-AZ VPC, public/private subnets, NAT Gateways, and security groups. Submit the terraform plan output and network architecture diagram in PDF.",
      },
    },
    {
      unitIndex: 4,
      quiz: {
        title: "GitOps, ArgoCD & Enterprise CI/CD Pipeline Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What is the core philosophy of GitOps?",
            options: [
              { text: "Git is the single source of truth for declarative infrastructure and applications, automatically synced by operators like ArgoCD.", isCorrect: true },
              { text: "Running production deployments manually via SSH from a laptop.", isCorrect: false },
              { text: "Deleting all Git branches after deployment.", isCorrect: false },
              { text: "Bypassing automated testing to deploy faster.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In GitHub Actions, which keyword triggers a workflow only when changes are pushed to specific branches or paths?",
            options: [
              { text: "on: push: branches: [main]", isCorrect: true },
              { text: "trigger: auto", isCorrect: false },
              { text: "run: execute", isCorrect: false },
              { text: "event: start", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What deployment strategy routes a small percentage of traffic to a new version to verify stability before full rollout?",
            options: [
              { text: "Canary Deployment", isCorrect: true },
              { text: "Recreate Deployment", isCorrect: false },
              { text: "Cold Swap", isCorrect: false },
              { text: "Hard Reset", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What tool is the de-facto standard for collecting time-series metrics from Kubernetes clusters?",
            options: [
              { text: "Prometheus", isCorrect: true },
              { text: "PostgreSQL", isCorrect: false },
              { text: "Redis", isCorrect: false },
              { text: "RabbitMQ", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "How does ArgoCD detect configuration drift in a Kubernetes cluster?",
            options: [
              { text: "By continuously comparing live cluster manifests with declarative YAMLs stored in the Git repository.", isCorrect: true },
              { text: "By monitoring ping latency to Google DNS.", isCorrect: false },
              { text: "By checking how many developers are online on Slack.", isCorrect: false },
              { text: "By scanning Docker container file sizes.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Capstone Project: Production GitOps CI/CD Pipeline End-to-End Walkthrough",
        type: "video",
        maxPoints: 30,
        description: "Demonstrate a complete automated GitOps pipeline: git push trigger in GitHub Actions -> automated unit tests -> Docker build & push -> ArgoCD automated synchronization to production Kubernetes cluster.",
      },
    },
  ],

  // 4. Python & AI Course
  "Mastering Python, AI & Generative Machine Learning": [
    {
      unitIndex: 1,
      quiz: {
        title: "Python Data Science Foundations & Vectorization Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "Why is NumPy vectorized computation significantly faster than native Python loops for large arrays?",
            options: [
              { text: "NumPy operations are executed in pre-compiled C/Fortran code with contiguous memory layouts and SIMD CPU vectorization.", isCorrect: true },
              { text: "NumPy skips all CPU computations using cache memories.", isCorrect: false },
              { text: "Python loops always write arrays to disk before reading.", isCorrect: false },
              { text: "NumPy compresses data using gzip.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In Pandas, what function is used to handle categorical text data using one-hot encoding?",
            options: [
              { text: "pd.get_dummies()", isCorrect: true },
              { text: "df.to_category()", isCorrect: false },
              { text: "pd.factorize_all()", isCorrect: false },
              { text: "df.pivot_table()", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What Python keyword creates a generator function that yields items lazily one at a time?",
            options: [
              { text: "yield", isCorrect: true },
              { text: "return lazy", isCorrect: false },
              { text: "generate", isCorrect: false },
              { text: "stream", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which plot is best suited for visualizing median, interquartile range (IQR), and outliers of numerical data?",
            options: [
              { text: "Box Plot", isCorrect: true },
              { text: "Pie Chart", isCorrect: false },
              { text: "Line Chart", isCorrect: false },
              { text: "Treemap", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the consequence of data leakage during the data preprocessing phase?",
            options: [
              { text: "Information from the test dataset leaks into the training pipeline, causing artificially high validation scores but poor real-world generalization.", isCorrect: true },
              { text: "The CPU runs out of RAM.", isCorrect: false },
              { text: "Pandas deletes the CSV file automatically.", isCorrect: false },
              { text: "The model runs twice as fast.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 1: Exploratory Data Analysis & Feature Engineering Report",
        type: "pdf",
        maxPoints: 15,
        description: "Perform comprehensive Exploratory Data Analysis (EDA) on a tabular dataset. Handle missing values, detect outliers, perform feature scaling, and submit the complete annotated Jupyter Notebook export as PDF.",
      },
    },
    {
      unitIndex: 2,
      quiz: {
        title: "Classical Machine Learning & Validation Metrics Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "When working with severely imbalanced classification data (e.g. fraud detection), which metric is preferred over Accuracy?",
            options: [
              { text: "Precision, Recall, and PR-AUC / F1-Score", isCorrect: true },
              { text: "Mean Squared Error (MSE)", isCorrect: false },
              { text: "R-squared Score", isCorrect: false },
              { text: "Accuracy only", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the primary difference between Bagging (e.g. Random Forest) and Boosting (e.g. XGBoost)?",
            options: [
              { text: "Bagging builds independent trees in parallel to reduce variance; Boosting trains trees sequentially to reduce bias.", isCorrect: true },
              { text: "Bagging is for regression only; Boosting is for classification only.", isCorrect: false },
              { text: "Boosting uses linear equations, while Bagging uses neural networks.", isCorrect: false },
              { text: "There is no difference.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What type of regularization adds the sum of absolute values of coefficients (L1 penalty) to enforce feature sparsity?",
            options: [
              { text: "Lasso Regularization (L1)", isCorrect: true },
              { text: "Ridge Regularization (L2)", isCorrect: false },
              { text: "ElasticNet", isCorrect: false },
              { text: "Dropout", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which Scikit-Learn class prevents data leakage by bundling transformations and estimator training together?",
            options: [
              { text: "Pipeline", isCorrect: true },
              { text: "GridSearchCV alone", isCorrect: false },
              { text: "SimpleImputer", isCorrect: false },
              { text: "KFold", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What does the Bias-Variance tradeoff dictate?",
            options: [
              { text: "High bias leads to underfitting; high variance leads to overfitting on training data.", isCorrect: true },
              { text: "High variance means the model runs out of GPU memory.", isCorrect: false },
              { text: "Bias is always zero in deep learning.", isCorrect: false },
              { text: "Variance cannot be calculated for trees.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 2: Multi-Model Benchmark & Hyperparameter Tuning Report",
        type: "pdf",
        maxPoints: 20,
        description: "Train and benchmark 3 classical ML models (Random Forest, XGBoost, Logistic Regression) using GridSearchCV and 5-fold cross-validation. Submit your ROC curves and performance analysis report in PDF.",
      },
    },
    {
      unitIndex: 3,
      quiz: {
        title: "PyTorch Deep Learning & Neural Architectures Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What method in PyTorch calculates the gradients of all model parameters during backpropagation?",
            options: [
              { text: "loss.backward()", isCorrect: true },
              { text: "optimizer.step()", isCorrect: false },
              { text: "model.forward()", isCorrect: false },
              { text: "torch.grad_all()", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Why must 'optimizer.zero_grad()' be called before 'loss.backward()' in the PyTorch training loop?",
            options: [
              { text: "PyTorch accumulates gradients by default on every backward pass.", isCorrect: true },
              { text: "It resets the model weights to random values.", isCorrect: false },
              { text: "It cleans CUDA memory cache.", isCorrect: false },
              { text: "It stops training if loss increases.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What layer in a Convolutional Neural Network (CNN) reduces spatial dimensions while retaining essential feature maps?",
            options: [
              { text: "MaxPooling2d", isCorrect: true },
              { text: "Linear", isCorrect: false },
              { text: "Dropout", isCorrect: false },
              { text: "BatchNorm2d", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What technique uses pre-trained weights from ImageNet on a new custom vision classification task?",
            options: [
              { text: "Transfer Learning", isCorrect: true },
              { text: "Zero-Shot Prompting", isCorrect: false },
              { text: "Unsupervised Clustering", isCorrect: false },
              { text: "Reinforcement Learning", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the purpose of the torch.no_grad() context manager during model evaluation?",
            options: [
              { text: "Disables autograd engine gradient tracking, reducing memory consumption and speeding up inference.", isCorrect: true },
              { text: "Locks the GPU clock speed.", isCorrect: false },
              { text: "Prevents users from downloading the weights.", isCorrect: false },
              { text: "Converts PyTorch models to TensorFlow.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 3: PyTorch Vision Classifier Training Loop & Live Inference Demo",
        type: "video",
        maxPoints: 20,
        description: "Record a 3-minute video showing your PyTorch training loop execution on GPU, displaying real-time loss reduction, validation accuracy charts, and testing live image classification inference.",
      },
    },
    {
      unitIndex: 4,
      quiz: {
        title: "Generative AI, Transformers & RAG Architecture Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What core mechanism enables Transformer models (like GPT and LLaMA) to relate tokens across an entire sequence simultaneously?",
            options: [
              { text: "Multi-Head Self-Attention", isCorrect: true },
              { text: "Recurrent Hidden Units", isCorrect: false },
              { text: "Convolutional Filters", isCorrect: false },
              { text: "Markov Decision Chains", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In a Retrieval-Augmented Generation (RAG) system, what is the role of the Vector Database (e.g. Pinecone / ChromaDB)?",
            options: [
              { text: "Storing high-dimensional text embeddings and enabling fast approximate nearest neighbor (ANN) semantic search.", isCorrect: true },
              { text: "Generating images from text prompts.", isCorrect: false },
              { text: "Hosting REST API webhooks.", isCorrect: false },
              { text: "Replacing the Large Language Model entirely.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is 'Hallucination' in the context of Large Language Models?",
            options: [
              { text: "When an LLM generates factually incorrect or fabricated information with high confidence.", isCorrect: true },
              { text: "When the model crashes due to CUDA out of memory.", isCorrect: false },
              { text: "When the temperature parameter is set to 0.0.", isCorrect: false },
              { text: "When prompts exceed 100 words.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What technique fine-tunes only small low-rank adapter matrices while freezing the base LLM weights?",
            options: [
              { text: "LoRA (Low-Rank Adaptation)", isCorrect: true },
              { text: "Full Parameter Fine-Tuning", isCorrect: false },
              { text: "Gradient Clipping", isCorrect: false },
              { text: "Beam Search", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What parameter controls the randomness of token generation in an LLM?",
            options: [
              { text: "Temperature", isCorrect: true },
              { text: "Batch Size", isCorrect: false },
              { text: "Embedding Dimension", isCorrect: false },
              { text: "Learning Rate Decay", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Capstone Project: Production RAG AI Assistant Full-Stack Walkthrough",
        type: "video",
        maxPoints: 30,
        description: "Submit a complete demonstration of a production RAG application: custom document chunking & ingestion, vector similarity search, citation verification, and low-latency LLM streaming response generation.",
      },
    },
  ],

  // 5. Next.js 15 Full-Stack Course
  "Full-Stack Web Development with Next.js 15 & Node.js": [
    {
      unitIndex: 1,
      quiz: {
        title: "Next.js 15 App Router Architecture Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "By default in the Next.js 15 App Router, what component type are all components created inside the app directory?",
            options: [
              { text: "React Server Components (RSC)", isCorrect: true },
              { text: "Client Components", isCorrect: false },
              { text: "Static HTML Strings", isCorrect: false },
              { text: "Web Components", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What directive must be placed at the top of a file to opt-in to React hooks (useState, useEffect) in Next.js?",
            options: [
              { text: "\"use client\"", isCorrect: true },
              { text: "\"use strict\"", isCorrect: false },
              { text: "\"use server\"", isCorrect: false },
              { text: "\"use browser\"", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which file in Next.js 15 App Router is used to render fallback UI while page contents are streaming?",
            options: [
              { text: "loading.jsx / loading.tsx", isCorrect: true },
              { text: "spinner.jsx", isCorrect: false },
              { text: "placeholder.jsx", isCorrect: false },
              { text: "defer.jsx", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the primary benefit of Server Actions in React 19 / Next.js 15?",
            options: [
              { text: "Allowing server-side mutations and database writes to be called directly from components without manual API routes.", isCorrect: true },
              { text: "Bypassing server validation rules.", isCorrect: false },
              { text: "Running code directly on the user's GPU.", isCorrect: false },
              { text: "Exporting components to WebAssembly.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "How does Next.js handle metadata (SEO title, description, OpenGraph) in the App Router?",
            options: [
              { text: "Via export const metadata = { title: '...', description: '...' } in page or layout files.", isCorrect: true },
              { text: "Through the deprecated <Head> tag imported from next/head.", isCorrect: false },
              { text: "Only by writing custom meta tags in HTML body.", isCorrect: false },
              { text: "SEO cannot be configured in App Router.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 1: Next.js 15 Server Components Dashboard & Streaming Architecture",
        type: "pdf",
        maxPoints: 15,
        description: "Design an analytics dashboard utilizing React Server Components, Suspense streaming boundaries, and parallel routes. Submit your component architecture breakdown, wireframe, and performance Lighthouse scores in PDF.",
      },
    },
    {
      unitIndex: 2,
      quiz: {
        title: "Scalable Node.js, Express & TypeScript Architecture Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What is the primary advantage of defining schema validation using Zod in Express applications?",
            options: [
              { text: "Runtime request validation coupled with static TypeScript type inference in a single schema definition.", isCorrect: true },
              { text: "It replaces database indexes.", isCorrect: false },
              { text: "It automatically generates React components.", isCorrect: false },
              { text: "It accelerates Express routing by 500%.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "How does Express 5 / modern async middleware handle unhandled Promise rejections?",
            options: [
              { text: "Automatically passes rejected promises to the global error-handling middleware.", isCorrect: true },
              { text: "Crashes the server process without logs.", isCorrect: false },
              { text: "Silently ignores the rejection.", isCorrect: false },
              { text: "Restarts the computer operating system.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the architectural purpose of the Service layer in a Controller-Service-Model design pattern?",
            options: [
              { text: "Encapsulating pure business logic, database transactions, and third-party integrations away from HTTP request handling.", isCorrect: true },
              { text: "Parsing HTTP cookies only.", isCorrect: false },
              { text: "Rendering HTML tags.", isCorrect: false },
              { text: "Serving static CSS files.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which Mongoose method performs multi-stage data aggregation pipelines (matching, grouping, projecting)?",
            options: [
              { text: "Model.aggregate([...])", isCorrect: true },
              { text: "Model.findAndGroup()", isCorrect: false },
              { text: "Model.collect()", isCorrect: false },
              { text: "Model.combine()", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Why should passwords never be stored using simple MD5 or SHA256 hashes?",
            options: [
              { text: "They are vulnerable to rainbow table lookups; salted, adaptive slow algorithms like Bcrypt / Argon2 must be used.", isCorrect: true },
              { text: "MD5 passwords cannot be saved in MongoDB.", isCorrect: false },
              { text: "Bcrypt passwords take less disk space.", isCorrect: false },
              { text: "SHA256 is deprecated by the W3C.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 2: Production REST API Architecture & Postman Test Collection",
        type: "pdf",
        maxPoints: 20,
        description: "Build an enterprise REST API in TypeScript featuring JWT authentication, role-based authorization, pagination, and Zod validation. Submit Postman collection test run documentation and error handling logs in PDF.",
      },
    },
    {
      unitIndex: 3,
      quiz: {
        title: "Authentication, SSLCommerz Payments & WebSockets Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What critical security step must an e-commerce server execute upon receiving an SSLCommerz IPN (Instant Payment Notification)?",
            options: [
              { text: "Validate the transaction on the SSLCommerz Order Validation API using val_id before fulfilling the order.", isCorrect: true },
              { text: "Trust the POST body immediately and mark the order as paid without validation.", isCorrect: false },
              { text: "Email the customer their credit card number.", isCorrect: false },
              { text: "Delete the database record.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "How do WebSockets differ from conventional HTTP polling for real-time updates?",
            options: [
              { text: "WebSockets maintain a single persistent, bidirectional, full-duplex TCP connection with negligible overhead.", isCorrect: true },
              { text: "HTTP polling uses less network bandwidth than WebSockets.", isCorrect: false },
              { text: "WebSockets only work on mobile devices.", isCorrect: false },
              { text: "WebSockets do not support JSON data.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What role does the 'Refresh Token' play in a modern JWT authentication architecture?",
            options: [
              { text: "Allows clients to securely obtain new short-lived Access Tokens without requiring re-entering credentials.", isCorrect: true },
              { text: "Encrypts user passwords in the browser.", isCorrect: false },
              { text: "Refreshes the webpage when the user is idle.", isCorrect: false },
              { text: "Deletes old cookies on the client device.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In Socket.io, which method transmits an event exclusively to users subscribed to a specific channel/room?",
            options: [
              { text: "io.to(roomId).emit(eventName, data)", isCorrect: true },
              { text: "io.broadcast(data)", isCorrect: false },
              { text: "socket.sendAll(data)", isCorrect: false },
              { text: "socket.post(roomId, data)", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Why should monetary values in database transactions be stored as integers (in cents/poisha) or Decimal128?",
            options: [
              { text: "Floating-point numbers in JavaScript suffer from binary rounding errors (e.g., 0.1 + 0.2 !== 0.3).", isCorrect: true },
              { text: "Databases cannot save floating point numbers.", isCorrect: false },
              { text: "Integers consume 10 times more memory.", isCorrect: false },
              { text: "SSLCommerz rejects integer numbers.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 3: Live SSLCommerz Sandbox Payment & WebSocket Notification Demo",
        type: "video",
        maxPoints: 20,
        description: "Submit a 3-minute video showing your application initiating an order, redirecting to the SSLCommerz sandbox gateway, completing test payment, verifying IPN webhook, and broadcasting real-time notification to the user.",
      },
    },
    {
      unitIndex: 4,
      quiz: {
        title: "Production Testing, Dockerization & Cloud Deployment Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What tool allows end-to-end browser testing that closely simulates actual user interactions in Next.js?",
            options: [
              { text: "Playwright / Cypress", isCorrect: true },
              { text: "Postman", isCorrect: false },
              { text: "Bcrypt", isCorrect: false },
              { text: "Eslint", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In a Next.js production standalone Docker build, what output setting in next.config.js optimizes the build artifact?",
            options: [
              { text: "output: 'standalone'", isCorrect: true },
              { text: "target: 'docker'", isCorrect: false },
              { text: "mode: 'container'", isCorrect: false },
              { text: "build: 'production-all'", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What Core Web Vital measures visual stability by tracking unexpected layout shifts during page load?",
            options: [
              { text: "Cumulative Layout Shift (CLS)", isCorrect: true },
              { text: "Largest Contentful Paint (LCP)", isCorrect: false },
              { text: "First Input Delay (FID)", isCorrect: false },
              { text: "Interaction to Next Paint (INP)", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Why should sensitive environment variables (e.g. DATABASE_URL, STRIPE_SECRET) never have the NEXT_PUBLIC_ prefix?",
            options: [
              { text: "The NEXT_PUBLIC_ prefix bundles secrets directly into the client-side JavaScript, exposing them publicly in the browser.", isCorrect: true },
              { text: "They make the server crash on startup.", isCorrect: false },
              { text: "Vercel will not deploy files with NEXT_PUBLIC_.", isCorrect: false },
              { text: "Node.js cannot read NEXT_PUBLIC_ variables.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What HTTP header enforces browser connections exclusively over HTTPS with subdomains included?",
            options: [
              { text: "Strict-Transport-Security (HSTS)", isCorrect: true },
              { text: "X-Content-Type-Options", isCorrect: false },
              { text: "Referrer-Policy", isCorrect: false },
              { text: "Permissions-Policy", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Capstone Project: Production SaaS Application Deployment Walkthrough",
        type: "video",
        maxPoints: 30,
        description: "Deliver a live demonstration of your production Next.js 15 & Node.js application deployed on cloud servers: responsive UI, live authentication, payment checkout flow, real-time events, and 95+ Google Lighthouse scores.",
      },
    },
  ],

  // 6. MERN Stack Course
  "Mern Stack": [
    {
      unitIndex: 1,
      quiz: {
        title: "React 18 Core & Component Lifecycle Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What is the primary role of the useEffect dependency array in React?",
            options: [
              { text: "Specifying which values trigger the effect callback when they change between renders.", isCorrect: true },
              { text: "Determining the CSS styling of the component.", isCorrect: false },
              { text: "Allocating GPU memory for the component.", isCorrect: false },
              { text: "Importing external JavaScript libraries.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Why is 'key' prop required when rendering dynamic lists in React?",
            options: [
              { text: "Helps React identify which items have changed, been added, or removed for efficient Virtual DOM diffing.", isCorrect: true },
              { text: "Sets the database primary key on the backend.", isCorrect: false },
              { text: "Encrypts the list item data in memory.", isCorrect: false },
              { text: "Required by the CSS grid specification.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which hook memoizes a callback function definition across renders to prevent unnecessary child re-renders?",
            options: [
              { text: "useCallback", isCorrect: true },
              { text: "useMemo", isCorrect: false },
              { text: "useRef", isCorrect: false },
              { text: "useReducer", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What feature in React 18 allows batching multiple state updates inside promises and timeouts automatically?",
            options: [
              { text: "Automatic Batching", isCorrect: true },
              { text: "Concurrent Sharding", isCorrect: false },
              { text: "Fiber Queueing", isCorrect: false },
              { text: "Lazy Loading", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the Context API primarily used for in React applications?",
            options: [
              { text: "Sharing global state across the component tree without prop drilling.", isCorrect: true },
              { text: "Making direct database queries from the browser.", isCorrect: false },
              { text: "Compiling JSX to HTML on the server.", isCorrect: false },
              { text: "Replacing Node.js backends.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 1: React Component Hierarchy & Custom Hooks Architecture",
        type: "pdf",
        maxPoints: 15,
        description: "Build an interactive e-commerce filtering application using React 18 and custom hooks. Submit your component tree architecture diagram, state flow documentation, and test reports as PDF.",
      },
    },
    {
      unitIndex: 2,
      quiz: {
        title: "Node.js & Express REST Standards Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What is the non-blocking Event Loop in Node.js?",
            options: [
              { text: "A single-threaded loop that delegates asynchronous I/O operations to the system kernel (via libuv) and processes callbacks.", isCorrect: true },
              { text: "A multi-threaded CPU cluster manager.", isCorrect: false },
              { text: "A database transaction lock mechanism.", isCorrect: false },
              { text: "A continuous while(true) loop that freezes the server.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Which Express middleware is required to parse incoming JSON request bodies?",
            options: [
              { text: "express.json()", isCorrect: true },
              { text: "express.urlencoded()", isCorrect: false },
              { text: "express.static()", isCorrect: false },
              { text: "cors()", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What HTTP status code represents '201 Created'?",
            options: [
              { text: "201", isCorrect: true },
              { text: "200", isCorrect: false },
              { text: "204", isCorrect: false },
              { text: "301", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Why should environment variables in Node.js be loaded through dotenv rather than hardcoded?",
            options: [
              { text: "To maintain 12-factor app security and separate configuration from code across development and production.", isCorrect: true },
              { text: "Because Node.js cannot read hardcoded strings.", isCorrect: false },
              { text: "To make the application load faster.", isCorrect: false },
              { text: "It is required by MongoDB.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the signature of an Express error-handling middleware function?",
            options: [
              { text: "(err, req, res, next)", isCorrect: true },
              { text: "(req, res, next)", isCorrect: false },
              { text: "(error, callback)", isCorrect: false },
              { text: "(req, res)", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 2: Secure JWT Authentication & CRUD API Project Report",
        type: "pdf",
        maxPoints: 20,
        description: "Implement a secure REST API with user registration, password hashing with Bcrypt, JWT auth, and protected routes. Submit endpoint test results and Postman documentation as PDF.",
      },
    },
    {
      unitIndex: 3,
      quiz: {
        title: "MongoDB Aggregations & Full-Stack Deployment Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "Which MongoDB index type drastically speeds up text search queries on titles and descriptions?",
            options: [
              { text: "Text Index", isCorrect: true },
              { text: "Geospatial Index", isCorrect: false },
              { text: "Hashed Index", isCorrect: false },
              { text: "TTL Index", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the role of the $lookup aggregation stage in MongoDB?",
            options: [
              { text: "Performs an equality join to another collection, similar to SQL LEFT OUTER JOIN.", isCorrect: true },
              { text: "Deletes documents that match a query.", isCorrect: false },
              { text: "Finds the maximum value in an array.", isCorrect: false },
              { text: "Creates a backup on cloud storage.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is CORS (Cross-Origin Resource Sharing) in full-stack web applications?",
            options: [
              { text: "A browser security mechanism that allows or restricts requests made from a different domain or port than the API server.", isCorrect: true },
              { text: "A database encryption protocol.", isCorrect: false },
              { text: "A CSS layout utility.", isCorrect: false },
              { text: "An image compression format.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "Where should the production React build folder be served from in a unified MERN deployment?",
            options: [
              { text: "As static files via express.static() with a wildcard catch-all route sending index.html.", isCorrect: true },
              { text: "Directly from the MongoDB database.", isCorrect: false },
              { text: "Via FTP on every page reload.", isCorrect: false },
              { text: "By running 'npm start' on the client folder in production.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What tool is commonly used to manage and keep Node.js server processes alive in production on a Linux VPS?",
            options: [
              { text: "PM2", isCorrect: true },
              { text: "Nodemon", isCorrect: false },
              { text: "Babel", isCorrect: false },
              { text: "Webpack", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Capstone Project: Full-Stack MERN Application Demo Video",
        type: "video",
        maxPoints: 25,
        description: "Record a comprehensive 4-minute demonstration of your complete deployed MERN stack web application: user registration/login, responsive UI, database CRUD operations, and live production deployment.",
      },
    },
  ],

  // 7. Web Development Course
  "Web Development": [
    {
      unitIndex: 1,
      quiz: {
        title: "HTML5 Semantics & Modern CSS3 Layouts Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "Which HTML5 semantic element should encapsulate the primary navigation links of a website?",
            options: [
              { text: "<nav>", isCorrect: true },
              { text: "<header>", isCorrect: false },
              { text: "<section>", isCorrect: false },
              { text: "<aside>", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In CSS Flexbox, what property aligns items along the cross axis (perpendicular to main axis)?",
            options: [
              { text: "align-items", isCorrect: true },
              { text: "justify-content", isCorrect: false },
              { text: "flex-direction", isCorrect: false },
              { text: "flex-wrap", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the CSS Box Model composed of, from inside out?",
            options: [
              { text: "Content, Padding, Border, Margin", isCorrect: true },
              { text: "Content, Margin, Border, Padding", isCorrect: false },
              { text: "Border, Content, Padding, Margin", isCorrect: false },
              { text: "Margin, Padding, Content, Border", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What CSS property ensures padding and border are included in the element's total width and height?",
            options: [
              { text: "box-sizing: border-box", isCorrect: true },
              { text: "box-sizing: content-box", isCorrect: false },
              { text: "display: block", isCorrect: false },
              { text: "position: relative", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "In CSS Grid, what function automatically fills as many columns as will fit into a container?",
            options: [
              { text: "repeat(auto-fit, minmax(250px, 1fr))", isCorrect: true },
              { text: "grid-columns: dynamic", isCorrect: false },
              { text: "flex: 1 1 auto", isCorrect: false },
              { text: "columns: auto-stretch", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 1: Mobile-First Responsive Landing Page & Wireframe PDF",
        type: "pdf",
        maxPoints: 15,
        description: "Design and build a fully responsive, semantic HTML5 & CSS3 landing page without external frameworks. Submit your mobile, tablet, and desktop wireframes with code structure breakdown in PDF.",
      },
    },
    {
      unitIndex: 2,
      quiz: {
        title: "Modern JavaScript (ES6+ & Async/Await) Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "What array method creates a new array populated with the results of calling a provided function on every element?",
            options: [
              { text: "Array.prototype.map()", isCorrect: true },
              { text: "Array.prototype.forEach()", isCorrect: false },
              { text: "Array.prototype.filter()", isCorrect: false },
              { text: "Array.prototype.reduce()", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is the difference between '==' and '===' in JavaScript?",
            options: [
              { text: "'===' checks both value and type without type coercion, while '==' converts types before comparison.", isCorrect: true },
              { text: "'==' is strict equality and '===' is loose equality.", isCorrect: false },
              { text: "There is no difference in ES6.", isCorrect: false },
              { text: "'===' is only used for strings.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What construct handles errors thrown inside an async/await function block?",
            options: [
              { text: "try { ... } catch (error) { ... }", isCorrect: true },
              { text: "onError { ... }", isCorrect: false },
              { text: "if (error) { ... }", isCorrect: false },
              { text: "rescue { ... }", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is Event Delegation in the browser DOM?",
            options: [
              { text: "Attaching a single event listener to a parent element to handle events on multiple children using event bubbling.", isCorrect: true },
              { text: "Deleting event listeners automatically after one click.", isCorrect: false },
              { text: "Preventing users from clicking buttons.", isCorrect: false },
              { text: "Delegating clicks to a background Web Worker.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What is a Closure in JavaScript?",
            options: [
              { text: "A function bundled together with references to its surrounding lexical state (scope).", isCorrect: true },
              { text: "Closing a browser window programmatically.", isCorrect: false },
              { text: "A function that has no return value.", isCorrect: false },
              { text: "The end of a script tag.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Lab 2: Dynamic REST API Web App Project Documentation PDF",
        type: "pdf",
        maxPoints: 20,
        description: "Build an interactive web application that fetches data from a public REST API (e.g., weather or currency data) using async/await with dynamic DOM rendering. Submit implementation details and error-handling tests in PDF.",
      },
    },
    {
      unitIndex: 3,
      quiz: {
        title: "Web Performance, Accessibility & Hosting Quiz",
        passMark: 70,
        questions: [
          {
            prompt: "Why should image elements always include descriptive 'alt' attributes?",
            options: [
              { text: "For screen reader accessibility (WCAG compliance) and fallback display if the image fails to load.", isCorrect: true },
              { text: "To make images load faster on 4G networks.", isCorrect: false },
              { text: "To prevent right-click downloading.", isCorrect: false },
              { text: "Required by the CSS compiler.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What modern image format provides significantly better compression than traditional JPEG and PNG?",
            options: [
              { text: "WebP / AVIF", isCorrect: true },
              { text: "BMP", isCorrect: false },
              { text: "TIFF", isCorrect: false },
              { text: "GIF", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What Git command creates and switches to a new feature branch in a single step?",
            options: [
              { text: "git checkout -b <branch-name> / git switch -c <branch-name>", isCorrect: true },
              { text: "git branch <branch-name> --now", isCorrect: false },
              { text: "git push -b <branch-name>", isCorrect: false },
              { text: "git commit -b <branch-name>", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What free platform can host static web projects directly from a GitHub repository?",
            options: [
              { text: "GitHub Pages / Vercel / Netlify", isCorrect: true },
              { text: "MongoDB Atlas", isCorrect: false },
              { text: "Postman Cloud", isCorrect: false },
              { text: "Docker Hub", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
          {
            prompt: "What does the browser DevTools Lighthouse audit score evaluate?",
            options: [
              { text: "Performance, Accessibility, Best Practices, and SEO.", isCorrect: true },
              { text: "Only JavaScript syntax errors.", isCorrect: false },
              { text: "Database connection speeds.", isCorrect: false },
              { text: "Server operating system memory.", isCorrect: false },
            ],
            perCorrectPoint: 2,
          },
        ],
      },
      practicalTask: {
        title: "Capstone Project: Live Personal Portfolio Website Walkthrough Video",
        type: "video",
        maxPoints: 25,
        description: "Submit a 3-4 minute walkthrough showcasing your live deployed personal portfolio website: clean semantic HTML5, responsive CSS Grid/Flexbox, interactive JavaScript widgets, and 95+ Lighthouse score.",
      },
    },
  ],
};

async function seedTasksAndQuizzes() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB successfully!");

  for (const [courseTitle, modulesData] of Object.entries(courseCurriculumData)) {
    console.log(`\n========================================`);
    console.log(`Processing Tasks & Quizzes for: "${courseTitle}"`);

    const course = await Course.findOne({ title: courseTitle, isDeleted: false });
    if (!course) {
      console.warn(`⚠️ Course "${courseTitle}" not found in database! Skipping.`);
      continue;
    }

    const units = await Unit.find({ course: course._id, isDeleted: false }).sort({ orderIndex: 1 });
    console.log(`  Found ${units.length} units for course ID: ${course._id}`);

    // Clear existing tasks and quizzes for this course to ensure clean state
    await Task.deleteMany({ course: course._id });
    await Quiz.deleteMany({ course: course._id });
    console.log(`  Cleaned old tasks & quizzes for course.`);

    for (const modConfig of modulesData) {
      const unit = units[modConfig.unitIndex - 1];
      if (!unit) {
        console.warn(`  ⚠️ Unit index ${modConfig.unitIndex} does not exist in course. Skipping.`);
        continue;
      }

      console.log(`  -> Processing Unit [${modConfig.unitIndex}]: "${unit.title}"`);

      // 1. Create Practical Task (Assignment / Project) if specified
      if (modConfig.practicalTask) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

        const practicalTaskDoc = await Task.create({
          course: course._id,
          unit: unit._id,
          title: modConfig.practicalTask.title,
          description: modConfig.practicalTask.description,
          type: modConfig.practicalTask.type, // "pdf" or "video"
          maxPoints: modConfig.practicalTask.maxPoints,
          dueDate,
        });

        console.log(`     + Created Practical Task: "${practicalTaskDoc.title}" (${practicalTaskDoc.type.toUpperCase()}, ${practicalTaskDoc.maxPoints} pts)`);
      }

      // 2. Create Quiz Task and Quiz Document if specified
      if (modConfig.quiz) {
        const totalPoints = modConfig.quiz.questions.reduce((sum, q) => sum + (q.perCorrectPoint || 2), 0);

        // First create Task of type "quiz"
        const quizTaskDoc = await Task.create({
          course: course._id,
          unit: unit._id,
          title: modConfig.quiz.title,
          description: `Module assessment covering key architectural and practical concepts. Passing mark is ${modConfig.quiz.passMark}%.`,
          type: "quiz",
          maxPoints: totalPoints,
        });

        // Next create Quiz document linked to task
        const quizDoc = await Quiz.create({
          course: course._id,
          unit: unit._id,
          task: quizTaskDoc._id,
          title: modConfig.quiz.title,
          questions: modConfig.quiz.questions,
          passMark: modConfig.quiz.passMark,
        });

        // Link quizId to task
        quizTaskDoc.quizId = quizDoc._id;
        await quizTaskDoc.save();

        console.log(`     + Created Quiz: "${quizDoc.title}" (${quizDoc.questions.length} questions, ${totalPoints} pts, Pass: ${quizDoc.passMark}%)`);
      }
    }
  }

  console.log("\n========================================");
  console.log("All courses successfully populated with realistic Tasks & Quizzes in suitable places!");
  process.exit(0);
}

seedTasksAndQuizzes().catch((err) => {
  console.error("Error during tasks & quizzes seeding:", err);
  process.exit(1);
});
