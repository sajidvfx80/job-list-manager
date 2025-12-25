# Job List Manager

An advanced platform to manage and track working jobs for multiple clients and employees.

## Features

- **Client Management**: Manage multiple clients (stc, CBK, BK, PH, solutions, Subway)
- **Employee Assignment**: Assign jobs to employees (Mijoy, Sajid)
- **Job Categories**: Organize jobs into current, upcoming, and pending categories
- **Job Types**: Support for SM, LED, PMax, and Branches
- **LED Deliverables**: Track specific LED deliverables (Adzone, M2R, Ceremony, Waterfront Outdoor, Waterfront Indoor 7 Screens)
- **Delivery Dates**: Set and track delivery deadlines for each job
- **Status Management**: Track job status (pending, in-progress, completed)
- **Completion Options**: Mark jobs as "sample delivered" or "rollout"
- **Date Filtering**: Filter and view jobs by specific dates
- **PDF Export**: Export job lists to PDF format
- **Data Persistence**: All data stored in browser localStorage
- **Client-Specific Views**: View all jobs for a specific client
- **Job Editing**: Edit existing jobs
- **Add New Clients**: Dynamically add new clients to the system

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

### Adding a New Job
1. Click "Add New Job" button in the header
2. Select a client from the dropdown
3. Assign the job to either Mijoy or Sajid
4. Choose the job category (current job, upcoming job, pending jobs)
5. Select the job type (SM, LED, PMax, Branches)
6. If LED is selected, choose the relevant deliverables
7. Set the delivery date
8. Optionally set status and completion status
9. Click "Add Job"

### Viewing Jobs by Client
1. Click on any client card in the client list at the top
2. All jobs for that client will be displayed with their deadlines
3. Click "View All Jobs" to see all jobs across all clients

### Filtering Jobs by Date
1. Click "Filter by Date" button in the header
2. Select a date
3. Optionally filter by a specific client (if viewing a client's jobs)
4. View the filtered results
5. Click "Export to PDF" to download the filtered list

### Editing a Job
1. Find the job in the job list
2. Click "Edit" button
3. Modify the job details
4. Click "Update Job"

### Adding a New Client
1. Click "Add Client" button in the header
2. Enter the client name
3. Click "Add Client"

### Job Status Management
- **Status**: pending, in-progress, completed
- **Completion Status**: sample delivered, rollout

## Data Storage

All data is stored in a Neon PostgreSQL database. The application uses Netlify Functions to interact with the database. The data includes:
- Jobs (with all details)
- Clients list
- Employees list

## Deployment

This application is configured for deployment on Netlify with Neon PostgreSQL. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Steps:

1. Set up a Neon PostgreSQL database
2. Push code to GitHub
3. Deploy to Netlify with environment variable `DATABASE_URL`
4. Your site will be live!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

## Technology Stack

- React 18
- Vite
- Tailwind CSS
- jsPDF (for PDF export)
- date-fns (for date formatting)

