import sqlite3 from 'sqlite3';
import { connectToDatabase } from '../database';
import fs from 'fs';
import path from 'path';

const dbDir = path.resolve(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

let db = connectToDatabase(path.join(dbDir, 'OLLamaScriptCode.db'));

// SQL statement to create the Questions table
let createQuestionsTable = `
CREATE TABLE IF NOT EXISTS Questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    qText TEXT NOT NULL,
    codeSelected TEXT,
    model TEXT,
    qImg TEXT NULL,
    askedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

// SQL statement to create the Responses table
let createResponsesTable = `
CREATE TABLE IF NOT EXISTS Responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    questionId INTEGER,
    responseText TEXT NOT NULL,
    respondedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(questionId) REFERENCES Questions(id)
)`;

// Execute the SQL statements to create the tables
db.run(createQuestionsTable, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Questions table created.');
  }
});

db.run(createResponsesTable, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Responses table created.');
  }
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});