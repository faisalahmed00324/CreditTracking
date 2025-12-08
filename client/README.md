# Credit Tracker - React Frontend

A modern React frontend application for the Credit Tracker system, built with Vite, Chakra UI, and React Router.

## Features

- **Authentication**: Login and registration with OTP verification
- **Role-based Access**: Separate dashboards for Shop owners and Customers
- **Shop Dashboard**: 
  - Create and manage credit entries
  - Search and select customers
  - Mark entries as paid
  - View summary statistics
- **Customer Dashboard**: 
  - View all credit entries
  - Track outstanding balance
  - See payment history

## Technologies

- **React 19** - UI library
- **Vite** - Build tool and development server
- **Chakra UI v3** - Component library
- **React Router v7** - Routing
- **Axios** - HTTP client
- **Framer Motion** - Animations (via Chakra UI)

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see main README)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the API URL:
```
VITE_API_BASE_URL=http://localhost:5000
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # Chakra UI custom components
│   │   ├── Layout.jsx  # Main layout wrapper
│   │   └── ProtectedRoute.jsx
│   ├── contexts/       # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ShopDashboard.jsx
│   │   └── CustomerDashboard.jsx
│   ├── services/       # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── creditEntryService.js
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── .env.example        # Environment variables template
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Roles

### Shop (Role: 0)
- Can create credit entries for customers
- Can mark entries as paid
- Can delete entries
- Can search for customers

### Customer (Role: 1)
- Can view their credit entries
- Can see outstanding balance
- Can track payment history

## API Integration

The frontend communicates with the backend API through these endpoints:

- `POST /login` - User authentication
- `POST /user` - User registration
- `POST /verifyotp` - OTP verification
- `GET /user/current` - Get current user details
- `GET /user/search` - Search customers
- `POST /creditentry` - Create credit entry
- `GET /creditentry/shop/{shopId}` - Get shop's entries
- `GET /creditentry/customer/{customerId}` - Get customer's entries
- `PUT /creditentry/{id}` - Update credit entry
- `DELETE /creditentry/{id}` - Delete credit entry

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000` |

## License

MIT
