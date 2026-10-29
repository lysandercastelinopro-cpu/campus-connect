import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Signup from './pages/Signup';

import Home from './pages/Home';
import Profile from './pages/Profile';
import Search from './pages/Search';
import NotificationPage from './pages/NotificationPage';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';

const App = () => {
    const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className='flex items-center justify-center h-screen bg-[#131413] text-[#026439]'>
                <Loader className='size-8 animate-spin' />
            </div>
        );
    }

    return (
        <div>
            {/* Custom Styled Toast System matching CampusConnect Dark Theme */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: '#1a1c1a',
                        color: '#FFFFFF',
                        border: '1px solid #262626',
                        borderRadius: '14px',
                        padding: '12px 18px',
                        fontSize: '13px',
                        fontWeight: '500',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#026439',
                            secondary: '#FFFFFF',
                        },
                        style: {
                            border: '1px solid rgba(2, 100, 57, 0.4)',
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#FFFFFF',
                        },
                        style: {
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                        }
                    },
                }}
            />
            <Routes>
                <Route path='/auth' element={<AuthLayout />}>
                    <Route path='login' element={!authUser ? <Login /> : <Navigate to='/' />} />
                    <Route path='signup' element={!authUser ? <Signup /> : <Navigate to='/' />} />
                </Route>
                <Route path='/' element={authUser ? <MainLayout /> : <Navigate to='/auth/login' />}>
                    <Route index element={<Home />} />
                    <Route path='chat' element={<Home />} />
                    <Route path='search' element={<Search />} />
                    <Route path='profile' element={<Profile />} />
                    <Route path='notifications' element={<NotificationPage />} />
                </Route>
            </Routes>
        </div>
    );
};

export default App;
