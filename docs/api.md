# 📘 Blog API Documentation

This API powers the frontend and admin panel of the blog platform Epicode. It supports posts, tags, comments, upvotes, authentication, and image uploads.

## 🌐 Base URL

http://localhost:3000/api

---

## 🔐 Authentication

- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- JWT is returned and must be sent via `Authorization: Bearer <token>`

---

## 📝 Posts

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | /posts             | List posts with filters  |
| GET    | /posts/:id         | Get post details         |
| POST   | /posts             | Create post (with image) |
| PUT    | /posts/:id         | Update post              |
| DELETE | /posts/:id         | Delete post              |
| PATCH  | /posts/:id/publish | Toggle publish status    |

**Filters**: `?q=search&tags=literature,coding&published=true&latest=true&page=1&limit=10`

---

## 🏷️ Tags

| Method | Endpoint  | Description             |
| ------ | --------- | ----------------------- |
| GET    | /tags     | List all tags           |
| POST   | /tags     | Create tag (admin only) |
| PUT    | /tags/:id | Update tag (admin only) |
| DELETE | /tags/:id | Delete tag (admin only) |

---

## 💬 Comments

| Method | Endpoint                | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| GET    | /posts/:postId/comments | List comments (threaded)            |
| POST   | /posts/:postId/comments | Create comment (user or anonymous)  |
| PUT    | /comments/:id           | Edit comment (owner/admin/author)   |
| DELETE | /comments/:id           | Delete comment (owner/admin/author) |
| POST   | /comments/:id/react     | React to comment (like/love/upvote) |

---

## 👍 Upvotes

| Method | Endpoint           | Description                         |
| ------ | ------------------ | ----------------------------------- |
| POST   | /posts/:id/upvote  | Toggle upvote (user or anonId)      |
| GET    | /posts/:id/upvotes | Get upvote count + user/anon status |

---

## 🖼️ Image Upload

- Integrated into `POST /posts` and `PUT /posts/:id` via `multipart/form-data`
- Field name: `image`

---

## 🔐 Role Middleware

- `admin`: full access
- `author`: post-related actions
- `user`: comment, upvote
- `anonymous`: comment (name/email), upvote (anonId)

---

## 🔧 Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
PORT=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
ADMIN_URL=
```

## 🧬 Prisma Models
- User: id, name, email, password, role
- Post: id, title, content, image, published, authorId
- Tag, PostTag: many-to-many
- Comment: userId or anonymous
- CommentReaction: userId or anonId
- Upvote: userId or anonId
- Image: optional


---

## 🧪 Sample Postman Collection (JSON)

You can export this from Postman, but here's a minimal curl example:

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