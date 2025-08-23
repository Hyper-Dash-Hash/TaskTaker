# TaskTaker - Teen Job Marketplace

A modern web platform connecting teenagers who need pocket money with adults who need help with odd jobs and tasks.

## 🚀 Features

### For Teens (13-19 years old)
- Browse available jobs in your area
- Apply for jobs with proposals and pricing
- Build your reputation with ratings and reviews
- Earn money for completed tasks
- Manage your job applications and schedule

### For Adults (18+ years old)
- Post jobs for various tasks (lawn care, housekeeping, pet care, etc.)
- Review teen applications and proposals
- Hire reliable teens for your tasks
- Rate and review teen workers
- Manage job postings and payments

### Platform Features
- Secure user authentication and verification
- Real-time job matching and notifications
- Rating and review system
- Location-based job search
- Secure payment processing (Stripe integration)
- Mobile-responsive design
- Messaging system between users

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.io** for real-time features
- **Stripe** for payment processing

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for form handling
- **Axios** for API communication

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd TaskTaker
```

### 2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/tasktaker

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL for CORS
CLIENT_URL=http://localhost:3000

# Stripe Configuration (optional for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Start MongoDB
If using local MongoDB:
```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### 5. Run the application
```bash
# Start both backend and frontend
npm run dev

# Or run them separately:
# Backend only
npm run server

# Frontend only
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
TaskTaker/
├── server/                 # Backend server
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── package.json           # Backend dependencies
└── README.md              # This file
```

## 🔧 Available Scripts

### Root Directory (Backend)
- `npm run dev` - Start both backend and frontend
- `npm run server` - Start backend server only
- `npm run start` - Start production server
- `npm run install-all` - Install all dependencies

### Client Directory (Frontend)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🌟 Key Features Implementation

### Authentication System
- JWT-based authentication
- Age verification for teens and adults
- Secure password hashing with bcrypt
- Protected routes with middleware

### Job Management
- CRUD operations for job postings
- Application system for teens
- Job status tracking
- Location-based job search

### User Management
- User profiles with ratings
- Verification system
- Skills and bio management
- Location tracking

### Security Features
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for session management
- Input validation on both frontend and backend
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Environment variables for sensitive data

## 🚧 Future Enhancements

- [ ] Real-time messaging system
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering
- [ ] Payment escrow system
- [ ] Background check integration
- [ ] Insurance coverage for jobs
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/TaskTaker/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the database solution
- All contributors and beta testers

---

**TaskTaker** - Building bridges between generations, one task at a time! 🚀
