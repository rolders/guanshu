# Base Stack

A modern, production-ready full-stack application template built with Next.js 15, TypeScript, Tailwind CSS with Shadcn UI components, and Drizzle ORM. Featuring a beautiful, accessible UI out of the box.

## 🚀 Features

- **Next.js 15** with App Router and Server Components
- **TypeScript** for type safety
- **Tailwind CSS** with Shadcn UI components
- **Authentication** via Lucia with role-based access control
- **Database** using Drizzle ORM with PostgreSQL
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
   pnpm install
   ```

3. **Database Setup**

   a. Start PostgreSQL using Docker:
   ```bash
   docker run --name postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=base_stack \
     -p 5432:5432 \
     -d postgres:15
   ```

   b. Apply database migrations:
   ```bash
   # Using the provided migrations.sql file
   docker exec -i postgres psql -U postgres -d base_stack < src/lib/db/migrations.sql
   ```

   c. Create test users (optional):
   ```bash
   # After starting the development server
   curl -X POST http://localhost:3006/api/test-users
   ```

4. **Environment Setup**

   Create a `.env` file with the following content:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/base_stack"

   # Authentication
   LUCIA_ENV="DEV"
   AUTH_SECRET="your-random-secret-key"
   AUTH_TRUST_HOST=true

   # API
   API_URL="http://localhost:3006"

   # Internationalization
   DEFAULT_LOCALE="en"
   SUPPORTED_LOCALES='["en", "zh"]'
   ```

5. **Development Server**
   ```bash
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
│   └── db/            # Database configuration and migrations
├── types/             # TypeScript type definitions
└── i18n/              # Internationalization
```

## 🔐 Authentication

The project uses Lucia for authentication with three role types:

- `ADMIN`: Full system access
- `USER`: Standard user access
- `GUEST`: Limited access

Test accounts (available after running the test-users API endpoint):

- Admin: admin@test.com / admin123
- User: user@test.com / user123
- Guest: guest@test.com / guest123

### Database Schema

The authentication system uses three main tables:

- `User`: Stores user information and roles
- `Session`: Manages user sessions
- `Key`: Stores authentication keys and password hashes

## 🌐 Internationalization

Supports multiple languages using next-intl:

- English (en)
- Chinese (zh)
- Add more languages by extending the locale configuration

## 🛡 Security Features

- Type-safe database operations with Drizzle ORM
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
- **Database**: Local PostgreSQL in Docker for development

## 📦 Production Deployment

Optimized for deployment on platforms like Vercel:

- Automatic image optimization
- Edge-compatible
- Production logging
- Compression enabled
- Cache optimization
- Type-safe routes

For production, you'll need to:
1. Set up a production PostgreSQL database
2. Update environment variables accordingly
3. Set `LUCIA_ENV` to "PROD"
4. Generate a strong `AUTH_SECRET`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
