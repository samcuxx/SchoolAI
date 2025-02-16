# Student School AI 🎓

A modern web application that helps students generate and manage their assignments using AI. Built with Next.js, Supabase, and AI integration.

## Features 🚀

- 🔐 Secure Authentication with Supabase
- 🤖 AI-Powered Assignment Generation (Gemini & OpenAI)
- 📄 Professional PDF Export
- 🌓 Dark/Light Mode Support
- 📱 Responsive Design
- 🔄 Real-time Updates

## Tech Stack 💻

- **Frontend:** Next.js 14+ (App Router)
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **AI:** Gemini and OpenAI
- **Styling:** Tailwind CSS
- **PDF:** react-pdf

## Project Structure 📁

```
├── app/                  # Next.js App Router
│   ├── (auth)/          # Authentication routes
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
│   ├── ui/             # UI components
│   ├── forms/          # Form components
│   └── shared/         # Shared components
├── lib/                # Utility functions
│   ├── supabase/      # Supabase client
│   ├── ai/            # AI integration
│   └── pdf/           # PDF generation
├── types/             # TypeScript types
├── styles/            # Global styles
└── public/            # Static assets
```

## Getting Started 🏁

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/schoolAI.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your credentials.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables 🔑

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_OPENAI_API_KEY`
- `NEXT_PUBLIC_GEMINI_API_KEY`

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
