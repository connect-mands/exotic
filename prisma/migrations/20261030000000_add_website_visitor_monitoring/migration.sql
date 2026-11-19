-- CreateTable
CREATE TABLE "WebsiteVisit" (
    "id" TEXT NOT NULL,
    "websiteDomain" VARCHAR(255) NOT NULL,
    "ipAddress" VARCHAR(45),
    "ipHash" VARCHAR(64),
    "sessionId" VARCHAR(64),
    "pageUrl" VARCHAR(1024) NOT NULL,
    "pathname" VARCHAR(512) NOT NULL,
    "landingPage" VARCHAR(512),
    "referrer" VARCHAR(1024),
    "referrerDomain" VARCHAR(255),
    "userAgent" VARCHAR(512),
    "deviceType" VARCHAR(16) NOT NULL,
    "browser" VARCHAR(32),
    "gclid" VARCHAR(256),
    "gbraid" VARCHAR(256),
    "wbraid" VARCHAR(256),
    "utmSource" VARCHAR(255),
    "utmMedium" VARCHAR(255),
    "utmCampaign" VARCHAR(255),
    "utmTerm" VARCHAR(255),
    "utmContent" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteLead" (
    "id" TEXT NOT NULL,
    "websiteDomain" VARCHAR(255) NOT NULL,
    "sessionId" VARCHAR(64),
    "ipHash" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteVisit_ipHash_createdAt_idx" ON "WebsiteVisit"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteVisit_gclid_idx" ON "WebsiteVisit"("gclid");

-- CreateIndex
CREATE INDEX "WebsiteVisit_sessionId_idx" ON "WebsiteVisit"("sessionId");

-- CreateIndex
CREATE INDEX "WebsiteVisit_websiteDomain_createdAt_idx" ON "WebsiteVisit"("websiteDomain", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteVisit_createdAt_idx" ON "WebsiteVisit"("createdAt");

-- CreateIndex
CREATE INDEX "WebsiteLead_sessionId_idx" ON "WebsiteLead"("sessionId");

-- CreateIndex
CREATE INDEX "WebsiteLead_ipHash_createdAt_idx" ON "WebsiteLead"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteLead_createdAt_idx" ON "WebsiteLead"("createdAt");
