# GPS Backend with OTP Authentication (TypeScript)

A TypeScript-based real GPS tracking backend with SMS OTP authentication using Supabase and the same SMS API as NestJSAuthGuard-main.

## Features

- **TypeScript**: Full TypeScript implementation for better type safety
- **OTP Authentication**: SMS-based OTP authentication using your existing SMS API
- **Real GPS Tracking**: Tracks real GPS coordinates from user devices
- **Supabase Integration**: Uses your existing Supabase database
- **JWT Authentication**: Secure JWT token-based authentication
- **Real-time Location**: Uses actual GPS coordinates from user devices

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   The `.env` file is already configured with your Supabase credentials and settings:
   - Supabase URL and API key
   - JWT secret for token generation
   - Test phone number: `8639398878`
   - Your home area GPS coordinates

3. **Build the Project**:
   ```bash
   npm run build
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev:ts
   ```

## API Endpoints

### Authentication
- `POST /v1/auth/send-otp` - Send OTP to phone number
- `POST /v1/auth/verify-otp` - Verify OTP and get JWT token
- `POST /v1/auth/register` - Register new user
- `GET /v1/auth/profile` - Get user profile (requires JWT)
- `PUT /v1/auth/profile` - Update user profile (requires JWT)
- `POST /v1/auth/signout` - Sign out user

### GPS Tracking
- `POST /v1/gps-signal/:deviceCode` - Update GPS location for device
- `GET /v1/gps-signal/:deviceCode/latest` - Get latest GPS location
- `GET /v1/gps-signal/:deviceCode/history` - Get GPS history
- `POST /v1/gps-signal/update-location` - Update current user location
- `GET /v1/gps-signal/current-location` - Get current user location
- `GET /v1/gps-signal/device/:deviceCode/data` - Get GPS data for frontend
- `DELETE /v1/gps-signal/device/:deviceCode/clear` - Clear GPS data

### SMS (Legacy)
- `POST /v1/sms/send` - Send custom SMS message

### System
- `GET /health` - Health check endpoint
- `GET /v1/devices/active` - Get all active devices

## GPS Tracking

The system now uses real GPS coordinates from user devices:

- **Real-time Tracking**: Captures actual GPS coordinates from device sensors
- **Location Updates**: Receives location data every 20 seconds when tracking is active
- **Database Storage**: Stores all GPS coordinates in Supabase for historical tracking
- **Permission Required**: Users must grant GPS permission for location tracking to work

## SMS Configuration

Uses the same SMS API as NestJSAuthGuard-main:
- **API URL**: `http://43.252.88.250/index.php/smsapi/httpapi/`
- **Sender**: `NIGHAI`
- **Template ID**: `1207174264191607433`
- **Test Phone**: `8639398878`

## Testing

Test SMS functionality:
```bash
npm run test:sms:ts
```

## Database Schema

The system expects these Supabase tables:
- `otp_verifications` - OTP storage and verification
- `super_admins` - User accounts
- `devices` - GPS device information
- `gps_data` - GPS location data

## Security Features

- Phone number validation (Indian mobile numbers only)
- OTP expiration (10 minutes)
- JWT token authentication
- Input validation and sanitization
- Error handling and logging

## Development

- **TypeScript**: Strict typing enabled
- **Hot Reload**: Use `npm run dev:ts` for development
- **Linting**: ESLint configuration included
- **Build**: Compiles to `dist/` directory

## Migration from JavaScript

This TypeScript version maintains full compatibility with your existing JavaScript implementation while adding:
- Type safety
- Better IDE support
- Enhanced error catching
- Improved maintainability

Your existing frontend and mobile applications will work without any changes.
