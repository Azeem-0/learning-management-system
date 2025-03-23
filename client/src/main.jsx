import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/auth-context/index.jsx";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";
import NotificationProvider from "./context/notification-context/index.jsx";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./web3/config/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

createRoot(document.getElementById("root")).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={new QueryClient()}>
      <RainbowKitProvider showRecentTransactions={true}>
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
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
