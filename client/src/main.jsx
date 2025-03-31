import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/auth-context/index.jsx";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";
import NotificationProvider from "./context/notification-context/index.jsx";
import Chatbot from "./components/chat-bot/index.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <NotificationProvider>
      <AuthProvider>
        <InstructorProvider>
          <StudentProvider>
            <App />
            <Chatbot />
          </StudentProvider>
        </InstructorProvider>
      </AuthProvider>
    </NotificationProvider>
  </BrowserRouter>
);
