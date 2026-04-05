# PawConnect 🐾

PawConnect is a modern, responsive web application designed to help connect stray and abandoned animals in Sri Lanka with loving forever homes. By providing a platform to report strays and browse animals waiting for adoption, PawConnect empowers the community to take action and save lives.

## ✨ Features

- **🐾 Browse Animals**: View all reported stray animals that are currently waiting for adoption, with a clean, grid-based layout and beautifully crafted animal cards.
- **📱 Mobile-First Design**: Fully responsive UI built with Tailwind CSS, ensuring a seamless experience across desktop, tablet, and mobile devices.
- **🔍 Advanced Filtering**: Easily filter animals by species (Dogs, Cats), gender, and adoption status using a user-friendly, collapsible filter panel on mobile or a horizontal bar on desktop.
- **📍 Report Strays**: Authenticated users can easily report new strays by providing details, location, and uploading a photo directly to the platform.
- **🔐 Secure User System**: Seamless phone-based registration and login system with robust Row Level Security (RLS) enforcement via Supabase for secure data ownership.
- **✅ Adoption Tracking**: Post creators can independently mark their reported animals as "Adopted", moving them to a dedicated adopted view.
- **🎨 Modern Animations**: Engaging micro-animations and page transitions powered by Framer Motion.

## 🛠️ Technology Stack

- **Frontend Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) (with TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS variables for a dynamic design system
- **State Management & Data Fetching**: [TanStack Query](https://tanstack.com/query/v5) (React Query)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL Database, Storage, and Row Level Security)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (FontAwesome)
- **Routing**: [React Router](https://reactrouter.com/)

## 🚀 Getting Started

Follow these steps to run the PawConnect platform locally on your machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm
- A Supabase account and project

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pawconnect.git
cd pawconnect
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Supabase Environment Variables

Create a `.env` file in the root of the project and add your Supabase connection details:

```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 4. Database Setup

Run the SQL files located in the `supabase/migrations/` directory in your Supabase SQL Editor to set up the proper tables (`animals`, `users`), storage buckets (`animal-photos`), and Row Level Security (RLS) policies. 

*Ensure you run the core migrations followed by the `20260405170000_security_hardening.sql` migration to properly secure the database.*

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## 🔒 Security Architecture

PawConnect utilizes a custom security implementation leveraging Supabase Row Level Security (RLS):
- **User Tokens**: Upon registration, users are assigned a unique, server-generated `user_token`.
- **Client-Side Storage**: This token is stored securely in the browser's `localStorage`.
- **Secure Updates**: Any `UPDATE` requests to the database send this token via a custom `x-user-token` header, which is verified server-side by RLS policies before allowing modifications (e.g., editing a post or marking an animal as adopted).
- **Data Integrity**: Database-level `CHECK` constraints are actively enforced to prevent invalid data lengths and formats.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/yourusername/pawconnect/issues) if you want to contribute.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Every life deserves a home. Thank you for supporting PawConnect!* ❤️
