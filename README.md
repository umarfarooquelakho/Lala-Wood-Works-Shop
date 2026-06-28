# 🪵 Lala Wood Works — Shop Management System

A modern, full-stack web application built for **Lala Wood Works**, a carpenter business based in **Sakrand, Sindh, Pakistan**. The system replaces manual paper-based order tracking with a clean digital solution for managing orders, door & window designs, payments, and business reports.

---

## ✨ Features

### 🛡️ Admin Panel
- **Dashboard** — Summary cards, weekly earnings chart, recent orders
- **Orders** — Create, edit, delete orders with full door & window measurements
- **Door Catalog** — Upload and manage door designs with images
- **Window Catalog** — Upload and manage window designs with images
- **Reports** — Weekly/monthly earnings, order status breakdown, outstanding payments
- **Calculator** — Built-in calculator with history log

### 👤 Customer Portal
- **Door Designs** — Browse available door designs with image gallery
- **Window Designs** — Browse window designs with type filter
- **Favourites** — Save favourite door & window designs
- **Profile** — View order history with full measurement details
- **Contact Us** — Shop contact information with tap-to-call

### 🔐 Authentication
- Secure login with role-based access (Admin / Customer)
- Admin account protected with separate credentials
- Supabase Auth with RLS (Row Level Security)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Frontend UI |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Styling |
| **Supabase** | Database, Auth & Storage |
| **React Router v7** | Client-side routing |
| **Recharts** | Dashboard charts |
| **React Hot Toast** | Notifications |
| **date-fns** | Date formatting |

---

## 📁 Project Structure

```
src/
├── components/
│   └── Sidebar.jsx          # Navigation sidebar (admin & customer)
├── lib/
│   └── supabase.js          # Supabase client
├── pages/
│   ├── Login.jsx            # Login page
│   ├── Signup.jsx           # Customer signup
│   ├── admin/
│   │   ├── Dashboard.jsx    # Admin dashboard
│   │   ├── Orders.jsx       # Order management
│   │   ├── NewOrder.jsx     # Create / edit order
│   │   ├── Doors.jsx        # Door catalog management
│   │   ├── Windows.jsx      # Window catalog management
│   │   ├── Reports.jsx      # Business reports
│   │   └── Calculator.jsx   # Calculator tool
│   └── customer/
│       ├── Doors.jsx        # Browse door designs
│       ├── Windows.jsx      # Browse window designs
│       ├── Profile.jsx      # Order history & favourites
│       └── Contact.jsx      # Shop contact info
├── App.jsx                  # Routing & auth state
├── main.jsx                 # App entry point
└── index.css                # Global styles & design system
```

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `profiles` | User roles (admin / customer) |
| `doors` | Door design catalog |
| `windows` | Window design catalog |
| `orders` | Customer orders |
| `order_doors` | Door line items per order |
| `order_windows` | Window line items per order |
| `favorites` | Customer saved designs |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lala-wood-works.git
cd lala-wood-works

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deployment

This project is deployed on **Netlify**.

**Build settings:**
- Build command: `npm run build`
- Publish directory: `dist`

Set environment variables in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`



<p align="center">Built By Umar Farooque for Lala Wood Works Shop, Sakrand</p>
