# CoVerify Admin Portal

Admin dashboard for managing field verification operations, agents, cases, and reports across the COANFISS platform.

---

## Features

- **Real-time Dashboard** -- KPI stat cards, case trend charts, and agent performance bar charts with live WebSocket updates
- **Case Management** -- Filterable, paginated case table with status tracking, TAT monitoring, report generation, and bulk CSV import
- **Agent Management** -- Agent cards with performance stats (active/completed cases, average TAT), create new agents, and toggle active status
- **Live Agent Tracking** -- Real-time agent location cards with online/idle/offline status indicators and Google Maps links
- **Report Generation** -- Generate, search, and download PDF verification reports with SHA-256 hash integrity tracking
- **Audit Log** -- Searchable, filterable audit trail with expandable metadata rows and CSV export
- **Notification System** -- Bell icon with unread count badge, dropdown panel with mark-read and mark-all-read actions
- **Settings** -- Profile management, password change, notification preferences, and system information display
- **Role-based Access** -- Admin and Manager roles only; agents are denied login
- **Collapsible Sidebar** -- Navigation sidebar with expand/collapse toggle
- **WebSocket Integration** -- Socket.IO connection for live case updates and agent location tracking

---

## Tech Stack

| Layer         | Technology                     |
| ------------- | ------------------------------ |
| Framework     | React 19                       |
| Build Tool    | Vite 8                         |
| Language      | TypeScript 5.9                 |
| Styling       | Tailwind CSS v4                |
| Charts        | Recharts 3                     |
| Data Fetching | TanStack React Query 5         |
| HTTP Client   | Axios                          |
| Real-time     | Socket.IO Client               |
| Validation    | Zod 4                          |
| Icons         | React Icons (Heroicons)        |
| Date Utils    | date-fns                       |
| Shared Types  | `@coanfiss/coverify-shared`    |

---

## Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- A running instance of the CoVerify API server (defaults to `http://localhost:4000`)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd coanfiss/coverify-admin
```

### 2. Install dependencies

```bash
npm install
```

> The project depends on `@coanfiss/coverify-shared` as a local file reference (`file:../coverify-shared`). Make sure the shared package is present at the sibling directory.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:4000
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### 5. Build for production

```bash
npm run build
```

Output is written to the `dist/` directory.

### 6. Preview the production build

```bash
npm run preview
```

### 7. Lint the codebase

```bash
npm run lint
```

---

## Environment Variables

| Variable       | Required | Default                  | Description                      |
| -------------- | -------- | ------------------------ | -------------------------------- |
| `VITE_API_URL` | No       | `http://localhost:4000`  | Base URL of the CoVerify API server. Used for both REST API calls and WebSocket connections. |

---

## Project Structure

```
coverify-admin/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite config with React plugin, Tailwind CSS, and @ alias
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config (Vite config)
├── eslint.config.js            # ESLint configuration
├── public/                     # Static assets served as-is
├── dist/                       # Production build output
└── src/
    ├── main.tsx                # Application entry point (React root)
    ├── App.tsx                 # Root component with auth guard, routing, and WebSocket lifecycle
    ├── index.css               # Global styles and Tailwind import
    ├── App.css                 # Additional app-level styles
    ├── api/
    │   ├── client.ts           # Axios instance with auth interceptor and 401 redirect
    │   ├── dashboard.ts        # Dashboard stats, case trends, agent performance endpoints
    │   ├── cases.ts            # Case listing, detail, assignment, bulk assign, report download
    │   ├── agents.ts           # Agent listing, creation, status toggle
    │   ├── reports.ts          # Report listing, generation, download URL
    │   ├── audit.ts            # Audit log listing with filters
    │   ├── location.ts         # Agent location fetching
    │   └── notifications.ts    # Notification listing, mark read, unread count
    ├── store/
    │   └── authStore.ts        # JWT and user data persistence in localStorage
    ├── services/
    │   └── websocket.ts        # Socket.IO connection management (connect, get, disconnect)
    ├── components/
    │   ├── layout/
    │   │   ├── AdminLayout.tsx  # Shell layout with sidebar and header
    │   │   ├── Sidebar.tsx      # Collapsible navigation sidebar with route links
    │   │   └── Header.tsx       # Top bar with search, notifications bell, and user avatar
    │   ├── NotificationPanel.tsx # Dropdown notification list with mark-read actions
    │   └── CsvImporter.tsx      # Drag-and-drop CSV import modal with validation and preview
    ├── pages/
    │   ├── LoginPage.tsx        # Login form with role-based access control
    │   ├── DashboardPage.tsx    # KPI cards, trend line chart, agent bar chart, TAT overview
    │   ├── CasesPage.tsx        # Case table with filters, search, pagination, bulk import
    │   ├── AgentsPage.tsx       # Agent cards with stats, add agent button
    │   ├── ReportsPage.tsx      # Report table with generation, download, hash copy
    │   ├── AuditLogPage.tsx     # Audit log table with expandable rows and CSV export
    │   ├── LiveMapPage.tsx      # Live agent location cards with WebSocket updates
    │   └── SettingsPage.tsx     # Tabbed settings (profile, password, notifications, system)
    └── assets/
        ├── hero.png             # Hero image asset
        ├── react.svg            # React logo
        └── vite.svg             # Vite logo
```

---

## Pages

### Login

- Email and password authentication via `/api/auth/login`
- Role guard: only `admin` and `manager` roles are permitted access
- Stores JWT access token and user object in localStorage on success
- Displays inline error messages for failed login or unauthorized roles

### Dashboard

- **Stat Cards** -- Total Cases, Active Cases, Active Agents, Pending Review
- **Case Trends Chart** -- 30-day line chart showing submitted, approved, and rejected cases (Recharts `LineChart`)
- **Agent Performance Chart** -- Bar chart of cases completed per agent (Recharts `BarChart`)
- **TAT Overview** -- Average TAT hours, breach rate percentage, and cases completed today
- **Real-time Updates** -- Listens for `case:updated` and `case:created` WebSocket events to auto-refresh all dashboard queries

### Cases

- Paginated, filterable table showing case ID, applicant, client, verification type, city, status, and TAT countdown
- **Status filter** dropdown: Assigned, In Progress, Submitted, Under Review, Approved, Rejected
- **Search** by case ID, applicant name, or client name
- **TAT monitoring** with color-coded indicators (green = on time, amber = at risk, red = breached) using shared `calculateTatStatus` and `formatTimeRemaining` utilities
- **Actions per case**: view details, download report (PDF blob), generate report
- **Bulk CSV Import** via the CsvImporter modal component

### Agents

- Card-based layout displaying each agent with avatar initials, name, email, active/inactive badge
- Performance metrics per agent: active cases, completed cases, average TAT hours
- Assigned city and online status indicator
- **Add Agent** button for creating new field agents

### Reports

- **Generate Report** section: enter a case ID to trigger PDF report generation
- **Summary cards**: Total Reports, Generated count, Pending count
- **Report table** with columns: Case ID, Applicant, Type, Status, File Size, Generated By, Date, SHA-256 hash
- SHA-256 hash copy to clipboard with visual feedback
- Download button for generated reports (opens signed URL in new tab)
- Status filter (Generated, Pending, Failed) and search by case ID
- Paginated with page counter

### Audit Log

- Filterable audit trail with columns: Timestamp, User, Action, Resource, HTTP Method, IP Address
- **Filters**: user ID search, action type dropdown (11 action types), date range (start/end)
- **Expandable rows**: click to reveal JSON metadata and user agent string
- **CSV Export**: download current filtered results as a CSV file
- Color-coded action badges and HTTP method labels
- Paginated with page counter

### Live Map

- Real-time agent location tracking via WebSocket `agent:location` events
- **Status summary bar**: Online Now, Idle, and Offline agent counts
- Agent location cards with:
  - Online/idle/offline status (based on time since last location update)
  - Animated pulse indicator for online agents
  - Coordinates display and Google Maps link
  - Assigned city label
- Auto-refresh via polling every 30 seconds plus live WebSocket position updates
- Manual refresh button

### Settings

Tabbed interface with four sections:

- **Profile** -- Edit full name; email and role are read-only
- **Password** -- Change password with current password verification, minimum 8 character validation, and confirm match check
- **Notifications** -- Toggle switches for email notifications, push notifications, TAT breach alerts, and daily digest
- **System** -- Application info (name, version, environment mode, API server URL) and security details (JWT expiry, refresh token expiry, PII encryption method, password hashing algorithm)

---

## Components

### AdminLayout

Shell component that composes the Sidebar and Header around page content. Uses a flex layout with full-height sidebar and scrollable main content area.

### Sidebar

Collapsible navigation sidebar with seven route links (Dashboard, Cases, Agents, Live Map, Reports, Audit Log, Settings). Highlights the active route with an indigo background. Includes a Sign Out button and collapse/expand toggle at the bottom.

### Header

Top bar displaying the current page title, a global search input, a notification bell with unread count badge (auto-refreshes every 30 seconds), and the logged-in user's avatar and name.

### NotificationPanel

Dropdown panel triggered by the notification bell. Fetches paginated notifications with auto-refresh when open. Supports marking individual notifications as read or marking all as read. Displays notification type icons (info, success, warning, error) with relative timestamps via `date-fns`. Closes on outside click.

### CsvImporter

Full-screen modal for bulk case import via CSV. Features:

- Drag-and-drop or click-to-browse file upload
- Automatic column mapping detection (case_id, agent_email, priority)
- Manual column mapping override via dropdowns
- Row-by-row validation with error highlighting
- Data preview table (first 5 rows)
- Batch import with progress bar
- Results summary (imported, skipped, failed counts)

---

## Real-time Features

The application uses **Socket.IO** for real-time communication with the backend.

### WebSocket Lifecycle

1. On successful authentication, `connectWebSocket()` is called from `App.tsx`
2. The socket connects to `{VITE_API_URL}/ws` with the JWT token in the `auth` object
3. Transport priority: WebSocket first, polling as fallback
4. On logout or component unmount, `disconnectWebSocket()` cleans up the connection

### Live Events

| Event              | Source Page   | Behavior                                                        |
| ------------------ | ------------- | --------------------------------------------------------------- |
| `case:updated`     | Dashboard     | Invalidates dashboard stats, trends, and agent performance queries |
| `case:created`     | Dashboard     | Invalidates dashboard stats, trends, and agent performance queries |
| `agent:location`   | Live Map      | Updates agent position in real-time without a full page refresh   |

### Auto-refresh (Polling)

| Query              | Interval    | Page           |
| ------------------ | ----------- | -------------- |
| Unread count       | 30 seconds  | Header (global)|
| Notifications      | 15 seconds  | NotificationPanel (when open) |
| Agent locations    | 30 seconds  | Live Map       |

### TanStack Query Configuration

- Default stale time: 30 seconds
- Default retry count: 1

---

## Authentication

### Flow

1. User submits email and password on the login page
2. The API returns a JWT access token and user object
3. The portal checks that `user.role` is `admin` or `manager`; all other roles are rejected client-side
4. Token and user data are stored in `localStorage` under `coverify_admin_token` and `coverify_admin_user`
5. The Axios interceptor attaches `Authorization: Bearer <token>` to every outgoing request
6. If any API response returns HTTP 401, the interceptor clears the token and redirects to `/login`

### Storage Keys

| Key                    | Value                                           |
| ---------------------- | ----------------------------------------------- |
| `coverify_admin_token` | JWT access token string                         |
| `coverify_admin_user`  | JSON-serialized user object (id, email, fullName, role) |

---

## API Integration

All API calls go through a shared Axios instance configured in `src/api/client.ts` with a base URL of `{VITE_API_URL}/api` and a 30-second timeout.

### Endpoints Used

| Module         | Method   | Endpoint                            | Description                    |
| -------------- | -------- | ----------------------------------- | ------------------------------ |
| Auth           | POST     | `/auth/login`                       | Admin/manager login            |
| Auth           | POST     | `/auth/register`                    | Create a new agent             |
| Auth           | POST     | `/auth/change-password`             | Change current user password   |
| Dashboard      | GET      | `/admin/dashboard/stats`            | Dashboard KPI stats            |
| Dashboard      | GET      | `/admin/dashboard/trends`           | Case trend data (N days)       |
| Dashboard      | GET      | `/admin/dashboard/agents`           | Agent performance metrics      |
| Cases          | GET      | `/admin/cases`                      | List cases with filters        |
| Cases          | GET      | `/cases/:id`                        | Single case detail             |
| Cases          | POST     | `/cases`                            | Assign a case to an agent      |
| Cases          | POST     | `/admin/cases/bulk-assign`          | Bulk assign cases              |
| Cases          | GET      | `/admin/cases/:id/report`           | Download case report (blob)    |
| Agents         | GET      | `/admin/agents`                     | List all agents with stats     |
| Agents         | PATCH    | `/admin/agents/:id`                 | Toggle agent active status     |
| Reports        | GET      | `/reports`                          | List reports with filters      |
| Reports        | POST     | `/reports/:caseId/generate`         | Generate a PDF report          |
| Reports        | GET      | `/reports/:caseId/download`         | Get signed download URL        |
| Audit          | GET      | `/admin/audit-logs`                 | List audit log entries         |
| Location       | GET      | `/location/agents`                  | Get all agent locations        |
| Notifications  | GET      | `/notifications`                    | List notifications (paginated) |
| Notifications  | PATCH    | `/notifications/:id/read`           | Mark a notification as read    |
| Notifications  | PATCH    | `/notifications/read-all`           | Mark all notifications as read |
| Notifications  | GET      | `/notifications/unread-count`       | Get unread notification count  |

---

## Routing

The application uses a **state-based client-side routing** approach without a third-party router library. The current path is stored in React state (`currentPath`) in `App.tsx`, and a `switch` statement renders the corresponding page component. Navigation is handled by the `onNavigate` callback passed to the Sidebar component.

### Routes

| Path          | Page Component   | Title              |
| ------------- | ---------------- | ------------------ |
| `/`           | DashboardPage    | Dashboard          |
| `/cases`      | CasesPage        | Case Management    |
| `/agents`     | AgentsPage       | Agent Management   |
| `/live-map`   | LiveMapPage      | Live Agent Map     |
| `/reports`    | ReportsPage      | Reports            |
| `/audit-log`  | AuditLogPage     | Audit Log          |
| `/settings`   | SettingsPage     | Settings           |

Unauthenticated users are shown the `LoginPage` exclusively. There is no public route.

---

## Building & Deployment

### Production Build

```bash
npm run build
```

This runs the TypeScript compiler (`tsc -b`) for type checking followed by `vite build`. The output is a fully static site in the `dist/` directory.

### Deployment Targets

**Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set the framework preset to **Vite** and add `VITE_API_URL` as an environment variable in the Vercel dashboard.

**Cloudflare Pages**

1. Connect the repository in the Cloudflare Pages dashboard
2. Set build command to `npm run build`
3. Set build output directory to `dist`
4. Add `VITE_API_URL` as an environment variable

**Nginx**

```nginx
server {
    listen 80;
    server_name admin.coverify.com;
    root /var/www/coverify-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

The `try_files` fallback to `index.html` is required since the app uses client-side routing.

---

## Screenshots

> Screenshots will be added in a future update. To capture them, run the application locally and navigate through each page.

| Page       | Screenshot          |
| ---------- | ------------------- |
| Login      | _Coming soon_       |
| Dashboard  | _Coming soon_       |
| Cases      | _Coming soon_       |
| Agents     | _Coming soon_       |
| Reports    | _Coming soon_       |
| Audit Log  | _Coming soon_       |
| Live Map   | _Coming soon_       |
| Settings   | _Coming soon_       |

---

## License

Proprietary -- COANFISS. All rights reserved.
