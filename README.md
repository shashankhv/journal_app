# Hourly Journal (Next.js)

A Next.js 14 App Router project for journaling by the hour, now backed by SQLite database for persistent storage.

## Features

- Monthly dashboard calendar with per-day entry counts
- 24-hour day view with inline editing & Ctrl/Cmd+S to save, Ctrl/Cmd+Enter to finish an hour edit
- New entry quick-add form
- Markdown export for a date range (download as `.md`)
- SQLite database for persistent storage
- Migration tool to transfer data from localStorage

## Data Model

SQLite database (`journal.db`) with the following schema:

```sql
CREATE TABLE entries (
  date TEXT NOT NULL,
  hour INTEGER NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (date, hour)
);
```

Data format: `YYYY-MM-DD` for dates, `0-23` for hours. Only hours with non-empty text are stored.

## Running

```bash
npm install
npm run dev
```

Visit http://localhost:3000

The SQLite database file (`journal.db`) will be created automatically in the project root on first use.

## Migrating from localStorage

If you were previously using the localStorage version:

1. Visit http://localhost:3000/migrate
2. Click "Start Migration" to transfer your data
3. After successful migration, you can optionally clear localStorage

## API Routes

The app uses the following API endpoints:

- `GET /api/entries/day?date=YYYY-MM-DD` - Get all entries for a specific day
- `POST /api/entries/set-hour` - Set/update a single hour entry
- `POST /api/entries/set-many` - Batch update multiple hour entries
- `GET /api/entries/month-counts?year=YYYY&month=M` - Get entry counts for a month
- `GET /api/entries/all` - Get all entries (used for export)

## Notes

- Database is stored locally in `journal.db`
- API routes handle all database operations using `better-sqlite3`
- Navigation handled with Next.js router; calendar day buttons push `/day?date=YYYY-MM-DD`
- Tailwind processes the same styling goals; colors preserved

## Future Improvements

- Add optional cloud sync
- Full-text search
- Theming toggle
- PWA offline installable
- Data backup/restore functionality

Enjoy!
