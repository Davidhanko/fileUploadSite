-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "parentUuid" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentUuid_fkey" FOREIGN KEY ("parentUuid") REFERENCES "Folder"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
