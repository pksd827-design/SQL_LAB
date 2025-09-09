import React, { useState } from 'react';

interface NameModalProps {
    onNameSubmit: (name: string) => void;
}

const NameModal: React.FC<NameModalProps> = ({ onNameSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onNameSubmit(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="name-modal-title">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <h2 id="name-modal-title" className="text-2xl font-bold text-slate-200">Welcome to SQL Studio</h2>
                    <p className="mt-2 text-slate-400">Please enter your name to get started.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label htmlFor="user-name" className="sr-only">Your Name</label>
                    <input
                        id="user-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-slate-700 rounded-md px-4 py-2 text-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        autoFocus
                        required
                        aria-required="true"
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="px-4 py-2.5 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors duration-200 font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Save and Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NameModal;