import sqlite3
from typing import List, Optional, Dict, Any
from datetime import datetime

import os

# Use 'data' directory for persistence in Docker, fallback to current dir
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)

DB_FILE = os.path.join(DATA_DIR, "review.db")

def get_connection():
    return sqlite3.connect(DB_FILE)

def init_db():
    conn = get_connection()
    c = conn.cursor()
    # Problems table
    c.execute('''CREATE TABLE IF NOT EXISTS problems
                 (id TEXT PRIMARY KEY, title TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    # Reviews table
    c.execute('''CREATE TABLE IF NOT EXISTS reviews
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  problem_id TEXT, 
                  status TEXT, 
                  feedback TEXT,
                  reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY(problem_id) REFERENCES problems(id))''')
    conn.commit()
    conn.close()

# Initialize on module load or explicit call
init_db()

def list_problems() -> List[Dict[str, Any]]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, title FROM problems ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1] or f"Problem {r[0]}"} for r in rows]

def add_problem_id(problem_id: str, title: Optional[str] = None):
    conn = get_connection()
    c = conn.cursor()
    c.execute("INSERT OR IGNORE INTO problems (id, title) VALUES (?, ?)", (problem_id, title))
    conn.commit()
    conn.close()

def delete_problem(problem_id: str):
    conn = get_connection()
    c = conn.cursor()
    # Delete reviews first due to foreign key (though sqlite default usually doesn't enforce cascade without config, good practice)
    c.execute("DELETE FROM reviews WHERE problem_id = ?", (problem_id,))
    c.execute("DELETE FROM problems WHERE id = ?", (problem_id,))
    conn.commit()
    conn.close()

def log_review(problem_id: str, status: str, feedback: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("INSERT INTO reviews (problem_id, status, feedback) VALUES (?, ?, ?)", 
              (problem_id, status, feedback))
    conn.commit()
    conn.close()
