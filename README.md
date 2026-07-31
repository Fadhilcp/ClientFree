# Clientfree 🚀

Clientfree is a comprehensive freelance marketplace platform that connects clients with skilled freelancers. It features a robust bidding system, milestone-based payments, real-time communication, and an administrative dashboard to manage escrow and platform operations.

## ✨ Core Features

The platform operates across three primary roles: **Client**, **Freelancer**, and **Admin**.

### 💼 For Clients

* **AI-Powered Job Posting:** Create and publish detailed job requirements effortlessly using the Gemini API to auto-fill job forms and descriptions.
* **Hiring & Management:** Review bids, hire freelancers, and manage ongoing projects.
* **Milestone Tracking:** Break down large projects into manageable tasks with specific budgets attached to each milestone, ensuring trust and transparency between both parties.
* **Task Approval:** Review submitted work and approve milestones for payment release.

### 🧑‍💻 For Freelancers

* **Job Discovery:** Browse and filter available job postings.
* **Bidding System:** Apply for jobs with customized proposals. Includes an **optional bid upgrade** to highlight proposals and stand out to clients.
* **Task Submission:** Submit completed work directly through the client's established milestones.

### 🛡️ For Admins (Escrow & Moderation)

* **Payment Release:** Act as an escrow agent. Once a client approves a milestone, the admin safely releases the funds to the freelancer.
* **Platform Management:** Oversee user management, control the platform's skill catalog, and manage subscription tiers.
* **Dispute Resolution:** Step in to mediate and resolve disputes raised by either clients or freelancers.
* **Push Notifications:** Send live announcements and notifications globally or to specific users.

### 🔄 Shared Features

* **Real-time Chat & Video:** Seamless communication between clients and hired freelancers through integrated live text chat and WebRTC video calls.
* **Live Notifications:** Instant, real-time alerts for messages, bids, payments, and system updates.
* **Flexible Subscriptions:** Dynamic subscription management allowing for highly flexible feature access and pricing amounts.
* **Secure Payments:** Integrated with **both Stripe and Razorpay** to provide versatile, secure global and local transaction options.

---

## 🛠️ Tech Stack & Integrations

Clientfree is built on a complete **MERN stack**, written entirely in **TypeScript** across both the frontend and backend to ensure type safety and scalable architecture.

* **Frontend:** React (via Vite) with TypeScript
* **Backend:** Node.js & Express with TypeScript
* **Database & Caching:** MongoDB, Redis
* **Real-Time & Communication:** Socket.io (live notifications/chat), WebRTC (video calls)
* **Cloud Storage:** AWS S3, Cloudinary
* **Payments:** Stripe, Razorpay
* **Authentication:** JWT, Google OAuth
* **AI Integrations:** Google Gemini (for job form generation)

## ⚙️ DevOps & Deployment

* **Containerization:** The backend infrastructure is fully containerized using **Docker**, ensuring consistency across development, testing, and production environments.
* **CI/CD Pipeline:** Automated workflows are managed via **GitHub Actions**. The pipeline handles code linting, building, and seamless deployments to the production server upon merging to the main branch.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI
* [Redis](https://redis.io/) running locally or a remote instance

### 1. Clone the repository
```bash
git clone [https://github.com/Fadhilcp/clientfree.git](https://github.com/Fadhilcp/clientfree.git)
cd clientfree

```

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
# Navigate to backend folder (adjust path if different)
cd backend 

# Install dependencies
npm install

# Start the development server
npm run dev

```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
# Navigate to frontend folder (adjust path if different)
cd frontend 

# Install dependencies
npm install

# Start the development server
npm run dev

```

---

## ⚙️ Environment Variables

You need to create a `.env` file in both the `backend` and `frontend` directories.

### Backend (`backend/.env`)

Create a `.env` file in your backend root and populate the missing secrets:

```env
# Server & CORS
PORT=3000
CORS_ORIGIN=http://localhost:5173
CORS_METHODS=GET,POST,PUT,DELETE,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization
CORS_CREDENTIALS=true

# Database & Cache
MONGO_DB=your_mongodb_connection_string
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

# Authentication & Cookies
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
COOKIE_SECURE=
COOKIE_SAMESITE=
REFRESH_COOKIE_MAX_AGE=
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
SENDER_EMAIL=your_sender_email
PASSKEY=your_email_passkey

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Storage (AWS & Cloudinary)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_aws_bucket_name
AWS_SIGNED_URL_EXPIRES_IN=
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Integrations
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

# Logging & Misc
FRONTEND_URL=http://localhost:5173
LOG_RETENTION_DAYS=
LOG_MAX_FILE_SIZE=
LOG_DIR=
LOG_LEVEL=

```

### Frontend (`frontend/.env`)

Create a `.env` file in your frontend root:

```env
VITE_API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api

VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
