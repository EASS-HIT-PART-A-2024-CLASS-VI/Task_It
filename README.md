# Task Manager for Team Collaboration

## Overview
A task management application for small teams to manage tasks, deadlines, and updates in real-time.

---
# Project Documentation

## 1. High-Level Architecture

The system consists of three main components:

- **Frontend**: Placeholder for React or Vue.js.
- **Backend**: FastAPI-based REST API service.
- **Database**: PostgreSQL for data persistence.

### Architecture Diagram

The architecture includes the following interactions:

- The frontend sends HTTP requests to the backend.
- The backend processes the requests and interacts with the PostgreSQL database.
- The entire system is containerized using Docker for easy deployment and scalability.

### Key Technologies

- **Backend**: FastAPI
- **Database**: PostgreSQL
- **Deployment**: Docker and Docker Compose

## 2. Backend Documentation

### Directory Structure

```plaintext
backend/
├── app/
│   ├── main.py          # Entry point for the FastAPI app
│   ├── routes/          # API routes (tasks, users, groups)
│   │   ├── tasks.py
│   │   ├── users.py
│   │   ├── groups.py
│   └── __init__.py
│   ├── crud.py          # CRUD operations for the database
│   ├── db.py            # Database connection and setup
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas for validation
├── Dockerfile           # Defines how to build the Docker image
├── requirements.txt     # Dependencies for the app
└── tests/               # Test cases for the backend
```

### API Endpoints

#### **Tasks**

- `GET /tasks/tasks`: Read tasks.
- `POST /tasks/tasks`: Create a task.
- `PATCH /tasks/tasks/{task_id}`: Update task status.
- `DELETE /tasks/tasks/{task_id}`: Delete a task.
- `PATCH /tasks/tasks/{task_id}/assign`: Assign a task.
- `GET /tasks/dashboard`: Get dashboard data.
- `GET /tasks/filter`: Filter tasks by deadline.

#### **Users**

- `POST /users/users/register`: Register a user.
- `GET /users/users`: Get all users.

#### **Groups**

- `POST /groups/groups`: Create a group.
- `PATCH /groups/groups/{group_id}/add_user`: Add user to a group.

### Deployment Process

1. **Run with Docker**:

   - Build and start containers:
     ```bash
     docker-compose up --build
     ```
   - Access FastAPI at [http://localhost:8000/docs](http://localhost:8000/docs).

2. **Database Migration**:

   - Ensure your database is initialized with the required schema before deployment.

## 3. Frontend Integration

### Planned Steps

Once the frontend is ready, document:

- **Frontend to Backend Integration**:
  - How the frontend calls the API endpoints.
  - Expected request/response formats.
- **Frontend Features**:
  - State management.
  - User flows and interaction points.

## 4. Development Workflow

### Version Control

- Use Git for version control.
- `.gitignore` excludes unnecessary files such as `.vs/`.

### Testing

- Write unit tests for all backend routes.
- Use `pytest` to execute tests within the Docker container:
  ```bash
  docker-compose run backend pytest
  ```

### Continuous Integration/Continuous Deployment (CI/CD)

- Automate testing and deployment with tools like GitHub Actions or Jenkins.

## 5. Future Work

### Enhancements

- Implement authentication and authorization.
- Add frontend components for task, user, and group management.
- Optimize database queries for performance.

### Scalability

- Use Kubernetes for container orchestration.
- Set up a load balancer for handling high traffic.

---

This document serves as a starting point for understanding the architecture and backend implementation of the project. Future updates will include frontend integration and deployment workflows.\


## Features

### Backend (Ex1)
- Built with **FastAPI**.
- REST API endpoints:
  - Create, Read, Update, and Delete (CRUD) tasks.
  - Assign tasks to team members.
  - Update task status (e.g., Pending, In Progress, Completed).
  - Fetch a dashboard of tasks by status or deadline.
- **Dockerized backend** using a Dockerfile.

### Frontend/UI (Ex2)
- Built with **React** for a dynamic and interactive UI.
- Main views:
  - **Dashboard**: Overview of tasks and statuses.
  - **Task Details**: View and edit specific tasks.
  - **Create Task**: A form to add new tasks.
- Interacts with the backend via REST API calls.
- Alternatively, you can use **Streamlit** for a simpler, data-driven dashboard built with Python.

### Integration with Docker Compose (Ex3)
- Use **Docker Compose** to run the backend (FastAPI) and frontend (React or Streamlit) together seamlessly.
- `docker-compose.yml` includes:
  - Definition for the FastAPI service.
  - Definition for the React/Streamlit service.
  - Network configuration to allow the frontend to communicate with the backend.

### README (Ex3)
- Explains:
  - How to set up Docker and run the app using `docker-compose up`.
  - List of available REST API endpoints.
  - Frontend features and instructions to access the UI.

### Presentation (Ex3 Part 2)
- Create a short video (2-3 minutes) demonstrating:
  - How the app works (UI interaction).
  - Features like adding, updating, and viewing tasks.
  - Docker Compose setup and how to start the app.

