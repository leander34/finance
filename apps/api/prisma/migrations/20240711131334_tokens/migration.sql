-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('FORGOT_PASSWORD', 'EMAIL_VERIFY');

-- DropEnum
DROP TYPE "DeciveType";

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
