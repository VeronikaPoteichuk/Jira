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
