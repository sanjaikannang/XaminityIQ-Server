<div align="center">

# 🎓 XaminityIQ — Server

### Online Examination & Proctoring Platform — Backend API

*A NestJS + MongoDB backend powering academic management, exam authoring, and live proctored examinations*

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

---

</div>

## 📋 Overview

XaminityIQ is a full-stack examination platform for colleges and institutes. This repository is the backend — a
NestJS REST API backed by MongoDB — covering academic structure management, student/faculty onboarding, exam
authoring, automatic proctoring-room formation, live exam monitoring (via LiveKit), answer evaluation, and result
publication.

The companion frontend lives at [XaminityIQ-Client](https://github.com/sanjaikannang/XaminityIQ-Client). A
complete technical architecture document (system design, full API reference, database schema, ER/sequence
diagrams, security model) is included at
[`docs/XaminityIQ-Technical-Documentation.pdf`](./docs/XaminityIQ-Technical-Documentation.pdf).

### 🔐 Role-Based Access Control

<div align="center">

<table>
<tr>
<td align="center" width="33%">
<h3>Super Admin</h3>
<p>Academic setup, user onboarding, exam authoring &amp; publishing, room formation, result publication</p>
</td>
<td align="center" width="33%">
<h3>Faculty</h3>
<p>Subject ownership, live proctoring &amp; invigilation, answer evaluation</p>
</td>
<td align="center" width="33%">
<h3>Student</h3>
<p>Profile completion, exam taking (self-paced or proctored), viewing results</p>
</td>
</tr>
</table>

</div>

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| Framework | NestJS 11 (TypeScript) |
| Database | MongoDB Atlas, via Mongoose ODM |
| Authentication | JWT (access + refresh), bcrypt password hashing |
| Validation | class-validator / class-transformer, global `ValidationPipe` |
| File storage | Cloudinary (signed direct-to-storage uploads) |
| Real-time proctoring | LiveKit (WebRTC SFU — camera, mic, screen-share, data-channel chat) |
| Scheduled jobs | `@nestjs/schedule` — exam lifecycle sweep (5s) &amp; disconnect sweep (60s) |
| Testing | Jest + Supertest (configured; see [Testing](#-testing)) |

---

## ✨ Key Features

- **Academic hierarchy** — batches, courses, departments, sections, subjects, with full mapping validation
- **User management** — student &amp; faculty onboarding (individual + bulk CSV), self-serve profile completion
- **Exam authoring** — AUTO (self-paced) and PROCTORING (invigilated) modes; MCQ, MSQ, Written, and Typing
  question types; exam sections; bulk question CSV upload; per-exam security settings; multi-section /
  multi-semester targeting
- **Automatic room formation** — partitions matched students into rooms of ≤10 and round-robin assigns active
  faculty as invigilators, pooling leftovers across identically-scheduled exams
- **Live proctoring** — waiting-room admission, live camera/screen monitoring via LiveKit, faculty mic mute,
  in-session chat, disconnect/reconnect grace period, integrity violation auto-submit
- **Evaluation &amp; results** — faculty evaluation queue for subjective answers, admin result publication
- **Time-driven state** — exam and room-assignment status advance automatically via a scheduled sweep, not
  manual admin action

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/sanjaikannang/XaminityIQ-Server.git
cd XaminityIQ-Server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment configuration

Create a `.env` file in the root directory (see `.env.example` for the template):

```env
PORT=8004
NODE_ENV=development

MONGODB_URI=<your MongoDB Atlas connection string>

FRONT_END_BASE_URL_1=<primary allowed CORS origin, e.g. your deployed client URL>
FRONT_END_BASE_URL_2=<secondary allowed CORS origin, e.g. http://localhost:5173>

JWT_SECRET_KEY=<secure random string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET_KEY=<secure random string>
JWT_REFRESH_EXPIRY_IN=7d
PASSWORD_RESET_JWT_SECRET_KEY=<secure random string>
QR_TOKEN_JWT_SECRET_KEY=<secure random string>

INITIAL_ADMIN_EMAIL=<seed-only, first admin account email>
INITIAL_ADMIN_PASSWORD=<seed-only, first admin account password>

CLOUDINARY_CLOUD_NAME=<your Cloudinary cloud name>
CLOUDINARY_API_KEY=<your Cloudinary API key>
CLOUDINARY_API_SECRET=<your Cloudinary API secret>

LIVEKIT_API_KEY=<your LiveKit API key>
LIVEKIT_API_SECRET=<your LiveKit API secret>
LIVEKIT_URL=<your LiveKit server URL>
```

> Every variable above is actually read by the application (`src/config/config.service.ts`) — there is no
> `VITE_*` variable in this repository; that naming belongs to the client only.

### 4. Database seeding

```bash
npm run seed          # seed initial admin + academic reference data
npm run seed:drop     # drop all seeded data
npm run seed:refresh  # drop + reseed
```

### 5. Run the application

```bash
npm run start:dev     # development, hot-reload
npm run start:debug   # development, debugger attached
npm run start:prod    # production (run `npm run build` first)
npm start              # standard start
```

The API listens on `PORT` (default `8004`) with no global route prefix — e.g. `POST /auth/login`,
`GET /admin/exams`.

---

## 🧪 Testing

```bash
npm run test        # unit tests
npm run test:e2e     # end-to-end tests
npm run test:cov     # coverage report
```

Jest, ts-jest, and Supertest are fully configured, but at present only the default NestJS-generated smoke tests
exist (`src/app.controller.spec.ts`, `test/app.e2e-spec.ts`) — project-specific test coverage is not yet
written. See the technical documentation's Testing Strategy chapter for a prioritized list of what to cover
first.

---

## 📁 Project Structure

```
src/
├── api/                          # Controllers + request/response DTOs (one endpoint per file)
│   ├── auth/                     # login, logout, refresh-token, change/forgot/reset-password
│   ├── public/written-answer/    # Unauthenticated QR-based mobile answer-capture endpoints
│   └── user/
│       ├── admin/                # Academic hierarchy, student/faculty management, exam management, dashboard
│       ├── faculty/              # Subject management, exam evaluation, exam proctoring, profile
│       └── student/               # Subject listing, exam attempts, exam proctoring, profile
│   └── api.module.ts
├── cloudinary/                    # cloudinary.service.ts — signed uploads, asset deletion
├── config/                        # config.service.ts — the single environment-variable access point
├── database/
│   ├── data/                      # Seed reference data (courses/departments)
│   └── seeders/                   # admin.seeder.ts, course-department.seeder.ts, seed.command.ts
├── decorators/                    # roles.decorator.ts, current-user.decorator.ts
├── guards/                        # jwt-auth.guard.ts, role.guard.ts
├── livekit/                       # livekit.service.ts, webhook controller/service, disconnect-sweep service
├── repositories/                  # One Mongoose data-access class per collection (31 total)
├── schemas/                       # Mongoose models — Academic/, Exam/, User/{Admin,Faculty,Student}/, AuthActivityLog/
├── services/
│   ├── auth-service/               # auth.service.ts, jwt.service.ts, password.service.ts
│   ├── public-service/             # written-answer.service.ts
│   ├── scheduler-service/          # exam-lifecycle-scheduler.service.ts
│   └── user-service/{admin,faculty,student}/
├── utils/                          # cookie.util.ts, date.util.ts, enum.ts, utils.ts
├── app.controller.ts / app.service.ts / app.module.ts
└── main.ts                         # Bootstrap — CORS, global ValidationPipe, cookie-parser, raw-body for webhooks
```

Layering convention: **controllers** (`api/`) handle HTTP + validation only → **services** hold all business
logic → **repositories** are the only layer that touches Mongoose models directly.

---

## 📚 Full Documentation

For system architecture, the complete API reference (all 98 endpoints), database schema, ER/sequence/data-flow
diagrams, security model, and documented engineering decisions, see
[`docs/XaminityIQ-Technical-Documentation.pdf`](./docs/XaminityIQ-Technical-Documentation.pdf).

---

## 🔗 Related Repository

- Frontend: [XaminityIQ-Client](https://github.com/sanjaikannang/XaminityIQ-Client)
