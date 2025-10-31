import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import UserRoutes from "./router/UserRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import AdminRoutes from "./router/AdminRoutes";


const App: React.FC = () => (
  <Provider store={store}>

      {/* <AdminRoutes/> */}
      <UserRoutes />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

  </Provider>
);

export default App;