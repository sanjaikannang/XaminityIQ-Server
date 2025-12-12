# 📘 XaminityIQ – Online Examination Platform

XaminityIQ is a secure and scalable online examination system designed for universities and colleges. It provides role-based access for **Super Admin**, **Faculty**, and **Students**, enabling efficient management of batches, courses, departments, and sections.

---

## 🚀 Tech Stack

### **Backend**
- NestJs
- TypeScript
- MongoDB
- Mongoose
- JWT (JSON Web Token)

---

## ⚙️ Installation

### 1. Clone the project
```bash
git clone https://github.com/sanjaikannang/XaminityIQ-Server.git
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory and add the following variables:
```env
VITE_API_BASE_URL=""
VITE_BACKEND_URL=""
```

### 4. Run the development server
```bash
npm run start:dev
```

---

## 🔐 User Roles

- **Super Admin** - Complete system management and configuration
- **Faculty** - Manage courses, exams, and student assessments
- **Students** - Take exams and view results

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
