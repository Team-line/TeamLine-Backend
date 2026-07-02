# 📌 Project Management Tool (Backend API)

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
│   ├── workspaces/
│   ├── boards/
│   ├── columns/
│   ├── tasks/
│   ├── time-tracking/
│   └── reports/
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
git clone https://github.com/your-username/project-management-backend.git
cd project-management-backend
npm install
```

---

# 🔧 Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
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

## Boards

- Create board
- Manage structure

## Time Tracking

- Start timer
- Stop timer
- Log work hours

## Reports

- Weekly aggregation
- Export-ready data

---

# 🧠 Design Principles

- Modular architecture (feature-based)
- Separation of concerns
- Scalable backend structure
- Stateless API design
- Clean error handling system

---

# 🚧 Project Status

🚀 MVP Phase (Backend Foundation in progress)

---

# 📌 Future Improvements

- Real-time collaboration (WebSockets)
- Notifications system
- Mobile application
- AI task suggestions
- Advanced analytics dashboard

---

# 👨‍💻 Author

Built as part of a scalable full-stack project management system.

---

# 📄 License

This project is currently private / under development.
