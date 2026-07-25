# Nexa Assessment Platform

A comprehensive enterprise assessment and evaluation platform designed to automate scoring, validation, and document generation for various applicant categories.

## Key Features

1. **Intelligent Assessment Engine**
   - Built-in calculator for validation and capacity planning.
   - Real-time limit checking.
   - Customizable criteria via application settings.

2. **Client Management (3 Categories)**
   - **Type A** - Pre-period assessment.
   - **Type B** - Full-period assessment.
   - **Type C** - Active assessment.

3. **Dynamic Form & Wizard**
   - Multi-step validation forms.
   - Secure financial background checks.
   - Automated summary generation.

4. **Document Generation**
   - Auto-generates letters, summaries, and legal forms using standard `docx` templates.
   - Stores history of generated documents.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon/Local)
- **ORM**: Drizzle ORM
- **Authentication**: Better-Auth
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand
- **Form Validation**: Zod + React Hook Form
- **Document Generation**: docxtemplater + pizzip

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables: `cp .env.example .env`
4. Run migrations: `npm run db:migrate`
5. Start development server: `npm run dev`

## License

Internal Enterprise Use Only.
