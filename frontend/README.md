# Charbucks — Fine Dining POS Frontend

A premium restaurant Point-of-Sale system built with React, featuring the **Architectural Palate** design system.

## Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** Custom CSS (The Architectural Palate design system)
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Notifications:** React Hot Toast

---

## Quick Start

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

---

## Connecting to Backend

### Scenario 1: Frontend + Backend on the SAME machine

No extra config needed. Vite's dev server proxies `/api/*` requests to `http://localhost:3000` automatically (configured in `vite.config.js`).

Just make sure your backend is running on port 3000:
```bash
# Terminal 1 — Backend
cd backend
npm start      # runs on :3000

# Terminal 2 — Frontend
cd frontend
npm run dev    # runs on :5173
```

### Scenario 2: Frontend on a DIFFERENT machine (no local DB)

When the frontend runs on a separate PC, it needs to know the backend's IP address.

**Step 1:** Find the backend machine's local IP address:
```bash
# On the backend machine:
# Windows
ipconfig
# Look for "IPv4 Address" under your active adapter, e.g., 192.168.1.10

# macOS / Linux
ifconfig | grep "inet "
# or
hostname -I
```

**Step 2:** Make your backend accessible on the network:

In your backend's `app.js`, ensure it listens on `0.0.0.0` (not just localhost):
```javascript
// backend/app.js
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
```

**Step 3:** Enable CORS for the frontend machine:

In your backend's `app.js`, add or update CORS:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.1.20:5173'], // frontend PC's IP
  credentials: true,
}));
```

**Step 4:** On the frontend machine, create a `.env` file:
```env
VITE_API_URL=http://192.168.1.10:3000/api
```
Replace `192.168.1.10` with your backend machine's actual IP.

**Step 5:** Start the frontend:
```bash
npm run dev
```

---

## PostgreSQL Access from Different Machines

### On the Backend Machine (where PostgreSQL runs):

1. **Edit `postgresql.conf`** to listen on all interfaces:
   ```
   # Usually at: /etc/postgresql/16/main/postgresql.conf (Linux)
   # or: C:\Program Files\PostgreSQL\16\data\postgresql.conf (Windows)

   listen_addresses = '*'
   ```

2. **Edit `pg_hba.conf`** to allow remote connections:
   ```
   # Add this line to allow connections from your local network:
   host    all    all    192.168.1.0/24    md5
   ```

3. **Restart PostgreSQL:**
   ```bash
   # Linux
   sudo systemctl restart postgresql

   # Windows — restart via Services or:
   pg_ctl restart -D "C:\Program Files\PostgreSQL\16\data"
   ```

4. **Open firewall port 5432:**
   ```bash
   # Linux
   sudo ufw allow 5432/tcp

   # Windows — open Windows Firewall and add inbound rule for port 5432
   ```

### On the Other Machine (to connect to DB directly):

```bash
psql -h 192.168.1.10 -U your_db_user -d your_db_name
```

Or use a GUI tool like pgAdmin, DBeaver, or TablePlus with:
- Host: `192.168.1.10` (backend machine IP)
- Port: `5432`
- Username / Password: your PostgreSQL credentials
- Database: your database name

> **Note:** For this project, the frontend does NOT talk to the DB directly.
> All communication goes through the backend API. You only need direct DB
> access for debugging or admin tasks.

---

## Project Structure

```
frontend/
├── index.html                 # Entry point
├── vite.config.js             # Vite config with API proxy
├── package.json
├── .env.example               # Environment template
│
└── src/
    ├── main.jsx               # React entry
    ├── App.jsx                # Router setup
    ├── index.css              # Architectural Palate design system
    │
    ├── config/
    │   └── api.js             # Axios instance + all API endpoint helpers
    │
    ├── context/
    │   └── AuthContext.jsx     # Authentication state management
    │
    ├── components/
    │   └── Sidebar.jsx        # Main navigation sidebar
    │
    └── pages/
        ├── Login.jsx          # Auth: Login
        ├── Signup.jsx         # Auth: Signup
        ├── Dashboard.jsx      # Backend: Overview dashboard
        ├── FloorPlan.jsx      # POS: Table/floor view
        ├── Order.jsx          # POS: Product selection + cart
        ├── Payment.jsx        # POS: Payment (Cash/Card/UPI QR)
        ├── Kitchen.jsx        # POS: Kitchen display (kanban)
        ├── Orders.jsx         # Backend: All orders list
        ├── Products.jsx       # Backend: Product CRUD
        ├── Tables.jsx         # Backend: Table CRUD
        ├── Sessions.jsx       # Backend: Session management
        └── Reports.jsx        # Backend: Reports with filters
```

---

## API Endpoints Consumed

| Module     | Endpoints                                              |
|------------|--------------------------------------------------------|
| Auth       | POST `/auth/signup`, POST `/auth/login`, GET `/auth/google` |
| Products   | GET/POST `/products`, DELETE `/products/:id`           |
| Tables     | GET/POST `/tables`, PATCH/DELETE `/tables/:id`         |
| Orders     | GET/POST `/orders`, POST `/orders/:id/send`, PATCH `/orders/:id` |
| Payments   | POST `/payments/create-order`, POST `/payments/verify`, GET `/payments` |
| Kitchen    | GET `/kitchen/orders`, GET `/kitchen/orders/completed`, PATCH `/kitchen/orders/:id` |
| Sessions   | POST `/sessions/open`, POST `/sessions/close`, GET `/sessions` |
| Reports    | GET `/reports` (with query params), GET `/reports/dashboard` |

---

## Design System: The Architectural Palate

- **Primary:** Deep Forest Green `#24340c`
- **Secondary:** Bronzed Earth `#6d5c3c`
- **Tertiary:** Deep Burgundy `#660013`
- **Surfaces:** Soft Cream tones (`#fff8f2`, `#fff2df`, `#f7e0b7`)
- **Typography:** Playfair Display (serif) + Inter (sans)
- **Philosophy:** No-Line boundaries, tonal layering, organic radii (24px+)

---

## Build for Production

```bash
npm run build
# Output in dist/ — deploy to any static host
```

When deploying, set `VITE_API_URL` to your production backend URL.
