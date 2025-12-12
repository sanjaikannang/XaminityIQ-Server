<div align="center">

# 🎓 XaminityIQ

### Online Examination Platform

*A secure and scalable examination system designed for modern educational institutions*

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture)

---

</div>

## 📋 Overview

XaminityIQ is a comprehensive online examination system that streamlines the entire assessment process for universities and colleges. With role-based access control and intuitive interfaces, it empowers administrators, faculty, and students to manage and participate in examinations seamlessly.

## ✨ Features

### 🔐 Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| **Super Admin** | Complete system management, user creation, configuration settings, batch & department management |
| **Faculty** | Course management, exam creation, student assessment, grade submission, result analytics |
| **Students** | Exam participation, result viewing, profile management, exam history tracking |

### 🎯 Core Capabilities

- **Secure Authentication** - JWT-based authentication with role-based authorization
- **Batch Management** - Organize students by academic years and semesters
- **Course Administration** - Create and manage courses across departments
- **Exam Engine** - Flexible examination system with multiple question types
- **Real-time Monitoring** - Track exam progress and student participation
- **Result Analytics** - Comprehensive reporting and performance metrics

---

## 🚀 Tech Stack

<table>
<tr>
<td width="50%">

### Backend Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Mongoose** - MongoDB object modeling

</td>
<td width="50%">

### Database & Security
- **MongoDB** - NoSQL document database
- **JWT** - Secure token-based authentication
- **bcrypt** - Password encryption

</td>
</tr>
</table>

---

## ⚙️ Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)

### Step 1: Clone the Repository

```bash
git clone https://github.com/sanjaikannang/XaminityIQ-Server.git
cd XaminityIQ-Server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL="http://localhost:3000/api"
VITE_BACKEND_URL="http://localhost:3000"

# Database
MONGODB_URI="mongodb://localhost:27017/xaminityiq"

# JWT Configuration
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"

# Application
PORT=3000
NODE_ENV="development"
```

### Step 4: Database Seeding

Initialize the database with default data:

```bash
# Seed initial data (admin, courses, departments)
npm run seed

# Drop all seeded data
npm run seed:drop

# Refresh seeded data (drop + seed)
npm run seed:refresh
```

### Step 5: Run the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug

# Standard mode
npm start
```

The server will start at `http://localhost:3000`

---

## 🎮 Usage

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the application in standard mode |
| `npm run start:dev` | Start with hot-reload for development |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start in production mode |
| `npm run seed` | Seed database with initial data |
| `npm run seed:drop` | Remove all seeded data |
| `npm run seed:refresh` | Drop and re-seed database |

### Default Credentials (After Seeding)

```
Super Admin:
Email: admin@xaminityiq.com
Password: Admin@123

Faculty:
Email: faculty@xaminityiq.com
Password: Faculty@123

Student:
Email: student@xaminityiq.com
Password: Student@123
```

> ⚠️ **Important:** Change default passwords after first login!

---

## 🏗️ Architecture

### Project Structure

```
src/
│
├── 📂 api/                          # API Layer (Controllers & Routes)
│   ├── auth/                        # Authentication endpoints
│   │   ├── login/
│   │   └── change-password/
│   ├── user/                        # User management
│   │   ├── admin/                   # Admin operations
│   │   ├── faculty/                 # Faculty operations
│   │   └── student/                 # Student operations
│   └── api.module.ts
│
├── 📂 services/                     # Business Logic Layer
│   ├── auth/
│   └── user/
│       ├── admin/
│       ├── faculty/
│       └── student/
│
├── 📂 repositories/                 # Data Access Layer
│   ├── admin-repository/
│   ├── batch-repository/
│   └── repository.module.ts
│
├── 📂 schemas/                      # MongoDB Schemas
│   ├── admin.schema.ts
│   ├── batch.schema.ts
│   └── course.schema.ts
│
├── 📂 database/                     # Database Configuration
│   ├── seeders/
│   │   ├── admin-seeder.ts
│   │   ├── course-department.seeder.ts
│   │   └── seeder.module.ts
│   └── database.module.ts
│
├── 📂 common/                       # Shared Resources
│   ├── dtos/                        # Data Transfer Objects
│   ├── exceptions/                  # Custom exceptions
│   ├── filters/                     # Exception filters
│   ├── guards/                      # Auth guards
│   ├── interceptors/                # Request/Response interceptors
│   └── pipes/                       # Validation pipes
│
├── app.module.ts                    # Root module
└── main.ts                          # Application entry point
```

### Module Organization

<table>
<tr>
<th>Layer</th>
<th>Purpose</th>
<th>Components</th>
</tr>
<tr>
<td><strong>API Layer</strong></td>
<td>Handle HTTP requests</td>
<td>Controllers, DTOs, Validators</td>
</tr>
<tr>
<td><strong>Service Layer</strong></td>
<td>Business logic implementation</td>
<td>Services, Business rules</td>
</tr>
<tr>
<td><strong>Repository Layer</strong></td>
<td>Database operations</td>
<td>Repositories, Queries</td>
</tr>
<tr>
<td><strong>Schema Layer</strong></td>
<td>Data modeling</td>
<td>MongoDB Schemas, Models</td>
</tr>
</table>

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Password encryption with bcrypt
- ✅ Request validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Secure session management

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Contact

For questions or support, please reach out to the development team.

<div align="center">

**Made with ❤️ by XaminityIQ Team**

⭐ Star this repository if you find it helpful!

</div>
