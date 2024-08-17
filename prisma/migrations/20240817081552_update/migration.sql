/*
  Warnings:

  - You are about to drop the column `fileUuid` on the `Folder` table. All the data in the column will be lost.
  - Added the required column `folderUuid` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_fileUuid_fkey";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "folderUuid" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "fileUuid",
ADD COLUMN     "name" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderUuid_fkey" FOREIGN KEY ("folderUuid") REFERENCES "Folder"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
