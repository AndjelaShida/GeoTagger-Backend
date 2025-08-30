-- CreateTable
CREATE TABLE "public"."UserOfAuth" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserOfAuth_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."UserOfAuth" ADD CONSTRAINT "UserOfAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
