import sqlite3 from 'sqlite3';
import { connectToDatabase } from './database';

class Responses {
  db: sqlite3.Database;

  constructor() {
    this.db = connectToDatabase('../../db/OLLamaScriptCode.db');
  }

  create(questionId: number, responseText: string) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO Responses (questionId, responseText) VALUES (?, ?)`;
      this.db.run(sql, [questionId, responseText], function(err) {
        if (err) {
          reject(err.message);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  read(id: number) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM Responses WHERE id = ?`;
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(row);
        }
      });
    });
  }

  update(id: number, questionId: number, responseText: string) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Responses SET questionId = ?, responseText = ? WHERE id = ?`;
      this.db.run(sql, [questionId, responseText, id], function(err) {
        if (err) {
          reject(err.message);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  delete(id: number) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM Responses WHERE id = ?`;
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err.message);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
}

export default Responses;