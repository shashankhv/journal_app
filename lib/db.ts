import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

// MongoDB Collections
interface HourlyEntry {
  _id?: any;
  date: string;
  hour: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DailyAggregation {
  _id?: any;
  date: string;
  totalEntries: number;
  entries: { [hour: number]: string };
  createdAt: Date;
  updatedAt: Date;
}

interface WeeklyAggregation {
  _id?: any;
  year: number;
  week: number;
  startDate: string;
  endDate: string;
  totalEntries: number;
  dailyEntries: { date: string; count: number }[];
  createdAt: Date;
  updatedAt: Date;
}

interface MonthlyAggregation {
  _id?: any;
  year: number;
  month: number;
  totalEntries: number;
  dailyEntries: { date: string; count: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getDb(): Promise<Db> {
  if (!client || !db) {
    const mongoUrl =
      process.env.MONGODB_URI || "mongodb://localhost:27017/test_journal";
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db();

    // Create indexes
    await createIndexes();
  }
  return db;
}

async function createIndexes() {
  if (!db) return;

  const entries = db.collection<HourlyEntry>("entries");
  const dailyAggs = db.collection<DailyAggregation>("daily_aggregations");
  const weeklyAggs = db.collection<WeeklyAggregation>("weekly_aggregations");
  const monthlyAggs = db.collection<MonthlyAggregation>("monthly_aggregations");

  // Create compound index for entries (unique on date + hour)
  await entries.createIndex({ date: 1, hour: 1 }, { unique: true });
  await entries.createIndex({ date: 1 });
  await entries.createIndex({ createdAt: 1 });

  // Create indexes for aggregations
  await dailyAggs.createIndex({ date: 1 }, { unique: true });
  await weeklyAggs.createIndex({ year: 1, week: 1 }, { unique: true });
  await monthlyAggs.createIndex({ year: 1, month: 1 }, { unique: true });
}

export interface Entry {
  date: string;
  hour: number;
  text: string;
}

export async function getDay(
  date: string
): Promise<{ [hour: number]: string }> {
  const database = await getDb();
  const entries = database.collection<HourlyEntry>("entries");

  const docs = await entries.find({ date }).toArray();
  const result: { [hour: number]: string } = {};

  for (const doc of docs) {
    result[doc.hour] = doc.text;
  }

  return result;
}

export async function setHourEntry(date: string, hour: number, text: string) {
  const database = await getDb();
  const entries = database.collection<HourlyEntry>("entries");

  if (text) {
    await entries.replaceOne(
      { date, hour },
      {
        date,
        hour,
        text,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  } else {
    await entries.deleteOne({ date, hour });
  }

  // Trigger background aggregation for this date
  await updateDailyAggregation(date);
}

export async function setManyEntries(
  date: string,
  entries: { hour: number; text: string }[]
) {
  const database = await getDb();
  const collection = database.collection<HourlyEntry>("entries");

  const operations = entries.map((entry) => {
    if (entry.text) {
      return {
        replaceOne: {
          filter: { date, hour: entry.hour },
          replacement: {
            date,
            hour: entry.hour,
            text: entry.text,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          upsert: true,
        },
      };
    } else {
      return {
        deleteOne: {
          filter: { date, hour: entry.hour },
        },
      };
    }
  });

  if (operations.length > 0) {
    await collection.bulkWrite(operations);
  }

  // Trigger background aggregation for this date
  await updateDailyAggregation(date);
}

export async function getMonthCounts(
  year: number,
  month: number
): Promise<{ [date: string]: number }> {
  // Check if we have monthly aggregation first
  const database = await getDb();
  const monthlyAggs = database.collection<MonthlyAggregation>(
    "monthly_aggregations"
  );

  const monthlyAgg = await monthlyAggs.findOne({ year, month });
  if (monthlyAgg) {
    const result: { [date: string]: number } = {};
    for (const dailyEntry of monthlyAgg.dailyEntries) {
      result[dailyEntry.date] = dailyEntry.count;
    }
    return result;
  }

  // Fallback to real-time aggregation
  const entries = database.collection<HourlyEntry>("entries");
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const pipeline = [
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$date",
        count: { $sum: 1 },
      },
    },
  ];

  const docs = await entries.aggregate(pipeline).toArray();
  const result: { [date: string]: number } = {};

  for (const doc of docs) {
    result[doc._id] = doc.count;
  }

  return result;
}

export async function getAllEntries(): Promise<{
  [date: string]: { [hour: number]: string };
}> {
  const database = await getDb();
  const entries = database.collection<HourlyEntry>("entries");

  const docs = await entries.find({}).sort({ date: 1, hour: 1 }).toArray();
  const result: { [date: string]: { [hour: number]: string } } = {};

  for (const doc of docs) {
    if (!result[doc.date]) {
      result[doc.date] = {};
    }
    result[doc.date][doc.hour] = doc.text;
  }

  return result;
}

// Background aggregation functions
async function updateDailyAggregation(date: string) {
  const database = await getDb();
  const entries = database.collection<HourlyEntry>("entries");
  const dailyAggs = database.collection<DailyAggregation>("daily_aggregations");

  // Get all entries for this date
  const dayEntries = await entries.find({ date }).toArray();
  const entriesMap: { [hour: number]: string } = {};

  for (const entry of dayEntries) {
    entriesMap[entry.hour] = entry.text;
  }

  if (dayEntries.length > 0) {
    await dailyAggs.replaceOne(
      { date },
      {
        date,
        totalEntries: dayEntries.length,
        entries: entriesMap,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  } else {
    await dailyAggs.deleteOne({ date });
  }

  // Trigger weekly and monthly aggregations
  await updateWeeklyAggregation(date);
  await updateMonthlyAggregation(date);
}

async function updateWeeklyAggregation(date: string) {
  const database = await getDb();
  const dailyAggs = database.collection<DailyAggregation>("daily_aggregations");
  const weeklyAggs = database.collection<WeeklyAggregation>(
    "weekly_aggregations"
  );

  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const week = getWeekNumber(dateObj);

  // Get week start and end dates
  const { startDate, endDate } = getWeekDates(year, week);

  // Get daily aggregations for this week
  const weeklyDailies = await dailyAggs
    .find({
      date: { $gte: startDate, $lte: endDate },
    })
    .toArray();

  const dailyEntries = weeklyDailies.map((daily) => ({
    date: daily.date,
    count: daily.totalEntries,
  }));

  const totalEntries = dailyEntries.reduce(
    (sum, daily) => sum + daily.count,
    0
  );

  if (totalEntries > 0) {
    await weeklyAggs.replaceOne(
      { year, week },
      {
        year,
        week,
        startDate,
        endDate,
        totalEntries,
        dailyEntries,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  } else {
    await weeklyAggs.deleteOne({ year, week });
  }
}

async function updateMonthlyAggregation(date: string) {
  const database = await getDb();
  const dailyAggs = database.collection<DailyAggregation>("daily_aggregations");
  const monthlyAggs = database.collection<MonthlyAggregation>(
    "monthly_aggregations"
  );

  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;

  // Get daily aggregations for this month
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-31`;

  const monthlyDailies = await dailyAggs
    .find({
      date: { $gte: monthStart, $lte: monthEnd },
    })
    .toArray();

  const dailyEntries = monthlyDailies.map((daily) => ({
    date: daily.date,
    count: daily.totalEntries,
  }));

  const totalEntries = dailyEntries.reduce(
    (sum, daily) => sum + daily.count,
    0
  );

  if (totalEntries > 0) {
    await monthlyAggs.replaceOne(
      { year, month },
      {
        year,
        month,
        totalEntries,
        dailyEntries,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  } else {
    await monthlyAggs.deleteOne({ year, month });
  }
}

// Helper functions for week calculations
function getWeekNumber(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + startDate.getDay() + 1) / 7);
}

function getWeekDates(
  year: number,
  week: number
): { startDate: string; endDate: string } {
  const january4th = new Date(year, 0, 4);
  const days = (week - 1) * 7;
  const weekStart = new Date(
    january4th.getTime() -
      (january4th.getDay() - 1) * 24 * 60 * 60 * 1000 +
      days * 24 * 60 * 60 * 1000
  );
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  return {
    startDate: weekStart.toISOString().slice(0, 10),
    endDate: weekEnd.toISOString().slice(0, 10),
  };
}

// Export the types for use in other files
export type {
  HourlyEntry,
  DailyAggregation,
  WeeklyAggregation,
  MonthlyAggregation,
};
