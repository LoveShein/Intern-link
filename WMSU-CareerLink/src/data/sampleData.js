
export const initialJobs = [
  {
    id: 1,
    title: 'Frontend Development Intern',
    company: 'Zamboanga Digital Labs',
    location: 'Zamboanga City',
    type: 'Internship',
    course: 'Computer Science',
    slots: 3,
    deadline: '2026-11-30',
    status: 'Published',
    description:
      'Support the team in building responsive web interfaces using HTML, CSS, and JavaScript.',
    requirements:
      'Basic HTML/CSS, JavaScript fundamentals, willingness to learn.',
  },
  {
    id: 2,
    title: 'IT Support Trainee',
    company: 'Western Tech Solutions',
    location: 'Hybrid',
    type: 'Internship',
    course: 'Information Technology',
    slots: 2,
    deadline: '2026-11-20',
    status: 'Published',
    description:
      'Help troubleshoot computer, software, and network issues under supervision.',
    requirements:
      'Basic computer troubleshooting and communication skills.',
  },
  {
    id: 3,
    title: 'Junior UI/UX Intern',
    company: 'PixelWorks Studio',
    location: 'Remote',
    type: 'Internship',
    course: 'Computer Science',
    slots: 2,
    deadline: '2026-12-05',
    status: 'Pending',
    description:
      'Assist with wireframes, prototypes, and usability reviews.',
    requirements:
      'Interest in interface design and a small portfolio or class project.',
  },
  {
    id: 4,
    title: 'Data Operations Intern',
    company: 'SouthTech Services',
    location: 'Zamboanga City',
    type: 'OJT',
    course: 'Information Systems',
    slots: 4,
    deadline: '2026-12-10',
    status: 'Published',
    description:
      'Assist with data quality checks, spreadsheets, and documentation.',
    requirements:
      'Attention to detail and basic spreadsheet skills.',
  },
];

export const initialUsers = [
  {
    id: 1,
    name: 'Amina Santos',
    email: 'amina.student@example.com',
    role: 'Student',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Miguel Reyes',
    email: 'miguel.student@example.com',
    role: 'Student',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Zamboanga Digital Labs',
    email: 'hr@zdl.example.com',
    role: 'Employer',
    status: 'Pending',
  },
  {
    id: 4,
    name: 'Western Tech Solutions',
    email: 'careers@wts.example.com',
    role: 'Employer',
    status: 'Active',
  },
];

export const initialApplications = [
  {
    id: 101,
    student: 'Amina Santos',
    jobId: 1,
    jobTitle: 'Frontend Development Intern',
    company: 'Zamboanga Digital Labs',
    date: '2026-10-02',
    status: 'Under Review',
  },
  {
    id: 102,
    student: 'Miguel Reyes',
    jobId: 2,
    jobTitle: 'IT Support Trainee',
    company: 'Western Tech Solutions',
    date: '2026-10-04',
    status: 'Shortlisted',
  },
];

export const initialNotifications = [
  {
    id: 1,
    title: 'Welcome to CareerLink',
    message: 'Complete your profile to get started.',
    date: 'Today',
    read: false,
  },
  {
    id: 2,
    title: 'Application update',
    message:
      'Your application status may appear here in the demo.',
    date: 'Yesterday',
    read: false,
  },
];