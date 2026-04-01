# All Things - React + Node.js Version

This is the React + Node.js rewrite of the Laravel application.

## Project Structure

```
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── server/          # Node.js backend (Express)
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
```

## Setup Instructions

### 1. Configure Environment Variables

Copy the example env file for the server:
```bash
cd server
copy .env.example .env
```

Edit `server/.env` with your MySQL credentials:
```
PORT=5000
DB_HOST=your-mysql-host
DB_DATABASE=your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run the Application

In two separate terminals:

Terminal 1 - Start the backend:
```bash
cd server
npm run dev
```

Terminal 2 - Start the frontend:
```bash
cd client
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Features

- **Public Pages**: Home, About, Clients listing, Client detail
- **Authentication**: Register, Login, JWT-based auth
- **Contact Form**: Authenticated users can submit contact messages
- **Admin Panel**: Dashboard, Messages management, Clients CRUD
  - Login: `/admin/login` (default: admin / admin123)

## Database

The app uses MySQL with Sequelize ORM. Tables are auto-created on first run:
- `users` - User accounts
- `clients` - Business clients
- `contact_messages` - Contact form submissions

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios
- Vite

**Backend:**
- Node.js
- Express
- Sequelize (MySQL)
- JWT Authentication
- Express Session (for admin)
