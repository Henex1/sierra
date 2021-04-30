-- CreateEnum
CREATE TYPE "UserSiteRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserOrgRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SearchEndpointType" AS ENUM ('ELASTICSEARCH', 'OPEN_SEARCH', 'SOLR', 'VESPA', 'REDIS_SEARCH');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "siteRole" "UserSiteRole" NOT NULL DEFAULT E'USER',
    "activeOrgId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "compound_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider_type" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "access_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "session_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Org" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "orgId" INTEGER NOT NULL,
    "role" "UserOrgRole" NOT NULL DEFAULT E'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchEndpoint" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "whitelist" TEXT[],
    "resultId" TEXT NOT NULL,
    "displayFields" TEXT[],
    "type" "SearchEndpointType" NOT NULL,
    "info" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" INTEGER NOT NULL,
    "searchEndpointId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryTemplate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "query" TEXT NOT NULL,
    "knobs" JSONB NOT NULL,
    "tag" TEXT,
    "description" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Judgement" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgementPhrase" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "judgementId" INTEGER NOT NULL,
    "phrase" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "judgementPhraseId" INTEGER NOT NULL,
    "documentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchConfiguration" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "queryTemplateId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchConfigurationLabel" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "searchConfigurationId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgementSearchConfiguration" (
    "id" SERIAL NOT NULL,
    "judgementId" INTEGER NOT NULL,
    "searchConfigurationId" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "searchConfigurationId" INTEGER NOT NULL,
    "meta" JSONB NOT NULL,
    "combinedScore" DOUBLE PRECISION NOT NULL,
    "allScores" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchPhraseExecution" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "executionId" INTEGER NOT NULL,
    "phrase" TEXT NOT NULL,
    "totalResults" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "explanation" JSONB NOT NULL,
    "combinedScore" DOUBLE PRECISION NOT NULL,
    "allScores" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruleset" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RulesetVersion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rulesetId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "value" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RulesetVersionToSearchConfiguration" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts.compound_id_unique" ON "accounts"("compound_id");

-- CreateIndex
CREATE INDEX "providerAccountId" ON "accounts"("provider_account_id");

-- CreateIndex
CREATE INDEX "providerId" ON "accounts"("provider_id");

-- CreateIndex
CREATE INDEX "userId" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions.session_token_unique" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions.access_token_unique" ON "sessions"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "OrgUser.userId_orgId_unique" ON "OrgUser"("userId", "orgId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgementPhrase.judgementId_phrase_unique" ON "JudgementPhrase"("judgementId", "phrase");

-- CreateIndex
CREATE UNIQUE INDEX "Vote.judgementPhraseId_documentId_unique" ON "Vote"("judgementPhraseId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchConfigurationLabel.projectId_name_unique" ON "SearchConfigurationLabel"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_RulesetVersionToSearchConfiguration_AB_unique" ON "_RulesetVersionToSearchConfiguration"("A", "B");

-- CreateIndex
CREATE INDEX "_RulesetVersionToSearchConfiguration_B_index" ON "_RulesetVersionToSearchConfiguration"("B");

-- AddForeignKey
ALTER TABLE "users" ADD FOREIGN KEY ("activeOrgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUser" ADD FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUser" ADD FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchEndpoint" ADD FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD FOREIGN KEY ("searchEndpointId") REFERENCES "SearchEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryTemplate" ADD FOREIGN KEY ("parentId") REFERENCES "QueryTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryTemplate" ADD FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judgement" ADD FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgementPhrase" ADD FOREIGN KEY ("judgementId") REFERENCES "Judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD FOREIGN KEY ("judgementPhraseId") REFERENCES "JudgementPhrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchConfiguration" ADD FOREIGN KEY ("queryTemplateId") REFERENCES "QueryTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchConfigurationLabel" ADD FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchConfigurationLabel" ADD FOREIGN KEY ("searchConfigurationId") REFERENCES "SearchConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgementSearchConfiguration" ADD FOREIGN KEY ("judgementId") REFERENCES "Judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgementSearchConfiguration" ADD FOREIGN KEY ("searchConfigurationId") REFERENCES "SearchConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD FOREIGN KEY ("searchConfigurationId") REFERENCES "SearchConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchPhraseExecution" ADD FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruleset" ADD FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RulesetVersion" ADD FOREIGN KEY ("parentId") REFERENCES "RulesetVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RulesetVersion" ADD FOREIGN KEY ("rulesetId") REFERENCES "Ruleset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RulesetVersionToSearchConfiguration" ADD FOREIGN KEY ("A") REFERENCES "RulesetVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RulesetVersionToSearchConfiguration" ADD FOREIGN KEY ("B") REFERENCES "SearchConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
