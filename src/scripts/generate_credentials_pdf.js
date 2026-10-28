const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function createCredentialsPDF(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
      info: {
        Title: 'SmartEdu LMS - User Credentials Directory',
        Author: 'SmartEdu Engineering Team',
        Subject: 'Instructor, Student & Admin Credentials for Development and QA'
      }
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Color Palette
    const colors = {
      primaryDark: '#0F172A',   // Slate 900
      primary: '#1E293B',       // Slate 800
      accent: '#2563EB',        // Blue 600
      accentDark: '#1D4ED8',    // Blue 700
      accentLight: '#EFF6FF',   // Blue 50
      instructorTag: '#4F46E5', // Indigo 600
      instructorBg: '#EEF2FF',  // Indigo 50
      studentTag: '#059669',    // Emerald 600
      studentBg: '#ECFDF5',     // Emerald 50
      adminTag: '#D97706',      // Amber 600
      adminBg: '#FFFBEB',       // Amber 50
      textMain: '#1F2937',      // Gray 800
      textMuted: '#64748B',     // Slate 500
      border: '#E2E8F0',        // Slate 200
      tableHeaderBg: '#1E293B', // Slate 800
      zebraBg: '#F8FAFC',       // Slate 50
      codeBg: '#F1F5F9',        // Slate 100
      codeBorder: '#CBD5E1',    // Slate 300
      white: '#FFFFFF'
    };

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 80;

    // Helper: Draw Main Top Header (Page 1)
    function drawMainHeader() {
      doc.rect(0, 0, pageWidth, 105).fill(colors.primaryDark);
      doc.rect(0, 105, pageWidth, 4).fill(colors.accent);

      // Title & Subtitle
      doc.fillColor(colors.white)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('SMARTEDU LMS PLATFORM', 40, 26);

      doc.fontSize(10.5)
         .font('Helvetica')
         .fillColor('#94A3B8')
         .text('User Credentials Directory  •  Instructors, Students & Admins', 40, 52);

      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.fontSize(8.5)
         .fillColor('#64748B')
         .text(`Generated: ${dateStr}   |   Environment: Local Development & Staging   |   Auth: Credentials / JWT`, 40, 72);
    }

    // Helper: Draw Mini Top Header (Page 2)
    function drawMiniHeader() {
      doc.rect(0, 0, pageWidth, 60).fill(colors.primaryDark);
      doc.rect(0, 60, pageWidth, 3).fill(colors.accent);

      doc.fillColor(colors.white)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('SMARTEDU LMS PLATFORM', 40, 16);

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#94A3B8')
         .text('Student Accounts, Gamification Profiles & Platform Testing Guide', 40, 36);
    }

    // Helper: Draw Section Title & Badge
    function drawSectionTitle(y, title, subtitle, badgeText, badgeColor, badgeBg) {
      doc.fillColor(colors.primary)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text(title, 40, y);

      const badgeWidth = 95;
      doc.roundedRect(pageWidth - 40 - badgeWidth, y - 2, badgeWidth, 18, 9)
         .fill(badgeBg);
      doc.fillColor(badgeColor)
         .fontSize(7.5)
         .font('Helvetica-Bold')
         .text(badgeText, pageWidth - 40 - badgeWidth, y + 3, { width: badgeWidth, align: 'center' });

      if (subtitle) {
        doc.fillColor(colors.textMuted)
           .fontSize(8.5)
           .font('Helvetica')
           .text(subtitle, 40, y + 17);
        return y + 34;
      }
      return y + 24;
    }

    // Helper: Draw Table Header
    function drawTableHeader(y, cols) {
      doc.roundedRect(40, y, contentWidth, 22, 4).fill(colors.tableHeaderBg);

      let curX = 48;
      doc.font('Helvetica-Bold').fontSize(8).fillColor(colors.white);
      cols.forEach(col => {
        doc.text(col.label, curX, y + 6, { width: col.width, align: col.align || 'left' });
        curX += col.width;
      });

      return y + 23;
    }

    // Helper: Draw Table Row
    function drawTableRow(y, cols, isEven) {
      const rowHeight = 24;
      if (isEven) {
        doc.rect(40, y, contentWidth, rowHeight).fill(colors.zebraBg);
      }

      let curX = 48;
      cols.forEach(col => {
        doc.font(col.font || 'Helvetica')
           .fontSize(col.size || 8.5)
           .fillColor(col.color || colors.textMain);

        if (col.isPassword) {
          doc.roundedRect(curX - 2, y + 3.5, col.width - 8, 16.5, 3)
             .fillAndStroke(colors.codeBg, colors.codeBorder);
          doc.font('Courier-Bold')
             .fontSize(8.5)
             .fillColor('#0F172A')
             .text(col.value, curX + 3, y + 7, { width: col.width - 14, align: 'left' });
        } else {
          doc.text(col.value, curX, y + 6.5, { width: col.width, align: col.align || 'left' });
        }
        curX += col.width;
      });

      doc.moveTo(40, y + rowHeight)
         .lineTo(pageWidth - 40, y + rowHeight)
         .strokeColor(colors.border)
         .lineWidth(0.5)
         .stroke();

      return y + rowHeight;
    }

    // ==============================================================
    // PAGE 1: INSTRUCTORS & ADMINISTRATIVE ACCOUNTS
    // ==============================================================
    drawMainHeader();

    let curY = 120;

    // Platform Endpoints Info Box
    doc.roundedRect(40, curY, contentWidth, 42, 6)
       .fillAndStroke('#F8FAFC', colors.border);

    doc.fillColor(colors.primary)
       .fontSize(8.5)
       .font('Helvetica-Bold')
       .text('PLATFORM LOCAL ACCESS URLS:', 52, curY + 9);

    doc.font('Helvetica')
       .fontSize(8)
       .fillColor(colors.textMuted)
       .text('Frontend Client:  http://localhost:3000   |   Backend API:  http://localhost:5000/api   |   Auth: Credentials', 52, curY + 23);

    curY += 54;

    // 1. INSTRUCTORS SECTION
    curY = drawSectionTitle(
      curY,
      '1. Instructors & Faculty Accounts',
      'Verified instructors with access to course builder, curriculum units, lesson uploads, and student progress.',
      '4 INSTRUCTORS',
      colors.instructorTag,
      colors.instructorBg
    );

    const instructorCols = [
      { label: '#', width: 22 },
      { label: 'Instructor Name', width: 140 },
      { label: 'Email Address (Login ID)', width: 175 },
      { label: 'Password', width: 105 },
      { label: 'Domain Expertise', width: 73 }
    ];

    curY = drawTableHeader(curY, instructorCols);

    const instructors = [
      {
        id: '1',
        name: 'Engr. Kawsar Ahmed',
        email: 'kawsar@gmail.com',
        pass: 'password123',
        exp: 'Full-Stack & AI Lead'
      },
      {
        id: '2',
        name: 'Khadiza Akter Bristi',
        email: 'khadiza.bristi@smartedu.com',
        pass: 'Instructor@123',
        exp: 'MS Office & Excel'
      },
      {
        id: '3',
        name: 'Payel Islam',
        email: 'payel.islam@smartedu.com',
        pass: 'Instructor@123',
        exp: 'CCNA & Networking'
      },
      {
        id: '4',
        name: 'Moriam Akter Shila',
        email: 'moriam.shila@smartedu.com',
        pass: 'Instructor@123',
        exp: 'Digital Marketing'
      }
    ];

    instructors.forEach((inst, idx) => {
      curY = drawTableRow(curY, [
        { value: inst.id, width: 22, color: colors.textMuted },
        { value: inst.name, width: 140, font: 'Helvetica-Bold' },
        { value: inst.email, width: 175, color: colors.accent },
        { value: inst.pass, width: 105, isPassword: true },
        { value: inst.exp, width: 73, color: colors.textMuted }
      ], idx % 2 === 1);
    });

    curY += 24;

    // 2. ADMINISTRATIVE ACCOUNTS SECTION
    curY = drawSectionTitle(
      curY,
      '2. Administrative & Operations Accounts',
      'High-privilege accounts for site configuration, course approval, revenue withdrawals, and role changes.',
      '2 ADMINS',
      colors.adminTag,
      colors.adminBg
    );

    const adminCols = [
      { label: '#', width: 22 },
      { label: 'Role / Designation', width: 140 },
      { label: 'Email Address (Login ID)', width: 175 },
      { label: 'Password', width: 105 },
      { label: 'Access Scope', width: 73 }
    ];

    curY = drawTableHeader(curY, adminCols);

    const admins = [
      {
        id: '1',
        role: 'Super Administrator',
        email: 'admin@example.com',
        pass: 'securepassword123',
        scope: 'Full Root Access'
      },
      {
        id: '2',
        role: 'Platform Admin (Kawsar)',
        email: 'sohelf@gmail.com',
        pass: '12345678',
        scope: 'Site Management'
      }
    ];

    admins.forEach((adm, idx) => {
      curY = drawTableRow(curY, [
        { value: adm.id, width: 22, color: colors.textMuted },
        { value: adm.role, width: 140, font: 'Helvetica-Bold' },
        { value: adm.email, width: 175, color: colors.accent },
        { value: adm.pass, width: 105, isPassword: true },
        { value: adm.scope, width: 73, color: colors.textMuted }
      ], idx % 2 === 1);
    });

    curY += 26;

    // Faculty & Admin Capabilities Callout
    doc.roundedRect(40, curY, contentWidth, 140, 6)
       .fillAndStroke(colors.accentLight, '#BFDBFE');

    doc.fillColor(colors.accentDark)
       .fontSize(9.5)
       .font('Helvetica-Bold')
       .text('INSTRUCTOR & ADMINISTRATOR WORKFLOW HIGHLIGHTS', 55, curY + 12);

    const guidePoints = [
      '• Course Publishing: Instructors can create rich curricula with video streams, PDFs, and graded tasks.',
      '• Quiz Creation: Automated scoring with pass marks, multiple-choice options, and instant leaderboard points.',
      '• Financial Dashboard: Simulated instructor revenue wallet with request withdrawal and transaction logs.',
      '• Admin Panel: Global user management, course approval workflows, category tagging, and audit records.',
      '• Verification: All seed instructor accounts are pre-approved and verified for immediate testing.'
    ];

    let pointY = curY + 30;
    guidePoints.forEach(pt => {
      doc.fillColor(colors.textMain)
         .fontSize(8)
         .font('Helvetica')
         .text(pt, 55, pointY);
      pointY += 20;
    });

    // ==============================================================
    // PAGE 2: STUDENTS & GAMIFICATION LEADERBOARD
    // ==============================================================
    doc.addPage();
    drawMiniHeader();

    curY = 78;

    curY = drawSectionTitle(
      curY,
      '3. Students & Leaderboard Accounts',
      'Active student profiles seeded for enrollment, quiz taking, point accumulation, and badge milestones.',
      '11 STUDENTS',
      colors.studentTag,
      colors.studentBg
    );

    const studentCols = [
      { label: '#', width: 22 },
      { label: 'Student Name', width: 138 },
      { label: 'Email Address (Login ID)', width: 177 },
      { label: 'Password', width: 105 },
      { label: 'Institution / City', width: 73 }
    ];

    curY = drawTableHeader(curY, studentCols);

    const students = [
      { id: '1', name: 'Tanvir Hasan (Default)', email: 'student@smartedu.com', pass: 'password123', loc: 'Main Demo Profile' },
      { id: '2', name: 'Ahsan Habib (1,450 pts)', email: 'ahsan.habib@gmail.com', pass: 'Student123!', loc: 'Notre Dame, Dhaka' },
      { id: '3', name: 'Nusrat Jahan (1,320 pts)', email: 'nusrat.jahan@gmail.com', pass: 'Student123!', loc: 'Viqarunnisa, Dhaka' },
      { id: '4', name: 'Tahmid Hossain (1,180 pts)', email: 'tahmid.hossain@gmail.com', pass: 'Student123!', loc: 'St. Joseph, Dhaka' },
      { id: '5', name: 'Sumaiya Akter (1,050 pts)', email: 'sumaiya.akter@gmail.com', pass: 'Student123!', loc: 'Rajuk Uttara, Dhaka' },
      { id: '6', name: 'Farhan Ahmed (940 pts)', email: 'farhan.ahmed@gmail.com', pass: 'Student123!', loc: 'Dhaka Residential' },
      { id: '7', name: 'Sadia Afrin (880 pts)', email: 'sadia.afrin@gmail.com', pass: 'Student123!', loc: 'Chittagong College' },
      { id: '8', name: 'Mahfuzur Rahman (760 pts)', email: 'mahfuzur.rahman@gmail.com', pass: 'Student123!', loc: 'MC College, Sylhet' },
      { id: '9', name: 'Ishrat Jahan (650 pts)', email: 'ishrat.jahan@gmail.com', pass: 'Student123!', loc: 'Rajshahi College' },
      { id: '10', name: 'Rafiqul Islam (520 pts)', email: 'rafiqul.islam@gmail.com', pass: 'Student123!', loc: 'BL College, Khulna' },
      { id: '11', name: 'Anika Tabassum (410 pts)', email: 'anika.tabassum@gmail.com', pass: 'Student123!', loc: 'BM College, Barishal' }
    ];

    students.forEach((stu, idx) => {
      curY = drawTableRow(curY, [
        { value: stu.id, width: 22, color: colors.textMuted },
        { value: stu.name, width: 138, font: 'Helvetica-Bold' },
        { value: stu.email, width: 177, color: colors.accent },
        { value: stu.pass, width: 105, isPassword: true },
        { value: stu.loc, width: 73, color: colors.textMuted }
      ], idx % 2 === 1);
    });

    curY += 24;

    // Student & Gamification Testing Guide Box
    doc.roundedRect(40, curY, contentWidth, 140, 6)
       .fillAndStroke(colors.studentBg, '#A7F3D0');

    doc.fillColor('#065F46')
       .fontSize(9.5)
       .font('Helvetica-Bold')
       .text('STUDENT GAMIFICATION & TESTING SCENARIOS', 55, curY + 12);

    const studentTestingPoints = [
      '• Leaderboard Testing: Ahsan Habib leads with 1,450 points and 3 milestone badges (Master Architect).',
      '• Course Checkout: Test SSLCommerz sandbox payments or zero-cost enrollments on free courses.',
      '• Quiz Submissions: Answer module assessments to verify dynamic point allocation and wallet sync.',
      '• Badge Unlocks: Earn badges automatically upon course completion (Full-Stack Pioneer, Tech Virtuoso).',
      '• Password Convention: All regional seeded students use "Student123!" for quick and uniform QA testing.'
    ];

    let stuPointY = curY + 30;
    studentTestingPoints.forEach(pt => {
      doc.fillColor('#047857')
         .fontSize(8)
         .font('Helvetica')
         .text(pt, 55, stuPointY);
      stuPointY += 20;
    });

    // ==============================================================
    // GLOBAL FOOTER (BOTH PAGES)
    // ==============================================================
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      // Temporarily clear bottom margin so footer is never considered out-of-bounds
      const origBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc.moveTo(40, doc.page.height - 35)
         .lineTo(pageWidth - 40, doc.page.height - 35)
         .strokeColor(colors.border)
         .lineWidth(0.5)
         .stroke();

      doc.fillColor(colors.textMuted)
         .fontSize(8)
         .font('Helvetica')
         .text('SmartEdu Learning Management System (LMS) • Development & QA Test Credentials', 40, doc.page.height - 24, { lineBreak: false });

      const pageStr = `Page ${i + 1} of ${range.count}`;
      const pageStrWidth = doc.widthOfString(pageStr);
      doc.text(pageStr, pageWidth - 40 - pageStrWidth, doc.page.height - 24, { lineBreak: false });

      doc.page.margins.bottom = origBottom;
    }

    doc.end();

    writeStream.on('finish', () => {
      resolve(outputPath);
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  const rootPath = path.resolve(__dirname, '../../../smart_edu_credentials.pdf');
  const frontendPublicPath = path.resolve(__dirname, '../../../Smart-Edu-Frontend/public/smart_edu_credentials.pdf');
  const brainPath = 'C:\\Users\\Barisal Laptop House\\.gemini\\antigravity-ide\\brain\\30b0d866-5797-465c-884b-7ca5bfe1a458\\smart_edu_credentials.pdf';

  console.log('Generating PDF credentials...');
  await createCredentialsPDF(rootPath);
  
  try {
    fs.copyFileSync(rootPath, frontendPublicPath);
    console.log(`Copied to Frontend public folder: ${frontendPublicPath}`);
  } catch (e) {
    console.warn('Could not copy to frontend public:', e.message);
  }

  try {
    fs.copyFileSync(rootPath, brainPath);
    console.log(`Copied to Artifact directory: ${brainPath}`);
  } catch (e) {
    console.warn('Could not copy to artifact dir:', e.message);
  }

  console.log('PDF generation finished successfully!');
}

run().catch(console.error);
