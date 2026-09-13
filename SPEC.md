# Fitness Tracker API — Specification

REST API for logging gym workouts. Express 5 + Prisma 7 + SQLite + TypeScript.

---

## Data Models

### User

App user. `username` and `email` are unique. Owns sessions and an exercise library.

<!-- prettier-ignore -->
| Field | Type | Notes |
|---|---|---|
| id | Int | primary key |
| name | String | |
| email | String | unique |
| password | String | bcrypt hash |
| username | String | unique |
| createdAt | DateTime | defaults to now |

### Exercise

An exercise in a user's personal library.

<!-- prettier-ignore -->
| Field | Type | Notes |
|---|---|---|
| id | Int | primary key |
| name | String | uppercased before saving |
| muscleGroup | String | |
| userId | Int | foreign key → User |

Same exercise name can exist across different users, but not twice for the same user (`@@unique([name, userId])`).

### Session

A single gym visit.

<!-- prettier-ignore -->
| Field | Type | Notes |
|---|---|---|
| id | Int | primary key |
| sessionType | String | `"PUSH"`, `"PULL"`, or `"LEGS"` — uppercased before saving |
| note | String? | optional |
| date | DateTime | defaults to now |
| userId | Int | foreign key → User |

### WorkoutExercise

Joins a `Session` and an `Exercise` — one record per exercise performed in a session.

<!-- prettier-ignore -->
| Field | Type | Notes |
|---|---|---|
| id | Int | primary key |
| sessionId | Int | foreign key → Session, **cascades on delete** |
| exerciseId | Int | foreign key → Exercise |

### Set

One set within a `WorkoutExercise`.

<!-- prettier-ignore -->
| Field | Type | Notes |
|---|---|---|
| id | Int | primary key |
| setNumber | Int | |
| reps | Int | |
| weight | Int | |
| workoutExerciseId | Int | foreign key → WorkoutExercise, **cascades on delete** |

---

## Relationships

- `User` → `Session` — one user has many sessions
- `User` → `Exercise` — one user has many exercises
- `Exercise` → `WorkoutExercise` — one exercise can appear in many workout exercises
- `Session` → `WorkoutExercise` — one session has many workout exercises (deleting the session deletes these)
- `WorkoutExercise` → `Set` — one workout exercise has many sets (deleting the workout exercise deletes these)

Only `Session → WorkoutExercise` and `WorkoutExercise → Set` cascade. `Exercise → WorkoutExercise` does **not** — see the Exercise delete route below for why that matters.

---

## Auth

JWT-based. `POST /login` returns a token. Protected routes require:

```
Authorization: Bearer <token>
```

The `auth` middleware verifies the token and attaches the payload to `res.locals.user`. Every route that needs to know "who's asking" reads `res.locals.user.id` — this value is never trusted from the request body or URL.

---

## API Reference

### Users

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/users` | No | `name, username, email, password` | Registers a user. Password hashed with bcrypt before saving. |

### Login

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/login` | No | `username, password` | Returns `{ user, token }` on success, `401` if the username or password is wrong. |
| GET | `/verify` | Yes | — | Returns the logged-in user's own record. |

### Exercises

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/exercises` | Yes | — | Returns the logged-in user's exercises only. |
| POST | `/exercises` | Yes | `name, muscleGroup` | Both fields required (`400` if missing). `name` is uppercased before saving. |
| DELETE | `/exercises/:id` | Yes | — | Ownership-checked. If the exercise has already been used in a `WorkoutExercise`, deletion is blocked with `400` ("cannot delete an exercise with workout history") instead of letting the database throw a foreign-key error. |

### Sessions

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/sessions` | Yes | — | Logged-in user's sessions, newest first. |
| GET | `/sessions/:id` | Yes | — | One session, with nested `workoutExercises` → each one's `exercise` and `sets`. `404` if it doesn't exist or isn't the requester's. |
| POST | `/sessions` | Yes | `sessionType, note?` | `sessionType` required (`400` if missing), uppercased before saving. |
| DELETE | `/sessions/:id` | Yes | — | Ownership-checked, then deleted. Cascades to its `WorkoutExercise` and `Set` records. |

### Workout Exercises

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/sessions/:sessionId/workoutExercises` | Yes | `exerciseId, sets: [{ setNumber, reps, weight }]` | Checks the session belongs to the requester first. Validates `sets` is a non-empty array where every set has `setNumber`, `reps`, and `weight` (`400` if not). Creates the `WorkoutExercise` and all its `Set` rows in one nested write. |
| DELETE | `/sessions/:sessionId/workoutExercises/:weId` | Yes | — | Two-step check: session belongs to requester, **and** the workout exercise belongs to that specific session. `404` if either fails. Cascades to its `Set` records. |

### Sets

<!-- prettier-ignore -->
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/workoutExercises/:workoutExerciseId/sets` | Yes | — | Ownership checked through `workoutExercise.session.userId`. Returns the array of sets for that workout exercise. |
| DELETE | `/workoutExercises/:workoutExerciseId/sets/:setId` | Yes | — | Checks all three at once: the set's `id`, that its `workoutExerciseId` matches the one in the URL, and that the owning session belongs to the requester. |

---

## Key Patterns

**Ownership check before touching anything.** Every read, update, or delete on a user-owned resource starts with a `findFirst` that filters by the resource's `id` _and_ a path back to `userId` — either directly, or by nesting through relations:

```typescript
// direct
prisma.session.findFirst({ where: { id, userId } })

// nested one relation deep
prisma.workoutExercise.findFirst({
    where: { id, session: { userId } },
})

// nested two relations deep
prisma.set.findFirst({
    where: { id, workoutExercise: { session: { userId } } },
})
```

Prisma compiles each of these into a single query with the necessary joins — no separate round-trip needed to check ownership before acting.

**Filter on the direct foreign key when you can, nest only when you must.** The `Set` delete route checks `workoutExerciseId` (its own foreign-key column) directly, and only nests through `workoutExercise: { session: { userId } } }` for the ownership check, since `Set` has no direct column back to `userId`:

```typescript
prisma.set.findFirst({
    where: {
        id,
        workoutExerciseId, // direct column — no join needed
        workoutExercise: { session: { userId } }, // no shortcut — must go through the chain
    },
})
```

**`userId` always comes from the JWT**, never from the request body — this is what stops a user from creating or touching data under someone else's account.

**Uppercasing for uniqueness.** `Exercise.name` and `Session.sessionType` are uppercased before saving, so `"bench press"` and `"Bench Press"` don't become two different rows.

**Validate before transforming.** A field's presence is checked before calling a method on it (e.g. `.toUpperCase()`), so a missing field returns a clean `400` instead of crashing the request.

**`return` after every response inside a conditional.** Without it, execution falls through past the `if` block and a second response gets attempted on the same request, which throws.

**Delete = check, then act, wrapped in try/catch.** Every `DELETE` route follows the same shape: confirm ownership with a `findFirst`, then attempt the actual `prisma.<model>.delete()` inside a `try/catch`, returning the deleted record on success. The `catch` currently returns `400` on failure — worth revisiting (see note below).

**Blocking deletes that would break references.** `Exercise → WorkoutExercise` isn't a cascading relation, so the `Exercise` delete route checks for existing `WorkoutExercise` rows first and returns a friendly `400` instead of letting the database reject the delete with a raw foreign-key error.

---

## Setup

```bash
npm install
npx prisma migrate dev
npm run seed   # optional, adds sample data
npm run dev    # starts on port 8800
```

---

## Built So Far

- Full CRUD-minus-update on Sessions, Exercises, WorkoutExercises, and Sets (create/read/delete — no updates yet on any model)
- JWT auth + registration
- Ownership enforcement on every protected route, including multi-level relation chains

## Not Yet Built

- Update routes for any model
- Streak / attendance tracking
- Password reset flow (the `email` field exists in the schema for this)
- Frontend (Next.js, planned)
