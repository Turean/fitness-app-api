# Fitness Tracker API

A REST API for logging gym workouts — sessions, exercises, and the sets performed in each one. Built as a hands-on backend learning project.

## Tech Stack

- **Express 5** — routing and middleware
- **Prisma 7** + **SQLite** — database and ORM
- **TypeScript**
- **JWT** (`jsonwebtoken`) — authentication
- **bcrypt** — password hashing

## Prerequisites

- Node.js
- npm

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run seed   # optional — adds sample data
npm run dev    # starts the API on port 8800
```

## Project Structure

```
index.ts              # app entry point, mounts all routers
routes/                # one file per resource
  users.ts             # user registration
  login.ts             # login + token verification
  sessions.ts          # gym sessions (PUSH / PULL / LEGS)
  exercises.ts         # a user's exercise library
  workoutExercises.ts  # links a session to an exercise
  sets.ts              # individual sets within a workout exercise
middlewares/
  auth.ts              # verifies JWT, attaches user to res.locals
lib/
  prisma.ts            # shared Prisma client instance
prisma/
  schema.prisma         # data model
  migrations/           # migration history
seed/
  main.ts               # sample data script
```

## Documentation

Data model, relationships, design patterns, API reference, and current build status are all in **[spec.md](./spec.md)**.

## Status

Actively in progress as a developing project.
