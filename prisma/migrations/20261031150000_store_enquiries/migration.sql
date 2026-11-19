-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "websiteDomain" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254),
    "mobile" VARCHAR(15) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "persons" INTEGER NOT NULL,
    "destination" VARCHAR(64) NOT NULL,
    "packageId" VARCHAR(128) NOT NULL,
    "packageName" VARCHAR(255),
    "flightBooked" BOOLEAN NOT NULL,
    "emailStatus" VARCHAR(16) NOT NULL DEFAULT 'pending',

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");
