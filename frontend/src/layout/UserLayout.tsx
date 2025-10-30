import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'

const UserLayout: React.FC = () => {

  const role  = useSelector((state: RootState) => state.auth.user?.role) ?? 'landing';

  return (
    <>
      <Navbar role={role} />
      <main className='pt-15'>
        <Outlet/>
      </main>
    </>
  )
}

export default UserLayout
