/*
  Warnings:

  - Added the required column `userId` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("id", "muscleGroup", "name") SELECT "id", "muscleGroup", "name" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
CREATE UNIQUE INDEX "Exercise_name_userId_key" ON "Exercise"("name", "userId");
CREATE TABLE "new_Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionType" TEXT NOT NULL,
    "note" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("date", "id", "note", "sessionType") SELECT "date", "id", "note", "sessionType" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
