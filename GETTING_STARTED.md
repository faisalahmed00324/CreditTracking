# CreditTracker - Quick Start Guide

This guide will help you get the CreditTracker application up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:
- **.NET 9.0 SDK** - [Download](https://dotnet.microsoft.com/download)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **Node.js 18+** - [Download](https://nodejs.org/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/faisalahmed00324/CreditTracking.git
cd CreditTracking
```

## Step 2: Start MongoDB

Make sure MongoDB is running on your local machine:

```bash
# Default MongoDB connection: mongodb://localhost:27017
mongod
```

## Step 3: Configure Backend

1. Navigate to the API project:
   ```bash
   cd src/CreditTracker.Api
   ```

2. (Optional) Update `appsettings.json` if your MongoDB settings differ:
   ```json
   {
     "Database": {
       "Connection": "mongodb://localhost:27017",
       "Name": "CreditTrackerDb"
     },
     "JwtSettings": {
       "Secret": "your-secret-key-here",
       "Issuer": "CreditTrackerAPI",
       "Audience": "CreditTrackerClient"
     }
   }
   ```

## Step 4: Run Backend API

From the root directory:

```bash
dotnet build CreditTracker.sln
dotnet run --project src/CreditTracker.Api/CreditTracker.Api.csproj
```

The API will start on `http://localhost:5000`

You can access Swagger documentation at: `http://localhost:5000/swagger`

## Step 5: Configure Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment (if needed):
   ```bash
   cp .env.example .env
   ```
   
   The `.env` file should contain:
   ```
   VITE_API_URL=http://localhost:5000
   ```

## Step 6: Run Frontend

From the `frontend` directory:

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## Step 7: Create Your First Users

### Option 1: Using the Web Interface

1. **Register as a Customer**:
   - Open `http://localhost:5173` in your browser
   - Click "Register as Customer"
   - Fill in the registration form
   - You'll receive an OTP (check console/logs for development)
   - Verify with the OTP
   - Login with your credentials

2. **Create a Shop User** (requires manual database entry or admin panel):
   - For testing, you can use the API directly via Swagger
   - POST to `/user` with role = 1 for Shop user

### Option 2: Using Swagger API

1. Go to `http://localhost:5000/swagger`
2. Use POST `/user` endpoint to create users:
   
   **Customer User Example:**
   ```json
   {
     "user": {
       "id": "",
       "userName": "customer1",
       "password": "password123",
       "name": "John Doe",
       "icNoOrPassport": "123456789",
       "role": 2,
       "email": "customer@example.com",
       "address": "123 Main St",
       "latitude": "0",
       "longitude": "0"
     }
   }
   ```
   
   **Shop User Example:**
   ```json
   {
     "user": {
       "id": "",
       "userName": "shop1",
       "password": "password123",
       "name": "My Shop",
       "icNoOrPassport": "987654321",
       "role": 1,
       "email": "shop@example.com",
       "address": "456 Business Ave",
       "latitude": "0",
       "longitude": "0"
     }
   }
   ```

## Using the Application

### As a Shop User:

1. **Login** with your shop credentials
2. **Dashboard**: View statistics of all credit entries
3. **Credit Entries**:
   - Click "Add New Entry" to create a credit entry
   - Search for a customer by name or email
   - Enter item description and amount
   - Mark as paid if the payment is already made
   - Manage existing entries (update payment status, delete)
4. **Customers**: Search and view customer information

### As a Customer User:

1. **Login** with your customer credentials
2. **Dashboard**: View your credit statistics
   - Total credit entries
   - Total amount owed
   - Paid amount
   - Outstanding amount
3. **My Credits**: View all your credit entries from different shops
   - See item details
   - Check payment status
   - View payment dates

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
Error: MongoDB connection failed
```
- Ensure MongoDB is running: `mongod`
- Check connection string in `appsettings.json`

**Port Already in Use:**
```
Error: Address already in use
```
- Stop other applications using port 5000
- Or change the port in `Properties/launchSettings.json`

### Frontend Issues

**Cannot Connect to API:**
- Ensure backend is running on the correct port
- Check CORS settings in backend
- Verify `VITE_API_URL` in `.env`

**npm install fails:**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Default Test Data

After registration and login, you can test the following flows:

1. **Shop creates credit entry**:
   - Login as shop user
   - Go to Credit Entries
   - Add new entry for a customer
   - Mark as unpaid initially

2. **Customer views credits**:
   - Login as customer user
   - Go to My Credits
   - See the entry created by the shop

3. **Shop marks as paid**:
   - Login as shop user
   - Go to Credit Entries
   - Click "Mark Paid" on an unpaid entry
   - Payment date is automatically set

## Production Deployment

For production deployment:

1. **Backend**:
   - Update MongoDB connection string
   - Change JWT secret to a strong, random value
   - Configure appropriate CORS origins
   - Build: `dotnet publish -c Release`

2. **Frontend**:
   - Update `VITE_API_URL` to production API URL
   - Build: `npm run build`
   - Serve the `dist` folder using a web server (Nginx, Apache, etc.)

## Additional Resources

- **API Documentation**: http://localhost:5000/swagger
- **Backend README**: [Root README](../README.md)
- **Frontend README**: [Frontend README](../frontend/README.md)

## Support

For issues or questions:
- Create an issue on GitHub
- Check the Swagger documentation for API details
- Review logs in the backend console for errors

## Next Steps

- Create shop and customer users
- Add credit entries
- Test payment workflows
- Explore all features
- Customize as needed for your use case

Happy tracking! 🎉
