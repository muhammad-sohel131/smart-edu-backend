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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationSpendServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const order_model_1 = require("../order/order.model");
const donationSpend_model_1 = require("./donationSpend.model");
const createSpend = (payload, actorUserId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!payload.title || !payload.title.trim()) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Title/Purpose of expense is required");
    }
    const amount = Number(payload.amount);
    if (isNaN(amount) || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Expense amount must be greater than 0");
    }
    const fund = ((_a = payload.fund) === null || _a === void 0 ? void 0 : _a.trim()) || "educational-scholarships";
    const spendRecord = yield donationSpend_model_1.DonationSpend.create(Object.assign(Object.assign({}, payload), { amount,
        fund, spentDate: payload.spentDate ? new Date(payload.spentDate) : new Date(), createdBy: actorUserId }));
    return spendRecord;
});
const getAllSpends = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { q, fund, category, page = 1, limit = 20, sortBy = "spentDate", sortOrder = "desc", } = query;
    const filter = { isDeleted: false };
    if (fund && fund !== "all") {
        filter.fund = fund;
    }
    if (category && category !== "all") {
        filter.category = category;
    }
    if (q && String(q).trim()) {
        const searchRegex = new RegExp(String(q).trim(), "i");
        filter.$or = [
            { title: searchRegex },
            { recipient: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { fund: searchRegex }
        ];
    }
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 20);
    const skip = (pageNum - 1) * limitNum;
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };
    const [spends, total] = yield Promise.all([
        donationSpend_model_1.DonationSpend.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .populate("createdBy", "name email"),
        donationSpend_model_1.DonationSpend.countDocuments(filter)
    ]);
    return {
        spends,
        meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1
        }
    };
});
const getSpendById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const spend = yield donationSpend_model_1.DonationSpend.findOne({ _id: id, isDeleted: false }).populate("createdBy", "name email");
    if (!spend) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Spend record not found");
    }
    return spend;
});
const updateSpend = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield donationSpend_model_1.DonationSpend.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Spend record not found");
    }
    if (payload.amount !== undefined) {
        const amount = Number(payload.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be greater than 0");
        }
        payload.amount = amount;
    }
    if (payload.spentDate) {
        payload.spentDate = new Date(payload.spentDate);
    }
    const updated = yield donationSpend_model_1.DonationSpend.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    return updated;
});
const deleteSpend = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield donationSpend_model_1.DonationSpend.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Spend record not found");
    }
    existing.isDeleted = true;
    yield existing.save();
    return existing;
});
const getSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    // Aggregate total raised from paid Donation orders
    const donationAggregation = yield order_model_1.Order.aggregate([
        {
            $match: {
                itemType: "Donation",
                status: "paid",
                isDeleted: false
            }
        },
        {
            $group: {
                _id: "$fund",
                totalRaised: { $sum: "$price" },
                count: { $sum: 1 }
            }
        }
    ]);
    // Aggregate total spent from active DonationSpend records
    const spendAggregation = yield donationSpend_model_1.DonationSpend.aggregate([
        {
            $match: {
                isDeleted: false
            }
        },
        {
            $group: {
                _id: "$fund",
                totalSpent: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);
    const totalRaised = donationAggregation.reduce((acc, curr) => acc + (curr.totalRaised || 0), 0);
    const totalSpent = spendAggregation.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);
    const totalDonationCount = donationAggregation.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const totalSpendCount = spendAggregation.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const netBalance = totalRaised - totalSpent;
    // Map by fund
    const fundsMap = {};
    // Standard predefined funds to always present in breakdown (3 funds)
    const defaultFunds = [
        "educational-scholarships",
        "institutional-development",
        "funding-programs"
    ];
    defaultFunds.forEach(f => {
        fundsMap[f] = {
            fund: f,
            raised: 0,
            spent: 0,
            balance: 0,
            percentageSpent: 0,
            donationCount: 0,
            spendCount: 0
        };
    });
    donationAggregation.forEach(d => {
        const fundKey = d._id || "general";
        if (!fundsMap[fundKey]) {
            fundsMap[fundKey] = {
                fund: fundKey,
                raised: 0,
                spent: 0,
                balance: 0,
                percentageSpent: 0,
                donationCount: 0,
                spendCount: 0
            };
        }
        fundsMap[fundKey].raised = d.totalRaised || 0;
        fundsMap[fundKey].donationCount = d.count || 0;
    });
    spendAggregation.forEach(s => {
        const fundKey = s._id || "general";
        if (!fundsMap[fundKey]) {
            fundsMap[fundKey] = {
                fund: fundKey,
                raised: 0,
                spent: 0,
                balance: 0,
                percentageSpent: 0,
                donationCount: 0,
                spendCount: 0
            };
        }
        fundsMap[fundKey].spent = s.totalSpent || 0;
        fundsMap[fundKey].spendCount = s.count || 0;
    });
    const fundBreakdown = Object.values(fundsMap)
        .filter(f => defaultFunds.includes(f.fund))
        .map(f => {
        const balance = f.raised - f.spent;
        const percentageSpent = f.raised > 0 ? Number(((f.spent / f.raised) * 100).toFixed(1)) : (f.spent > 0 ? 100 : 0);
        return Object.assign(Object.assign({}, f), { balance,
            percentageSpent });
    });
    // Fetch 5 latest spends
    const recentSpends = yield donationSpend_model_1.DonationSpend.find({ isDeleted: false })
        .sort({ spentDate: -1, createdAt: -1 })
        .limit(5);
    return {
        totalRaised,
        totalSpent,
        netBalance,
        totalDonationCount,
        totalSpendCount,
        fundBreakdown,
        recentSpends
    };
});
exports.DonationSpendServices = {
    createSpend,
    getAllSpends,
    getSpendById,
    updateSpend,
    deleteSpend,
    getSummary
};
