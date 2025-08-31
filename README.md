Event Collab Task Management
A full-stack, event-driven application designed for real-time collaborative task and event management. This project features a Spring Boot backend and a React frontend, enabling users to manage tasks and events seamlessly with live updates across all connected clients.

✨ Core Features
Real-Time Collaboration: Built with WebSockets, any changes to tasks or events are instantly reflected for all users, creating a live, interactive environment.

Task Management: Users can create, view, and update tasks.

Event Scheduling: The application supports scheduling and managing events.

Secure Authentication: The backend is secured using Spring Security and JWT, ensuring that all user data is protected.

Decoupled Architecture: A clean separation between the frontend and backend allows for independent development and scalability.

🔮 Future Development (Roadmap)
This project is under active development. Key features planned for upcoming releases include:

Assigning Tasks: Functionality to assign specific tasks to different users.

User Roles and Permissions: Introducing different levels of access for users (e.g., admin, member).

Notifications: In-app notifications for task updates and event reminders.

🛠️ Tech Stack
Backend
Framework: Spring Boot

Language: Java

Database: PostgreSQL with Spring Data JPA

Security: Spring Security & JSON Web Tokens (JWT)

Real-Time: Spring WebSocket

Build Tool: Apache Maven

Frontend
Framework: React

Build Tool: Vite

Styling: Tailwind CSS

Language: JavaScript (JSX)

🚀 Getting Started
Follow these instructions to get the project running on your local machine.

Prerequisites
Java JDK 21 or later

Node.js (which includes npm)

PostgreSQL database server

Installation & Setup
Clone the repository:

git clone [https://github.com/Sauravv193/event-collab-task-management.git](https://github.com/Sauravv193/event-collab-task-management.git)
cd event-collab-task-management

Setup the Backend:

Navigate to the backend directory: cd backend

Create a new PostgreSQL database.

In src/main/resources/application.properties, update the datasource URL, username, and password to match your database configuration.

Run the application using the Maven wrapper:

# For Windows
./mvnw.cmd spring-boot:run

# For macOS/Linux
./mvnw spring-boot:run

The backend will start on http://localhost:8080.

Setup the Frontend:

Open a new terminal and navigate to the frontend directory: cd frontend

Install dependencies: npm install

Start the development server: npm run dev

The application will be available at http://localhost:5173.
