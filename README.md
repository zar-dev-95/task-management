# TaskDesk — Collaborative Team Task Management Web Application

TaskDesk is a full-stack, real-time team task management platform built with **React 19, Tailwind CSS, Vite, Node.js, Express, Passport.js, and PostgreSQL**.

---

## 🚀 Quick Start & Setup Instructions

Follow these quick steps to run the application locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database (local instance or cloud database like Neon / Google Cloud SQL)

---

### Step 1: Backend Setup

1. Open your terminal and navigate to the `server` directory:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in the `server` directory (or copy `.env.example`):
   ```env
   PORT=5000
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_secure_session_secret
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. **Database Seeding (Instant Test Accounts)**:  
   Populate the database with **15 pre-configured members** linked to teams ready for testing:
   ```bash
   npm run seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   > Backend API will be live at `http://localhost:5000` with database tables automatically initialized.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   > Frontend will be live at `http://localhost:5173`. Open this URL in your browser to start using TaskDesk!

---

### 🔑 Test Credentials (Ready for Testing)

All seeded test accounts share the same simple password:

| Email | Password | Role / Purpose |
| :--- | :---: | :--- |
| `usman@task.com` | `123456` | Team Member / Collaborator |
| `ali@task.com` | `123456` | Team Member / Collaborator |
| `sara@task.com` | `123456` | Team Member / Collaborator |
| `hamza@task.com` | `123456` | Team Member / Collaborator |
| *(Any of 15 seeded users)* | `123456` | All 15 accounts are seeded and ready |

*You can also click **"Create an account"** on the login page to register any new account.*

---

## 🌟 Key Features & Architecture

### 1. Secure Authentication & Session Management
- **Passport.js (Local Strategy)** with `express-session`.
- Session persistence in **PostgreSQL** (`connect-pg-simple`) with resilient fallback.
- **Bcrypt password hashing** with 10 salt rounds.
- **HTTP-only cookies** configured with CSRF-safe settings.
- Protected API routes guarded via `isAuthenticated` middleware.

### 2. Team Management & Collaboration
- Create and organize teams with **case-insensitive uniqueness checks**.
- Clear **"Owner"** (blue) vs **"Member"** (slate) badges on teams in the sidebar.
- Independently scrollable team list and active team members panel.
- **Team Creator Protection**: Only the team creator can delete the team.
- **Member Management**: Team owners/admins can remove members (automatically unassigns their tasks), and regular members can voluntarily leave teams.

### 3. Kanban Task Board & Granular Permissions
- **3 Kanban Columns**: `To Do`, `In Progress`, and `Completed`.
- Priority-first sorting (**High priority** tasks remain on top > Medium > Low).
- Search tasks in real-time by title or description.
- Filter tasks by **Assignee**, **Status**, and **Priority**.
- **Related Members Permissions**:
  - **Status Change**: Only related members (**Assignee**, **Task Creator**, or **Team Owner**) can change task status. Non-related members see a read-only lock badge (`Status: In Progress 🔒`).
  - **Edit Task**: Only related members can edit task details.
  - **Delete Task**: Only the **Task Creator** or **Team Owner** can delete tasks.

### 4. Assessment Bonus Features (100% Implemented)
- 🔔 **Task Due Date Reminders**: Real-time alert banner warning users of tasks due within 48 hours.
- 🛡️ **Role-Based Access Control (RBAC)**: Fine-grained permissions enforced across both API controllers and React UI.
- ✉️ **Email Invitation Flow**: Generates unique invite tokens and links (`/join?token=...&teamId=...`) with a pending invitations banner on the dashboard for users to accept or decline.

---

## 📁 Project Structure

```
├── client/
│   ├── public/
│   │   └── favicon.svg           # Brand logo icon
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js      # Axios/Fetch API client with credentials
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Sticky navigation bar with branding & urgent alert pill
│   │   │   ├── TeamSidebar.jsx   # Scrollable teams & member management
│   │   │   ├── TaskBoard.jsx     # Kanban columns with search, filter & permissions
│   │   │   ├── TaskModal.jsx     # Create/Edit task modal dialog
│   │   │   ├── CreateTeamModal.jsx
│   │   │   ├── InviteMemberModal.jsx
│   │   │   ├── InvitationBanner.jsx # Pending team invites
│   │   │   └── DueAlertBanner.jsx   # 48h deadline alert
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx      # Login & Signup with smooth animated cards
│   │   │   └── DashboardPage.jsx
│   │   └── store/
│   │       ├── useAuthStore.js
│   │       ├── useTeamStore.js
│   │       └── useTaskStore.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── db.js                 # PostgreSQL connection pool
│   │   └── passport.js           # Passport LocalStrategy configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── teamController.js     # Team CRUD, member removal, invitations
│   │   └── taskController.js     # Task CRUD, filters, reminders, RBAC
│   ├── db/
│   │   ├── schema.sql            # PostgreSQL table definitions & indexes
│   │   └── seed.js               # Seed script with 15 test accounts
│   ├── middleware/
│   │   ├── auth.js               # isAuthenticated check
│   │   └── validators.js         # express-validator request schemas
│   ├── routes/
│   │   ├── auth.js
│   │   ├── teams.js
│   │   └── tasks.js
│   └── index.js
```

---

## 🧪 Postman API Collection
A complete Postman collection is available at `server/postman_collection.json` covering all REST endpoints:
- **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Teams**: `/api/teams` (CRUD, members, invitations, join, decline)
- **Tasks**: `/api/tasks` (CRUD, status, filters, due reminders)
