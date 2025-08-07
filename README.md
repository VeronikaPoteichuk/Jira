# Jira-like Kanban System

A comprehensive project management system with Kanban boards, user management, and GitHub integration.

## Installation

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git** - for cloning the repository
- **Python 3.8+** - for backend development
- **Node.js 16+** - for frontend development
- **Docker & Docker Compose** - for containerized deployment
- **PostgreSQL** - database

### Cloning the Project

```bash
# Clone the repository
git clone https://github.com/VeronikaPoteichuk/Jira.git
cd Jira

# Or if you have SSH access
git clone git@github.com:VeronikaPoteichuk/Jira.git
cd Jira
```

## Setup

### Option 1: Local Development Setup

#### Backend Setup

1. **Create and activate virtual environment:**

```bash

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Option 2: Docker Setup (Recommended)

#### Using Docker Compose

1. **Build and start all services:**

```bash
# From the root directory
docker-compose up --build
```

2. **Run database migrations:**

```bash
# In a new terminal, run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

3. **Access the application:**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin
- **API Documentation:** http://localhost:8000/api/schema/swagger-ui/

## Running the Application

### Local Development

#### Backend Server

```bash

# Activate virtual environment
source venv/bin/activate

# Navigate to backend directory
cd backend

# Run development server
python manage.py runserver

# Or run with specific host and port
python manage.py runserver 0.0.0.0:8000
```

#### Frontend Development Server

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm start

# Or run with specific port
PORT=3000 npm start
```

### Production Deployment

For production deployment, ensure you:

1. **Set proper environment variables:**

   - `DEBUG=False`
   - `SECRET_KEY` (strong, unique key)
   - `DATABASE_URL` (production database)
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

2. **Configure static files:**

```bash
# Collect static files
python manage.py collectstatic

# Or with Docker
docker-compose exec backend python manage.py collectstatic
```

## Troubleshooting

### Common Issues

1. **Database connection errors:**

   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Run migrations: `python manage.py migrate`

2. **Frontend build errors:**

   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **Docker issues:**

   - Rebuild containers: `docker-compose down && docker-compose up --build`
   - Check Docker logs: `docker-compose logs`

4. **WebSocket connection issues:**
   - Check WebSocket routing configuration

## Functionality of a Jira-like System (Kanban) with User Addition to Projects and GitLab Integration

1. Authentication and Authorization:

- Registration and Login: Ability to register and log in using email or username/password.
- Roles and Permissions: Access control based on user roles (e.g., admin, member).

2. Project Management:

- Project Creation: Ability to create new projects with a name, description, and owner.
- Each project has a Kanban board with columns (e.g., "To Do", "In Progress", "Done").
- Ability to add, remove, and rename columns.

3. Task Management:

- Task Creation: Ability to create tasks with a title, description, due date, and assignee.
- Task Movement: Tasks can be moved between columns (e.g., from "To Do" to "In Progress").
- Task Editing: Ability to edit tasks (e.g., update description, due dates, etc.).
- Task Deletion: Ability to delete tasks.

4. Adding Users to Projects:

- Inviting Participants: Ability to invite users to a project via email or username.
- User Roles: Assigning roles (e.g., "Admin", "Member").
- Access Management: Ability to remove users from a project (by admin or manager).

5. GitHub Integration:

- Repository Connection: Ability to connect GitHub repositories to a project.
- Task Synchronization: Synchronization between tasks in Jira and branches in GitHub.
- Notifications: Notifications about repository changes (e.g., new commits, merge requests).

6. Search and Filtering:

- Task Search: Search tasks by title, description, assignee, and other parameters.
- Task Filtering: Filter tasks by status, due date, and other criteria.

7. Notifications:

- Email Notifications: Notifications about task assignments, status changes, new comments, etc.
- In-App Notifications: Notifications within the application interface.

8. Mobile Support:

- Responsive Design: Interface adapted for use on mobile devices.

9. Additional Features:

- Commenting and Discussion:
  - Task Comments: Ability to leave comments on tasks.
  - Notifications: Notifications about new comments or changes in tasks.
- Analytics and Reports:
  - Task Statistics: Display the number of tasks in each status.
  - Charts: Progress charts for task completion.
  - Data Export: Ability to export data in CSV or PDF format.
- File Attachments:
  - File Upload: Ability to attach files to tasks (e.g., images, documents).
  - File Viewing: View attached files directly in the task interface.

### Technologies:

- Frontend: React.
- Backend: Django, REST API, WebSocket (Django Channels).
- Database: PostgreSQL, Redis.
- GitHub Integration: GitHub API.
- Deployment: Docker Compose.
