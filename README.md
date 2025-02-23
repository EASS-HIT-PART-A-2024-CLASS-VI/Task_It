# 🚀 Task It: Modern Team Collaboration Platform

<p align="center">
  <img src="./frontend/public/Task It.png" width="400" alt="Task It Logo">
</p>

<div align="center">
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-%23009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

  [📺 Watch Demo Video](#demo-video) | [🎯 Features](#-key-features) | [🏗️ Architecture](#-architecture) | [🚀 Quick Start](#-quick-start)
  
</div>

## 🌟 About Task It

Task It revolutionizes team collaboration with an intuitive task management platform. Built with modern technologies, it offers real-time updates, interactive dashboards, and seamless team coordination capabilities.

### 🎥 **Demo Video**

[![Task It Preview](https://raw.githubusercontent.com/EASS-HIT-PART-A-2024-CLASS-VI/Task_It/main/Task_It.gif)](https://youtu.be/EfBlEMsbesQ)

🔹 *Click the preview to watch the full demo on YouTube!*

## 🎯 Key Features

- 📋 **Interactive Kanban Boards**: Drag-and-drop task management
- 📅 **Smart Calendar Integration**: Schedule and track deadlines
- 👥 **Team Collaboration**: Real-time updates and team workspace
- 📊 **Dynamic Dashboard**: Personalized task overview and analytics
- 🔐 **Secure Authentication**: JWT-based user authentication
- 📱 **Responsive Design**: Works seamlessly across all devices

## 🏗️ Architecture

<p align="center">
  <img src="/TaskItArcheitecture.png" width="800" alt="Task It Architecture">
</p>

### Tech Stack Overview
- **Frontend**: React with modern UI components
- **Backend**: FastAPI for high-performance API
- **Database**: MongoDB for flexible data storage
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```plaintext
Task_It/
├── 🔙 backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── tasks.py      # Task management endpoints
│   │   │   ├── users.py      # User authentication & management
│   │   │   ├── groups.py     # Team & group operations
│   │   │   └── chatbot.py    # AI assistant integration
│   │   ├── main.py          # Application entry point
│   │   ├── models.py        # MongoDB schemas
│   │   └── crud.py         # Database operations
│   ├── tests/              # Comprehensive test suite
│   └── Dockerfile         # Backend container configuration
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/       # Authentication views
│   │   │   ├── Board/      # Kanban & task boards
│   │   │   ├── Dashboard/  # User dashboard
│   │   │   └── Sidebar/    # Navigation component
│   │   └── App.js         # Root component
│   └── Dockerfile        # Frontend container setup
│
└── 🐳 docker-compose.yml  # Container orchestration
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/Task_It.git

# Start the application
docker-compose up --build
```

### 🔑 Environment Variables
```env
MONGO_URI=mongodb://mongo:27017
DB_NAME=task_manager
SECRET_KEY=super-secure-key
PORT=8000
```

### 📚 API Documentation
Access the interactive API documentation at `http://localhost:8000/docs`

## 💡 Smart Features

### 1. Intelligent Task Management
- Automated task prioritization
- Smart deadline reminders
- Task dependency tracking

### 2. Team Collaboration
- Real-time updates
- Team chat integration
- File sharing capabilities

### 3. Analytics Dashboard
- Task completion metrics
- Team performance insights
- Productivity tracking

## 🔜 Roadmap

- [ ] AI-powered task suggestions
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Integration with popular tools (Slack, GitHub)
- [ ] Custom workflow automation

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

Need help? Check out our:
- [Issue Tracker](https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/Task_It/issues)
- [Documentation](#)
- [Community Forum](#)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ by Team Task It</p>
