# AlgoRiddle - Collaborative Coding Platform

A real-time collaborative platform for practicing Data Structures and Algorithms with voice chat, shared whiteboard, and live code editing.

## Features

- 🎯 Real-time collaborative code editor
- 🎨 Shared whiteboard for brainstorming
- 🎤 Voice chat with WebRTC
- 📝 DSA questions with test cases
- 👥 Multi-user rooms
- 🔄 Live code synchronization
- ✅ Automatic test case evaluation

## Tech Stack

### Frontend
- React 19
- Vite
- TailwindCSS
- CodeMirror
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB (Mongoose)
- WebRTC

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Modern browser with WebRTC support

### Quick Start (Local Development)

1. Clone the repository:
```bash
git clone https://github.com/Anupkumarpandey1/college_project.git
cd college_project
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Configure environment variables:

Create `server/.env` (copy from `server/.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
```

Create `client/.env` (copy from `client/.env.example`):
```env
VITE_BACKEND_URL=http://localhost:5000
```

5. Seed the database with questions (optional):
```bash
cd server
node seed.js
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. Start the frontend development server:
```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

---

## 🚀 Deployment

Want to deploy this project for free? Check out our comprehensive deployment guide:

**[📖 DEPLOY.md - Step-by-Step Deployment Guide](./DEPLOY.md)**

The guide covers:
- MongoDB Atlas setup (free database)
- Render deployment (free backend hosting)
- Vercel deployment (free frontend hosting)
- Environment configuration
- Troubleshooting tips

**Total Cost: $0/month** ✨

## Usage

1. Create a new practice session from the home page
2. Share the room URL with collaborators
3. Join with a unique username
4. Use the code editor, whiteboard, and voice chat to collaborate
5. Run code to evaluate against test cases
6. Solve questions to unlock the next one

## Project Structure

```
college_project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── socket/        # Socket.IO configuration
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── socket/           # Socket.IO handlers
│   └── package.json
└── README.md
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
