# 📘 XaminityIQ – Online Examination Platform

XaminityIQ is a secure and scalable online examination system designed for universities and colleges. It provides role-based access for **Super Admin**, **Faculty**, and **Students**, enabling efficient management of batches, courses, departments, and sections.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

---

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
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
│   │   │   └── admin.module.ts          # Optional: facade module
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
│   │   └── auth.service.ts             # Shared auth logic
│   │
│   ├── user/
│   │   ├── admin/
│   │   │   ├── student/
│   │   │   │   ├── create-student.service.ts
│   │   │   │   ├── update-student.service.ts
│   │   │   │   └── student.service.ts  # Optional: shared admin-student logic
│   │   │   ├── faculty/
│   │   │   │   ├── create-faculty.service.ts
│   │   │   │   └── faculty.service.ts
│   │   │   └── admin.service.ts        # Facade service for admin role
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
│   ├── dtos/                          # Shared DTOs
│   ├── exceptions/                    # Custom exceptions
│   ├── filters/                       # Exception filters
│   ├── guards/                        # Auth/Role guards
│   ├── interceptors/                  # Logging, transform
│   └── pipes/                          # Validation pipes
│
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts

