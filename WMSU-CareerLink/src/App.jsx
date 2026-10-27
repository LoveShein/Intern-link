import { useEffect, useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';

import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Modal from './components/Modal.jsx';
import Button from './components/Button.jsx';
import NotificationPanel from './components/NotificationPanel.jsx';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';

import StudentDashboard from './pages/student/Dashboard.jsx';
import Profile from './pages/student/Profile.jsx';
import Internships from './pages/student/Internships.jsx';
import Applications from './pages/student/Applications.jsx';
import StudentNotifications from './pages/student/Notifications.jsx';

import EmployerDashboard from './pages/employer/Dashboard.jsx';
import CompanyProfile from './pages/employer/CompanyProfile.jsx';
import JobPostings from './pages/employer/JobPostings.jsx';
import Applicants from './pages/employer/Applicants.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import UsersPage from './pages/admin/Users.jsx';
import Employers from './pages/admin/Employers.jsx';
import JobApprovals from './pages/admin/JobApprovals.jsx';
import Reports from './pages/admin/Reports.jsx';
import Categories from './pages/admin/Categories.jsx';
import Announcements from './pages/admin/Announcements.jsx';

import Settings from './pages/shared/Settings.jsx';

import {
  initialJobs,
  initialUsers,
  initialApplications,
  initialNotifications,
} from './data/sampleData.js';

const load = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  // Authentication and navigation
  const [user, setUser] = useState(() =>
    load('careerlink.user', null)
  );

  const [authPage, setAuthPage] = useState('login');
  const [page, setPage] = useState('dashboard');

  const [jobs, setJobs] = useState(() =>
    load('careerlink.jobs', initialJobs)
  );

  const [users, setUsers] = useState(() =>
    load('careerlink.users', initialUsers)
  );

  const [applications, setApplications] = useState(() =>
    load('careerlink.applications', initialApplications)
  );

  const [saved, setSaved] = useState(() =>
    load('careerlink.saved', [])
  );

  const [notifications, setNotifications] = useState(() =>
    load('careerlink.notifications', initialNotifications)
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [applyNote, setApplyNote] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const data = {
      'careerlink.user': user,
      'careerlink.jobs': jobs,
      'careerlink.users': users,
      'careerlink.applications': applications,
      'careerlink.saved': saved,
      'careerlink.notifications': notifications,
    };

    Object.entries(data).forEach(([key, value]) => {
      try {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch {
        // Continue if browser storage is unavailable.
      }
    });
  }, [user, jobs, users, applications, saved, notifications]);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2800);
  }

  async function login(nextUser) {
    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: nextUser.email,
          password: nextUser.password || '',
          role: nextUser.role,
        }),
      });

      const signedInUser = {
        ...result.user,
        password: undefined,
      };

      setUser(signedInUser);
      setAuthPage('login');
      setPage('dashboard');
      notify(`Welcome to the ${signedInUser.role} portal.`);
    } catch (error) {
      notify(error.message || 'Login failed.');
    }
  }

  async function register(nextUser) {
    try {
      const result = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: nextUser.name,
          email: nextUser.email,
          role: nextUser.role,
          password: nextUser.password || '',
        }),
      });

      const signedInUser = {
        ...result.user,
        password: undefined,
      };

      setUsers((previousUsers) => [
        ...previousUsers.filter(
          (existingUser) => existingUser.email !== signedInUser.email
        ),
        signedInUser,
      ]);

      setUser(signedInUser);
      setAuthPage('login');
      setPage('dashboard');
      notify('Account created successfully.');
    } catch (error) {
      notify(error.message || 'Account creation failed.');
    }
  }

  function logout() {
    setUser(null);
    setAuthPage('login');
    setPage('dashboard');
    setSidebarOpen(false);
  }

  function navigate(key) {
    setPage(key);
    setSidebarOpen(false);
    setNotifOpen(false);
  }

  function saveProfile(nextUser) {
    setUser(nextUser);

    setUsers((previousUsers) =>
      previousUsers.map((existingUser) =>
        existingUser.email === nextUser.email
          ? { ...existingUser, ...nextUser }
          : existingUser
      )
    );

    notify('Changes saved in this browser.');
  }

  function toggleSaved(id) {
    const isSaved = saved.includes(id);

    setSaved((previousSaved) =>
      isSaved
        ? previousSaved.filter((savedId) => savedId !== id)
        : [...previousSaved, id]
    );

    notify(
      isSaved
        ? 'Removed from saved opportunities.'
        : 'Opportunity saved.'
    );
  }

  function submitApplication(job) {
    const alreadyApplied = applications.some(
      (application) =>
        application.jobId === job.id &&
        application.student === user.name
    );

    if (alreadyApplied) {
      notify('You have already applied to this opportunity.');
      setApplyJob(null);
      return;
    }

    const newApplication = {
      id: Date.now(),
      student: user.name,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      date: new Date().toISOString().slice(0, 10),
      status: 'Submitted',
      note: applyNote,
    };

    setApplications((previousApplications) => [
      newApplication,
      ...previousApplications,
    ]);

    setApplyJob(null);
    setApplyNote('');

    notify('Demo application submitted!');
  }

  function updateApplication(id, status) {
    setApplications((previousApplications) =>
      previousApplications.map((application) =>
        application.id === id
          ? { ...application, status }
          : application
      )
    );

    notify(`Application status updated to ${status}.`);
  }

  function updateUser(id, status) {
    setUsers((previousUsers) =>
      previousUsers.map((existingUser) =>
        existingUser.id === id
          ? { ...existingUser, status }
          : existingUser
      )
    );

    notify(`Account status updated to ${status}.`);
  }

  function updateJob(updatedJob) {
    setJobs((previousJobs) =>
      previousJobs.map((job) =>
        job.id === updatedJob.id ? updatedJob : job
      )
    );

    notify('Posting updated.');
  }

  function addJob(job) {
    setJobs((previousJobs) => [job, ...previousJobs]);
    notify('Posting added to demo data.');
  }

  function deleteJob(id) {
    setJobs((previousJobs) =>
      previousJobs.filter((job) => job.id !== id)
    );

    notify('Posting removed from demo data.');
  }

  function readNotification(id) {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) =>
        id === 'all' || notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  if (!user) {
    if (authPage === 'register') {
      return (
        <Register
          onBack={() => setAuthPage('login')}
          onRegister={register}
        />
      );
    }

    if (authPage === 'forgot') {
      return (
        <ForgotPassword
          onBack={() => setAuthPage('login')}
        />
      );
    }

    return (
      <Login
        onLogin={login}
        onRegister={() => setAuthPage('register')}
        onForgot={() => setAuthPage('forgot')}
      />
    );
  }

  const role =
    user.role === 'Admin'
      ? 'Admin'
      : user.role === 'Employer'
        ? 'Employer'
        : 'Student';

  let content;

  // Student portal
  if (role === 'Student') {
    switch (page) {
      case 'profile':
        content = (
          <Profile user={user} onSave={saveProfile} />
        );
        break;

      case 'internships':
        content = (
          <Internships
            jobs={jobs}
            saved={saved}
            onSave={toggleSaved}
            onDetails={setJobDetails}
          />
        );
        break;

      case 'applications':
        content = (
          <Applications
            applications={applications}
            user={user}
          />
        );
        break;

      case 'saved':
        content = (
          <Internships
            jobs={jobs.filter((job) => saved.includes(job.id))}
            saved={saved}
            onSave={toggleSaved}
            onDetails={setJobDetails}
          />
        );
        break;

      case 'notifications':
        content = (
          <StudentNotifications
            items={notifications}
            onRead={readNotification}
          />
        );
        break;

      case 'settings':
        content = (
          <Settings
            user={user}
            onSave={saveProfile}
            onLogout={logout}
          />
        );
        break;

      default:
        content = (
          <StudentDashboard
            user={user}
            jobs={jobs}
            applications={applications}
            saved={saved}
            onNavigate={navigate}
            onApply={setJobDetails}
            onSave={toggleSaved}
          />
        );
    }
  }

  // Employer portal
  if (role === 'Employer') {
    switch (page) {
      case 'company':
        content = <CompanyProfile />;
        break;

      case 'postings':
        content = (
          <JobPostings
            jobs={jobs}
            onAdd={addJob}
            onUpdate={updateJob}
            onDelete={deleteJob}
          />
        );
        break;

      case 'applicants':
        content = (
          <Applicants
            applications={applications}
            onStatus={updateApplication}
          />
        );
        break;

      case 'notifications':
        content = (
          <StudentNotifications
            items={notifications}
            onRead={readNotification}
          />
        );
        break;

      case 'settings':
        content = (
          <Settings
            user={user}
            onSave={saveProfile}
            onLogout={logout}
          />
        );
        break;

      default:
        content = (
          <EmployerDashboard
            jobs={jobs}
            applications={applications}
            onNavigate={navigate}
          />
        );
    }
  }

  // Administrator portal
  if (role === 'Admin') {
    switch (page) {
      case 'users':
        content = (
          <UsersPage users={users} onStatus={updateUser} />
        );
        break;

      case 'employers':
        content = (
          <Employers users={users} onStatus={updateUser} />
        );
        break;

      case 'approvals':
        content = (
          <JobApprovals jobs={jobs} onUpdate={updateJob} />
        );
        break;

      case 'applications':
        content = (
          <ApplicationsAdmin
            applications={applications}
            onStatus={updateApplication}
          />
        );
        break;

      case 'categories':
        content = <Categories />;
        break;

      case 'announcements':
        content = <Announcements />;
        break;

      case 'reports':
        content = (
          <Reports
            users={users}
            jobs={jobs}
            applications={applications}
          />
        );
        break;

      case 'settings':
        content = (
          <Settings
            user={user}
            onSave={saveProfile}
            onLogout={logout}
          />
        );
        break;

      default:
        content = (
          <AdminDashboard
            users={users}
            jobs={jobs}
            applications={applications}
            onNavigate={navigate}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        onMenu={() => setSidebarOpen(!sidebarOpen)}
        onNotifications={() => setNotifOpen(!notifOpen)}
      />

      <div className="app-body">
        <Sidebar
          role={role}
          page={page}
          onNavigate={navigate}
          onLogout={logout}
          open={sidebarOpen}
        />

        {sidebarOpen && (
          <button
            className="sidebar-scrim"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          />
        )}

        <main className="main-content">
          <div className="breadcrumbs">
            <Home size={14} />
            <span>{role} portal</span>
            <ChevronRight size={13} />
            <strong>{pageLabel(page)}</strong>
          </div>

          {content}

          <footer className="footer">
            <span>
              © 2026 WMSU CareerLink 
            </span>
          </footer>
        </main>
      </div>

      {/* Notifications panel */}
      {notifOpen && (
        <>
          <button
            className="click-away"
            aria-label="Close notifications"
            onClick={() => setNotifOpen(false)}
          />

          <NotificationPanel
            items={notifications}
            onRead={readNotification}
            onClose={() => setNotifOpen(false)}
          />
        </>
      )}

      {/* Job opportunity details modal */}
      {jobDetails && (
        <Modal
          title={jobDetails.title}
          onClose={() => setJobDetails(null)}
        >
          <div className="job-detail-modal">
            <p className="company-name">
              {jobDetails.company} · {jobDetails.location}
            </p>

            <div className="job-detail-tags">
              <span>{jobDetails.type}</span>
              <span>{jobDetails.course}</span>
              <span>{jobDetails.slots} slot(s)</span>
            </div>

            <h3>About this opportunity</h3>
            <p>{jobDetails.description}</p>

            <h3>Requirements</h3>
            <p>
              {jobDetails.requirements || 'See posting description.'}
            </p>

            <p>
              <strong>Application deadline:</strong>{' '}
              {jobDetails.deadline}
            </p>

            {role === 'Student' && (
              <div className="modal-actions">
                <Button
                  variant="light"
                  onClick={() => toggleSaved(jobDetails.id)}
                >
                  {saved.includes(jobDetails.id)
                    ? 'Unsave'
                    : 'Save opportunity'}
                </Button>

                <Button
                  onClick={() => {
                    setApplyJob(jobDetails);
                    setJobDetails(null);
                  }}
                >
                  Apply now
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Application submission modal */}
      {applyJob && (
        <Modal
          title="Apply for opportunity"
          onClose={() => setApplyJob(null)}
        >
          <form
            className="modal-form"
            onSubmit={(event) => {
              event.preventDefault();
              submitApplication(applyJob);
            }}
          >
            <p>
              You're applying for{' '}
              <strong>{applyJob.title}</strong> at{' '}
              {applyJob.company}.
            </p>

            <label className="field-label">
              Optional note to employer

              <textarea
                rows="4"
                value={applyNote}
                onChange={(event) => setApplyNote(event.target.value)}
                placeholder="Briefly introduce yourself..."
              />
            </label>

            <p className="demo-note">
              This is a simulated application. No documents are
              uploaded to a server.
            </p>

            <div className="modal-actions">
              <Button
                variant="light"
                type="button"
                onClick={() => setApplyJob(null)}
              >
                Cancel
              </Button>

              <Button type="submit">
                Submit application
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast message */}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function pageLabel(key) {
  const labels = {
    dashboard: 'Dashboard',
    profile: 'My Profile',
    internships: 'Browse Internships',
    applications: 'Applications',
    saved: 'Saved Opportunities',
    notifications: 'Notifications',
    settings: 'Account Settings',
    company: 'Company Profile',
    postings: 'Job Postings',
    applicants: 'Applicants',
    users: 'User Management',
    employers: 'Employer Accounts',
    approvals: 'Job Approvals',
    categories: 'Categories & Courses',
    announcements: 'Announcements',
    reports: 'Reports & Analytics',
  };

  return labels[key] || key;
}

function ApplicationsAdmin({ applications, onStatus }) {
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Application Records</h1>
          <p>Review the current sample applications.</p>
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Opportunity</th>
                <th>Company</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.student}</td>
                  <td>{application.jobTitle}</td>
                  <td>{application.company}</td>

                  <td>
                    <span
                      className={`status status-${application.status
                        .toLowerCase()
                        .replaceAll(' ', '-')}`}
                    >
                      {application.status}
                    </span>
                  </td>

                  <td>
                    <select
                      value={application.status}
                      onChange={(event) =>
                        onStatus(
                          application.id,
                          event.target.value
                        )
                      }
                    >
                      <option>Submitted</option>
                      <option>Under Review</option>
                      <option>Shortlisted</option>
                      <option>Accepted</option>
                      <option>Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

 // --------------------------------------------------
 // API REQUESTS
 // --------------------------------------------------

 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

 async function apiRequest(path, options = {}) {
   const response = await fetch(`${API_URL}${path}`, {
     headers: {
       'Content-Type': 'application/json',
       ...(options.headers || {}),
     },
     ...options,
   });

   const isJson = response.headers
     .get('content-type')
     ?.includes('application/json');

   const payload = isJson ? await response.json() : null;

   if (!response.ok) {
     throw new Error(payload?.message || 'Request failed.');
   }

   return payload;
 }

