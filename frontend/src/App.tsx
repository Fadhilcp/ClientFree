import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./router/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"

const App: React.FC = () => {

  return (
    <Provider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >

        <AppRoutes/>
        <Toaster 
          position="top-center" 
          richColors 
          closeButton
          />
          </ThemeProvider>
    </Provider>
  );
}


export default App