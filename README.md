# The Millennium School E-Learning System

The Millennium School E-Learning System is a web-based learning management platform for managing school academics, digital course delivery, assignments, attendance, communication, performance tracking, and parent visibility. The project combines a custom PHP API backend with a React/Vite frontend so administrators, teachers, students, and parents can work from role-specific dashboards.

## Project Description

This system is designed to support the daily academic workflow of a school. Administrators can manage users, classes, courses, teacher assignments, student records, attendance reports, and system activity. Teachers can upload learning materials, create assignments, review submissions, grade student work, mark attendance, and participate in course discussions. Students can browse courses and materials, submit assignments, track grades, view attendance, receive notifications, and join discussions. Parents can monitor their children's courses, assignments, attendance, performance, risk reports, and notifications.

The application exposes backend functionality through REST-style API routes under `/api/*`. The frontend consumes those APIs through organized API modules and presents a responsive dashboard experience for each user role.

## Main Goals

- Provide one platform for school e-learning and academic management.
- Organize users by role: admin, teacher, student, and parent.
- Deliver course materials and assignments digitally.
- Track submissions, grading, attendance, and student performance.
- Support announcements, notifications, help guides, FAQs, and support tickets.
- Give parents visibility into student progress and risk indicators.
- Keep the backend simple and deployable in a typical PHP/MySQL hosting environment.

## Core Modules

### Authentication and Users

The system includes login, logout, registration, profile management, password changes, role-based access, user status control, and admin-managed student and teacher creation.

### Administration

Admins can manage users, classes, courses, departments, teacher assignments, student assignments, user statuses, activity logs, attendance reports, performance analytics, academic departments, and course details.

### Courses and Content Delivery

Teachers and admins can organize academic content by categories such as grade, subject, course, chapter, and topic. Learning materials can be uploaded and delivered to students, with Cloudinary support available for media/file storage.

### Assignments, Submissions, and Grading

Teachers can create assignments, students can submit work, and teachers can review, grade, and publish grades. The system stores assignment metadata, due dates, submission status, scores, and feedback-related data.

### Attendance

The attendance module supports bulk attendance marking, course attendance reports, student attendance history, monthly summaries, course analytics, institution analytics, CSV export, and student-at-risk insights.

### Performance and Gap Analysis

The platform includes performance reports, course trends, student dashboard statistics, risk reports, high-risk student detection, and gap analysis tools to help identify learning issues early.

### Discussions and Communication

Course discussions include groups, topics, messages, open/closed topic status, and admin monitoring. Announcements and notifications help keep school users informed.

### Notification and Help Center

The help module includes FAQs, user guides, support tickets, ticket replies, unread notification counts, mark-as-read behavior, and real-time notification support through server-sent events and optional broadcasting drivers.

### Parent Portal

Parents can view linked children, child overview pages, course lists, assignments, attendance records, performance summaries, risk reports, reports, and notifications.

## Technology Stack

### Backend

- PHP 8+
- Custom PHP routing and controller structure
- PSR-4 autoloading through Composer
- MySQL database
- JWT/session-oriented helpers and middleware
- Cloudinary helper support for uploaded materials
- Optional real-time broadcasting support

### Frontend

- React
- Vite
- React Router
- TanStack React Query
- Axios
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React icons
- Pusher JS support

## Project Structure

```text
app/
  Controllers/        Backend API controllers
  Core/               Request, response, router, database, validation
  Helpers/            Shared helper utilities
  Middleware/         Auth, role, CORS, rate limit, session middleware
  Models/             Database model classes
  Broadcasting/       Broadcasting manager and drivers

config/               Application configuration
database/             Schema, migrations, and seeders
frontend/             React/Vite frontend application
public/               PHP front controller and public entry point
routes/               API route definitions
storage/              Runtime storage
tests/                Test directory
tools/                Project tools/scripts
```

## Backend Overview

The backend entry point is `public/index.php`. It loads environment variables, configures CORS for local development, registers the application autoloader, creates the request/response/router objects, loads `routes/api.php`, and resolves the incoming request.

Most backend behavior is organized around controllers in `app/Controllers`. Routes are declared in `routes/api.php`, and most API endpoints are grouped by module, such as authentication, administration, courses, assignments, submissions, grading, materials, discussions, attendance, performance, notifications, announcements, help, support tickets, and parent access.

## Frontend Overview

The frontend lives in the `frontend/` directory. It is a React application powered by Vite and organized into pages, components, layouts, API modules, hooks, routes, and shared UI utilities.

Important frontend areas include:

- Admin dashboard and management screens
- Teacher dashboard and course tools
- Student dashboard, courses, assignments, discussions, grades, attendance, and notifications
- Parent dashboard and child progress views
- Shared layout, form, modal, pagination, toast, and notification components
- API modules for admin, auth, attendance, assignments, content, communication, notification, parent, performance, teacher, and user workflows

## Database

The database schema is stored in `database/schema.sql`. It creates the `millennium_db` database and defines core tables such as users, roles, login logs, categories, materials, assignments, submissions, grades, discussion groups, discussion topics, discussion messages, teacher assignments, attendance records, performance reports, gap analysis, notifications, announcements, FAQs, support tickets, support ticket replies, and user guides.

Seeders are available under `database/seeders` for roles, admin users, and demo data.

## Environment Configuration

Copy `.env.example` to `.env` and update the values for your local environment.

Important environment values include:

```env
APP_NAME="The Millennium School E-Learning System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost/millinium

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=millennium_db
DB_USERNAME=root
DB_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=
```

## Local Setup

### Backend

1. Install PHP 8+ and MySQL.
2. Place the project in your web server directory, for example `c:\xampp\htdocs\millinium`.
3. Copy `.env.example` to `.env`.
4. Create/import the database using `database/schema.sql`.
5. Install Composer dependencies if needed:

```bash
composer install
```

6. Serve the backend through your PHP web server. With XAMPP, the API is typically available under:

```text
http://localhost/millinium/public
```

The health check endpoint is:

```text
GET /api/health
```

### Frontend

1. Move into the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the Vite dev URL, usually:

```text
http://localhost:5173
```

## Available Frontend Commands

```bash
npm run dev       # Start the local Vite development server
npm run build     # Build the production frontend
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Typical User Roles

- **Admin:** manages users, academic structure, classes, courses, reports, attendance analytics, logs, and system settings.
- **Teacher:** manages courses, materials, assignments, submissions, grading, attendance, discussions, and student performance.
- **Student:** accesses courses, materials, assignments, submissions, grades, attendance, discussions, notifications, and help resources.
- **Parent:** monitors linked students, academic progress, assignments, attendance, risk reports, and notifications.



