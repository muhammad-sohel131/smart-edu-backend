import mongoose from "mongoose";
import { envVars } from "./app/config/env";
import { User, Instructor } from "./app/modules/user/user.model";
import { Course } from "./app/modules/course/course.model";

async function main() {
  await mongoose.connect(envVars.DB_URL);
  console.log("Connected to MongoDB to update Kawsar instructor profile.");

  // Find user by email 'kawsar@gmail.com' or name 'kawsar'
  let user = await User.findOne({ email: "kawsar@gmail.com" });
  if (!user) {
    user = await User.findOne({ name: { $regex: "kawsar", $options: "i" }, role: "INSTRUCTOR" });
  }

  if (!user) {
    throw new Error("User kawsar not found!");
  }

  console.log(`Found User: ${user.name} (${user._id})`);

  // Count real courses assigned to this user
  const courseCount = await Course.countDocuments({ instructor: user._id, isDeleted: false });

  // 1. Update User document
  user.name = "Engr. Kawsar Ahmed";
  user.picture = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";
  user.phone = "+880 1712-345678";
  user.address = "Dhaka, Bangladesh";
  user.role = "INSTRUCTOR" as any;
  user.isVerified = true;
  user.intro = "Passionate Senior Software Engineer and Tech Educator with 8+ years of industry experience building scalable enterprise web platforms and AI-driven solutions. Experienced in Next.js, TypeScript, Python, Node.js, and Cloud Native Architectures. Mentored thousands of students worldwide to transition into modern software engineering roles.";
  user.socialLinks = {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    website: "https://kawsarahmed.dev"
  };

  await user.save();
  console.log("✅ User document updated for Kawsar.");

  // 2. Update or create Instructor document
  const instructorDoc = await Instructor.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      designation: "Lead Full-Stack Software Engineer & AI Researcher",
      enrolledStudent: 485,
      noOfCourse: Math.max(courseCount, 6),
      expertise: [
        "Web Development",
        "Next.js & React 19",
        "Artificial Intelligence",
        "Python & PyTorch",
        "Node.js & Express",
        "Cloud & DevOps"
      ],
      certifications: [
        "AWS Certified Solutions Architect – Associate",
        "Meta Certified Full-Stack Developer",
        "TensorFlow Developer Certificate",
        "Google Professional Cloud Architect"
      ]
    },
    { upsert: true, new: true }
  );

  console.log("✅ Instructor document updated:", JSON.stringify({
    id: instructorDoc._id,
    designation: instructorDoc.designation,
    noOfCourse: instructorDoc.noOfCourse,
    enrolledStudent: instructorDoc.enrolledStudent,
    expertise: instructorDoc.expertise,
    certifications: instructorDoc.certifications
  }, null, 2));

  await mongoose.disconnect();
  console.log("Done!");
}

main().catch(err => {
  console.error("Error updating profile:", err);
  process.exit(1);
});
