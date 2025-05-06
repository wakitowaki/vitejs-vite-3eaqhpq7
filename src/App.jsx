import './App.css';
import CardList from './CardList';
import PasswordGate from './PasswordGate';
import { useState, useRef } from 'react';
import UserDashboard from './UserDashboard';


function App() {
    const [view, setView] = useState("collection");
    const dashboardRef = useRef();
    const [showDeckChecker, setShowDeckChecker] = useState(false);

    return (
        <PasswordGate>
            <div className="min-h-screen text-gray-800 font-sans px-4 py-8">
                <div className="max-w-3xl mx-auto">
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
                            {view === "dashboard" && (
                                <button
                                    onClick={() => dashboardRef.current?.downloadCSV?.()}
                                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                >
                                    ⬇️ Esporta CSV
                                </button>
                            )}
                            {view !== "dashboard" && (
                                <button
                                    onClick={() => setShowDeckChecker(true)}
                                    className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                                >
                                    🧪 DeckChecker
                                </button>
                            )}
                        </div>
                    </div>



                    {view === "collection" ? (
                        <CardList />
                    ) : (
                        <UserDashboard ref={dashboardRef} />
                    )}
                </div>
            </div>
            {showDeckChecker && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="bg-white max-w-xl w-full p-6 rounded-lg shadow-lg relative">
                        <button
                            className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
                            onClick={() => setShowDeckChecker(false)}
                        >
                            ×
                        </button>
                        <h2 className="text-xl font-bold text-purple-700 mb-4">🧪 DeckChecker</h2>
                        <textarea
                            rows="10"
                            className="w-full border p-2 rounded font-mono text-sm"
                            placeholder="Incolla qui la lista del mazzo..."
                        ></textarea>
                        <button
                            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                            onClick={() => alert("Analisi mazzo non ancora implementata")}
                        >
                            Analizza Mazzo
                        </button>
                    </div>
                </div>
            )}

        </PasswordGate>
    );
}

export default App;
