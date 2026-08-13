# YouTube Clone

A full-stack YouTube clone built for the Web Development project.

## Features

- React + React Router frontend
- Axios API integration
- JWT authentication
- MongoDB + Mongoose backend
- Channel creation and public channel pages
- Video Create / Read / Update / Delete
- YouTube video player embedding
- Like / Dislike with persistent MongoDB state
- Subscribe / Unsubscribe with persistent MongoDB state
- Comments Create / Read / Update / Delete with owner protection
- Search videos by title/channel
- 6+ dynamic category filters
- Responsive Home, Channel and Watch pages

## Project structure

```text
YouTube-Clone/
├── client/
│   └── src/
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    └── routes/
```

## Run locally

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
PORT=5000
```

Start the server:

```bash
npm start
```

### 2. Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Optional demo data

To reset the video collection with the demo videos:

```bash
cd server
node seedVideos.js
```

Create/login to a user and create a channel before uploading your own videos.

## Submission note

Git commit history is intentionally not modified by the project code. Maintain the required Git/GitHub commit history separately in your repository.
