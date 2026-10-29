import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useChatStore } from '../store/useChatStore';

const MainLayout = () => {
    const { selectedUser } = useChatStore();
    const location = useLocation();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        const handleFocusIn = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) {
                setIsKeyboardOpen(true);
            }
        };

        const handleFocusOut = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) {
                setIsKeyboardOpen(false);
            }
        };

        const handleViewportResize = () => {
            if (window.visualViewport) {
                // If visualViewport height is substantially smaller than window.innerHeight, keyboard is visible
                const isShrunk = window.visualViewport.height < window.innerHeight * 0.85;
                setIsKeyboardOpen(isShrunk);
            }
        };

        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportResize);
        }

        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportResize);
            }
        };
    }, []);

    const isChatActive = Boolean(selectedUser && (location.pathname === '/' || location.pathname === '/chat'));
    const hideMobileNav = isKeyboardOpen || isChatActive;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#131413]">
            <Navbar hideMobileNav={hideMobileNav} />
            <div className={`flex-1 w-full md:pl-20 ${hideMobileNav ? 'pb-0' : 'pb-16'} md:pb-0 h-full overflow-hidden bg-[#131413] transition-all duration-200`}>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
