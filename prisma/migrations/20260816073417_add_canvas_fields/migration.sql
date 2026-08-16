-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "canvasData" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "pageType" TEXT NOT NULL DEFAULT 'richtext';
