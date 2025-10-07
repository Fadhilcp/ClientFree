import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AppRoutes from "./router/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => (
  <Provider store={store}>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
  </Provider>
);

export default App;