require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'common-ground-secret-change-in-production';

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

const { run, get, all, db } = require('./models/db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, full_name: user.full_name }, JWT_SECRET, { expiresIn: '7d' });
}

db.serialize(() => {
  run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  run(`CREATE TABLE IF NOT EXISTS surplus_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    quantity TEXT,
    pickup_address TEXT NOT NULL,
    pickup_window TEXT,
    status TEXT DEFAULT 'available',
    created_by_id INTEGER NOT NULL,
    created_by_name TEXT,
    reserved_by_id INTEGER,
    reserved_by_name TEXT,
    reserved_at DATETIME,
    reservation_note TEXT,
    expires_at DATETIME,
    collected_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    form TEXT,
    person_name TEXT,
    instructions TEXT,
    active INTEGER DEFAULT 1,
    times TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS dose_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    medicine_name TEXT,
    person_name TEXT,
    dosage TEXT,
    scheduled_time TEXT,
    log_date DATE NOT NULL,
    status TEXT DEFAULT 'taken',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    place TEXT,
    doctor TEXT,
    who_is_going TEXT,
    starts_at DATETIME,
    status TEXT DEFAULT 'upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS neighborhood_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    photo_url TEXT,
    status TEXT DEFAULT 'reported',
    upvotes INTEGER DEFAULT 0,
    upvoted_by TEXT DEFAULT '[]',
    reporter_name TEXT,
    reporter_id INTEGER NOT NULL,
    resolution_note TEXT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS blood_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blood_group TEXT NOT NULL,
    hospital TEXT NOT NULL,
    area TEXT NOT NULL,
    units_needed INTEGER DEFAULT 1,
    needed_by DATETIME,
    status TEXT DEFAULT 'open',
    requested_by_id INTEGER NOT NULL,
    requested_by_name TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS blood_donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    blood_group TEXT NOT NULL,
    area TEXT NOT NULL,
    available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS water_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    area TEXT NOT NULL,
    timing TEXT,
    price TEXT,
    description TEXT,
    status TEXT DEFAULT 'reported',
    reporter_id INTEGER NOT NULL,
    reporter_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS tuition_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_level TEXT NOT NULL,
    area TEXT NOT NULL,
    mode TEXT NOT NULL,
    schedule TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    posted_by_id INTEGER NOT NULL,
    posted_by_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by_id) REFERENCES users(id)
  )`);

  console.log('Database tables initialized');
});

// ===== AUTH =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, address } = req.body;
    if (!email || !password || !full_name) return res.status(400).json({ message: 'Email, password, and name required' });
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await run('INSERT INTO users (email, password_hash, full_name, phone, address) VALUES (?, ?, ?, ?, ?)', [email, passwordHash, full_name, phone || null, address || null]);
    const user = await get('SELECT id, email, full_name, phone, address, created_at FROM users WHERE id = ?', [result.lastID]);
    res.status(201).json({ token: generateToken(user), user });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token: generateToken(user), user: userWithoutPassword });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await get('SELECT id, email, full_name, phone, address, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ===== SURPLUS FOOD =====
app.get('/api/surplus-listings', authenticateToken, async (req, res) => {
  try {
    const { status, view, userId } = req.query;
    let sql = 'SELECT * FROM surplus_listings';
    const params = [];
    const conditions = [];
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (view === 'mine' && userId) { conditions.push('reserved_by_id = ? AND status = ?'); params.push(userId, 'reserved'); }
    else if (view === 'posts' && userId) { conditions.push('created_by_id = ?'); params.push(userId); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    const listings = await all(sql, params);
    res.json({ listings });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/surplus-listings', authenticateToken, async (req, res) => {
  try {
    const { title, description, quantity, pickup_address, pickup_window, expires_at } = req.body;
    if (!title || !pickup_address) return res.status(400).json({ message: 'Title and pickup address required' });
    const user = await get('SELECT id, full_name FROM users WHERE id = ?', [req.user.id]);
    const result = await run('INSERT INTO surplus_listings (title, description, quantity, pickup_address, pickup_window, expires_at, created_by_id, created_by_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [title, description || null, quantity || null, pickup_address, pickup_window || null, expires_at || null, req.user.id, user.full_name]);
    const listing = await get('SELECT * FROM surplus_listings WHERE id = ?', [result.lastID]);
    res.status(201).json({ listing });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/surplus-listings/:id/reserve', authenticateToken, async (req, res) => {
  try {
    const { note } = req.body;
    const listing = await get('SELECT * FROM surplus_listings WHERE id = ? AND status = ?', [req.params.id, 'available']);
    if (!listing) return res.status(404).json({ message: 'Listing not available' });
    const user = await get('SELECT full_name FROM users WHERE id = ?', [req.user.id]);
    await run('UPDATE surplus_listings SET status = ?, reserved_by_id = ?, reserved_by_name = ?, reserved_at = ?, reservation_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['reserved', req.user.id, user.full_name, new Date().toISOString(), note || '', req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/surplus-listings/:id/release', authenticateToken, async (req, res) => {
  try {
    const listing = await get('SELECT * FROM surplus_listings WHERE id = ?', [req.params.id]);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.reserved_by_id !== req.user.id && listing.created_by_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await run('UPDATE surplus_listings SET status = ?, reserved_by_id = NULL, reserved_by_name = NULL, reserved_at = NULL, reservation_note = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['available', req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/surplus-listings/:id/collect', authenticateToken, async (req, res) => {
  try {
    const listing = await get('SELECT * FROM surplus_listings WHERE id = ?', [req.params.id]);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.created_by_id !== req.user.id && listing.reserved_by_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await run('UPDATE surplus_listings SET status = ?, collected_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['collected', new Date().toISOString(), req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.delete('/api/surplus-listings/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await get('SELECT * FROM surplus_listings WHERE id = ? AND created_by_id = ?', [req.params.id, req.user.id]);
    if (!listing) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('DELETE FROM surplus_listings WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== MEDICINES =====
app.get('/api/medicines', authenticateToken, async (req, res) => {
  try {
    const medicines = await all('SELECT * FROM medicines WHERE user_id = ? ORDER BY name', [req.user.id]);
    res.json({ medicines: medicines.map(m => ({ ...m, times: JSON.parse(m.times || '[]') })) });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/medicines', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, form, person_name, instructions, active, times } = req.body;
    if (!name || !dosage) return res.status(400).json({ message: 'Name and dosage required' });
    const result = await run('INSERT INTO medicines (user_id, name, dosage, form, person_name, instructions, active, times) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.user.id, name, dosage, form || null, person_name || null, instructions || null, active !== false ? 1 : 0, JSON.stringify(times || [])]);
    const med = await get('SELECT * FROM medicines WHERE id = ?', [result.lastID]);
    res.status(201).json({ medicine: { ...med, times: JSON.parse(med.times || '[]') } });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.put('/api/medicines/:id', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, form, person_name, instructions, active, times } = req.body;
    const med = await get('SELECT * FROM medicines WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!med) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('UPDATE medicines SET name = COALESCE(?, name), dosage = COALESCE(?, dosage), form = COALESCE(?, form), person_name = COALESCE(?, person_name), instructions = COALESCE(?, instructions), active = COALESCE(?, active), times = COALESCE(?, times) WHERE id = ?', [name, dosage, form, person_name, instructions, active !== undefined ? (active ? 1 : 0) : med.active, times !== undefined ? JSON.stringify(times) : med.times, req.params.id]);
    const updated = await get('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
    res.json({ medicine: { ...updated, times: JSON.parse(updated.times || '[]') } });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.delete('/api/medicines/:id', authenticateToken, async (req, res) => {
  try {
    const med = await get('SELECT * FROM medicines WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!med) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('DELETE FROM medicines WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== DOSE LOGS =====
app.get('/api/dose-logs', authenticateToken, async (req, res) => {
  try {
    const { date, medicine_id } = req.query;
    let sql = 'SELECT * FROM dose_logs WHERE user_id = ?';
    const params = [req.user.id];
    if (date) { sql += ' AND log_date = ?'; params.push(date); }
    if (medicine_id) { sql += ' AND medicine_id = ?'; params.push(medicine_id); }
    sql += ' ORDER BY created_at DESC';
    const logs = await all(sql, params);
    res.json({ logs });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/dose-logs', authenticateToken, async (req, res) => {
  try {
    const { medicine_id, medicine_name, person_name, dosage, scheduled_time, log_date, status } = req.body;
    if (!medicine_id) return res.status(400).json({ message: 'Medicine ID required' });
    const result = await run('INSERT INTO dose_logs (medicine_id, user_id, medicine_name, person_name, dosage, scheduled_time, log_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [medicine_id, req.user.id, medicine_name || null, person_name || null, dosage || null, scheduled_time || null, log_date || new Date().toISOString().split('T')[0], status || 'taken']);
    const log = await get('SELECT * FROM dose_logs WHERE id = ?', [result.lastID]);
    res.status(201).json({ log });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.delete('/api/dose-logs/:id', authenticateToken, async (req, res) => {
  try {
    const log = await get('SELECT * FROM dose_logs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!log) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('DELETE FROM dose_logs WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== APPOINTMENTS =====
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await all('SELECT * FROM appointments WHERE user_id = ? ORDER BY starts_at ASC', [req.user.id]);
    res.json({ appointments });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { title, place, doctor, who_is_going, starts_at, status } = req.body;
    if (!title || !starts_at) return res.status(400).json({ message: 'Title and time required' });
    const result = await run('INSERT INTO appointments (user_id, title, place, doctor, who_is_going, starts_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, title, place || null, doctor || null, who_is_going || null, starts_at, status || 'upcoming']);
    const appt = await get('SELECT * FROM appointments WHERE id = ?', [result.lastID]);
    res.status(201).json({ appointment: appt });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { title, place, doctor, who_is_going, starts_at, status } = req.body;
    const appt = await get('SELECT * FROM appointments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!appt) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('UPDATE appointments SET title = COALESCE(?, title), place = COALESCE(?, place), doctor = COALESCE(?, doctor), who_is_going = COALESCE(?, who_is_going), starts_at = COALESCE(?, starts_at), status = COALESCE(?, status) WHERE id = ?', [title, place, doctor, who_is_going, starts_at, status, req.params.id]);
    const updated = await get('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ appointment: updated });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appt = await get('SELECT * FROM appointments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!appt) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== NEIGHBORHOOD ISSUES =====
app.get('/api/neighborhood-issues', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM neighborhood_issues';
    const params = [];
    const conditions = [];
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    const issues = await all(sql, params);
    res.json({ issues: issues.map(i => ({ ...i, upvoted_by: JSON.parse(i.upvoted_by || '[]') })) });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/neighborhood-issues', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, location, latitude, longitude, photo_url } = req.body;
    if (!title || !location) return res.status(400).json({ message: 'Title and location required' });
    const user = await get('SELECT full_name FROM users WHERE id = ?', [req.user.id]);
    const result = await run('INSERT INTO neighborhood_issues (title, description, category, location, latitude, longitude, photo_url, reporter_name, reporter_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [title, description || null, category || null, location, latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null, photo_url || null, user.full_name, req.user.id]);
    const issue = await get('SELECT * FROM neighborhood_issues WHERE id = ?', [result.lastID]);
    res.status(201).json({ issue: { ...issue, upvoted_by: JSON.parse(issue.upvoted_by || '[]') } });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/neighborhood-issues/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const issue = await get('SELECT * FROM neighborhood_issues WHERE id = ?', [req.params.id]);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    const voters = JSON.parse(issue.upvoted_by || '[]');
    const voted = voters.includes(req.user.id);
    const next = voted ? voters.filter(v => v !== req.user.id) : [...voters, req.user.id];
    await run('UPDATE neighborhood_issues SET upvoted_by = ?, upvotes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(next), next.length, req.params.id]);
    const updated = await get('SELECT * FROM neighborhood_issues WHERE id = ?', [req.params.id]);
    res.json({ ok: true, upvoted: !voted, upvotes: next.length });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.put('/api/neighborhood-issues/:id', authenticateToken, async (req, res) => {
  try {
    const { status, resolution_note } = req.body;
    const issue = await get('SELECT * FROM neighborhood_issues WHERE id = ?', [req.params.id]);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    const updates = [];
    const params = [];
    if (status) { updates.push('status = ?'); params.push(status); }
    if (resolution_note !== undefined) { updates.push('resolution_note = ?'); params.push(resolution_note); }
    if (status === 'resolved') { updates.push('resolved_at = ?'); params.push(new Date().toISOString()); }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);
    await run(`UPDATE neighborhood_issues SET ${updates.join(', ')} WHERE id = ?`, params);
    const updated = await get('SELECT * FROM neighborhood_issues WHERE id = ?', [req.params.id]);
    res.json({ issue: { ...updated, upvoted_by: JSON.parse(updated.upvoted_by || '[]') } });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.delete('/api/neighborhood-issues/:id', authenticateToken, async (req, res) => {
  try {
    const issue = await get('SELECT * FROM neighborhood_issues WHERE id = ? AND reporter_id = ?', [req.params.id, req.user.id]);
    if (!issue) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('DELETE FROM neighborhood_issues WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== BLOOD REQUESTS =====
app.get('/api/blood-requests', authenticateToken, async (req, res) => {
  try {
    const { status, blood_group } = req.query;
    let sql = 'SELECT * FROM blood_requests';
    const params = [];
    const conditions = [];
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (blood_group) { conditions.push('blood_group = ?'); params.push(blood_group); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    const requests = await all(sql, params);
    res.json({ requests });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/blood-requests', authenticateToken, async (req, res) => {
  try {
    const { blood_group, hospital, area, units_needed, needed_by, status, contact_name, contact_phone } = req.body;
    if (!blood_group || !hospital || !area) return res.status(400).json({ message: 'Blood group, hospital, and area required' });
    const user = await get('SELECT full_name FROM users WHERE id = ?', [req.user.id]);
    const result = await run('INSERT INTO blood_requests (blood_group, hospital, area, units_needed, needed_by, status, requested_by_id, requested_by_name, contact_name, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [blood_group, hospital, area, units_needed || 1, needed_by || null, status || 'open', req.user.id, user.full_name, contact_name || null, contact_phone || null]);
    const request = await get('SELECT * FROM blood_requests WHERE id = ?', [result.lastID]);
    res.status(201).json({ request });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.put('/api/blood-requests/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await get('SELECT * FROM blood_requests WHERE id = ? AND requested_by_id = ?', [req.params.id, req.user.id]);
    if (!request) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('UPDATE blood_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    const updated = await get('SELECT * FROM blood_requests WHERE id = ?', [req.params.id]);
    res.json({ request: updated });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.delete('/api/blood-requests/:id', authenticateToken, async (req, res) => {
  try {
    const request = await get('SELECT * FROM blood_requests WHERE id = ? AND requested_by_id = ?', [req.params.id, req.user.id]);
    if (!request) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('DELETE FROM blood_requests WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== BLOOD DONORS =====
app.get('/api/blood-donors', authenticateToken, async (req, res) => {
  try {
    const { blood_group, area } = req.query;
    let sql = 'SELECT * FROM blood_donors WHERE available = 1';
    const params = [];
    if (blood_group && area) sql += ' AND blood_group = ? AND area = ?';
    else if (blood_group) sql += ' AND blood_group = ?';
    else if (area) sql += ' AND area = ?';
    if (blood_group) params.push(blood_group);
    if (area) params.push(area);
    sql += ' ORDER BY created_at DESC';
    const donors = await all(sql, params);
    res.json({ donors });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/blood-donors', authenticateToken, async (req, res) => {
  try {
    const { blood_group, area } = req.body;
    if (!blood_group || !area) return res.status(400).json({ message: 'Blood group and area required' });
    const existing = await get('SELECT * FROM blood_donors WHERE user_id = ?', [req.user.id]);
    if (existing) {
      await run('UPDATE blood_donors SET blood_group = ?, area = ?, available = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [blood_group, area, req.user.id]);
      const donor = await get('SELECT * FROM blood_donors WHERE user_id = ?', [req.user.id]);
      return res.json({ donor });
    }
    const result = await run('INSERT INTO blood_donors (user_id, blood_group, area, available) VALUES (?, ?, ?, 1)', [req.user.id, blood_group, area]);
    const donor = await get('SELECT * FROM blood_donors WHERE id = ?', [result.lastID]);
    res.status(201).json({ donor });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.get('/api/blood-donors/me', authenticateToken, async (req, res) => {
  try {
    const donor = await get('SELECT * FROM blood_donors WHERE user_id = ?', [req.user.id]);
    res.json({ donor: donor || null });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.put('/api/blood-donors/toggle', authenticateToken, async (req, res) => {
  try {
    const { available } = req.body;
    const donor = await get('SELECT * FROM blood_donors WHERE user_id = ?', [req.user.id]);
    if (!donor) return res.status(404).json({ message: 'Donor listing not found' });
    await run('UPDATE blood_donors SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [available ? 1 : 0, req.user.id]);
    const updated = await get('SELECT * FROM blood_donors WHERE user_id = ?', [req.user.id]);
    res.json({ donor: updated });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== WATER UPDATES =====
app.get('/api/water-updates', authenticateToken, async (req, res) => {
  try {
    const { kind, status } = req.query;
    let sql = 'SELECT * FROM water_updates';
    const params = [];
    const conditions = [];
    if (kind) { conditions.push('kind = ?'); params.push(kind); }
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    const updates = await all(sql, params);
    res.json({ updates });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/water-updates', authenticateToken, async (req, res) => {
  try {
    const { kind, area, timing, price, description } = req.body;
    if (!kind || !area) return res.status(400).json({ message: 'Kind and area required' });
    const user = await get('SELECT full_name FROM users WHERE id = ?', [req.user.id]);
    const result = await run('INSERT INTO water_updates (kind, area, timing, price, description, reporter_id, reporter_name) VALUES (?, ?, ?, ?, ?, ?, ?)', [kind, area, timing || null, price || null, description || null, req.user.id, user.full_name]);
    const update = await get('SELECT * FROM water_updates WHERE id = ?', [result.lastID]);
    res.status(201).json({ update });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.put('/api/water-updates/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const update = await get('SELECT * FROM water_updates WHERE id = ? AND reporter_id = ?', [req.params.id, req.user.id]);
    if (!update) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('UPDATE water_updates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    const updated = await get('SELECT * FROM water_updates WHERE id = ?', [req.params.id]);
    res.json({ update: updated });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.delete('/api/water-updates/:id', authenticateToken, async (req, res) => {
  try {
    const update = await get('SELECT * FROM water_updates WHERE id = ? AND reporter_id = ?', [req.params.id, req.user.id]);
    if (!update) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('DELETE FROM water_updates WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== TUITION POSTS =====
app.get('/api/tuition-posts', authenticateToken, async (req, res) => {
  try {
    const { kind, status } = req.query;
    let sql = 'SELECT * FROM tuition_posts';
    const params = [];
    const conditions = [];
    if (kind) { conditions.push('kind = ?'); params.push(kind); }
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    const posts = await all(sql, params);
    res.json({ posts });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.post('/api/tuition-posts', authenticateToken, async (req, res) => {
  try {
    const { kind, subject, class_level, area, mode, schedule, description } = req.body;
    if (!kind || !subject || !class_level || !area || !mode || !schedule) return res.status(400).json({ message: 'All fields required' });
    const user = await get('SELECT full_name FROM users WHERE id = ?', [req.user.id]);
    const result = await run('INSERT INTO tuition_posts (kind, subject, class_level, area, mode, schedule, description, posted_by_id, posted_by_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [kind, subject, class_level, area, mode, schedule, description || null, req.user.id, user.full_name]);
    const post = await get('SELECT * FROM tuition_posts WHERE id = ?', [result.lastID]);
    res.status(201).json({ post });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.put('/api/tuition-posts/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const post = await get('SELECT * FROM tuition_posts WHERE id = ? AND posted_by_id = ?', [req.params.id, req.user.id]);
    if (!post) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('UPDATE tuition_posts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    const updated = await get('SELECT * FROM tuition_posts WHERE id = ?', [req.params.id]);
    res.json({ post: updated });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

app.delete('/api/tuition-posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await get('SELECT * FROM tuition_posts WHERE id = ? AND posted_by_id = ?', [req.params.id, req.user.id]);
    if (!post) return res.status(404).json({ message: 'Not found or not authorized' });
    await run('DELETE FROM tuition_posts WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== DASHBOARD STATS =====
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const available = await get('SELECT COUNT(*) as c FROM surplus_listings WHERE status = ?', ['available']);
    const myReservations = await get('SELECT COUNT(*) as c FROM surplus_listings WHERE reserved_by_id = ? AND status = ?', [userId, 'reserved']);
    const medsPage = await all('SELECT * FROM medicines WHERE user_id = ? AND active = 1', [userId]);
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await all('SELECT * FROM dose_logs WHERE user_id = ? AND log_date = ?', [userId, today]);
    const appts = await all('SELECT * FROM appointments WHERE user_id = ? AND status = ? ORDER BY starts_at ASC LIMIT 1', [userId, 'upcoming']);
    const totalDoses = medsPage.reduce((sum, m) => sum + (JSON.parse(m.times || '[]')).length, 0);
    const loggedCount = todayLogs.length;
    const dueMedicines = medsPage.filter(m => {
      const times = JSON.parse(m.times || '[]');
      return times.some(t => !todayLogs.some(l => l.medicine_id === m.id && l.scheduled_time === t));
    }).map(m => m.name);
    const openIssues = await get('SELECT COUNT(*) as c FROM neighborhood_issues WHERE status != ?', ['resolved']);
    const resolvedIssues = await get('SELECT COUNT(*) as c FROM neighborhood_issues WHERE status = ?', ['resolved']);
    const openBlood = await get('SELECT COUNT(*) as c FROM blood_requests WHERE status = ?', ['open']);
    const donorsReady = await get('SELECT COUNT(*) as c FROM blood_donors WHERE available = 1');
    const waterLive = await get('SELECT COUNT(*) as c FROM water_updates WHERE status = ?', ['reported']);
    const waterSorted = await get('SELECT COUNT(*) as c FROM water_updates WHERE status = ?', ['resolved']);
    const tuitionOffers = await get('SELECT COUNT(*) as c FROM tuition_posts WHERE kind = ? AND status = ?', ['offer', 'open']);
    const tuitionAsks = await get('SELECT COUNT(*) as c FROM tuition_posts WHERE kind = ? AND status = ?', ['request', 'open']);
    res.json({
      available: available.c,
      myReservations: myReservations.c,
      totalDoses,
      dosesLogged: loggedCount,
      dueMedicines,
      nextAppointment: appts[0] || null,
      openIssues: openIssues.c,
      resolvedIssues: resolvedIssues.c,
      openBlood: openBlood.c,
      donorsReady: donorsReady.c,
      waterLive: waterLive.c,
      waterSorted: waterSorted.c,
      tuitionOffers: tuitionOffers.c,
      tuitionAsks: tuitionAsks.c,
    });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
});

// ===== HEALTH =====
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Common Ground API running' }));

// ===== FILE UPLOAD =====
const upload = multer({ dest: uploadsDir, limits: { fileSize: 5 * 1024 * 1024 } });
app.post('/api/uploads', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ file_url: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => console.log(`Common Ground server running on port ${PORT}`));
