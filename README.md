# Common Ground

> Six everyday problems. One place to solve them.

<p align="center">
  <a href="https://visionary-fresh-plate-link.base44.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-Visit_App-0ea5e9?style=for-the-badge&logo=google-chrome" alt="Live Demo"/>
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Backend_API-Node.js_Express-339933?style=for-the-badge&logo=node.js" alt="Backend API"/>
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Frontend-React_TanStack_Start-000000?style=for-the-badge&logo=react" alt="Frontend"/>
  </a>
</p>

<p align="center">
  Built for ordinary neighbourhoods. No setup, no training, no forms to fill in twice.
</p>

---

## What It Does

Food thrown away while people go hungry. A parent's medicines kept in someone's memory. Streets that stay broken because reporting them goes nowhere. A night spent calling strangers for blood. A tanker nobody can time. Coaching a family cannot afford.

Common Ground is a working answer to all six — not a concept, not a mockup. A neighbourhood coordination platform where neighbours help neighbours, one screen at a time.

## Six Modules

| Module | Icon | What it solves |
|--------|------|----------------|
| **Surplus Food** | 🍞 | Shops post leftover food; neighbours reserve and collect before it goes to waste |
| **Elder Care** | 💊 | Shared medicine schedule, daily dose tracking, and appointments in one place |
| **Street Fixes** | 🛠️ | Report broken lights and potholes with photos; neighbours upvote; status stays public until fixed |
| **Blood Donors** | 🩸 | One board for blood requests and donors — searchable by blood group and area |
| **Water Supply** | 🚰 | Share tanker timings, dry taps, leaks, and restored supply — posted by whoever sees it first |
| **Free Tuition** | 📚 | Neighbours offer an hour a week of free teaching; families ask for what they need. No money changes hands |

## Key Features

- **One account, six boards** — Sign in once, everything stays in one place
- **Status that moves** — Available → Reserved → Collected; Reported → In Progress → Resolved; Open → Matched
- **Neighbour-powered** — No authority required. A person, not a council inbox, closes the loop
- **No money in the app** — Tuition is free by design; food rescue is about sharing, not selling
- **Real-time boards** — Post, reserve, upvote, collect, resolve — all visible to your street
- **Mobile-first** — Works on any phone. No app store. Just open the link

## Live Demo

Visit the reference design: **[Common Ground on Base44](https://visionary-fresh-plate-link.base44.app/)**

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TanStack Start, TanStack Router, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | SQLite (file-based, zero config) |
| **Authentication** | JWT (JSON Web Tokens), bcrypt password hashing |
| **Styling** | Tailwind CSS, shadcn/ui components, Lucide icons |
| **HTTP Client** | Native Fetch API |
| **Build Tool** | Vite |

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/HackerO112/common-ground.git
cd common-ground
```

### 2. Start the backend

```bash
cd server
npm install
rm -f database.sqlite          # fresh database (optional)
node server.js
```

The API will run at **http://localhost:5000**

### 3. Start the frontend

Open a new terminal:

```bash
cd client   # or the root if frontend files are at root
npm install
npm run dev
```

The app will run at **http://localhost:5173**

### 4. Open the app

Go to **http://localhost:5173** in your browser.

---

## Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@commonground.local` |
| Password | `demo1234` |

Or register your own account at **/signup**.

---

## API Endpoints

All endpoints require authentication (JWT Bearer token) unless noted.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Get current user |

### Surplus Food

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/surplus-listings` | List food listings |
| `POST` | `/api/surplus-listings` | Post surplus food |
| `POST` | `/api/surplus-listings/:id/reserve` | Reserve a listing |
| `POST` | `/api/surplus-listings/:id/collect` | Mark as collected |
| `POST` | `/api/surplus-listings/:id/release` | Release reservation |
| `DELETE` | `/api/surplus-listings/:id` | Delete own listing |

### Elder Care

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/medicines` | List medicines |
| `POST` | `/api/medicines` | Add medicine |
| `PUT` | `/api/medicines/:id` | Update medicine |
| `DELETE` | `/api/medicines/:id` | Delete medicine |
| `GET` | `/api/dose-logs` | List dose logs |
| `POST` | `/api/dose-logs` | Log a dose |
| `DELETE` | `/api/dose-logs/:id` | Delete dose log |
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Add appointment |
| `PUT` | `/api/appointments/:id` | Update appointment |
| `DELETE` | `/api/appointments/:id` | Delete appointment |

### Street Fixes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/neighborhood-issues` | List issues |
| `POST` | `/api/neighborhood-issues` | Report an issue |
| `POST` | `/api/neighborhood-issues/:id/upvote` | Upvote an issue |
| `PUT` | `/api/neighborhood-issues/:id` | Update status |
| `DELETE` | `/api/neighborhood-issues/:id` | Delete own issue |

### Blood Donors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/blood-requests` | List blood requests |
| `POST` | `/api/blood-requests` | Post blood request |
| `PUT` | `/api/blood-requests/:id` | Update request status |
| `DELETE` | `/api/blood-requests/:id` | Delete own request |
| `GET` | `/api/blood-donors` | List available donors |
| `POST` | `/api/blood-donors` | Register as donor |
| `GET` | `/api/blood-donors/me` | My donor status |
| `PUT` | `/api/blood-donors/toggle` | Pause/resume listing |

### Water Supply

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/water-updates` | List water updates |
| `POST` | `/api/water-updates` | Post water update |
| `PUT` | `/api/water-updates/:id` | Update status |
| `DELETE` | `/api/water-updates/:id` | Delete own update |

### Free Tuition

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tuition-posts` | List tuition posts |
| `POST` | `/api/tuition-posts` | Create offer or request |
| `PUT` | `/api/tuition-posts/:id` | Update status |
| `DELETE` | `/api/tuition-posts/:id` | Delete own post |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Dashboard statistics |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/uploads` | Upload a photo (multipart/form-data) |

---

## Project Structure

```
common-ground/
├── server/                  # Express + SQLite backend
│   ├── server.js            # Main server file with all API routes
│   ├── models/db.js         # SQLite database connection
│   ├── database.sqlite      # Auto-created SQLite database
│   ├── uploads/             # Uploaded photos
│   └── package.json
├── src/                     # React frontend (TanStack Start)
│   ├── api/api.js           # API client (fetch wrapper)
│   ├── lib/AuthContext.jsx  # Authentication context
│   ├── routes/              # File-based routes
│   │   ├── index.jsx        # Landing page (6 modules)
│   │   ├── login.jsx        # Sign in
│   │   ├── register.jsx     # Sign up
│   │   ├── _authed/         # Authenticated routes
│   │   │   ├── dashboard.jsx
│   │   │   ├── food.jsx
│   │   │   ├── care.jsx
│   │   │   ├── fixes.jsx
│   │   │   ├── blood.jsx
│   │   │   ├── water.jsx
│   │   │   └── tuition.jsx
│   │   └── __root.jsx       # Root layout
│   ├── components/          # Reusable UI components
│   └── lib/                 # Utilities
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Design Reference

The UI is inspired by the Base44 reference implementation:
- **[Live Reference](https://visionary-fresh-plate-link.base44.app/)**
- Dark theme with green accent color
- Gradient module cards with numbered sections
- Clean, neighbourhood-first typography

---

## What Makes This Different

Most community apps try to do everything. Common Ground does six things well:

1. **No middleman** — Neighbours connect directly. No agency fees, no commissions.
2. **No money in the loop** — Tuition is free. Food is rescued, not sold. Blood is donated, not bought.
3. **Status that matters** — Every post has a lifecycle. Nothing disappears into an inbox.
4. **Built for streets, not cities** — Small scale, high trust, immediate impact.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License — feel free to use this in your own neighbourhood.

---

<p align="center">
  <b>Common Ground</b> — Rescue tonight's bread, log this morning's tablets, report the light that's been out for three winters.<br>
  Six everyday problems. One place to solve them.
</p>
