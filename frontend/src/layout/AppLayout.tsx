import React from 'react'
import Navbar from '../components/ui/Navbar'
import { Outlet } from 'react-router-dom'

const AppLayout: React.FC = () => {
  return (
    <>
      <Navbar role="landing"/>
      <main className='pt-15'>
        <Outlet/>
      </main>
    </>
  )
}

export default AppLayout
