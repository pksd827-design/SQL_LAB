import React from 'react';

interface HeaderProps {
    onNewTableClick: () => void;
    userName: string | null;
}

const Header: React.FC<HeaderProps> = ({ onNewTableClick, userName }) => {
    return (
        <header className="flex-shrink-0 bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-sky-400">
                    <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.933l-9 5.25v9l8.628-5.033A.75.75 0 0 0 21.75 16.5V7.933ZM2.25 7.933V16.5a.75.75 0 0 0 .372.648L11.25 22.18v-9l-9-5.25Z" />
                </svg>
                <h1 className="text-xl font-bold text-slate-200">SQL Studio</h1>
            </div>
            <div className="flex items-center gap-4">
                {userName && (
                    <span className="text-slate-400 text-sm" aria-label={`Welcome, ${userName}`}>
                        Welcome, <span className="font-semibold text-slate-300">{userName}</span>
                    </span>
                )}
                <button
                    onClick={onNewTableClick}
                    className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors duration-200 text-sm font-semibold flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    New Table from Data
                </button>
            </div>
        </header>
    );
};

export default Header;