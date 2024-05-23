import sqlite3 from 'sqlite3';

export function connectToDatabase(dbFilePath: string): sqlite3.Database {
  return new sqlite3.Database(dbFilePath, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Connected to the SQLite database.');
    }
  });
}