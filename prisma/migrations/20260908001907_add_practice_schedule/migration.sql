-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('PRACTICE', 'RACE');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "activeSchedule" "ScheduleType" NOT NULL DEFAULT 'RACE',
ADD COLUMN     "currentPracticeId" TEXT;

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "practiceNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "laps" INTEGER,
    "minutes" INTEGER,
    "position" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeSession_eventId_position_key" ON "PracticeSession"("eventId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Event_currentPracticeId_key" ON "Event"("currentPracticeId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_currentPracticeId_fkey" FOREIGN KEY ("currentPracticeId") REFERENCES "PracticeSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
