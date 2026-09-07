-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROMOTER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PROMOTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "promoterId" TEXT NOT NULL,
    "currentRaceId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "raceNumber" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateDrop" (
    "id" TEXT NOT NULL,
    "gateNumber" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "raceId" TEXT NOT NULL,

    CONSTRAINT "GateDrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassEntry" (
    "id" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "laps" INTEGER NOT NULL,
    "numRacers" INTEGER NOT NULL,
    "gateDropId" TEXT NOT NULL,

    CONSTRAINT "ClassEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_currentRaceId_key" ON "Event"("currentRaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Race_eventId_position_key" ON "Race"("eventId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "GateDrop_raceId_position_key" ON "GateDrop"("raceId", "position");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_currentRaceId_fkey" FOREIGN KEY ("currentRaceId") REFERENCES "Race"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateDrop" ADD CONSTRAINT "GateDrop_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassEntry" ADD CONSTRAINT "ClassEntry_gateDropId_fkey" FOREIGN KEY ("gateDropId") REFERENCES "GateDrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
