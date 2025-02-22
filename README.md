# 🌤 Task It: Task Manager for Team Collaboration

<p align="center">
  <img src="./my-new-app2/public/Task It.png" width="400" alt="Task It Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-%23009688.svg?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/MongoDB-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</p>

## 🌍 Overview

**Task It** is a task management application designed for small teams to collaborate, manage tasks, track deadlines, and view real-time updates. The application is built with a **Dockerized backend** using **FastAPI** and a **React** frontend, making it fully containerized and easy to deploy.

## 🚀 Technologies

- **Backend**: FastAPI for building the RESTful API
- **Frontend**: React for the dynamic UI
- **Database**: MongoDB for data persistence
- **Deployment**: Docker and Docker Compose for containerization
- **Authentication**: JWT-based token authentication

<p align="center">
  <img src="./my-new-app2/TaskItArcheitecture.png" width="400" alt="Task It Logo">
</p>
---

## 📃 Table of Contents
1. [High-Level Architecture](#🏠-high-level-architecture)
2. [Backend Documentation](#📚-backend-documentation)
3. [Frontend Integration](#🌐-frontend-integration)
4. [Development Workflow](#🛠-development-workflow)
5. [Deployment Instructions](#💪-deployment-instructions)
6. [Features](#👨‍💼-features)
7. [Future Work](#💡-future-work)
8. [Contributing](#🤝-contributing)

---

## 🏠 High-Level Architecture

### Components
- **Frontend**: Developed using React to offer a responsive and interactive user experience.
- **Backend**: FastAPI provides a fast and scalable REST API that connects the frontend with the MongoDB database.
- **Database**: MongoDB for managing tasks, users, and groups.

### Architecture Flow
- The frontend communicates with the backend through REST API calls.
- The backend stores data in MongoDB.
- The entire stack is containerized using Docker and Docker Compose for seamless deployment.

---

## 📚 Backend Documentation

### Directory Structure
```plaintext
backend/
├── app/
│   ├── main.py          # Entry point for FastAPI app
│   ├── routes/          # API routes (tasks, users, groups)
│   │   ├── tasks.py
│   │   ├── users.py
│   │   ├── groups.py
│   └── __init__.py
│   ├── crud.py          # Database operations
│   ├── db.py            # Database connection
│   ├── models.py        # MongoDB models
│   ├── schemas.py       # Pydantic schemas for validation
├── Dockerfile           # Docker setup for backend
├── requirements.txt     # Backend dependencies
└── tests/               # Backend test cases
```

---

## 🌐 Frontend Integration
- **Frontend interacts with the backend through REST API endpoints.**
- **Dashboard**: Display tasks and their statuses interactively.
- **Task Details**: Ability to view and edit individual tasks.
- **Create Task**: A form to add new tasks.

---

## 🛠 Development Workflow
### **Version Control**
- Git for version control.
- `.gitignore` excludes unnecessary files such as `.vs/`.

### **Testing**
- Unit tests located in `backend/tests`.
```bash
docker-compose run backend pytest
```

### **CI/CD**
- Automate testing and deployment using GitHub Actions or Jenkins.

---

## 💪 Deployment Instructions
### Using Docker
```bash
docker-compose up --build
```

### Access API Docs
- **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## 👨‍💼 Features
- **Task Management**: Create, update, assign, and track tasks.
- **User Groups & Roles**: Assign users to teams.
- **JWT Authentication**: Secure API access.
- **MongoDB Storage**: Flexible document-based database.
- **Fully Dockerized**: Easy deployment with Docker.

---

## 💡 Future Work
- **Authentication & Authorization**: Implement advanced JWT handling.
- **Scalability**: Use Kubernetes for container orchestration.
- **UI Enhancements**: Improve frontend with new designs.

---

## 🤝 Contributing
**Fork the repository & submit a PR!**

```bash
git clone https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/Task_It.git
git checkout -b feature-branch
git commit -m "Add new feature"
git push origin feature-branch
```

---

