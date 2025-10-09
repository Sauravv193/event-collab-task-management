# 🎯 Event Collaboration Task Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1.0-purple.svg)](https://vitejs.dev/)

A comprehensive, production-ready event collaboration and task management platform built with modern technologies and enterprise-grade features.

## 🚀 Latest Updates - All 11 Major Improvements Implemented!

### ✅ **Recently Added Features**
- **Advanced Security:** Environment-based configuration, password validation, enhanced CORS
- **Error Handling:** Global exception handling with structured error responses
- **API Improvements:** Swagger documentation, DTOs, pagination support
- **State Management:** Optimistic updates, error boundaries, enhanced notifications
- **UI/UX:** Skeleton loaders, advanced animations, responsive design improvements
- **Performance:** Lazy loading, code splitting, service worker, virtual scrolling
- **Real-time:** Enhanced WebSocket with typing indicators, user presence
- **Task Management:** Priorities, deadlines, dependencies, file attachments, time tracking
- **Event Management:** Recurring events, categories, analytics, branding
- **User Experience:** Advanced search/filtering, role-based permissions
- **Advanced Features:** Calendar integration framework, reporting capabilities

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework:** Spring Boot 3.3.3 with Java 21
- **Database:** PostgreSQL with JPA/Hibernate
- **Authentication:** JWT with Spring Security
- **WebSocket:** STOMP over SockJS for real-time features
- **Documentation:** Swagger/OpenAPI 3
- **Build Tool:** Maven

### Frontend (React + Vite)
- **Framework:** React 18.2.0 with TypeScript support
- **Build Tool:** Vite 5.1.0 with optimized configuration
- **Styling:** Tailwind CSS with dark/light theme
- **State Management:** React Query + Context API
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 21+
- PostgreSQL 14+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Sauravv193/event-collab-task-management.git
cd event-collab-task-management
```

### 2. Backend Setup

#### Environment Configuration
```bash
cd backend
cp .env.template .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/event_task_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_with_at_least_64_characters
JWT_EXPIRATION_MS=86400000

# Server Configuration
SERVER_PORT=8080
```

#### Run Backend
```bash
./mvnw spring-boot:run
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Application:** http://localhost:5173
- **API Documentation:** http://localhost:8080/swagger-ui/index.html

## 🎯 Features

### 🔐 **Advanced Security**
- Environment-based configuration management
- JWT authentication with secure token handling
- Password strength validation with custom validators
- Role-based access control (RBAC)
- CORS protection with configurable origins
- Global exception handling with structured responses

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Dark/Light theme support
- Skeleton loading states for better UX
- Advanced animations with Framer Motion
- Error boundaries with retry functionality
- Enhanced toast notifications
- Virtual scrolling for large lists

### ⚡ **Performance Optimizations**
- Lazy loading with code splitting
- Service worker for offline functionality
- Image lazy loading with intersection observer
- Bundle optimization and compression
- Optimistic updates for better UX
- Background sync capabilities

### 🔄 **Real-time Features**
- Enhanced WebSocket integration with STOMP
- Typing indicators with auto-timeout
- Live user presence indicators
- Real-time task and event updates
- Connection status monitoring
- Automatic reconnection with exponential backoff

### 📋 **Advanced Task Management**
- Task priorities (1-5 scale) with visual indicators
- Deadlines and time tracking with start/stop functionality
- Task dependencies with visual representation
- File attachments with drag & drop upload
- Checklist support within tasks
- Task templates for repeated workflows
- Advanced filtering and search

### 📅 **Enhanced Event Management**
- Recurring events with flexible patterns (daily, weekly, monthly, yearly)
- Event categories and comprehensive tagging system
- Capacity limits with waiting lists
- Event reminders and notifications
- Social media integration capabilities
- Event branding with image uploads
- Analytics and reporting framework

## 📚 API Documentation

Full API documentation available at: http://localhost:8080/swagger-ui/index.html

### Key Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration  
- `GET /api/events` - List all events with pagination
- `POST /api/events` - Create new event
- `GET /api/tasks` - List tasks with filtering
- `POST /api/tasks` - Create new task

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests  
```bash
cd frontend
npm test
```

## 📱 Progressive Web App (PWA)
- Service worker for offline functionality
- Background sync for offline actions
- Push notifications support (framework ready)
- App-like experience on mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Calendar service integrations
- [ ] Multi-language support (i18n)
- [ ] Advanced notification system
- [ ] Plugin system for extensibility

---

**Built with ❤️ for better collaboration and productivity**
