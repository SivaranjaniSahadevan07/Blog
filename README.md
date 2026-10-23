# Blog

[**Open the live demo →**](https://blog-frontend-woad-alpha.vercel.app)

Blog is a full-stack publishing platform where readers can discover, save, and discuss articles, editors can write posts, and administrators can manage categories and user roles. It was built to support a complete multi-role blogging workflow, from authentication through publishing and moderation.

## Preview

The live demo above is the current interactive preview. The repository does not yet include a static application screenshot.

## Features

- Browse articles and read individual posts
- Register, sign in, and manage a profile
- Create and edit posts as an editor
- Save articles and participate in discussions
- Manage categories and user roles as an administrator
- Refresh-token authentication with HTTP-only cookies

## Tech stack

- **Frontend:** React, React Router, Redux Toolkit, Axios, Bootstrap
- **Backend:** Node.js, Express
- **Data and services:** MongoDB with Mongoose, Redis
- **Authentication:** JSON Web Tokens, bcrypt
- **Deployment:** Vercel frontend

## Run locally

### Requirements

- Node.js and npm
- MongoDB
- Redis

### 1. Clone and install dependencies

```bash
git clone https://github.com/SivaranjaniSahadevan07/Blog.git
cd Blog
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Set `MONGODB_URL`, `REDIS_URL`, `JWT_ACCESS_TOKEN_SECRET`, and `JWT_REFRESH_TOKEN_SECRET` in `backend/.env`. Use new, unique random values for both JWT secrets. The example points to local MongoDB and Redis instances.

### 3. Configure the frontend

```bash
cp frontend/.env.example frontend/.env
```

Set `REACT_APP_API_URL` to the backend API URL if it differs from `http://localhost:5000/api`.

### 4. Start the backend and frontend

In separate terminals:

```bash
npm --prefix backend start
```

```bash
npm --prefix frontend start
```

The frontend runs at [http://localhost:3000](http://localhost:3000), and the API runs at [http://localhost:5000](http://localhost:5000).

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `MONGODB_URL` | Backend | MongoDB connection string |
| `REDIS_URL` | Backend | Redis connection string; defaults to local Redis |
| `JWT_ACCESS_TOKEN_SECRET` | Backend | Signs access tokens |
| `JWT_REFRESH_TOKEN_SECRET` | Backend | Signs refresh tokens |
| `REACT_APP_URL` | Backend | Allowed frontend origin for credentialed CORS |
| `PORT` | Backend | API port; defaults to `5000` |
| `REACT_APP_API_URL` | Frontend | Backend API base URL |

Never commit real `.env` files or credentials. The tracked `.env.example` files contain placeholders only.

## Tests and production build

Run the frontend test suite in non-interactive CI mode:

```bash
npm --prefix frontend test -- --watchAll=false
```

Create a production frontend build:

```bash
npm --prefix frontend run build
```
