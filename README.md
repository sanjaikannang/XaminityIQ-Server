<div align="center">

# 🎓 XaminityIQ

### Online Examination Platform

*A secure and scalable examination system designed for modern educational institutions*

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

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

### Step 1: Clone the Repository

```bash
git clone https://github.com/sanjaikannang/XaminityIQ-Server.git
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=""
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

---


## 📁 Project Folder Structure

```bash
src/
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   ├── login.controller.ts
│   │   │   ├── login.request.ts
│   │   │   └── login.response.ts
│   │   ├── change-password/
│   │   │   ├── change-password.controller.ts
│   │   │   ├── change-password.request.ts
│   │   │   └── change-password.response.ts
│   │   └── auth.module.ts
│   │
│   ├── user/
│   │   ├── admin/
│   │   │   ├── student/
│   │   │   │   ├── create-student.controller.ts
│   │   │   │   ├── create-student.service.ts
│   │   │   │   ├── update-student.controller.ts
│   │   │   │   ├── update-student.service.ts
│   │   │   │   └── student.module.ts
│   │   │   ├── faculty/
│   │   │   │   ├── create-faculty.controller.ts
│   │   │   │   ├── create-faculty.service.ts
│   │   │   │   └── faculty.module.ts
│   │   │   └── admin.module.ts          
│   │   │
│   │   ├── faculty/
│   │   │   ├── get-faculty.controller.ts
│   │   │   ├── get-faculty.service.ts
│   │   │   └── faculty.module.ts
│   │   │
│   │   ├── student/
│   │   │   ├── get-student.controller.ts
│   │   │   ├── get-student.service.ts
│   │   │   └── student.module.ts
│   │   │
│   │   └── user.module.ts
│   │
│   └── api.module.ts
│
├── services/
│   ├── auth/
│   │   └── auth.service.ts             
│   │
│   ├── user/
│   │   ├── admin/
│   │   │   ├── student/
│   │   │   │   ├── create-student.service.ts
│   │   │   │   ├── update-student.service.ts
│   │   │   │   └── student.service.ts  
│   │   │   ├── faculty/
│   │   │   │   ├── create-faculty.service.ts
│   │   │   │   └── faculty.service.ts
│   │   │   └── admin.service.ts       
│   │   │
│   │   ├── faculty/
│   │   │   └── faculty.service.ts
│   │   │
│   │   └── student/
│   │       └── student.service.ts
│   │
│   └── service.module.ts
│
├── repositories/
│   ├── admin-repository/
│   │   └── admin-repository.ts
│   ├── batch-repository/
│   │   └── batch-repository.ts
│   └── repository.module.ts
│
├── schemas/
│   ├── admin.schema.ts
│   ├── batch.schema.ts
│   └── course.schema.ts
│
├── database/
│   ├── seeders/
│   │   ├── admin-seeder.ts
│   │   ├── course-department.seeder.ts
│   │   └── seeder.module.ts
│   └── database.module.ts
│
├── common/
│   ├── dtos/                          
│   ├── exceptions/                    
│   ├── filters/                       
│   ├── guards/                        
│   ├── interceptors/                  
│   └── pipes/                         
│
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts

</div>
