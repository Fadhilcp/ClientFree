import React, { useEffect } from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { socket } from '../../config/socket.config'
import { tokenStore } from '../../utils/tokenStore'
import { NotificationProvider } from '../../context/NotificationContext'
import { CallProvider } from '../../context/CallProvider'
import GlobalCallModal from '../../components/ui/Modal/GlobalCallModal'

const UserLayout: React.FC = () => {

  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role ?? "landing";

  useEffect(() => {
    if (!user?.id) return;

    const token = tokenStore.get();
    if (!token) return;
  
    socket.auth = { token };
  
    socket.connect();
  
    socket.on("connect", () => {
      console.log("socket connected", socket.id);
    });
  
    socket.on("connect_error", (err) => {
      console.error("socket connect error:", err.message);
    });
  
    return () => {
      socket.disconnect();
    };
  }, [user?.id]);


  return (
    <NotificationProvider>
      <CallProvider>

      {role !== "admin" && <Navbar role={role} />}
      <main className='pt-15'>
        <GlobalCallModal/>
        <Outlet/>
      </main>

      </CallProvider>
    </NotificationProvider>
  );
}

export default UserLayout
