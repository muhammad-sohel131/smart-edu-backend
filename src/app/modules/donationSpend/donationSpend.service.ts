import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Order } from "../order/order.model";
import { IDonationSpend } from "./donationSpend.interface";
import { DonationSpend } from "./donationSpend.model";

const createSpend = async (payload: Partial<IDonationSpend>, actorUserId?: string) => {
  if (!payload.title || !payload.title.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Title/Purpose of expense is required");
  }

  const amount = Number(payload.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Expense amount must be greater than 0");
  }

  const fund = payload.fund?.trim() || "educational-scholarships";

  const spendRecord = await DonationSpend.create({
    ...payload,
    amount,
    fund,
    spentDate: payload.spentDate ? new Date(payload.spentDate) : new Date(),
    createdBy: actorUserId as any,
  });

  return spendRecord;
};

const getAllSpends = async (query: Record<string, any> = {}) => {
  const {
    q,
    fund,
    category,
    page = 1,
    limit = 20,
    sortBy = "spentDate",
    sortOrder = "desc",
  } = query;

  const filter: any = { isDeleted: false };

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
  const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortDirection };

  const [spends, total] = await Promise.all([
    DonationSpend.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name email"),
    DonationSpend.countDocuments(filter)
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
};

const getSpendById = async (id: string) => {
  const spend = await DonationSpend.findOne({ _id: id, isDeleted: false }).populate("createdBy", "name email");
  if (!spend) {
    throw new AppError(httpStatus.NOT_FOUND, "Spend record not found");
  }
  return spend;
};

const updateSpend = async (id: string, payload: Partial<IDonationSpend>) => {
  const existing = await DonationSpend.findOne({ _id: id, isDeleted: false });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Spend record not found");
  }

  if (payload.amount !== undefined) {
    const amount = Number(payload.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
    }
    payload.amount = amount;
  }

  if (payload.spentDate) {
    payload.spentDate = new Date(payload.spentDate);
  }

  const updated = await DonationSpend.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return updated;
};

const deleteSpend = async (id: string) => {
  const existing = await DonationSpend.findOne({ _id: id, isDeleted: false });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Spend record not found");
  }

  existing.isDeleted = true;
  await existing.save();
  return existing;
};

const getSummary = async () => {
  // Aggregate total raised from paid Donation orders
  const donationAggregation = await Order.aggregate([
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
  const spendAggregation = await DonationSpend.aggregate([
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
  const fundsMap: Record<string, {
    fund: string;
    raised: number;
    spent: number;
    balance: number;
    percentageSpent: number;
    donationCount: number;
    spendCount: number;
  }> = {};

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
      return {
        ...f,
        balance,
        percentageSpent
      };
    });

  // Fetch 5 latest spends
  const recentSpends = await DonationSpend.find({ isDeleted: false })
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
};

export const DonationSpendServices = {
  createSpend,
  getAllSpends,
  getSpendById,
  updateSpend,
  deleteSpend,
  getSummary
};
