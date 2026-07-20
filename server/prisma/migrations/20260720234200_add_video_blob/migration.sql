-- CreateTable
CREATE TABLE "VideoBlob" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoBlob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoBlob_dreamId_key" ON "VideoBlob"("dreamId");

-- AddForeignKey
ALTER TABLE "VideoBlob" ADD CONSTRAINT "VideoBlob_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
