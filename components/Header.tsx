import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface HeaderProps {
    onNewTableClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewTableClick }) => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex-shrink-0 bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-sky-400">
                    <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.933l-9 5.25v9l8.628-5.033A.75.75 0 0 0 21.75 16.5V7.933ZM2.25 7.933V16.5a.75.75 0 0 0 .372.648L11.25 22.18v-9l-9-5.25Z" />
                </svg>
                <h1 className="text-xl font-bold text-slate-200">SQL Studio</h1>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onNewTableClick}
                    className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors duration-200 text-sm font-semibold flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    New Table from Data
                </button>
                {user && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="h-9 w-9 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                            aria-expanded={isMenuOpen}
                            aria-haspopup="true"
                        >
                            <span className="sr-only">Open user menu</span>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {isMenuOpen && (
                             <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                                <div className="py-1" role="none">
                                    <div className="px-4 py-2 text-sm text-slate-300 border-b border-slate-600">
                                        <p className="font-semibold">Signed in as</p>
                                        <p className="truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-slate-600"
                                        role="menuitem"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;