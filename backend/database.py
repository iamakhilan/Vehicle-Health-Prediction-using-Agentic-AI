import sqlite3
import json
import time
from pathlib import Path

_default_db_path = Path(__file__).parent.parent / 'vehicle_health.db'
DB_PATH = _default_db_path


def set_db_path(path):
    """Override DB path (used for test isolation)."""
    global DB_PATH
    DB_PATH = Path(path)


def reset_db_path():
    """Reset DB path to default."""
    global DB_PATH
    DB_PATH = _default_db_path

def get_connection():
    # Use isolation_level=None for autocommit
    conn = sqlite3.connect(DB_PATH, isolation_level=None)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    # Vehicles table
    c.execute('''
        CREATE TABLE IF NOT EXISTS vehicles (
            vehicle_id TEXT PRIMARY KEY,
            health_score REAL DEFAULT 100.0,
            cumulative_runtime REAL DEFAULT 0.0,
            cumulative_decay REAL DEFAULT 0.0,
            last_update_timestamp REAL,
            stress_history TEXT DEFAULT '[]',
            predicted_label INTEGER,
            failure_probability REAL,
            model_version TEXT DEFAULT 'xgboost_v1'
        )
    ''')
    try:
        c.execute("ALTER TABLE vehicles ADD COLUMN predicted_label INTEGER")
        c.execute("ALTER TABLE vehicles ADD COLUMN failure_probability REAL")
        c.execute("ALTER TABLE vehicles ADD COLUMN model_version TEXT DEFAULT 'xgboost_v1'")
    except sqlite3.OperationalError:
        pass
    
    # History table
    c.execute('''
        CREATE TABLE IF NOT EXISTS health_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_id TEXT,
            timestamp_text TEXT,
            health_score REAL,
            source_row_index INTEGER,
            FOREIGN KEY(vehicle_id) REFERENCES vehicles(vehicle_id)
        )
    ''')
    try:
        c.execute("ALTER TABLE health_history ADD COLUMN source_row_index INTEGER")
    except sqlite3.OperationalError:
        pass
    conn.close()

def get_vehicle_state(vehicle_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,))
    row = c.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def update_vehicle_state_ml(vehicle_id, predicted_label, failure_probability):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?", (vehicle_id,))
    exists = c.fetchone()
    now = time.time()
    
    if exists:
        c.execute('''
            UPDATE vehicles 
            SET predicted_label = ?, 
                failure_probability = ?, 
                model_version = 'xgboost_v1',
                last_update_timestamp = ?
            WHERE vehicle_id = ?
        ''', (predicted_label, failure_probability, now, vehicle_id))
    else:
        c.execute('''
            INSERT INTO vehicles (vehicle_id, predicted_label, failure_probability, model_version, last_update_timestamp)
            VALUES (?, ?, ?, 'xgboost_v1', ?)
        ''', (vehicle_id, predicted_label, failure_probability, now))
        
    conn.close()

def update_vehicle_state(vehicle_id, health, runtime, decay, stress_history):
    conn = get_connection()
    c = conn.cursor()
    
    c.execute("SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?", (vehicle_id,))
    exists = c.fetchone()
    
    stress_json = json.dumps(stress_history)
    now = time.time()
    
    if exists:
        c.execute('''
            UPDATE vehicles 
            SET health_score = ?, 
                cumulative_runtime = cumulative_runtime + ?, 
                cumulative_decay = cumulative_decay + ?, 
                last_update_timestamp = ?, 
                stress_history = ?
            WHERE vehicle_id = ?
        ''', (health, runtime, decay, now, stress_json, vehicle_id))
    else:
        c.execute('''
            INSERT INTO vehicles (vehicle_id, health_score, cumulative_runtime, cumulative_decay, last_update_timestamp, stress_history)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (vehicle_id, health, runtime, decay, now, stress_json))
        
    conn.close()

def add_history_record(vehicle_id, timestamp_text, health_score, source_row_index=None):
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO health_history (vehicle_id, timestamp_text, health_score, source_row_index) 
        VALUES (?, ?, ?, ?)
    ''', (vehicle_id, timestamp_text, health_score, source_row_index))
    
    # Enforce limit of 200 per vehicle
    c.execute("SELECT id FROM health_history WHERE vehicle_id = ? ORDER BY id DESC LIMIT 200", (vehicle_id,))
    rows = c.fetchall()
    if rows:
        min_id = rows[-1]['id']
        c.execute("DELETE FROM health_history WHERE vehicle_id = ? AND id < ?", (vehicle_id, min_id))
        
    conn.close()

def get_vehicle_history(vehicle_id, limit=50):
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        SELECT time, health, source_row_index
        FROM (
            SELECT timestamp_text AS time, health_score AS health, source_row_index, id
            FROM health_history
            WHERE vehicle_id = ?
            ORDER BY id DESC
            LIMIT ?
        )
        ORDER BY id ASC
    ''', (vehicle_id, limit))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Initialize db schemas on load
init_db()
