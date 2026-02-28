-- CreateEnum
CREATE TYPE "CaseOutcome" AS ENUM ('WON', 'LOST', 'PARTIAL', 'NO_RESPONSE', 'PENDING');

-- AlterEnum
ALTER TYPE "CaseStatus" ADD VALUE 'DEADLINE_EXPIRED';

-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "submission_message_id" TEXT;

-- CreateTable
CREATE TABLE "case_results" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "outcome" "CaseOutcome" NOT NULL DEFAULT 'PENDING',
    "response_date" TIMESTAMP(3),
    "response_text" TEXT,
    "response_pdf" BYTEA,
    "authority_name" TEXT NOT NULL,
    "inbound_email_id" TEXT,
    "ai_analysis" TEXT,
    "lessons_learned" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_results" (
    "id" TEXT NOT NULL,
    "case_result_id" TEXT NOT NULL,
    "defense_key" TEXT NOT NULL,
    "effective" BOOLEAN NOT NULL,
    "rejection_reason" TEXT,
    "counter_argument" TEXT,

    CONSTRAINT "defense_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_effectiveness" (
    "id" TEXT NOT NULL,
    "defense_key" TEXT NOT NULL,
    "authority_name" TEXT NOT NULL,
    "total_cases" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "win_rate" DOUBLE PRECISION NOT NULL,
    "top_rejections" TEXT[],
    "top_counter_args" TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "defense_effectiveness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "case_results_case_id_key" ON "case_results"("case_id");

-- CreateIndex
CREATE UNIQUE INDEX "defense_results_case_result_id_defense_key_key" ON "defense_results"("case_result_id", "defense_key");

-- CreateIndex
CREATE UNIQUE INDEX "defense_effectiveness_defense_key_authority_name_key" ON "defense_effectiveness"("defense_key", "authority_name");

-- AddForeignKey
ALTER TABLE "case_results" ADD CONSTRAINT "case_results_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defense_results" ADD CONSTRAINT "defense_results_case_result_id_fkey" FOREIGN KEY ("case_result_id") REFERENCES "case_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
