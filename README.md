# Campus Pulse

### College Event Management & Student Engagement Platform

Campus Pulse is a modern web-based college event management system designed to simplify event creation, student registration, attendance, verification, evaluation, winners, and certificate management through a centralized platform.

It provides separate experiences for **Administrators** and **Students**, with event-specific registration, individual student profiles, pass-based entry workflows, and administrative controls.

---

## ✨ Key Features

### 👨‍💼 Admin Control Center
- Admin login and session management
- Dashboard with event and registration overview
- Create, update, and delete events
- Manage student registrations
- Registration verification
- Attendance and check-in management
- Pass/QR verification workflow
- Enter marks and feedback
- Select winners
- Manage certificate recipients
- Certificate management
- Admin profile editing

### 🎓 Student Portal
- Student signup and login
- Individual student profiles
- Persistent student data
- Fixed institution: **SHEAT College of Engineering**
- Campus branch selection:
  - Babatpur
  - Gahani
- Course/program and semester information
- Browse events
- Event-specific registration
- My Events and My Passes
- Attendance information
- Marks and feedback
- Certificates

### 🎫 Event Registration
Each event can have its own registration link.

```text
Event Link
    ↓
Student Login / Signup
    ↓
Requested Event
    ↓
Registration
    ↓
Admin Verification
    ↓
Pass Generation
    ↓
Event Check-in
```

### 🏆 Evaluation & Certificates
Administrators can:
1. Review registrations
2. Verify participants
3. Record attendance
4. Enter marks
5. Add feedback
6. Select winners
7. Select certificate recipients
8. Manage certificates

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| React | User interface |
| JavaScript / TypeScript | Application logic |
| Supabase | Database and backend services |
| Vercel | Production deployment |
| GitHub | Source control |

---

## 🏗️ Application Architecture

```text
                         CAMPUS PULSE
                              │
                ┌─────────────┴─────────────┐
                │                           │
           Admin Login                 Student Login
                │                           │
                ▼                           ▼
       Admin Control Center          Student Portal
                │                           │
       ┌────────┼────────┐           ┌──────┼──────┐
       │        │        │           │      │      │
     Events  Registrations Verify   Events Profile Passes
       │        │        │           │
       └────────┴────────┘           ▼
                │                Registration
                ▼                     │
        Attendance / Scanner          ▼
                │                Verification
                ▼                     │
        Marks / Feedback              ▼
                │                 Attendance
                ▼                     │
       Winners / Certificates         ▼
                              Certificates
```

---

## 🎓 Institution Details

**College:** SHEAT College of Engineering

### Campus Branches

- **Babatpur**
- **Gahani**

The college/institution field in student registration is fixed to the official institution and cannot be changed by the student.

---

## ⚙️ Environment Variables

For local development, create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> Never commit `.env.local` or secret/service-role credentials to GitHub. Configure production secrets through Vercel Environment Variables.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd campus-pulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` and add the required Supabase values.

### 4. Start development

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## 🧪 Build & Test

Before deploying:

```bash
npm run build
```

Verify the main flows:

- Admin login
- Student signup/login
- Student profile
- Event creation
- Event-specific registration
- Registration persistence
- Pass generation
- QR/check-in
- Attendance
- Marks and feedback
- Winner selection
- Certificates

---

## ☁️ Deployment

Campus Pulse is intended to run with **GitHub + Vercel + Supabase**.

```text
Local Development
       ↓
    Git Commit
       ↓
   GitHub main
       ↓
 Vercel Deployment
       ↓
 Production
```

After making changes:

```bash
git add .
git commit -m "Update Campus Pulse"
git push origin main
```

If the repository is connected to Vercel, the push can trigger a new deployment automatically.

---

## 🗃️ Production Data

Production should contain only real application data:

- Admin accounts
- Student accounts
- Events
- Registrations
- Verification records
- Attendance
- Passes
- Evaluations
- Winners
- Certificates

Demo/seed data should **not** be automatically recreated in production.

---

## 🛡️ Production Checklist

Before using the system for a real college event:

- [ ] Remove all demo data
- [ ] Verify Supabase production database
- [ ] Configure production environment variables
- [ ] Test Admin login
- [ ] Test Student signup/login
- [ ] Test event-specific links
- [ ] Test registration persistence
- [ ] Test pass generation
- [ ] Test QR/check-in
- [ ] Test attendance
- [ ] Test marks and feedback
- [ ] Test winner selection
- [ ] Test certificates
- [ ] Confirm demo data is not recreated
- [ ] Run a successful production build

---

## 📁 Project Structure

The project is organized around application routes, reusable components, and backend/data utilities.

```text
campus-pulse/
├── app/
│   ├── admin/
│   ├── student/
│   ├── register/
│   └── ...
├── components/
├── lib/
├── public/
├── .env.local
├── package.json
└── README.md
```

> The exact structure may evolve as new features are added.

---

## 🎯 Project Objective

Campus Pulse manages the complete college-event lifecycle from a single platform:

**Create → Register → Verify → Attend → Evaluate → Award**

The objective is to reduce manual event administration while providing students with a personalized and reliable event experience.

---

## 👤 Project Information

**College:** SHEAT College of Engineering  
**Student / Developer:** Ashutosh Dixit  
**Course:** B.Tech CSE

---

## 🔄 Development Philosophy

Campus Pulse is developed incrementally. New features and bug fixes should preserve existing functionality and data integrity.

Every update should be tested locally before being deployed to production.

---

## 🤝 Contributing

For development:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Test changes locally before merging them into the production branch.

---

## 📄 License

This project is currently intended for **academic/college project use**.

A suitable open-source license can be added if the project is released publicly.

---

<p align="center">
  <strong>Campus Pulse</strong><br>
  College Event Management • Student Engagement • Event Operations
</p>
