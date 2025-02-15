# SchoolAI - AI-Powered Academic Assistant

> SchoolAI helps students excel in their academic journey by providing AI-assisted assignment creation, quiz preparation, and project work support.

## 🎯 Core Features

### 📝 Assignment Generation

- Professional PDF creation from AI-generated content
- Smart formatting and structuring
- Citation and reference management
- Grammar and plagiarism checks

### 👤 User Management

- Secure authentication via Supabase
- Profile customization
- Assignment history tracking
- Real-time sync across devices

### 🤖 AI Integration

- Powered by OpenAI GPT
- Context-aware content generation
- Smart assignment analysis
- Intelligent formatting suggestions

## 🔄 App Flow

### 1. User Onboarding

#### Welcome Screen

- Initial app introduction
- Feature overview
- Getting started guide

#### Authentication

- Gmail OAuth integration
- Email/password login
- Secure session management

### 2. Profile Setup

#### Required Information

- Full Name
- School Name
- Email Address
- Student Number
- Contact Number (Optional)

#### Data Management

- Secure storage in Supabase
- Profile updating capabilities
- Data encryption standards

### 3. Main Dashboard

#### Key Components

- New Assignment Creation
- Assignment History
- AI Assistant Access
- Settings & Help Center

### 4. Assignment Workflow

#### Creation Process

1. Input Assignment Details
   - Title
   - Subject
   - Due Date
   - Instructions
2. AI Generation
   - Content creation
   - Reference compilation
   - Format optimization
3. Review & Edit
   - Content preview
   - Manual editing
   - Custom annotations
4. Export Options
   - PDF download
   - Email sharing
   - Cloud storage

## 🛠 Technical Architecture

### Frontend

- React Native
- Modern UI/UX principles
- Responsive design
- Cross-platform compatibility
- Tech Stack:
  - Frontend: React Native with TypeScript, Expo, and Expo Router
  - Backend/Database: Supabase
  - UI Framework: React Native Paper
  - AI Processing: openAI

### Backend (Supabase)

- User authentication
- Real-time database
- File storage
- API management

### AI Integration

- OpenAI GPT integration
- Content generation API
- Natural language processing
- Context understanding

### PDF Generation

- PDF-lib/jsPDF implementation
- Professional formatting
- Custom templating
- Export optimization

## 📊 Database Schema

### Users Table

```sql
users (
    id            uuid primary key default uuid_generate_v4(),
    email         varchar(255) unique not null,
    full_name     varchar(255) not null,
    school_name   varchar(255) not null,
    student_number varchar(100),
    contact_number varchar(50),
    created_at    timestamp with time zone default now(),
    updated_at    timestamp with time zone default now()
)
```

### Assignments Table

```sql
assignments (
    id            uuid primary key default uuid_generate_v4(),
    user_id       uuid references users(id),
    title         varchar(255) not null,
    subject       varchar(100) not null,
    instructions  text,
    due_date      timestamp with time zone,
    status        varchar(50) default 'draft',
    content       text,
    created_at    timestamp with time zone default now(),
    updated_at    timestamp with time zone default now()
)
```

### References Table

```sql
references (
    id            uuid primary key default uuid_generate_v4(),
    assignment_id uuid references assignments(id),
    title         varchar(255) not null,
    authors       varchar(255)[],
    url           varchar(512),
    citation      text,
    created_at    timestamp with time zone default now()
)
```

### AI_Generations Table

```sql
ai_generations (
    id            uuid primary key default uuid_generate_v4(),
    assignment_id uuid references assignments(id),
    prompt        text not null,
    response      text not null,
    model_used    varchar(100) not null,
    created_at    timestamp with time zone default now()
)
```

### Files Table

```sql
files (
    id            uuid primary key default uuid_generate_v4(),
    assignment_id uuid references assignments(id),
    file_name     varchar(255) not null,
    file_type     varchar(50) not null,
    file_size     bigint not null,
    storage_path  varchar(512) not null,
    created_at    timestamp with time zone default now()
)
```

## 📁 Folder Structure

```
schoolai/
├── app/                      # Main application directory
│   ├── _layout.tsx          # Root layout component
│   ├── index.tsx            # Entry point
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── assignments/     # Assignment-related screens
│   │   ├── profile/         # Profile management
│   │   └── settings/        # App settings
│   └── (modals)/           # Modal screens
├── assets/                  # Static assets
│   ├── images/
│   └── fonts/
├── components/             # Reusable components
│   ├── common/            # Shared components
│   ├── forms/             # Form components
│   └── layouts/           # Layout components
├── constants/             # App constants
│   ├── theme.ts
│   └── config.ts
├── hooks/                 # Custom React hooks
├── services/             # API and external services
│   ├── ai/              # AI service integration
│   ├── auth/            # Authentication service
│   ├── database/        # Database operations
│   └── pdf/             # PDF generation service
├── types/               # TypeScript type definitions
├── utils/              # Utility functions
└── docs/               # Documentation
    └── CONTEXT.md      # Project context and documentation
```

## 🚀 Future Roadmap

### Phase 1

- [ ] AI-based assignment scoring
- [ ] Peer collaboration features
- [ ] LMS integration capabilities

### Phase 2

- [ ] Mobile app development
- [ ] Advanced AI features
- [ ] Enhanced collaboration tools

### Phase 3

- [ ] Analytics dashboard
- [ ] Performance tracking
- [ ] Personalized learning paths

## 📚 Implementation Guidelines

### Development Priorities

1. Core authentication system
2. Basic AI integration
3. PDF generation
4. User dashboard
5. Advanced features

### Best Practices

- Follow React Native conventions
- Implement proper error handling
- Maintain consistent documentation
- Regular security audits

### Security Considerations

- Data encryption
- Secure API calls
- User data protection
- Regular security updates

## 🤝 Support & Maintenance

### User Support

- In-app tutorials
- FAQ section
- Technical support
- User feedback system

### System Maintenance

- Regular updates
- Performance monitoring
- Bug fixing
- Feature enhancements

---

_This document serves as a comprehensive guide for developers implementing the SchoolAI application. For technical details, refer to the API documentation and development guidelines._
