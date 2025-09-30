/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Image` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Upvote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostTag" DROP CONSTRAINT "PostTag_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostTag" DROP CONSTRAINT "PostTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Upvote" DROP CONSTRAINT "Upvote_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Upvote" DROP CONSTRAINT "Upvote_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ALTER COLUMN "authorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Comment_id_seq";

-- AlterTable
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Image_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Image_id_seq";

-- AlterTable
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "authorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Post_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Post_id_seq";

-- AlterTable
ALTER TABLE "public"."PostTag" DROP CONSTRAINT "PostTag_pkey",
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ALTER COLUMN "tagId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId", "tagId");

-- AlterTable
ALTER TABLE "public"."Tag" DROP CONSTRAINT "Tag_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Tag_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Tag_id_seq";

-- AlterTable
ALTER TABLE "public"."Upvote" DROP CONSTRAINT "Upvote_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Upvote_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Upvote_id_seq";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostTag" ADD CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Upvote" ADD CONSTRAINT "Upvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Upvote" ADD CONSTRAINT "Upvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
