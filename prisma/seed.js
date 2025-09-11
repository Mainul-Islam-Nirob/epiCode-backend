import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (for re-seeding during dev)
  await prisma.upvote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const authorPassword = await bcrypt.hash("author123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@epicode.com",
      password: adminPassword,
    },
  });

  const author = await prisma.user.create({
    data: {
      name: "Author User",
      email: "author@epicode.com",
      password: authorPassword,
    },
  });

  // Tags
  const tags = await prisma.tag.createMany({
    data: [
      { name: "literature" },
      { name: "coding" },
      { name: "philosophy" },
      { name: "novel" },
      { name: "criticism" },
      { name: "webdev" },
    ],
  });

  // Get tags individually (needed for relations)
  const allTags = await prisma.tag.findMany();

  // Posts
  const posts = [];
  for (let i = 1; i <= 6; i++) {
    posts.push(
      await prisma.post.create({
        data: {
          title: `Sample Post ${i}`,
          content: `This is the content of sample post ${i}. It mixes literature and coding ideas.`,
          image: null,
          published: i % 2 === 0, // half published, half unpublished
          readTime: 5 + i,
          authorId: i % 2 === 0 ? admin.id : author.id,
        },
      })
    );
  }

  // Add tags to posts (simple mapping)
  await prisma.postTag.createMany({
    data: [
      { postId: posts[0].id, tagId: allTags.find(t => t.name === "literature").id },
      { postId: posts[0].id, tagId: allTags.find(t => t.name === "novel").id },
      { postId: posts[1].id, tagId: allTags.find(t => t.name === "coding").id },
      { postId: posts[1].id, tagId: allTags.find(t => t.name === "webdev").id },
      { postId: posts[2].id, tagId: allTags.find(t => t.name === "philosophy").id },
      { postId: posts[3].id, tagId: allTags.find(t => t.name === "criticism").id },
    ],
  });

  // Comments
  await prisma.comment.createMany({
    data: [
      {
        content: "Great post! Really enjoyed it.",
        postId: posts[0].id,
        authorId: author.id,
      },
      {
        content: "Very insightful!",
        postId: posts[1].id,
        authorId: admin.id,
      },
    ],
  });

  // Upvotes
  await prisma.upvote.createMany({
    data: [
      { postId: posts[0].id, userId: admin.id },
      { postId: posts[1].id, userId: author.id },
    ],
  });

  console.log("✅ Database seeded with sample data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
