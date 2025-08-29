# Biometric Voting System

A secure biometric voting system that uses Aadhar number authentication, OTP verification, and face recognition for voter identification.

## Features

- **Aadhar-based Authentication**: Users sign up and login using their 12-digit Aadhar number
- **OTP Verification**: SMS-based OTP verification using TextBee API
- **Face Recognition**: Biometric face verification for secure voting
- **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui components

## Authentication Flow

### Sign Up Process
1. User enters their 12-digit Aadhar number
2. User provides their full name
3. User enters the phone number linked to their Aadhar
4. System sends OTP via SMS using TextBee API
5. User verifies OTP
6. User enrolls their face for biometric verification
7. Account is created and user is ready to vote

### Sign In Process
1. User enters their 12-digit Aadhar number
2. System sends OTP to the phone number linked to the Aadhar
3. User verifies OTP
4. User undergoes face verification
5. User is authenticated and can access the voting system

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./prisma/local.db"

# TextBee SMS API Configuration
SMS_API_KEY="your_textbee_api_key_here"
DEVICE_ID="your_textbee_device_id_here"

# Better Auth Configuration
BETTER_AUTH_SECRET="your_better_auth_secret_here"
```

### Getting TextBee API Credentials

1. Sign up at [TextBee](https://textbee.dev)
2. Get your API key and device ID from the dashboard
3. Add them to your `.env` file

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Push database schema:
   ```bash
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Better Auth with phone number plugin
- **Database**: SQLite with Prisma ORM
- **SMS Service**: TextBee API
- **UI Components**: shadcn/ui with Tailwind CSS
- **Face Recognition**: face-api.js
- **Form Validation**: Zod
- **Notifications**: Sonner

## Project Structure

```
src/
├── app/
│   ├── auth/           # Authentication pages and actions
│   ├── dashboard/      # Main voting dashboard
│   ├── face/          # Face enrollment and verification
│   └── api/           # API routes
├── components/
│   ├── ui/            # Reusable UI components
│   ├── face/          # Face recognition components
│   └── auth-client.tsx # Main authentication component
└── lib/
    ├── auth.ts        # Better Auth configuration
    ├── types.ts       # TypeScript type definitions
    └── constants.ts   # Application constants
```

## Security Features

- **Aadhar Validation**: Ensures unique identification
- **OTP Verification**: Two-factor authentication via SMS
- **Face Biometrics**: Additional security layer
- **Session Management**: Secure session handling with Better Auth
- **Input Validation**: Comprehensive form validation with Zod

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
