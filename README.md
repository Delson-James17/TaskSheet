# 🗓️ TaskSheet

TaskSheet is a time-tracking and task management web application that allows users to log project-based work sessions with start, pause, resume, and end logic. It calculates total work hours per task, supports authentication (email/password + Google), and provides a clean dashboard UI.

---

## 🚀 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI Framework:** Tailwind CSS + ShadCN UI
- **Authentication:** Supabase Auth (Email/Password, Google OAuth)
- **Database:** Supabase Postgres (hosted)
- **Deployment:** (Add Netlify / Vercel / your host if applicable)

---

## 📁 Folder Structure

task-sheet/
│
├── public/ # Static assets
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── ui/ # ShadCN UI components (e.g. Button, Input)
│ │ ├── theme-provider.tsx
│ │ ├── switch-toggle.tsx
│ ├── features/
│ │ └── page/ # Page components (SignUp, Login, Dashboard, etc.)
│ ├── utils/
│ │ └── supabaseClient.ts # Supabase setup
│ ├── App.tsx
│ └── main.tsx # Entry point with routing
├── tailwind.config.js
├── index.html
├── package.json
└── README.md


---

## 🔐 Features

- [x] Email/Password sign up and login
- [x] Google OAuth login
- [x] Protected routes with session guard
- [x] Add task with:
  - Start → Pause → Resume → End
- [x] Auto calculation of total hours based on segments
- [x] Task dashboard with project filtering and action buttons
- [x] Profile page (coming soon)

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tasksheet.git
cd tasksheet
2. Install dependencies
bash
Copy
Edit
npm install
3. Set up your .env
env
Copy
Edit
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
Get these from Supabase Project Settings

4. Start the development server
bash
Copy
Edit
npm run dev

🧠 Project Logic
The app follows the logic:

Start → Pause logs segment 1

Resume → Pause logs segment 2

Resume → End logs final segment

All segments are accumulated as Total Hours

All logic is persisted using Supabase DB, and session-based auth ensures only logged-in users can track their work.

📦 Supabase Schema
Tables:
projects: stores project names

tasks: stores time logs

profiles: stores user metadata (optional)

Built-in auth.users table manages authentication

Row-Level Security:
Every table uses auth.uid() to restrict data to the current user

📄 License
MIT License. Feel free to use, fork, or contribute!

✨ Credits
Made with ❤️ by Delson James M.Tubiera