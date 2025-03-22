import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/auth-context/index.jsx";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";
import NotificationProvider from "./context/notification-context/index.jsx";
import { WagmiProvider } from "wagmi";
import { config } from "./web3/config/wagmiConfig";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./web3/config/queryConfig";

createRoot(document.getElementById("root")).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <InstructorProvider>
              <StudentProvider>
                <App />
              </StudentProvider>
            </InstructorProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>
);
