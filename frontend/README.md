# CreditTracker Frontend

A modern React frontend application for the CreditTracker API, built with Vite.

## Features

### Shop Users (Role 1)
- Dashboard with credit entry statistics
- Create, update, and delete credit entries
- Search and view customers
- Mark credit entries as paid/unpaid
- View credit entry details

### Customer Users (Role 2)
- Dashboard showing credit statistics
- View all personal credit entries
- Track paid and unpaid credits
- View credit entry details

## Tech Stack

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and dev server
- **CSS3** - Styling

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Register, OTP verification
│   │   ├── shop/           # Shop-specific components
│   │   ├── customer/       # Customer-specific components
│   │   └── shared/         # Shared components (Header, ProtectedRoute)
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication context and state
│   ├── services/
│   │   ├── api.js          # Axios instance configuration
│   │   └── apiService.js   # API service functions
│   ├── utils/
│   │   └── helpers.js      # Utility functions
│   ├── App.jsx             # Main app component with routing
│   └── main.jsx            # App entry point
├── public/                 # Static assets
├── .env                    # Environment variables
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- CreditTracker API running (default: http://localhost:5000)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your API URL:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### First-Time Setup

1. **Register as Customer**:
   - Go to the Register page
   - Fill in the registration form
   - Verify your email with the OTP sent

2. **Login**:
   - Use your username and password to login
   - You'll be redirected to your dashboard based on your role

### Shop User Flow

1. **Dashboard**: View statistics of all credit entries
2. **Credit Entries**: 
   - Click "Add New Entry" to create a credit entry
   - Search for a customer
   - Enter item details and amount
   - Mark as paid if already paid
3. **Customers**: Search and view customer information

### Customer User Flow

1. **Dashboard**: View your credit statistics
2. **My Credits**: View all your credit entries from various shops

## API Endpoints

The frontend connects to the following API endpoints:

**Authentication**:
- POST `/login` - User login
- POST `/user` - User registration
- POST `/users/verifyotp` - OTP verification

**User Management**:
- GET `/user/getcurrentuser` - Get current user
- GET `/user/{id}` - Get user by ID
- GET `/user/{searchText}` - Search customers

**Credit Entries**:
- POST `/creditentry` - Create credit entry
- PUT `/creditentry` - Update credit entry
- DELETE `/creditentry/{id}` - Delete credit entry
- GET `/creditentry/{id}` - Get single entry
- GET `/creditentry/getbyshopid` - Get entries by shop
- GET `/creditentry/getbycustomerid` - Get entries by customer

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## Development Notes

- JWT tokens are stored in localStorage
- Authentication state is managed via React Context
- Protected routes redirect to login if not authenticated
- Role-based access control is enforced on routes

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
