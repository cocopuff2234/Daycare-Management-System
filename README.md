# Daycare Management System

A React-based daycare management application with attendance tracking, roster management, and parent signature functionality.

## Setup Instructions

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd Daycare-Management-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://tcfxaiuukjsyotmjxzol.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZnhhaXV1a2pzeW90bWp4em9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNTcyMjksImV4cCI6MjA2MTczMzIyOX0.eEVwDvLr56q0ILhUnjvuwy_h8D56C9QHmqZX3PYrwoo
   ```

   **Important**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## Environment Variables

The application requires the following environment variables:

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key

## Features

- User authentication (sign up, sign in)
- Daycare creation and management
- Child roster management
- Attendance tracking with parent signatures
- Monthly attendance reports (Excel export)
- Multi-daycare support

## Tech Stack

- **Frontend**: React 19.1.0, React Router DOM
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication, Database)
- **Additional Libraries**: 
  - `react-signature-canvas` for signature capture
  - `exceljs` & `xlsx` for report generation
  - `date-fns-tz` for timezone handling

## Database Schema

The application uses the following Supabase tables:
- `Daycares`: Daycare information and settings
- `DaycareMembers`: User memberships in daycares
- `Roster`: Children enrolled in daycares
- `Attendance`: Check-in/out records with signatures

## Development

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App (not recommended)

### Security Notes

- Supabase credentials are now stored as environment variables
- The `.env` file is gitignored to prevent credential exposure
- Use row-level security (RLS) policies in Supabase for data protection
