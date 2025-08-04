# MedConnect - Doctor Directory Platform

A comprehensive healthcare platform connecting patients with medical professionals. Built with Next.js 14, Supabase, and TypeScript.

## 🏗️ Project Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: shadcn/ui
- **Deployment**: Vercel with Supabase integration

### Database Schema
\`\`\`sql
-- Core tables
auth.users          # Supabase auth users
doctors             # Doctor profiles and credentials
patients            # Patient profiles (coming soon)
doctor_locations    # Multiple locations per doctor
doctor_articles     # Doctor-authored articles
admins              # Admin user management
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Environment Variables
\`\`\`bash
# Supabase (auto-configured with Vercel integration)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd medconnect

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

### Database Setup
1. Create a new Supabase project
2. Run the migration files in order:
   - `001_create_patients_table.sql`
   - `002_fix_patients_trigger.sql` 
   - `003_improve_patients_trigger.sql`
   - `004_create_doctors_table.sql`
   - `005_create_admin_system.sql`
   - `006_create_doctor_locations.sql`
   - `007_create_doctor_articles.sql`

## 📁 Project Structure

\`\`\`
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel routes
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── doctors/              # Doctor management
│   │   └── login/                # Admin authentication
│   ├── auth/                     # Authentication routes
│   │   ├── doctor/               # Doctor auth (login/register)
│   │   ├── login/                # Patient login (coming soon)
│   │   └── register/             # Patient registration (coming soon)
│   ├── doctor/                   # Doctor portal
│   │   ├── dashboard/            # Doctor dashboard
│   │   ├── profile/              # Profile management
│   │   └── articles/             # Article management
│   ├── doctors/[slug]/           # Public doctor profiles
│   └── api/                      # API routes
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── admin/                    # Admin-specific components
│   └── doctor/                   # Doctor-specific components
├── lib/                          # Utilities and configurations
│   ├── supabase.ts              # Supabase client and auth functions
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
└── supabase/migrations/         # Database migration files
\`\`\`

## 🔐 Authentication System

### User Types
1. **Patients**: Basic users (coming soon)
2. **Doctors**: Medical professionals with profiles
3. **Admins**: Platform administrators

### Authentication Flow
- Supabase Auth handles user creation and sessions
- Row Level Security (RLS) policies control data access
- Triggers automatically create profile records
- Role-based access control for different user types

## 👨‍⚕️ Doctor Features

### Registration & Profile
- Professional information collection
- Account status management (pending/approved/rejected/suspended)
- Profile photo upload
- Multiple location support
- Bio and credentials management

### Dashboard Features
- Profile editing (except name)
- Location management
- Article creation and editing
- Account status monitoring
- Professional information updates

### Public Profile
- Searchable doctor directory
- Specialty filtering
- Location-based search
- Article showcase
- Contact information

## 👑 Admin Features

### Doctor Management
- View all registered doctors
- Approve/reject/suspend accounts
- Edit doctor information
- Monitor registration metrics

### Dashboard Analytics
- Total doctors by status
- Registration trends
- Geographic distribution
- Specialty breakdown

### Content Management
- Review doctor articles
- Manage platform content
- User activity monitoring

## 🗄️ Database Design

### Core Tables

#### `doctors`
\`\`\`sql
id                  UUID PRIMARY KEY (references auth.users)
email               TEXT UNIQUE NOT NULL
first_name          TEXT NOT NULL
last_name           TEXT NOT NULL
phone               TEXT
specialty           TEXT NOT NULL
years_experience    INTEGER DEFAULT 0
bio                 TEXT
profile_image       TEXT
status              TEXT DEFAULT 'pending'
created_at          TIMESTAMP WITH TIME ZONE
updated_at          TIMESTAMP WITH TIME ZONE
\`\`\`

#### `doctor_locations`
\`\`\`sql
id                  UUID PRIMARY KEY
doctor_id           UUID REFERENCES doctors(id)
name                TEXT NOT NULL
address             TEXT NOT NULL
city                TEXT NOT NULL
state               TEXT NOT NULL
postal_code         TEXT
phone               TEXT
is_primary          BOOLEAN DEFAULT false
\`\`\`

#### `doctor_articles`
\`\`\`sql
id                  UUID PRIMARY KEY
doctor_id           UUID REFERENCES doctors(id)
title               TEXT NOT NULL
content             TEXT NOT NULL
excerpt             TEXT
featured_image      TEXT
status              TEXT DEFAULT 'draft'
published_at        TIMESTAMP WITH TIME ZONE
\`\`\`

#### `admins`
\`\`\`sql
id                  UUID PRIMARY KEY (references auth.users)
email               TEXT UNIQUE NOT NULL
role                TEXT DEFAULT 'admin'
permissions         JSONB
\`\`\`

## 🔒 Security & Permissions

### Row Level Security (RLS)
- Doctors can only access their own data
- Admins have elevated permissions
- Public data is read-only for unauthenticated users

### API Security
- Server-side validation for all mutations
- Rate limiting on sensitive endpoints
- Input sanitization and validation

## 🎨 UI/UX Design

### Design System
- Consistent color palette (green/blue medical theme)
- Responsive design for all screen sizes
- Accessible components with proper ARIA labels
- Loading states and error handling

### Component Library
- Built on shadcn/ui for consistency
- Custom medical-themed components
- Reusable form components
- Data visualization components

## 📊 Features Implementation

### Current Features ✅
- Doctor registration and authentication
- Admin panel with doctor management
- Doctor dashboard with profile editing
- Public doctor directory
- Location management
- Article system
- Image upload functionality

### Coming Soon 🚧
- Patient registration and authentication
- Appointment booking system
- Review and rating system
- Advanced search and filtering
- Email notifications
- Mobile app

## 🧪 Testing

### Manual Testing Checklist
- [ ] Doctor registration flow
- [ ] Admin login and doctor approval
- [ ] Doctor dashboard functionality
- [ ] Profile photo upload
- [ ] Location management
- [ ] Article creation/editing
- [ ] Public doctor directory
- [ ] Responsive design

### Automated Testing (Future)
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure Supabase integration
3. Set environment variables
4. Deploy with automatic CI/CD

### Database Migrations
- Run migrations in Supabase dashboard
- Verify RLS policies are active
- Test authentication flows
- Seed initial admin user

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Consistent naming conventions
- Comprehensive error handling

### Git Workflow
- Feature branches for new development
- Pull requests for code review
- Semantic commit messages
- Automated deployment on merge

## 📞 Support & Maintenance

### Monitoring
- Supabase dashboard for database metrics
- Vercel analytics for performance
- Error tracking and logging
- User feedback collection

### Maintenance Tasks
- Regular database backups
- Security updates
- Performance optimization
- Feature updates based on user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Now let's create the enhanced database migrations:
