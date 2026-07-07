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
