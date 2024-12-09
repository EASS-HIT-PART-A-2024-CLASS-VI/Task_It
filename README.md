# Task Manager for Team Collaboration

## Overview
A task management application for small teams to manage tasks, deadlines, and updates in real-time.

---

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

