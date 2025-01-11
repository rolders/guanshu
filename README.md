# Base Stack

A modern, production-ready full-stack application template built with Next.js 15, TypeScript, Tailwind CSS with Shadcn UI components, and Drizzle ORM. Featuring a beautiful, accessible UI out of the box.

## 🚀 Features

- **Next.js 15** with App Router and Server Components
- **TypeScript** for type safety
- **Tailwind CSS** with Shadcn UI components
- **Authentication** via Lucia with role-based access control
- **Database** using Drizzle ORM with PostgreSQL (Neon)
- **Internationalization** with next-intl
- **Modern UI Components** using Radix UI and Lucide icons
- **Type-safe Forms** and validations
- **Dark Mode** support
- **Production Optimizations** including image optimization and caching

## 🛠 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Lucia
- **Styling**: Tailwind CSS, Shadcn UI
- **Components**: Radix UI
- **Icons**: Lucide
- **State Management**: React Server Components
- **Form Handling**: React Hook Form (implied)
- **API**: Next.js API Routes
- **Development**: ESLint, TypeScript

## 🚦 Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd base-stack
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**

   - Copy `.env.example` to `.env`
   - Configure your environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `LUCIA_ENV`: Authentication environment ("DEV" or "PROD")
     - `AUTH_SECRET`: Your authentication secret key
     - `AUTH_TRUST_HOST`: Trusted host for authentication
     - `API_URL`: Your API URL
     - `DEFAULT_LOCALE`: Default language locale
     - `SUPPORTED_LOCALES`: JSON array of supported locales

4. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
   Open [http://localhost:3006](http://localhost:3006) to view the application

## 📁 Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/         # React components
│   ├── ui/            # Shared UI components
│   └── ...            # Feature-specific components
├── lib/               # Core utilities
│   ├── actions/       # Server actions
│   ├── auth/          # Authentication logic
│   └── db/            # Database configuration
├── types/             # TypeScript type definitions
└── i18n/              # Internationalization
```

## 🔐 Authentication

The project uses Lucia for authentication with three role types:

- `ADMIN`: Full system access
- `USER`: Standard user access
- `GUEST`: Limited access

Test accounts are available for development:

- Admin: admin@test.com / admin123
- User: user@test.com / user123
- Guest: guest@test.com / guest123

## 🌐 Internationalization

Supports multiple languages using next-intl:

- English (en)
- Chinese (zh)
- Add more languages by extending the locale configuration

## 🛡 Security Features

- Type-safe database operations
- Secure authentication with Lucia
- Role-based access control
- Server-side validation
- Protected API routes
- Secure session management

## 🔧 Development

- **Code Style**: ESLint configuration for Next.js
- **Type Checking**: Strict TypeScript configuration
- **Performance**: Built-in Next.js optimizations
- **Testing**: Ready for implementation of test suites

## 📦 Production Deployment

Optimized for deployment on platforms like Vercel:

- Automatic image optimization
- Edge-compatible
- Production logging
- Compression enabled
- Cache optimization
- Type-safe routes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
