/*
  Warnings:

  - Changed the type of `action` on the `ActionLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `component` to the `ActionLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('CLICK', 'SCROLL', 'ADDED_VALUE', 'CHANGED_VALUE', 'REMOVED_VALUE');

-- CreateEnum
CREATE TYPE "public"."ComponentType" AS ENUM ('BUTTON', 'LINK', 'INPUT', 'CHECKBOX', 'RADIO', 'DROPDOWN', 'NONE');

-- AlterTable
ALTER TABLE "public"."ActionLog" DROP COLUMN "action",
ADD COLUMN     "action" "public"."ActionType" NOT NULL,
DROP COLUMN "component",
ADD COLUMN     "component" "public"."ComponentType" NOT NULL;

-- CreateIndex
CREATE INDEX "ActionLog_createdAt_idx" ON "public"."ActionLog"("createdAt");
