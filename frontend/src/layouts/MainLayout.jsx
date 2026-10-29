import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const MainLayout = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#131413]">
            <Navbar />
            <div className="flex-1 w-full md:pl-20 pb-16 md:pb-0 h-full overflow-hidden bg-[#131413]">
                <Outlet />
            </div>
        </div>
    )
}

export default MainLayout;
