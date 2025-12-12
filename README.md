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

### 🔐 Role-Based Access Control

<div align="center">

<table>
<tr>
<td align="center" width="33%">
<img src="https://img.icons8.com/fluency/96/000000/admin-settings-male.png" alt="Super Admin" width="80"/>
<h3>Super Admin</h3>
<p><em>Complete System Control</em></p>
</td>
<td align="center" width="33%">
<img src="https://img.icons8.com/fluency/96/000000/teacher.png" alt="Faculty" width="80"/>
<h3>Faculty</h3>
<p><em>Course & Exam Management</em></p>
</td>
<td align="center" width="33%">
<img src="https://img.icons8.com/fluency/96/000000/student-male.png" alt="Student" width="80"/>
<h3>Student</h3>
<p><em>Exam Participation</em></p>
</td>
</tr>
</table>

</div>

---

## 🚀 Tech Stack

<div align="center">

<table>
<tr>
<td align="center" width="15%">
<img src="https://docs.nestjs.com/assets/logo-small-gradient.svg" alt="NestJS" width="60" height="60"/>
<br><strong>NestJS</strong>
</td>
<td align="center" width="15%">
<img src="https://raw.githubusercontent.com/remojansen/logo.ts/master/ts.png" alt="TypeScript" width="60" height="60"/>
<br><strong>TypeScript</strong>
</td>
<td align="center" width="14%">
<img src="https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg" alt="MongoDB" width="60" height="60"/>
<br><strong>MongoDB</strong>
</td>
<td align="center" width="14%">
<img src="https://jwt.io/img/pic_logo.svg" alt="JWT" width="60" height="60"/>
<br><strong>JWT</strong>
</td>
<td align="center" width="14%">
<img src="https://img.icons8.com/color/96/000000/lock--v1.png" alt="bcrypt" width="60" height="60"/>
<br><strong>bcrypt</strong>
</td>
<td align="center" width="14%">
<img src="https://img.icons8.com/color/96/000000/api-settings.png" alt="REST API" width="60" height="60"/>
<br><strong>REST API</strong>
</td>
<td align="center" width="14%">
<img src="https://img.icons8.com/color/96/000000/nodejs.png" alt="Node.js" width="60" height="60"/>
<br><strong>Node.js</strong>
</td>
</tr>
</table>

</div>

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
```

</div>
