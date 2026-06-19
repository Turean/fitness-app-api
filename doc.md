# Data Models

## Exercise

A library of exercises. Seeded upfront, expandable later. One exercise can be reused across many sessions.

## Session

A single gym visit. `sessionType` is `"PUSH"`, `"PULL"`, or `"LEGS"`. `note` is optional.

## WorkoutExercise

Joins a `Session` and an `Exercise`. A new record is created each time an exercise is performed in a session.

## Set

One set within a `WorkoutExercise`. Holds `setNumber`, `reps`, and `weight`.

---

## Relationships

- `Exercise` → `WorkoutExercise` — one exercise can appear in many workout sessions
- `Session` → `WorkoutExercise` — one session can have many exercises
- `WorkoutExercise` → `Set` — one workout exercise can have many sets
