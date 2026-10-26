import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'data', 'db.json');

const defaultData = {
  jobs: [],
  users: [],
  applications: [],
  notifications: [],
  saved: [],
};

const DEFAULT_ADMIN = {
  id: 'admin-1',
  name: 'WMSU Administrator',
  email: 'admin@wmsu.edu.ph',
  role: 'Admin',
  status: 'Active',
};

const DEFAULT_ADMIN_PASSWORD = 'admin123';

function readDb() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    if (!raw.trim()) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return {
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
      users: Array.isArray(parsed.users) ? parsed.users : [],
      applications: Array.isArray(parsed.applications) ? parsed.applications : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
    };
  } catch {
    return { ...defaultData };
  }
}

function writeDb(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

function ensureDataFile() {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dataPath)) {
    writeDb({ ...defaultData });
  }
}

function ensureDefaultAdmin() {
  const db = readDb();
  const hasAdmin = db.users.some(
    (user) => user.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
  );

  if (!hasAdmin) {
    db.users = [DEFAULT_ADMIN, ...db.users];
    writeDb(db);
  }
}

ensureDataFile();
ensureDefaultAdmin();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'WMSU CareerLink backend is running.',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/jobs', (_req, res) => {
  const db = readDb();
  res.json(db.jobs);
});

app.post('/api/jobs', (req, res) => {
  const db = readDb();
  const { job } = req.body;
  const payload = job || req.body;

  if (!payload || !payload.title || !payload.company) {
    return res.status(400).json({ message: 'Job title and company are required.' });
  }

  const nextJob = {
    id: payload.id || Date.now(),
    ...payload,
    status: payload.status || 'Published',
  };

  db.jobs = [nextJob, ...db.jobs];
  writeDb(db);
  res.status(201).json(nextJob);
});

app.put('/api/jobs/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const nextJob = req.body;

  if (!nextJob) {
    return res.status(400).json({ message: 'Job payload is required.' });
  }

  db.jobs = db.jobs.map((job) => (job.id === id ? { ...job, ...nextJob } : job));
  writeDb(db);
  res.json(db.jobs.find((job) => job.id === id));
});

app.delete('/api/jobs/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.jobs = db.jobs.filter((job) => job.id !== id);
  db.applications = db.applications.filter((application) => application.jobId !== id);
  writeDb(db);
  res.json({ success: true, removedJobId: id });
});

app.get('/api/users', (_req, res) => {
  const db = readDb();
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const db = readDb();
  const user = req.body;

  if (!user || !user.email || !user.name || !user.role) {
    return res.status(400).json({ message: 'Name, email, and role are required.' });
  }

  const exists = db.users.some((entry) => entry.email.toLowerCase() === user.email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const nextUser = {
    id: user.id || Date.now(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || 'Active',
  };

  db.users = [nextUser, ...db.users];
  writeDb(db);
  res.status(201).json(nextUser);
});

app.put('/api/users/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const updates = req.body;

  db.users = db.users.map((user) => (user.id === id ? { ...user, ...updates } : user));
  writeDb(db);
  res.json(db.users.find((user) => user.id === id));
});

app.get('/api/applications', (_req, res) => {
  const db = readDb();
  res.json(db.applications);
});

app.post('/api/applications', (req, res) => {
  const db = readDb();
  const application = req.body;

  if (!application || !application.student || !application.jobId) {
    return res.status(400).json({ message: 'Student and jobId are required.' });
  }

  const nextApplication = {
    id: application.id || Date.now(),
    student: application.student,
    jobId: Number(application.jobId),
    jobTitle: application.jobTitle || 'Unknown opportunity',
    company: application.company || 'Unknown company',
    date: application.date || new Date().toISOString().slice(0, 10),
    status: application.status || 'Submitted',
    note: application.note || '',
  };

  db.applications = [nextApplication, ...db.applications];
  writeDb(db);
  res.status(201).json(nextApplication);
});

app.put('/api/applications/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const updates = req.body;

  db.applications = db.applications.map((application) =>
    application.id === id ? { ...application, ...updates } : application
  );
  writeDb(db);
  res.json(db.applications.find((application) => application.id === id));
});

app.get('/api/notifications', (_req, res) => {
  const db = readDb();
  res.json(db.notifications);
});

app.put('/api/notifications/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.notifications = db.notifications.map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification
  );
  writeDb(db);
  res.json(db.notifications);
});

app.post('/api/auth/login', (req, res) => {
  const db = readDb();
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);

  if (!user) {
    const isAdminLogin = normalizedEmail === DEFAULT_ADMIN.email.toLowerCase();
    if (isAdminLogin && String(password).trim() === DEFAULT_ADMIN_PASSWORD) {
      return res.json({
        user: DEFAULT_ADMIN,
        token: `demo-token-${DEFAULT_ADMIN.id}`,
      });
    }

    return res.status(401).json({ message: 'User not found.' });
  }

  const passwordMatches =
    user.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
      ? String(password).trim() === DEFAULT_ADMIN_PASSWORD
      : String(password).length >= 4;

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Password is invalid.' });
  }

  if (role && user.role !== role) {
    return res.status(403).json({ message: 'Role mismatch.' });
  }

  res.json({
    user,
    token: `demo-token-${user.id}`,
  });
});

app.post('/api/auth/register', (req, res) => {
  const db = readDb();
  const user = req.body;

  if (!user || !user.name || !user.email || !user.role) {
    return res.status(400).json({ message: 'Name, email, and role are required.' });
  }

  const exists = db.users.some((entry) => entry.email.toLowerCase() === user.email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const nextUser = {
    id: user.id || Date.now(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.role === 'Employer' ? 'Pending' : 'Active',
  };

  db.users = [nextUser, ...db.users];
  writeDb(db);
  res.status(201).json({ user: nextUser, token: `demo-token-${nextUser.id}` });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`WMSU CareerLink backend running on http://localhost:${PORT}`);
});
