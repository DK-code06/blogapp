# ✦ Luminary — Full-Stack Blog Platform

An Instagram-style blog platform built with React, TypeScript, Express, and MongoDB.

## Features
- 🔐 JWT Authentication (register / login)
- 📝 Create, Edit, Delete posts with image upload
- ❤️ Like posts and comments
- 💬 Nested comments with replies
- 👥 Follow / Unfollow users
- 🏠 Personalized feed (following posts)
- 🔭 Explore page with search
- 👤 Profile page with followers/following lists
- 🖼 Avatar upload & bio editing
- ✨ Animated dark UI with Playfair Display typography

## Tech Stack
**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Multer  
**Frontend:** React 18, TypeScript, React Router v6, Axios, Vite

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Edit MONGODB_URI and JWT_SECRET
npm run dev                  # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                  # Starts on http://localhost:3000
```

## Project Structure
```
blogapp/
├── backend/
│   ├── src/
│   │   ├── config/db.ts
│   │   ├── controllers/    authController, postController, userController, commentController
│   │   ├── middleware/     auth.ts (JWT)
│   │   ├── models/         User, Post, Comment
│   │   └── routes/         auth, posts, users, comments
│   ├── uploads/            (auto-created for image storage)
│   └── .env.example
└── frontend/
    └── src/
        ├── components/     Layout, PostCard
        ├── context/        AuthContext
        ├── pages/          AuthPage, FeedPage, ExplorePage, PostPage, ProfilePage, CreatePostPage
        ├── types/          index.ts
        └── utils/          api.ts
```

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`

### Posts
- `GET    /api/posts`              (all posts, ?feed=true for following feed)
- `POST   /api/posts`              (create, multipart/form-data)
- `GET    /api/posts/:id`
- `PUT    /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST   /api/posts/:id/like`
- `GET    /api/posts/user/:userId`

### Users
- `GET  /api/users/search?q=`
- `GET  /api/users/:id`
- `PUT  /api/users/profile`
- `POST /api/users/:id/follow`

### Comments
- `GET    /api/comments/post/:postId`
- `POST   /api/comments/post/:postId`
- `POST   /api/comments/:id/like`
- `DELETE /api/comments/:id`
