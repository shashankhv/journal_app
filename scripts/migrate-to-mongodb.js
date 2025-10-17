#!/usr/bin/env node

/**
 * Migration script to transfer data from SQLite journal.db to MongoDB
 * 
 * Usage:
 *   node scripts/migrate-to-mongodb.js
 * 
 * Make sure to set MONGODB_URI environment variable if not using localhost:27017
 */

const Database = require('better-sqlite3');
const { MongoClient } = require('mongodb');
const path = require('path');

async function main() {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://root:0asZ35tXO8VtG7zB2V0lca8kLVPWvqNsT21mbPlZhJolIVucnuRYZ82LaAAsEeVb@170.9.243.125:4444/?directConnection=true';
  const dbPath = path.join(process.cwd(), 'journal.db');
  
  console.log('🚀 Starting migration from SQLite to MongoDB');
  console.log(`📂 SQLite DB: ${dbPath}`);
  console.log(`🌐 MongoDB URI: ${mongoUrl}`);
  
  // Check if SQLite database exists
  let sqliteDb;
  try {
    sqliteDb = new Database(dbPath, { readonly: true });
  } catch (error) {
    console.error('❌ Could not open SQLite database:', error.message);
    process.exit(1);
  }
  
  // Connect to MongoDB
  let mongoClient;
  let mongodb;
  try {
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    mongodb = mongoClient.db();
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
  
  try {
    // Get all entries from SQLite
    const stmt = sqliteDb.prepare('SELECT date, hour, text FROM entries ORDER BY date, hour');
    const entries = stmt.all();
    
    console.log(`📊 Found ${entries.length} entries to migrate`);
    
    if (entries.length === 0) {
      console.log('ℹ️  No entries found in SQLite database');
      return;
    }
    
    // Clear existing MongoDB collections
    console.log('🧹 Clearing existing MongoDB collections...');
    await mongodb.collection('entries').deleteMany({});
    await mongodb.collection('daily_aggregations').deleteMany({});
    await mongodb.collection('weekly_aggregations').deleteMany({});
    await mongodb.collection('monthly_aggregations').deleteMany({});
    
    // Prepare MongoDB entries
    const mongoEntries = entries.map(entry => ({
      date: entry.date,
      hour: entry.hour,
      text: entry.text,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert entries into MongoDB
    console.log('📝 Inserting entries into MongoDB...');
    if (mongoEntries.length > 0) {
      const result = await mongodb.collection('entries').insertMany(mongoEntries);
      console.log(`✅ Inserted ${result.insertedCount} entries`);
    }
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await mongodb.collection('entries').createIndex({ date: 1, hour: 1 }, { unique: true });
    await mongodb.collection('entries').createIndex({ date: 1 });
    await mongodb.collection('entries').createIndex({ createdAt: 1 });
    await mongodb.collection('daily_aggregations').createIndex({ date: 1 }, { unique: true });
    await mongodb.collection('weekly_aggregations').createIndex({ year: 1, week: 1 }, { unique: true });
    await mongodb.collection('monthly_aggregations').createIndex({ year: 1, month: 1 }, { unique: true });
    console.log('✅ Indexes created');
    
    // Generate aggregations
    console.log('📊 Generating daily aggregations...');
    await generateDailyAggregations(mongodb, entries);
    
    console.log('📊 Generating weekly aggregations...');
    await generateWeeklyAggregations(mongodb);
    
    console.log('📊 Generating monthly aggregations...');
    await generateMonthlyAggregations(mongodb);
    
    console.log('✅ Migration completed successfully!');
    console.log(`📈 Total entries migrated: ${entries.length}`);
    
    // Show some stats
    const dailyCount = await mongodb.collection('daily_aggregations').countDocuments();
    const weeklyCount = await mongodb.collection('weekly_aggregations').countDocuments();
    const monthlyCount = await mongodb.collection('monthly_aggregations').countDocuments();
    
    console.log(`📊 Generated ${dailyCount} daily aggregations`);
    console.log(`📊 Generated ${weeklyCount} weekly aggregations`);
    console.log(`📊 Generated ${monthlyCount} monthly aggregations`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (sqliteDb) sqliteDb.close();
    if (mongoClient) await mongoClient.close();
  }
}

async function generateDailyAggregations(mongodb, entries) {
  const dailyData = {};
  
  // Group entries by date
  for (const entry of entries) {
    if (!dailyData[entry.date]) {
      dailyData[entry.date] = [];
    }
    dailyData[entry.date].push(entry);
  }
  
  const dailyAggregations = [];
  
  for (const [date, dayEntries] of Object.entries(dailyData)) {
    const entriesMap = {};
    for (const entry of dayEntries) {
      entriesMap[entry.hour] = entry.text;
    }
    
    dailyAggregations.push({
      date,
      totalEntries: dayEntries.length,
      entries: entriesMap,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  if (dailyAggregations.length > 0) {
    await mongodb.collection('daily_aggregations').insertMany(dailyAggregations);
  }
}

async function generateWeeklyAggregations(mongodb) {
  const dailyAggs = await mongodb.collection('daily_aggregations').find({}).toArray();
  const weeklyData = {};
  
  for (const daily of dailyAggs) {
    const dateObj = new Date(daily.date);
    const year = dateObj.getFullYear();
    const week = getWeekNumber(dateObj);
    const weekKey = `${year}-${week}`;
    
    if (!weeklyData[weekKey]) {
      const { startDate, endDate } = getWeekDates(year, week);
      weeklyData[weekKey] = {
        year,
        week,
        startDate,
        endDate,
        dailyEntries: []
      };
    }
    
    weeklyData[weekKey].dailyEntries.push({
      date: daily.date,
      count: daily.totalEntries
    });
  }
  
  const weeklyAggregations = [];
  
  for (const weekly of Object.values(weeklyData)) {
    const totalEntries = weekly.dailyEntries.reduce((sum, daily) => sum + daily.count, 0);
    
    weeklyAggregations.push({
      year: weekly.year,
      week: weekly.week,
      startDate: weekly.startDate,
      endDate: weekly.endDate,
      totalEntries,
      dailyEntries: weekly.dailyEntries,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  if (weeklyAggregations.length > 0) {
    await mongodb.collection('weekly_aggregations').insertMany(weeklyAggregations);
  }
}

async function generateMonthlyAggregations(mongodb) {
  const dailyAggs = await mongodb.collection('daily_aggregations').find({}).toArray();
  const monthlyData = {};
  
  for (const daily of dailyAggs) {
    const dateObj = new Date(daily.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const monthKey = `${year}-${month}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        year,
        month,
        dailyEntries: []
      };
    }
    
    monthlyData[monthKey].dailyEntries.push({
      date: daily.date,
      count: daily.totalEntries
    });
  }
  
  const monthlyAggregations = [];
  
  for (const monthly of Object.values(monthlyData)) {
    const totalEntries = monthly.dailyEntries.reduce((sum, daily) => sum + daily.count, 0);
    
    monthlyAggregations.push({
      year: monthly.year,
      month: monthly.month,
      totalEntries,
      dailyEntries: monthly.dailyEntries,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  if (monthlyAggregations.length > 0) {
    await mongodb.collection('monthly_aggregations').insertMany(monthlyAggregations);
  }
}

// Helper functions for week calculations
function getWeekNumber(date) {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startDate.getDay() + 1) / 7);
}

function getWeekDates(year, week) {
  const january4th = new Date(year, 0, 4);
  const days = (week - 1) * 7;
  const weekStart = new Date(january4th.getTime() - (january4th.getDay() - 1) * 24 * 60 * 60 * 1000 + days * 24 * 60 * 60 * 1000);
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  
  return {
    startDate: weekStart.toISOString().slice(0, 10),
    endDate: weekEnd.toISOString().slice(0, 10)
  };
}

// Run the migration
main().catch(console.error);
