# 📌 TeamLine Backend API

A scalable and modular backend system for a Trello-like project management platform designed for small teams and Arabic-speaking users.

It provides core features such as task management, Kanban boards, time tracking, and weekly reporting.

Built with **Node.js, Express.js, and MongoDB**, following a feature-based modular architecture for scalability and maintainability.

---

# 🚀 Features (MVP)

- 🔐 Authentication (JWT-based)
- 👥 Workspace management
- 📋 Kanban boards system
- 🧩 Custom columns per board
- ✅ Task creation & assignment
- 🔄 Drag & drop task movement (API support)
- ⏱️ Time tracking per task
- 📊 Weekly reports generation (export-ready structure)

---

# 🏗️ Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt (password hashing)
- dotenv
- cors + helmet (security)

---

# 📁 Project Architecture

The project follows a **feature-based modular architecture**:

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── workSpace/
│   ├── Board/        (boards and columns)
│   ├── tasks/
│   ├── time-tracking/
│   ├── reports/
│   └── dashboard/
│
├── shared/
├── config/
├── app.js
└── server.js
```

Each module contains:

- controller
- service
- routes
- model
- validation (where needed)

---

# ⚙️ Installation

```bash
git clone https://github.com/Team-line/TeamLine-Backend.git
cd TeamLine-Backend
npm install
```

---

# 🔧 Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
DB_CONNECTION=your_mongodb_connection_string
JWT_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret_key
JWT_EXPIRE=7d
EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_sender_address
RESEND_API_KEY=your_resend_api_key
```

---

# ▶️ Run the Project

### Development mode:

```bash
npm run dev
```

### Production:

```bash
npm start
```

---

# 📡 API Base URL

```
/api/v1
```

---

# 🔐 Authentication Flow

1. User registers or logs in
2. Server generates JWT token
3. Token is sent in request header:

```http
Authorization: Bearer <token>
```

---

# 📊 Core Modules

## Auth

- Register
- Login
- JWT validation

## Tasks

- Create task
- Update task
- Assign user
- Move between columns

## Workspaces

- Create, view, update and delete workspaces
- Add members to a workspace

## Boards

- Create, view, update and delete boards
- Add, list, update and delete columns

## Time Tracking

- Start timer
- Stop timer
- Log work hours

## Reports

- Weekly aggregation
- Export-ready data

## Dashboard

- Workspace stats and active projects
- Report stats, task distribution and daily productivity
- Project details

---

# 🧠 Design Principles

- Modular architecture (feature-based)
- Separation of concerns
- Scalable backend structure
- Stateless API design
- Clean error handling system

---

# 🚧 Project Status

Backend MVP. Authentication, workspaces, boards, columns, tasks, time tracking, reports and a dashboard are in place. Last updated in July 2026.

---

# 📌 Future Improvements

- Real-time collaboration (WebSockets)
- Notifications system
- Mobile application
- AI task suggestions
- Advanced analytics dashboard

---

# 👨‍💻 Author

Built by the Team-line team during the 144-hour TAQAT intensive training at Code Map.

Backend developer and team lead: [Mohammed Ferwana](https://github.com/hammoudFerwana).
