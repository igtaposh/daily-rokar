import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RecordProvider } from "./context/RecordContext.jsx";
import { AepsProvider } from "./context/AepsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RecordProvider>
          <AepsProvider>
            <App />
          </AepsProvider>
        </RecordProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
