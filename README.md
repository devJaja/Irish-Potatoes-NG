# Plateau Potatoes E-commerce Platform

A full-stack e-commerce website for selling Plateau potatoes in Nigeria.

## Features

- **Frontend**: React with TypeScript, Tailwind CSS, React Query
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT-based auth system
- **Payment**: Paystack integration ready
- **Real-time**: Stock tracking and order management
- **Mobile-first**: Responsive design

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
# Root level
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

2. **Environment Setup**:
```bash
# Copy and configure backend/.env
cp backend/.env.example backend/.env
```

3. **Database Setup**:
```bash
# Start MongoDB service
sudo systemctl start mongod

# Seed sample data
cd backend && node seedData.js
```

4. **Start Development**:
```bash
# From root directory - starts both frontend and backend
npm run dev
```

## Project Structure

```
plateau-potatoes/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Email utilities
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── public/
└── package.json
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - List products (with pagination/filters)
- `GET /api/products/:id` - Get single product
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Track order

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/plateau-potatoes
JWT_SECRET=your_jwt_secret_key_here
PAYSTACK_SECRET_KEY=your_paystack_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
SMS_API_KEY=your_sms_api_key
```

## Deployment

1. **Build frontend**:
```bash
cd frontend && npm run build
```

2. **Deploy to your preferred platform** (Heroku, DigitalOcean, AWS, etc.)

## Next Steps

- [ ] Implement Paystack payment integration
- [ ] Add SMS notifications
- [ ] Build admin dashboard
- [ ] Add order tracking page
- [ ] Implement wishlist functionality
- [ ] Add product reviews
- [ ] Set up email templates
- [ ] Add inventory management

## License

MIT License
