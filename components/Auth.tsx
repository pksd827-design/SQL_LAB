import React from 'react';
import { supabase, supabaseUrl } from '../services/supabaseClient';

const Auth: React.FC = () => {
    // The check is now simply whether the supabase client was successfully created.
    const isSupabaseConfigured = !!supabase;

    const googleAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google`;
    const githubAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=github`;

    return (
        <div className="flex items-center justify-center h-screen bg-slate-900">
            <div className="w-full max-w-sm p-8 space-y-8 bg-slate-800 rounded-lg shadow-lg text-center">
                 <div className="flex flex-col justify-center items-center gap-3">
                     <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-sky-400">
                        <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.933l-9 5.25v9l8.628-5.033A.75.75 0 0 0 21.75 16.5V7.933ZM2.25 7.933V16.5a.75.75 0 0 0 .372.648L11.25 22.18v-9l-9-5.25Z" />
                    </svg>
                    <h1 className="text-3xl font-bold text-slate-200">SQL Studio</h1>
                </div>
                <p className="text-slate-400">Sign in to start your session</p>
                
                {!isSupabaseConfigured ? (
                     <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-md text-left text-sm" role="alert">
                        <strong className="font-bold block">Configuration Needed</strong>
                        <span className="block mt-1">Supabase URL and Key are missing. Please add your credentials to <code>/services/supabaseClient.ts</code> to enable login.</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <a
                            href={googleAuthUrl}
                            target="_top"
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200 font-semibold"
                        >
                           Sign in with Google
                        </a>
                        <a
                            href={githubAuthUrl}
                            target="_top"
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200 font-semibold"
                        >
                           Sign in with GitHub
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auth;