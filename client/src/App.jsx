import React from 'react';
import Dashboard from './components/Dashboard';

import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-crisis-bg text-gray-100 selection:bg-crisis-accent selection:text-black">
                <Dashboard />
            </div>
        </AuthProvider>
    );
}

export default App;
