/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Event } from "./event.model";
import { IEvent } from "./event.interface";
import { GamificationServices } from "../gamification/gamification.service"; // optional if already exists
import { BadgeServices } from "../badge/badge.service";
import { OrderServices } from "../order/order.services";
import { Order } from "../order/order.model";

const create = async (payload: Partial<IEvent>, userId: string) => {
  const now = new Date(payload.eventDate ?? Date.now());
  console.log(payload)
  const event = await Event.create({
    ...payload,
    organizer: userId
  });
  return event;
};

const update = async (eventId: string, payload: Partial<IEvent>) => {
  console.log(eventId, payload)
  const event = await Event.findByIdAndUpdate(eventId, payload, { new: true });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  return event;
};

const remove = async (eventId: string) => {
  const event = await Event.findByIdAndUpdate(eventId, { isDeleted: true }, { new: true });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  return event;
};

const listPublic = async () => {
  return Event.find({ isDeleted: false }).sort({ startDate: 1 });
};

const getMyRegisteredEvents = async (userId: string) => {
  const orders = await Order.find({
    user: userId,
    itemType: "event",
    status: "paid",
    isDeleted: false,
  }).select("event price currency status provider createdAt").lean();

  const eventIdsFromOrders = orders
    .map((o: any) => o.event)
    .filter(Boolean);

  const events = await Event.find({
    isDeleted: false,
    $or: [
      { attendees: userId },
      ...(eventIdsFromOrders.length > 0 ? [{ _id: { $in: eventIdsFromOrders } }] : []),
    ],
  })
    .populate("organizer", "name email picture")
    .sort({ eventDate: 1, createdAt: -1 })
    .lean();

  const orderMap = new Map();
  orders.forEach((o: any) => {
    if (o.event) {
      orderMap.set(String(o.event), o);
    }
  });

  return events.map((ev: any) => {
    const order = orderMap.get(String(ev._id)) || null;
    return {
      ...ev,
      order,
      isPaid: Boolean(order) || ev.price === 0,
      registrationDate: order?.createdAt || ev.createdAt,
    };
  });
};
const getAllRegistrations = async () => {
  // fetch events with attendees populated
  const events = await Event.find({
    isDeleted: false,
    attendees: { $exists: true, $ne: [] }
  })
  .sort({ startDate: 1 })
  .populate("attendees", "name email picture phone");

  // flatten: each attendee gets its own "event" object
  const result:any = [];

  events.forEach(event => {
    event.attendees.forEach((user: any) => {
      result.push({
        eventId: event._id,
        eventTitle: event.title, 
        startDate: event.startDate,
        user: user, 
      });
    });
  });

  return result;
};

const get = async (eventId: string) => {
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  return event;
};

const register = async (eventId: string, userId: string) => {
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");

  if (event.attendees?.includes(userId as any))
    throw new AppError(httpStatus.BAD_REQUEST, "Already registered");

  event.attendees?.push(userId as any);
  await event.save();

  if (event.pointsReward > 0) {
    await GamificationServices.addPoints({
      userId,
      points: event.pointsReward,
      sourceType: "event",
      eventId: String(event._id),
      reason: `Attended event: ${(event.title as any).en || "Event"}`
    });

  }

  return event;
};

const markAttendance = async (eventId: string, userId: string) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");

  if (!event.attendees?.includes(userId as any))
    throw new AppError(httpStatus.BAD_REQUEST, "User not registered for this event");

  // Give points or badge (future integration)
  if (event.pointsReward > 0) {
    await GamificationServices.addPoints({
      userId,
      points: event.pointsReward,
      sourceType: "event",
      eventId: String(event._id),
      reason: `Attended event: ${(event.title as any).en || "Event"}`
    });

  }

  await BadgeServices.autoIssueBadge({ userId, totalPoints: 0, eventId: String(event._id) });


  return { message: "Attendance confirmed and points added", event };
};

const createCheckout = async (eventId: string, userId: string) => {
  const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true }});
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");

  const amount = event.price;

  // Reuse OrderServices but for itemType "event"
  return OrderServices.createCheckoutForEvent({
    eventId: String(event._id),
    userId,
    amount,
    currency: event.currency || "USD",
    name: event.title?.en || "Event"
  });
};
export const EventServices = {
  create,
  update,
  remove,
  listPublic,
  get,
  register,
  markAttendance,
  getMyRegisteredEvents,
  createCheckout,
  getAllRegistrations
};
