import './App.css';
import CardList from './CardList';
import PasswordGate from './PasswordGate';
import { useState } from 'react';
import UserDashboard from './UserDashboard';

function App() {
    const [view, setView] = useState("collection");

    return (
        <PasswordGate>
            <div className="min-h-screen text-gray-800 font-sans px-4 py-8">
                <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-extrabold text-blue-800">📚 Collezione Carte</h1>
                        <div className="space-x-2">
                            <button
                                onClick={() => setView("collection")}
                                className={`px-4 py-2 rounded ${view === "collection" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                            >
                                Prestiti
                            </button>
                            <button
                                onClick={() => setView("dashboard")}
                                className={`px-4 py-2 rounded ${view === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>

                    {view === "collection" ? (
                        <CardList />
                    ) : (
                        <UserDashboard />
                    )}
                </div>
            </div>
        </PasswordGate>
    );
}

export default App;
