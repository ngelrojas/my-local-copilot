import sqlite3 from 'sqlite3';
import { connectToDatabase } from './database';

class Questions {
  db: sqlite3.Database;

  constructor() {
    this.db = connectToDatabase('../../db/OLLamaScriptCode.db');
  }

  create(qText: string, codeSelected: string, model: string, qImg: string) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO Questions (QText, CodeSelected, Model, QImg) VALUES (?, ?, ?, ?)`;
      this.db.run(sql, [qText, codeSelected, model, qImg], function(err) {
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
      const sql = `SELECT * FROM Questions WHERE id = ?`;
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(row);
        }
      });
    });
  }

  update(id: number, qText: string, codeSelected: string, model: string, qImg: string) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Questions SET qText = ?, codeSelected = ?, model = ?, qImg=? WHERE id = ?`;
      this.db.run(sql, [qText, codeSelected, model, qImg, id], function(err) {
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
      const sql = `DELETE FROM Questions WHERE id = ?`;
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

export default Questions;