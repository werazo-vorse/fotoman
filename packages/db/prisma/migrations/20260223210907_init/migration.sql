-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WEB', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('ANALYZING', 'DOCUMENT_READY', 'PAYMENT_PENDING', 'PAID', 'SUBMITTED', 'AWAITING_RESPONSE', 'RESPONDED', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "CaseEventType" AS ENUM ('CREATED', 'ANALYSIS_COMPLETE', 'DOCUMENT_GENERATED', 'PAYMENT_RECEIVED', 'SUBMITTED', 'DEADLINE_WARNING', 'DEADLINE_EXPIRED', 'RESPONSE_RECEIVED', 'ESCALATED', 'RESOLVED', 'NOTE');

-- CreateEnum
CREATE TYPE "FotomultaStatus" AS ENUM ('PENDING', 'RESOLUTION', 'COBRO_COACTIVO', 'PAID');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "platform" "Platform" NOT NULL DEFAULT 'WEB',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotomultas" (
    "id" TEXT NOT NULL,
    "comparendo_number" TEXT NOT NULL,
    "resolution_number" TEXT,
    "infraction_date" TIMESTAMP(3) NOT NULL,
    "notification_date" TIMESTAMP(3),
    "resolution_date" TIMESTAMP(3),
    "infraction_code" TEXT NOT NULL,
    "infraction_description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "FotomultaStatus" NOT NULL DEFAULT 'PENDING',
    "camera_location" TEXT,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "fotomultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'ANALYZING',
    "defenses_applied" TEXT[],
    "document_url" TEXT,
    "document_pdf" BYTEA,
    "submission_date" TIMESTAMP(3),
    "submission_proof" TEXT,
    "payment_id" TEXT,
    "deadline_date" TIMESTAMP(3),
    "authority_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_fotomultas" (
    "case_id" TEXT NOT NULL,
    "fotomulta_id" TEXT NOT NULL,

    CONSTRAINT "case_fotomultas_pkey" PRIMARY KEY ("case_id","fotomulta_id")
);

-- CreateTable
CREATE TABLE "case_events" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "type" "CaseEventType" NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cedula_key" ON "users"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "fotomultas_comparendo_number_key" ON "fotomultas"("comparendo_number");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotomultas" ADD CONSTRAINT "fotomultas_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_fotomultas" ADD CONSTRAINT "case_fotomultas_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_fotomultas" ADD CONSTRAINT "case_fotomultas_fotomulta_id_fkey" FOREIGN KEY ("fotomulta_id") REFERENCES "fotomultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
