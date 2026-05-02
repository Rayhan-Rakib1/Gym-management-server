# 🏋️ GymFlow - Complete Gym Management System

<div align="center">

![GymFlow](https://img.shields.io/badge/GymFlow-Gym%20Management-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-ISC-orange?style=for-the-badge)

A comprehensive, production-ready gym management system with advanced features including AI-powered recommendations, payment gateway integration, and real-time analytics.

[Features](#-features) • [Tech Stack](#-technology-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Payment Integration](#-payment-integration)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**GymFlow** is a full-featured gym management system built with modern technologies. It provides complete functionality for managing gym operations including member management, trainer assignments, class scheduling, payment processing, progress tracking, and AI-powered workout recommendations.

### Why GymFlow?

- 🤖 **AI-Powered**: Intelligent workout and diet recommendations using OpenAI
- 💳 **Payment Ready**: Integrated SSLCommerz & Stripe payment gateways
- 📊 **Analytics**: Real-time dashboards and detailed reporting
- 🔐 **Secure**: Role-based access control with JWT authentication
- 📱 **Modern UI**: RESTful API ready for any frontend framework
- 🚀 **Production Ready**: Deployed on Vercel with PostgreSQL

---

## ✨ Features

### 👥 User Management

- **Multi-Role System**: Super Admin, Admin, Trainer, and Member roles
- **Authentication**: JWT-based secure authentication with refresh tokens
- **Profile Management**: Complete user profiles with image uploads (Cloudinary)
- **Password Security**: Bcrypt encryption with configurable salt rounds

### 🏋️ Member Management

- **Member Profiles**: Comprehensive fitness profiles with health metrics
- **Membership Plans**: Flexible plan management with various durations
- **Progress Tracking**: Body metrics, weight tracking, and progress photos
- **Goal Setting**: Personalized fitness goals and target tracking
- **Attendance System**: Check-in/check-out with history tracking

### 💪 Trainer Management

- **Trainer Profiles**: Specializations, certifications, and experience
- **Availability Management**: Schedule management and booking slots
- **Client Assignment**: Member-trainer pairing system
- **Performance Reviews**: Rating and review system
- **Workload Analytics**: Track trainer assignments and schedules

### 💳 Payment System

- **Multiple Gateways**: SSLCommerz (bKash, Nagad, Card) & Stripe integration
- **Payment Methods**: Online payments, cash, and card support
- **Invoice Generation**: Automatic PDF invoice creation
- **Payment History**: Complete transaction logs with filters
- **Refund Processing**: Automated refund through payment gateways
- **IPN Handling**: Real-time payment verification
- **Revenue Analytics**: Detailed financial reports and statistics

### 📅 Class & Booking Management

- **Class Scheduling**: Create and manage various class types (Yoga, HIIT, Zumba, etc.)
- **Recurring Classes**: Schedule recurring sessions by day of week
- **Booking System**: Member class reservations with capacity management
- **Waitlist Support**: Automatic waitlist when classes are full
- **Calendar Integration**: Full scheduling system with conflict detection

### 🎯 Workout & Diet Plans

- **Custom Workout Plans**: Trainer-created personalized workout routines
- **Exercise Library**: Comprehensive exercise database with instructions
- **Diet Plans**: Meal planning with macros and calorie tracking
- **Progress Photos**: Before/after photo tracking with multiple angles
- **Weekly Scheduling**: Day-wise workout and meal planning

### 🤖 AI Features (OpenAI Integration)

- **Smart Recommendations**: AI-powered workout and diet suggestions
- **Member Profiling**: Automatic fitness level assessment
- **Goal Analysis**: AI-based goal setting and achievement tracking
- **Workout Plan Generation**: Auto-generate personalized workout plans
- **Training Data Analysis**: Performance analytics and insights
- **Adaptive Learning**: System learns from member progress

### 📊 Analytics & Reporting

- **Member Analytics**: Active members, retention rates, growth metrics
- **Revenue Reports**: Income analysis, payment methods breakdown
- **Attendance Analytics**: Check-in patterns and peak hours
- **Trainer Performance**: Client satisfaction and workload metrics
- **Custom Reports**: Flexible reporting with date ranges and filters

### 🔍 Advanced Features

- **Global Search**: Search across members, trainers, classes, and more
- **Rate Limiting**: API protection against abuse
- **Email Notifications**: Automated emails for payments, bookings, etc.
- **File Upload**: Cloudinary integration for images and documents
- **Real-time Updates**: Live data synchronization
- **Multi-tenant Support**: Support for multiple gym locations

---

## 🛠️ Technology Stack

### Backend Framework

- **Node.js** (v18+) - Runtime environment
- **Express.js** (v5.1.0) - Web application framework
- **TypeScript** (v5.9.3) - Type-safe development

### Database & ORM

- **PostgreSQL** - Primary database
- **Prisma ORM** (v7.1.0) - Modern database toolkit
- **Neon Database** - Serverless PostgreSQL hosting

### Authentication & Security

- **JWT** (jsonwebtoken v9.0.2) - Token-based authentication
- **Bcrypt** (bcryptjs v3.0.3) - Password hashing
- **Helmet** (v8.1.0) - Security headers
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Express Rate Limit** (v8.2.1) - API rate limiting

### Payment Integration

- **SSLCommerz** - Bangladesh payment gateway (bKash, Nagad, Cards)
- **Stripe** - International payment processing
- **PDFKit** (v0.17.2) - Invoice PDF generation

### File Management

- **Cloudinary** (v2.8.0) - Image and file storage
- **Multer** (v2.0.2) - File upload handling

### AI & Machine Learning

- **OpenAI API** - GPT-powered recommendations and analysis

### Email Service

- **Nodemailer** (v7.0.11) - Email sending with SMTP

### Validation & Utilities

- **Zod** (v4.1.13) - Runtime type validation
- **Axios** (v1.13.2) - HTTP client
- **Dotenv** (v17.2.3) - Environment configuration
- **Cookie Parser** (v1.4.7) - Cookie handling

### Development Tools

- **ts-node-dev** (v2.0.0) - Development server with hot reload
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Deployment & Hosting

- **Vercel** - Serverless deployment platform
- **Neon** - PostgreSQL database hosting
- **Git** - Version control

---

## 🏗️ Architecture

### API Design Pattern

- **RESTful API** - Standard HTTP methods (GET, POST, PUT, DELETE)
- **MVC Pattern** - Model-View-Controller architecture
- **Service Layer** - Business logic separation
- **Middleware Pattern** - Authentication, authorization, validation
- **Error Handling** - Centralized error management

### Database Design

- **Multi-file Prisma Schema** - Modular schema organization
- **Relational Database** - Normalized PostgreSQL structure
- **Migrations** - Version-controlled database changes
- **Indexes** - Optimized query performance
- **Foreign Keys** - Data integrity enforcement

### Security Features

- **Role-Based Access Control (RBAC)** - 4 user roles with permissions
- **JWT Authentication** - Stateless token-based auth
- **Refresh Token Rotation** - Enhanced security
- **Rate Limiting** - DDoS protection
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Prisma ORM protection
- **XSS Protection** - Helmet middleware
- **CORS Configuration** - Controlled cross-origin access

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14.0
- **npm** or **yarn**
- **Git**

### Step 1: Clone Repository

```bash
git clone https://github.com/abusaiyedjoy/gym-flow-server.git
cd gym-flow-server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following variables (see [Environment Variables](#-environment-variables) section):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/gymflow
FRONTEND_URL=http://localhost:3000
# ... (see full list below)
```

### Step 4: Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed super admin (automatic on first run)
npm run dev
```

### Step 5: Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Step 6: Verify Installation

```bash
curl http://localhost:5000/
```

Expected response:

```json
{
  "message": "Server is running..",
  "environment": "development",
  "uptime": "12.45 sec",
  "timeStamp": "2025-12-12T10:30:00.000Z"
}
```

---

## 🔐 Environment Variables

### Required Variables

#### Server Configuration

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Database

```env
DATABASE_URL=postgresql://user:password@localhost:5432/gymflow?schema=public
```

#### JWT Authentication

```env
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

#### Security

```env
BCRYPT_SALTROUNDS=12
```

#### Super Admin (Auto-created on first run)

```env
SUPER_ADMIN_NAME=Admin Name
SUPER_ADMIN_EMAIL=admin@gymflow.com
SUPER_ADMIN_PASSWORD=SecurePassword123!
SUPER_ADMIN_PHONE=+1234567890
```

#### Email (SMTP)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@gymflow.com
EMAIL_FROM_NAME=GymFlow Gym
```

#### Cloudinary (File Storage)

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### OpenAI (AI Features)

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

#### SSLCommerz Payment Gateway

```env
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_LIVE=false
SSLCOMMERZ_IS_SANDBOX=true
SSLCOMMERZ_SUCCESS_URL=http://localhost:5000/api/v1/payment/sslcommerz/success
SSLCOMMERZ_FAIL_URL=http://localhost:5000/api/v1/payment/sslcommerz/fail
SSLCOMMERZ_CANCEL_URL=http://localhost:5000/api/v1/payment/sslcommerz/cancel
SSLCOMMERZ_IPN_URL=http://localhost:5000/api/v1/payment/sslcommerz/ipn
```

#### Stripe Payment Gateway (Optional)

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
```

### Getting API Keys

#### OpenAI API Key

1. Visit https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create new secret key

#### SSLCommerz Sandbox

1. Visit https://developer.sslcommerz.com/registration/
2. Register for sandbox account
3. Get Store ID and Password from dashboard

#### Cloudinary

1. Visit https://cloudinary.com/
2. Sign up for free account
3. Get credentials from dashboard

#### Gmail SMTP (App Password)

1. Enable 2-factor authentication
2. Go to Google Account → Security → App Passwords
3. Generate app password for "Mail"

---

## 💾 Database Setup

### Local PostgreSQL Setup

#### Install PostgreSQL

**Windows:**

```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey
choco install postgresql
```

**macOS:**

```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gymflow;

# Create user (optional)
CREATE USER gymflow_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gymflow TO gymflow_user;

# Exit
\q
```

#### Update DATABASE_URL

```env
DATABASE_URL=postgresql://gymflow_user:your_password@localhost:5432/gymflow
```

### Cloud Database (Neon)

1. Visit https://neon.tech/
2. Create new project
3. Copy connection string
4. Update DATABASE_URL in `.env`

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio
```

---

## 💻 Usage

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing APIs

#### Using cURL

```bash
# Health check
curl http://localhost:5000/

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "phone": "+1234567890",
    "role": "MEMBER"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

#### Using Postman

1. Import the API collection (create from documentation)
2. Set base URL: `http://localhost:5000/api/v1`
3. Add Authorization header with JWT token

---

## 📚 API Documentation

### Base URL

```
Local: http://localhost:5000/api/v1
Production: https://gym-flow-server.vercel.app/api/v1
```

### Authentication

All protected routes require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints Overview

#### Authentication (`/auth`)

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Forgot password

#### Users (`/user`)

- `GET /user` - Get all users (Admin)
- `GET /user/:id` - Get user by ID
- `PUT /user/:id` - Update user
- `DELETE /user/:id` - Delete user

#### Members (`/member`)

- `GET /member` - Get all members
- `GET /member/:id` - Get member details
- `POST /member` - Create member
- `PUT /member/:id` - Update member
- `DELETE /member/:id` - Delete member

#### Trainers (`/trainer`)

- `GET /trainer` - Get all trainers
- `GET /trainer/:id` - Get trainer details
- `POST /trainer` - Create trainer
- `PUT /trainer/:id` - Update trainer
- `GET /trainer/:id/schedule` - Get trainer schedule

#### Payments (`/payment`)

- `POST /payment/initiate` - Initiate online payment
- `POST /payment` - Manual payment entry (Admin)
- `GET /payment` - Get all payments (Admin)
- `GET /payment/member/:memberId` - Get member payments
- `GET /payment/stats` - Payment statistics
- `GET /payment/:id/invoice` - Download invoice PDF
- `POST /payment/:id/refund` - Process refund (Admin)

#### Membership Plans (`/plan`)

- `GET /plan` - Get all plans
- `GET /plan/:id` - Get plan details
- `POST /plan` - Create plan (Admin)
- `PUT /plan/:id` - Update plan (Admin)
- `DELETE /plan/:id` - Delete plan (Admin)

#### Classes (`/class`)

- `GET /class` - Get all classes
- `GET /class/:id` - Get class details
- `POST /class` - Create class (Admin/Trainer)
- `PUT /class/:id` - Update class
- `DELETE /class/:id` - Delete class

#### Bookings (`/booking`)

- `GET /booking` - Get all bookings
- `POST /booking` - Create booking
- `PUT /booking/:id` - Update booking
- `DELETE /booking/:id` - Cancel booking

#### Workout Plans (`/workout`)

- `GET /workout` - Get all workout plans
- `GET /workout/:id` - Get workout details
- `POST /workout` - Create workout plan (Trainer)
- `PUT /workout/:id` - Update workout plan
- `DELETE /workout/:id` - Delete workout plan

#### Progress Tracking (`/progress`)

- `GET /progress/member/:memberId` - Get member progress
- `POST /progress/metrics` - Add body metrics
- `POST /progress/photos` - Upload progress photos
- `GET /progress/stats/:memberId` - Progress statistics

#### Attendance (`/attendance`)

- `GET /attendance` - Get all attendance
- `POST /attendance/check-in` - Member check-in
- `POST /attendance/check-out` - Member check-out
- `GET /attendance/member/:memberId` - Member attendance history

#### AI Recommendations (`/ai`)

- `POST /ai/recommend` - Get AI workout recommendations
- `POST /ai/analyze` - Analyze member data
- `POST /ai/generate-plan` - Generate workout plan

#### Reports (`/reports`)

- `GET /reports/members` - Member reports
- `GET /reports/revenue` - Revenue reports
- `GET /reports/attendance` - Attendance reports

#### Search (`/search`)

- `GET /search?q=query` - Global search

### Response Format

#### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errorMessages": [
    {
      "path": "field_name",
      "message": "Validation error"
    }
  ]
}
```

---

## 💳 Payment Integration

### SSLCommerz Setup

1. **Get Credentials**

   - Sandbox: https://developer.sslcommerz.com/registration/
   - Production: https://sslcommerz.com/

2. **Configure Environment**

   ```env
   SSLCOMMERZ_STORE_ID=your_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_password
   SSLCOMMERZ_IS_LIVE=false
   ```

3. **Update Callback URLs**
   - Success: `YOUR_DOMAIN/api/v1/payment/sslcommerz/success`
   - Fail: `YOUR_DOMAIN/api/v1/payment/sslcommerz/fail`
   - Cancel: `YOUR_DOMAIN/api/v1/payment/sslcommerz/cancel`
   - IPN: `YOUR_DOMAIN/api/v1/payment/sslcommerz/ipn`

### Payment Flow

1. **Initiate Payment**

   ```javascript
   POST /api/v1/payment/initiate
   {
     "memberId": "uuid",
     "planId": "uuid",
     "paymentMethod": "SSLCOMMERZ"
   }
   ```

2. **Redirect to Gateway**

   - User completes payment on SSLCommerz
   - Supports bKash, Nagad, Cards, etc.

3. **Callback Processing**

   - System receives payment status
   - Activates membership
   - Generates invoice
   - Sends email notification

4. **Invoice Download**
   ```javascript
   GET / api / v1 / payment / { paymentId } / invoice;
   ```

---

## 🚀 Deployment

### Vercel Deployment

#### Prerequisites

- Vercel account
- Vercel CLI installed: `npm i -g vercel`

#### Step 1: Configure Environment Variables

Add all environment variables in Vercel Dashboard:

- Project Settings → Environment Variables
- Add all variables from `.env` file

#### Step 2: Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Step 3: Update URLs

Update callback URLs to production domain:

```env
SSLCOMMERZ_SUCCESS_URL=https://your-domain.vercel.app/api/v1/payment/sslcommerz/success
SSLCOMMERZ_FAIL_URL=https://your-domain.vercel.app/api/v1/payment/sslcommerz/fail
SSLCOMMERZ_CANCEL_URL=https://your-domain.vercel.app/api/v1/payment/sslcommerz/cancel
SSLCOMMERZ_IPN_URL=https://your-domain.vercel.app/api/v1/payment/sslcommerz/ipn
```

### Database Migration

```bash
# Deploy migrations
npx prisma migrate deploy
```

### Monitoring

- Check logs: Vercel Dashboard → Deployments → Logs
- Monitor performance: Vercel Analytics
- Error tracking: Integrate Sentry (optional)

---

## 📁 Project Structure

```
gym-flow-server/
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma           # Main schema file
│   ├── ai.prisma              # AI-related models
│   ├── enum.prisma            # Enum definitions
│   ├── member.prisma          # Member models
│   ├── payment.prisma         # Payment models
│   ├── trainer.prisma         # Trainer models
│   ├── user.prisma            # User models
│   ├── workout.prisma         # Workout models
│   └── migrations/            # Database migrations
│
├── src/
│   ├── app/
│   │   ├── errors/            # Custom error classes
│   │   ├── interfaces/        # TypeScript interfaces
│   │   ├── middlewares/       # Express middlewares
│   │   │   ├── auth.ts        # Authentication
│   │   │   ├── authorize.ts   # Authorization
│   │   │   ├── rateLimiter.ts # Rate limiting
│   │   │   └── validateRequest.ts # Validation
│   │   │
│   │   ├── modules/           # Feature modules
│   │   │   ├── AI/           # AI recommendations
│   │   │   ├── attendance/   # Attendance tracking
│   │   │   ├── auth/         # Authentication
│   │   │   ├── Booking/      # Class bookings
│   │   │   ├── Class/        # Class management
│   │   │   ├── member/       # Member management
│   │   │   ├── membership/   # Membership plans
│   │   │   ├── payment/      # Payment processing
│   │   │   ├── ProgressTracking/ # Progress tracking
│   │   │   ├── reports/      # Reporting
│   │   │   ├── Review/       # Reviews & ratings
│   │   │   ├── search/       # Global search
│   │   │   ├── trainer/      # Trainer management
│   │   │   ├── upload/       # File uploads
│   │   │   ├── user/         # User management
│   │   │   └── Workout/      # Workout plans
│   │   │
│   │   └── routes/           # API route aggregation
│   │       └── index.ts
│   │
│   ├── config/               # Configuration
│   │   └── index.ts         # Environment config
│   │
│   ├── helpers/             # Helper functions
│   │   ├── fileUploader.ts  # File upload handler
│   │   └── jwtHelpers.ts    # JWT utilities
│   │
│   ├── shared/              # Shared utilities
│   │   ├── prisma.ts        # Prisma client
│   │   └── sendResponse.ts  # Response formatter
│   │
│   ├── types/               # TypeScript types
│   │   └── express/         # Express type extensions
│   │
│   ├── utils/               # Utility functions
│   │   ├── catchAsync.ts    # Async error handler
│   │   ├── idGenerator.ts   # ID generation
│   │   ├── invoiceGenerator.ts # Invoice numbers
│   │   ├── invoicePdfGenerator.ts # PDF generation
│   │   ├── openai.ts        # OpenAI integration
│   │   ├── sendEmail.ts     # Email service
│   │   ├── sendResponse.ts  # Response helper
│   │   ├── sslcommerz.ts    # SSLCommerz integration
│   │   └── seedSuperAdmin.ts # Super admin seeding
│   │
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
│
├── uploads/                # Uploaded files (local)
│   └── invoices/          # Generated invoices
│
├── .env                   # Environment variables
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── .vercelignore       # Vercel ignore rules
├── package.json        # Dependencies
├── prisma.config.ts   # Prisma configuration
├── tsconfig.json      # TypeScript config
├── vercel.json        # Vercel config
├── VERCEL_DEPLOYMENT.md # Deployment guide
└── README.md          # This file
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines

### Development Workflow

1. **Fork the Repository**

   ```bash
   # Click "Fork" button on GitHub
   git clone https://github.com/YOUR_USERNAME/gym-flow-server.git
   cd gym-flow-server
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**

   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Commit message format:

   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Code style
   - `refactor:` Code refactoring
   - `test:` Tests
   - `chore:` Maintenance

5. **Push to GitHub**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to original repository
   - Click "New Pull Request"
   - Describe your changes

### Code Style Guidelines

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint

# Format code
npm run format
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Rakibul Hasan**

- Email: rayhanrakib114@gmail.com
- GitHub: [@Rayhan-Rakib1](https://github.com/Rayhan-Rakib1)

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [OpenAI](https://openai.com/) - AI capabilities
- [SSLCommerz](https://sslcommerz.com/) - Payment gateway
- [Vercel](https://vercel.com/) - Hosting platform
- [Cloudinary](https://cloudinary.com/) - Image hosting

---

## 📞 Support

For support, email abusaiyedjoy1@gmail.com or create an issue on GitHub.

---

## 🔗 Links

- **Repository**: https://github.com/Rayhan-Rakib1/gym-management-server
- **Issues**: https://github.com/Rayhan-Rakib1/gym-management-server/issues
- **Production**: https://gym-flow-server.vercel.app

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made with ❤️ by Rakibul Hasan

</div>