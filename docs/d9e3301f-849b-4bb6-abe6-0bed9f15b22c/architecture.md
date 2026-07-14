# Architecture Document

## System Overview
TaskFlow2 is a web-based task management application that enables users to create and manage projects, add tasks with due dates, assign tasks to team members, and track progress through a kanban board interface. The application aims to enhance team collaboration and productivity by providing a clear and intuitive platform for managing tasks and projects.

## Architecture Style
modular monolith

## Components
### Frontend Application
Responsibility: User interface for creating projects, adding tasks, and displaying the kanban board.
Technology: Next.js

### Backend API
Responsibility: Handles business logic, data processing, and communication with the database.
Technology: Express.js

### Database
Responsibility: Stores user data, project information, tasks, and their statuses.
Technology: PostgreSQL

### Notification Service
Responsibility: Sends notifications to users about task assignments and updates.
Technology: Node.js (integrated with the backend)

## Data Model
### User
Fields: id, name, email, role
Relationships: projects, tasks

### Project
Fields: id, name, description, startDate, endDate, userId
Relationships: tasks

### Task
Fields: id, title, description, dueDate, status, projectId, assignedTo
Relationships: project, user

## API Endpoints
- `POST /api/projects` — Create a new project.
- `GET /api/projects` — Retrieve all projects.
- `POST /api/tasks` — Add a new task to a project.
- `GET /api/tasks` — Retrieve all tasks for a project.
- `PATCH /api/tasks/:id` — Update the status or details of a task.
- `POST /api/notifications` — Send notifications to users.

## Tech Stack
- next.js
- express
- postgresql
- node.js
- socket.io

## Risks
- User adoption may be lower than expected if the interface is not intuitive enough.
- Data security risks if user data is not properly protected.
- Performance issues if the application does not scale well with increasing user load.
