# 🔧 EpicCode Blog Backend

This is the backend API for the EpicCode blog platform. It powers the frontend and admin panel, supporting posts, tags, comments, upvotes, authentication, and image uploads.

---

## 🚀 Tech Stack

- **Express.js** — RESTful API server  
- **Prisma** — ORM for PostgreSQL  
- **PostgreSQL** — Relational database  
- **JWT** — Authentication via tokens  
- **Multer + Cloudinary** — Image upload handling  
- **CORS + Rate Limiting** — Security and access control  

---

## 📦 Features

- User roles: `admin`, `author`, `user`, and anonymous support  
- Post CRUD with image upload and tag filtering  
- Comment system with threaded replies and reactions  
- Upvote system (one per user or anonymous client)  
- Tag management (admin only)  
- Role-based route protection  
- Search, pagination, and filtering  
- Anonymous comment and upvote support  
- Integrated image upload via Cloudinary or local storage  

---

## 🧬 Prisma Models

- `User`: id, name, email, password, role  
- `Post`: title, content, image, published, authorId, tags  
- `Tag`, `PostTag`: many-to-many  
- `Comment`: userId or anonymous, parentId for replies  
- `CommentReaction`: userId or anonId  
- `Upvote`: userId or anonId  
- `Image`: optional (for future multi-image support)  

---

## 🔐 Environment Variables

Create a `.env` file using `.env.example`:

```env
DATABASE_URL=
JWT_SECRET=
PORT=3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
ADMIN_URL=
```

---

## 🧪 Getting Started

```bash
git clone https://github.com/Mainul-Islam-Nirob/epiCode-backend
cd epiCode-backend
npm install
```

---

## 🧬 Prisma Setup

```bash
npx prisma migrate dev --name init
npm run prisma:seed
npx prisma studio
```

---

## 🏃 Run Locally

```bash
npm run dev
```

---

## 📘 API Documentation

See `docs/api.md` for full endpoint reference.

---

## 🧪 Sample Curl Commands

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Mainul","email":"mainul@example.com","password":"securepass"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mainul@example.com","password":"securepass"}'

# Create Post (with JWT)
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <your_token>" \
  -F "title=My First Post" \
  -F "content=This is the content" \
  -F "tags[]=literature" \
  -F "image=@/path/to/image.jpg"
```

---

## Author

- Facebook - [@mainul islam](https://web.facebook.com/mmmuinul.islam/)
- LinkedIn - [@mainul islam](https://www.linkedin.com/in/mainul-islam-nirob/)
- Twitter - [@mainul](https://twitter.com/Mainuli96601040)
- Github - [@mainul](https://github.com/Mainul-Islam-Nirob)

---