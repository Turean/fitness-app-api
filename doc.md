# Fitness Tracker API

REST API for logging gym workouts. Express 5 + Prisma 7 + SQLite.

---

# Data Models

## User

Represents an app user. `username` and `email` must be unique. Owns their own sessions and exercise library.

## Exercise

An exercise in the user's personal library. The same exercise name can exist across different users but not twice for the same user (`@@unique([name, userId])`).

## Session

A single gym visit. `sessionType` is `"PUSH"`, `"PULL"`, or `"LEGS"`. `note` is optional. Belongs to a user.

## WorkoutExercise

Joins a `Session` and an `Exercise`. A new record is created each time an exercise is performed in a session.

## Set

One set within a `WorkoutExercise`. Holds `setNumber`, `reps`, and `weight`.

---

## Relationships

- `User` → `Session` — one user can have many sessions
- `User` → `Exercise` — one user can have many exercises
- `Exercise` → `WorkoutExercise` — one exercise can appear in many workout sessions
- `Session` → `WorkoutExercise` — one session can have many workout exercises
- `WorkoutExercise` → `Set` — one workout exercise can have many sets

---

# Auth

JWT-based. `POST /login` returns a token. Protected routes require:

```
Authorization: Bearer <token>
```

The `auth` middleware verifies the token and attaches the payload to `res.locals.user`. Routes read `res.locals.user.id` to identify the requester — never trusted from the request body.

---

# API Reference

## Users

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/users` | No | — | Returns all users |
| GET | `/users/:id` | No | — | Returns one user by id |
| POST | `/users` | No | `name, username, email, password` | Registers a user. Password is hashed with bcrypt. |

## Login

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/login` | No | `username, password` | Returns `{ user, token }` on success, `401` on failure |
| GET | `/verify` | Yes | — | Returns the logged-in user's record |

## Exercises

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/exercises` | Yes | — | Returns the logged-in user's exercises only |
| GET | `/exercises/:id` | No | — | Returns one exercise by id, with related user and sessions |
| POST | `/exercises` | Yes | `name, muscleGroup` | Name is uppercased before saving |

## Sessions

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/sessions` | Yes | — | Returns the logged-in user's sessions, newest first, with nested exercises and sets |
| GET | `/sessions/:id` | No | — | Returns one session by id |
| POST | `/sessions` | Yes | `sessionType, note?` | `sessionType` is uppercased before saving |

## Workout Exercises

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/sessions/:sessionId/workoutExercises` | Yes | `exerciseId, sets: [{ setNumber, reps, weight }]` | Creates a `WorkoutExercise` and all its `Set` records in one nested write. Checks the session belongs to the logged-in user first. |

---

# Key Patterns

**Ownership check** — before acting on a resource tied to a session, confirm it belongs to the requester:

```typescript
prisma.session.findFirst({ where: { id, userId } })
```

**`userId` always comes from the JWT**, never from the request body — prevents a user from creating data under another user's account.

**Uppercasing for uniqueness** — `Exercise.name` and `Session.sessionType` are uppercased before saving, so casing differences don't create near-duplicate values.

**Validate before transforming** — check a field exists before calling a method on it (e.g. `.toUpperCase()`), otherwise a missing field crashes the request instead of returning a clean `400`.

**`return` after every response inside a conditional** — without it, execution falls through and a second response gets attempted, which crashes the request.

---

# Setup

```bash
npm install
npx prisma migrate dev
npm run seed   # optional, adds sample data
npm run dev    # starts on port 8800
```

---

# Not Yet Built

- Update / delete routes for any model
- Streak / attendance tracking
- Password reset flow (email field exists in schema for this)
- Frontend
