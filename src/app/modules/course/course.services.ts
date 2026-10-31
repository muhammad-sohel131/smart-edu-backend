/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { FilterQuery } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Course } from "./course.model";
import { ICourse, ICourseListQuery } from "./course.interface";
import { Lesson } from "../lesson/lesson.model";
import { Unit } from "../unit/unit.model";
import { Instructor } from "../user/user.model";

const createCourse = async (payload: Omit<ICourse, "slug" | "isDeleted">) => {
  console.log("Creating course with payload:", payload);
  const course = await Course.create(payload);
  return course.toObject();
};

const listCourses = async (query: any) => {
  const filter: FilterQuery<ICourse> = { isDeleted: false };

  const searchVal = (query.q || query.search)?.toString()?.trim();
  if (searchVal) {
    if (searchVal.length <= 8) {
      const searchRegex = new RegExp(searchVal, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    } else {
      filter.$text = { $search: searchVal };
    }
  }

  // 🎯 Category (support single or multiple)
  if (query.categories) {
    const rawCategories = String(query.categories)
      .split(",")
      .map((c: string) => c.trim())
      .filter(Boolean);

    if (rawCategories.length > 0) {
      const escapeRegex = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regexPatterns = rawCategories.map((c: string) => {
        const words = c.split(/[\s_&\-]+/).filter(Boolean);
        const flexiblePattern = words.map((w: string) => escapeRegex(w)).join("(?:[\\s_&\\-]+|and)");
        return new RegExp(`^${flexiblePattern}$`, "i");
      });
      filter.category = { $in: regexPatterns };
    }
  }

  // 📚 Level
  if (query.level) filter.level = query.level;

  // ✅ Status (published/draft)
  if (query.status) filter.status = query.status;

  // 👨‍🏫 Instructor
  if (query.instructor) {
    const instructorDoc = await Instructor.findById(query.instructor);
    if (instructorDoc && instructorDoc.userId) {
      filter.instructor = instructorDoc.userId;
    } else {
      filter.instructor = query.instructor as any;
    }
  }

  // 💰 Free vs Paid filter
  if (query.price === "free") {
    filter.price = 0;
  } else if (query.price === "paid") {
    filter.price = { $gt: 0 };
  } else if (typeof query.isFree === "boolean") {
    filter.price = query.isFree ? 0 : { $gt: 0 };
  }

  // 📄 Pagination and Sorting
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 12);
  const skip = (page - 1) * limit;
  const sort = query.sort ?? "-createdAt";

  // Check global active course discount
  let activeDiscount: any = null;
  try {
    const { CourseDiscountServices } = await import("../courseDiscount/courseDiscount.service");
    const d = await CourseDiscountServices.getDiscount();
    if (d && d.isActive && d.percentage > 0) {
      activeDiscount = d;
    }
  } catch (err) {
    console.error("Error reading active discount:", err);
  }

  // ⚡ Fetch items and total count
  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "name email picture") // optional
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  // Calculate lesson count and duration for each course + apply global discount
  const itemsWithStats = await Promise.all(
    items.map(async (course) => {
      const courseObj = course.toObject();

      // Get all units for this course
      const units = await Unit.find({ course: course._id, isDeleted: false }).select('_id');
      const unitIds = units.map(u => u._id);
      
      // Count lessons
      const lessonCount = await Lesson.countDocuments({
        unit: { $in: unitIds },
        isDeleted: false
      });
      
      // Calculate total duration (sum of all lesson durations in seconds)
      const durationResult = await Lesson.aggregate([
        {
          $match: {
            unit: { $in: unitIds },
            isDeleted: false,
            durationSec: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            totalSeconds: { $sum: "$durationSec" }
          }
        }
      ]);
      
      const totalSeconds = durationResult[0]?.totalSeconds || 0;
      
      // Format duration
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      let duration = "";
      if (hours > 0) {
        duration = `${hours}h`;
        if (minutes > 0) {
          duration += ` ${minutes}m`;
        }
      } else if (minutes > 0) {
        duration = `${minutes}m`;
      } else {
        duration = "0m";
      }

      // Compute pricing with global discount if active
      let finalPrice = courseObj.price ?? 0;
      const originalPrice = courseObj.price ?? 0;
      let oldPrice: number | undefined = undefined;
      let discountPercentage = 0;
      let discountAmount = 0;
      let isScholarshipFunded = false;

      if (activeDiscount && originalPrice > 0) {
        discountPercentage = activeDiscount.percentage;
        discountAmount = Math.round((originalPrice * discountPercentage) / 100);
        finalPrice = Math.max(0, originalPrice - discountAmount);
        oldPrice = originalPrice;
        isScholarshipFunded = true;
      }
      
      return {
        ...courseObj,
        price: finalPrice,
        originalPrice,
        oldPrice,
        discountPercentage,
        discountAmount,
        isScholarshipFunded,
        lessonCount,
        duration,
        totalDurationSeconds: totalSeconds
      };
    })
  );

  return {
    items: itemsWithStats,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const getCourseBySlug = async (id: string) => {
  const course = await Course.findOne({
    $or: [
      { slug: id },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
    ],
    isDeleted: false
  }).populate("instructor", "name email picture");

  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const courseObj = course.toObject();
  let finalPrice = courseObj.price ?? 0;
  const originalPrice = courseObj.price ?? 0;
  let oldPrice: number | undefined = undefined;
  let discountPercentage = 0;
  let discountAmount = 0;
  let isScholarshipFunded = false;

  try {
    const { CourseDiscountServices } = await import("../courseDiscount/courseDiscount.service");
    const d = await CourseDiscountServices.getDiscount();
    if (d && d.isActive && d.percentage > 0 && originalPrice > 0) {
      discountPercentage = d.percentage;
      discountAmount = Math.round((originalPrice * discountPercentage) / 100);
      finalPrice = Math.max(0, originalPrice - discountAmount);
      oldPrice = originalPrice;
      isScholarshipFunded = true;
    }
  } catch (err) {
    console.error("Error applying discount in getCourseBySlug:", err);
  }

  return {
    ...courseObj,
    price: finalPrice,
    originalPrice,
    oldPrice,
    discountPercentage,
    discountAmount,
    isScholarshipFunded
  };
};

const updateCourse = async (
  id: string,
  updates: Partial<ICourse>,
  actor: { userId: string; role: string }
) => {
  const course = await Course.findOne({slug: id});
  if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  Object.assign(course, updates);
  await course.save();
  return course;
};

const softDeleteCourse = async (id: string) => {
  const course = await Course.findById(id);
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");
  course.isDeleted = true;
  await course.save();
  return true;
};

export const CourseServices = {
  createCourse,
  listCourses,
  getCourseBySlug,
  updateCourse,
  softDeleteCourse,
};
