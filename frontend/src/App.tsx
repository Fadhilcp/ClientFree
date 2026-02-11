import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./router/AppRoutes";
// import Lenis from "lenis";

// const lenis = new Lenis({
//   autoRaf: true,
// });

// lenis.on('scroll', () => {});

const App: React.FC = () => {
  
  return (
    <Provider store={store}>

        <AppRoutes/>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

    </Provider>
  );
}


export default App;