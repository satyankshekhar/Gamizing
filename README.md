# Gamizing

A scalable, modern authentication system and application boilerplate built with the MERN stack (MongoDB, Express.js, React, Node.js). 

Gamizing is built with modern security best practices, a beautiful dark-mode first UI using TailwindCSS, and is designed for high scalability.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Axios, React Router DOM
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB (v4.4+)
- **Authentication**: Stateless JWT Auth (HTTP-only cookies for refresh tokens)

---

## 🚀 How to Run on Windows

Follow these instructions to get the Gamizing project up and running locally on a Windows machine.

### Prerequisites
Before you start, make sure you have the following installed on your PC:
1. [Node.js](https://nodejs.org/en/download/) (v18 or higher recommended)
2. [Git](https://git-scm.com/download/win)
3. **MongoDB**: You can run MongoDB locally using either:
   - [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Recommended for beginners)
   - [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) (If you prefer running via containers)

### Step 1: Clone the Repository
Open Command Prompt, PowerShell, or Git Bash and clone the repository:
```cmd
git clone https://github.com/YOUR-USERNAME/Gamizing.git
cd Gamizing
```
*(Replace `YOUR-USERNAME` with the actual GitHub username where the repository is hosted)*

### Step 2: Set Up the Backend
1. Open a terminal and navigate to the backend folder:
   ```cmd
   cd backend
   ```
2. Install the necessary Node dependencies:
   ```cmd
   npm install
   ```
3. Create an environment variables file. Inside the `backend` folder, create a new file named `.env` and add the following configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/gamizing
   JWT_ACCESS_SECRET=your_super_secret_access_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=30d
   CLIENT_URL=http://localhost:5173
   BCRYPT_SALT_ROUNDS=12
   NODE_ENV=development
   ```
4. **Start the Database**: 
   - If using **MongoDB Community Server**: Simply ensure the MongoDB service is running in Windows Services.
   - If using **Docker**: Run `docker run -d -p 27017:27017 --name gamizing-mongo mongo:4.4`
5. Start the backend development server:
   ```cmd
   npm run dev
   ```
   *You should see a message saying "MongoDB Connected Successfully" and "Server running in development mode on port 5000". Leave this terminal window open.*

### Step 3: Set Up the Frontend
1. Open a **new** terminal window (keep the backend one running) and navigate to the frontend folder:
   ```cmd
   cd Gamizing/frontend
   ```
2. Install the frontend dependencies:
   ```cmd
   npm install
   ```
3. Start the Vite development server:
   ```cmd
   npm run dev
   ```
   *The frontend should now be running on `http://localhost:5173`.*

### Step 4: Try it out!
Open your browser and navigate to `http://localhost:5173`. You will see the Gamizing landing page. Click **Register** to create a new account, and it will safely store your data in your local MongoDB instance!

---

### Troubleshooting
- **`ECONNREFUSED` on Backend**: This means your backend cannot talk to MongoDB. Make sure MongoDB is running on your machine and listening on port `27017`.
- **`next is not a function` during registration**: If you upgraded Mongoose manually, note that Mongoose 8.x+ drops support for `next()` in Hooks. Our codebase uses the modern Promise-based hooks to prevent this!
- **CORS Errors on Frontend**: Make sure you are accessing the frontend at `http://localhost:5173` exactly as specified in the backend's `CLIENT_URL` environment variable.
