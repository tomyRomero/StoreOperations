import "server-only";

import { requireAdmin } from "../guards";
import Activity from "../models/activity.model";
import Store from "../models/store.model";

// Admin reads for Server Components. Each one checks for an admin itself, so a
// page can never leak data even if its layout check were bypassed.

// Activity log, newest first
export const getAllActivity = async (pageNumber = 1, pageSize = 10) => {
  await requireAdmin();
  try {
    const skipAmount = (pageNumber - 1) * pageSize;
    const activities = await Activity.aggregate([{ $sort: { timestamp: -1 } }, { $skip: skipAmount }, { $limit: pageSize }]);
    const totalActivitiesCount = await Activity.countDocuments();
    const isNext = totalActivitiesCount > skipAmount + pageSize;

    return { activities, isNext };
  } catch (error) {
    console.error("Error retrieving all activity:", error);
    return { activities: [], isNext: false };
  }
};

export const getAllSubscribedEmails = async (): Promise<string[]> => {
  await requireAdmin();
  try {
    const store = await Store.findOne();
    return store?.newsletter ?? [];
  } catch (error) {
    console.error("Error fetching subscribed emails:", error);
    return [];
  }
};
