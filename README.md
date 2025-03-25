# 关树 Guanshu - Chinese Social Media Follower Hub

A modern web application that enables Chinese content creators to centralize and manage their audience across key platforms like Xiaohongshu, WeChat, Douyin, and Bilibili.

## 🌟 Features

### For Content Creators
- Create multiple personalized landing pages
- Aggregate social media links in one place
- Customize page themes and styling
- Track page views and link clicks
- Collect follower information securely
- Support for multiple languages (English/中文)

### Page Customization
- 5 beautiful themes:
  - Default: Clean, modern look with indigo-to-blue gradient
  - Minimal: Simple, clean design with white background
  - Dark: Elegant dark theme
  - Colorful: Vibrant theme with pink-to-purple gradient
  - Professional: Sophisticated theme with slate gradients
- Custom background images with fit options (cover, contain, repeat)
- Background image visibility toggle
- Custom main icon/profile picture
- Customizable contact form

### Social Media Integration
- Support for major Chinese platforms:
  - Xiaohongshu (小红书)
  - WeChat (微信)
  - Douyin (抖音)
  - Bilibili (哔哩哔哩)
  - Weibo (微博)
  - Zhihu (知乎)
- Custom link support for other platforms
- Custom icons for each link

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Lucia with Scrypt password hashing
- **Styling**: Tailwind CSS + Shadcn UI
- **Components**: Radix UI + Lucide icons
- **Forms**: React Hook Form
- **Internationalization**: next-intl

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/socialmedia_aggregator_cn.git
   cd socialmedia_aggregator_cn
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   AUTH_SECRET="your-secret-key"
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── [locale]/          # Internationalized routes
│   │   ├── dashboard/     # Dashboard pages
│   │   └── p/            # Public profile pages
│   └── globals.css        # Global styles
├── components/            # Shared components
│   └── ui/               # UI components
├── lib/                   # Utilities and configurations
│   ├── actions/          # Server actions
│   ├── auth/             # Authentication
│   ├── db/               # Database configuration
│   └── utils/            # Helper functions
└── types/                # TypeScript type definitions
```

## 🔒 Security

- Secure password hashing with Scrypt
- Protected API routes
- Input validation and sanitization
- CSRF protection
- Rate limiting

## 🌐 Internationalization

The application supports multiple languages:
- English (en)
- Chinese (zh)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lucia](https://lucia-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
