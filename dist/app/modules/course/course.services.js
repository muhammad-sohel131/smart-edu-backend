"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const course_model_1 = require("./course.model");
const lesson_model_1 = require("../lesson/lesson.model");
const unit_model_1 = require("../unit/unit.model");
const user_model_1 = require("../user/user.model");
const createCourse = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating course with payload:", payload);
    const course = yield course_model_1.Course.create(payload);
    return course.toObject();
});
const listCourses = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const filter = { isDeleted: false };
    const searchVal = (_b = (_a = (query.q || query.search)) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.trim();
    if (searchVal) {
        if (searchVal.length <= 8) {
            const searchRegex = new RegExp(searchVal, 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ];
        }
        else {
            filter.$text = { $search: searchVal };
        }
    }
    // 🎯 Category (support single or multiple)
    if (query.categories) {
        const rawCategories = String(query.categories)
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
        if (rawCategories.length > 0) {
            const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
            const regexPatterns = rawCategories.map((c) => {
                const words = c.split(/[\s_&\-]+/).filter(Boolean);
                const flexiblePattern = words.map((w) => escapeRegex(w)).join("(?:[\\s_&\\-]+|and)");
                return new RegExp(`^${flexiblePattern}$`, "i");
            });
            filter.category = { $in: regexPatterns };
        }
    }
    // 📚 Level
    if (query.level)
        filter.level = query.level;
    // ✅ Status (published/draft)
    if (query.status)
        filter.status = query.status;
    // 👨‍🏫 Instructor
    if (query.instructor) {
        const instructorDoc = yield user_model_1.Instructor.findById(query.instructor);
        if (instructorDoc && instructorDoc.userId) {
            filter.instructor = instructorDoc.userId;
        }
        else {
            filter.instructor = query.instructor;
        }
    }
    // 💰 Free vs Paid filter
    if (query.price === "free") {
        filter.price = 0;
    }
    else if (query.price === "paid") {
        filter.price = { $gt: 0 };
    }
    else if (typeof query.isFree === "boolean") {
        filter.price = query.isFree ? 0 : { $gt: 0 };
    }
    // 📄 Pagination and Sorting
    const page = Number((_c = query.page) !== null && _c !== void 0 ? _c : 1);
    const limit = Number((_d = query.limit) !== null && _d !== void 0 ? _d : 12);
    const skip = (page - 1) * limit;
    const sort = (_e = query.sort) !== null && _e !== void 0 ? _e : "-createdAt";
    // Check global active course discount
    let activeDiscount = null;
    try {
        const { CourseDiscountServices } = yield Promise.resolve().then(() => __importStar(require("../courseDiscount/courseDiscount.service")));
        const d = yield CourseDiscountServices.getDiscount();
        if (d && d.isActive && d.percentage > 0) {
            activeDiscount = d;
        }
    }
    catch (err) {
        console.error("Error reading active discount:", err);
    }
    // ⚡ Fetch items and total count
    const [items, total] = yield Promise.all([
        course_model_1.Course.find(filter)
            .populate("instructor", "name email picture") // optional
            .sort(sort)
            .skip(skip)
            .limit(limit),
        course_model_1.Course.countDocuments(filter),
    ]);
    // Calculate lesson count and duration for each course + apply global discount
    const itemsWithStats = yield Promise.all(items.map((course) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const courseObj = course.toObject();
        // Get all units for this course
        const units = yield unit_model_1.Unit.find({ course: course._id, isDeleted: false }).select('_id');
        const unitIds = units.map(u => u._id);
        // Count lessons
        const lessonCount = yield lesson_model_1.Lesson.countDocuments({
            unit: { $in: unitIds },
            isDeleted: false
        });
        // Calculate total duration (sum of all lesson durations in seconds)
        const durationResult = yield lesson_model_1.Lesson.aggregate([
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
        const totalSeconds = ((_a = durationResult[0]) === null || _a === void 0 ? void 0 : _a.totalSeconds) || 0;
        // Format duration
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        let duration = "";
        if (hours > 0) {
            duration = `${hours}h`;
            if (minutes > 0) {
                duration += ` ${minutes}m`;
            }
        }
        else if (minutes > 0) {
            duration = `${minutes}m`;
        }
        else {
            duration = "0m";
        }
        // Compute pricing with global discount if active
        let finalPrice = (_b = courseObj.price) !== null && _b !== void 0 ? _b : 0;
        const originalPrice = (_c = courseObj.price) !== null && _c !== void 0 ? _c : 0;
        let oldPrice = undefined;
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
        return Object.assign(Object.assign({}, courseObj), { price: finalPrice, originalPrice,
            oldPrice,
            discountPercentage,
            discountAmount,
            isScholarshipFunded,
            lessonCount,
            duration, totalDurationSeconds: totalSeconds });
    })));
    return {
        items: itemsWithStats,
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
});
const getCourseBySlug = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const course = yield course_model_1.Course.findOne({
        $or: [
            { slug: id },
            ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
        ],
        isDeleted: false
    }).populate("instructor", "name email picture");
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const courseObj = course.toObject();
    let finalPrice = (_a = courseObj.price) !== null && _a !== void 0 ? _a : 0;
    const originalPrice = (_b = courseObj.price) !== null && _b !== void 0 ? _b : 0;
    let oldPrice = undefined;
    let discountPercentage = 0;
    let discountAmount = 0;
    let isScholarshipFunded = false;
    try {
        const { CourseDiscountServices } = yield Promise.resolve().then(() => __importStar(require("../courseDiscount/courseDiscount.service")));
        const d = yield CourseDiscountServices.getDiscount();
        if (d && d.isActive && d.percentage > 0 && originalPrice > 0) {
            discountPercentage = d.percentage;
            discountAmount = Math.round((originalPrice * discountPercentage) / 100);
            finalPrice = Math.max(0, originalPrice - discountAmount);
            oldPrice = originalPrice;
            isScholarshipFunded = true;
        }
    }
    catch (err) {
        console.error("Error applying discount in getCourseBySlug:", err);
    }
    return Object.assign(Object.assign({}, courseObj), { price: finalPrice, originalPrice,
        oldPrice,
        discountPercentage,
        discountAmount,
        isScholarshipFunded });
});
const updateCourse = (id, updates, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.Course.findOne({ slug: id });
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    Object.assign(course, updates);
    yield course.save();
    return course;
});
const softDeleteCourse = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.Course.findById(id);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    course.isDeleted = true;
    yield course.save();
    return true;
});
exports.CourseServices = {
    createCourse,
    listCourses,
    getCourseBySlug,
    updateCourse,
    softDeleteCourse,
};
