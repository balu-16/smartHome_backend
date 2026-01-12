# SmartHome Backend - NestJS + MongoDB

A complete backend migration from Express.js + Supabase to NestJS + MongoDB with zero API regression.

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run in development mode
npm run start:dev

# Run in production mode
npm run build
npm run start:prod
```

## API Endpoints

### Health Check
- `GET /health` - Check server and database health

### Authentication (`/v1/auth`)
- `POST /v1/auth/send-otp` - Send OTP to phone number
- `POST /v1/auth/verify-otp` - Verify OTP and login/register
- `GET /v1/auth/profile/:sessionToken` - Get user profile
- `PUT /v1/auth/profile/:sessionToken` - Update user profile
- `POST /v1/auth/cleanup-otps` - Cleanup expired OTPs

### GPS Signal (`/v1/gps-signal`)
- `POST /v1/gps-signal/update-location` - Update device location
- `GET /v1/gps-signal/current-location` - Get current user location
- `GET /v1/gps-signal/:device_code` - Get GPS data for device
- `GET /v1/gps-signal/:device_code/history` - Get GPS history
- `GET /v1/gps-signal/device/:deviceCode/data` - Get GPS data for frontend
- `DELETE /v1/gps-signal/device/:deviceCode/clear` - Clear GPS data
- `POST /v1/gps-signal/device/:device_code/active` - Update device active status

### SMS (`/v1/sms`)
- `POST /v1/sms/send` - Send SMS with OTP

## MongoDB Collections

| Collection | Description |
|------------|-------------|
| `otp_verifications` | OTP storage and verification |
| `super_admins` | Super admin users |
| `employee_data` | Admin/employee users |
| `signup_users` | Customer users |
| `devices` | Device information |
| `gps_data` | GPS tracking data |
| `employee_login_logs` | Employee login logs |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smarthome` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `SMS_SECRET` | SMS API secret | - |
| `SMS_SENDER` | SMS sender ID | `NIGHAI` |
| `SMS_TEMPID` | SMS template ID | - |
| `SMS_ROUTE` | SMS route | `TA` |
| `SMS_MSGTYPE` | SMS message type | `1` |
| `SMS_BASE_URL` | SMS API base URL | - |
| `OTP_EXPIRY_MINUTES` | OTP expiry time | `10` |

## Project Structure

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/
│   │   ├── filters/
│   │   └── utils/
│   ├── database/
│   │   ├── database.module.ts
│   │   └── schemas/
│   └── modules/
│       ├── auth/
│       ├── gps/
│       ├── health/
│       └── sms/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Migration Notes

This backend is a 1:1 migration from the old Express.js + Supabase backend with:

- ✅ Same API routes
- ✅ Same request/response formats
- ✅ Same validation rules
- ✅ Same error messages
- ✅ Same auth flow

The frontend can switch to this backend by simply updating the `API_BASE_URL` in the config.

## Development

```bash
# Run tests
npm run test

# Run with watch mode
npm run start:dev

# Build for production
npm run build
```

## License

ISC
