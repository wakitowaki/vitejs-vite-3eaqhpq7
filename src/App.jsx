import './App.css';
import CardList from './CardList';
import PasswordGate from './PasswordGate';
import { useState, useRef } from 'react';
import UserDashboard from './UserDashboard';


function App() {
    const [view, setView] = useState("collection");
    const dashboardRef = useRef();
    const [showDeckChecker, setShowDeckChecker] = useState(false);
    const [deckText, setDeckText] = useState("");
    const [deckResults, setDeckResults] = useState([]);


    const parseDeckText = (text) => {
        return text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line)
            .map(line => {
                const match = line.match(/^(\d+)\s+(.+)$/);
                if (!match) return null;
                return {
                    quantity: parseInt(match[1]),
                    name: match[2]
                };
            })
            .filter(Boolean);
    };

    const handleAnalyzeDeck = () => {
        const parsed = parseDeckText(deckText);
        const collection = dashboardRef.current?.getCollection?.();

        if (!parsed.length) {
            alert("Lista mazzo vuota o non valida.");
            return;
        }

        if (!collection || !Array.isArray(collection)) {
            alert("⚠️ Collezione non disponibile (sei nella vista Prestiti?)");
            return;
        }

        const results = parsed.map(deckEntry => {
            const matchingCards = collection.filter(card => card.name.toLowerCase() === deckEntry.name.toLowerCase());
            let totalAvailable = 0;
            let owners = [];

            matchingCards.forEach(card => {
                const foilCount = (card.copies || []).filter(c => c.foil).length;
                const nonFoilCount = (card.copies || []).filter(c => !c.foil).length;
                const totalCopies = foilCount + nonFoilCount;
                const totalLoaned = (card.loans || []).reduce((sum, loan) => sum + (loan.quantity || 0), 0);
                const available = totalCopies - totalLoaned;

                if (available > 0) {
                    totalAvailable += available;
                    owners.push(`${card.owner} (${available})`);
                }
            });

            return {
                ...deckEntry,
                available: totalAvailable,
                owners
            };
        });

        setDeckResults(results);
    };

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



                    <CardList style={{ display: view === "collection" ? "block" : "none" }} />
                    <UserDashboard ref={dashboardRef} style={{ display: view === "dashboard" ? "block" : "none" }} />

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
                            value={deckText}
                            onChange={(e) => setDeckText(e.target.value)}
                        ></textarea>
                        <button
                            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                            onClick={handleAnalyzeDeck}
                        >
                            Analizza Mazzo
                        </button>
                        {deckResults.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">📋 Risultato Analisi</h3>
                                <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                                    {deckResults.map((res, idx) => (
                                        <li key={idx} className="border-b pb-2">
                                            <div className="font-semibold">{res.quantity}x {res.name}</div>
                                            {res.available >= res.quantity ? (
                                                <div className="text-green-700">✅ Disponibili: {res.available} — {res.owners.join(", ")}</div>
                                            ) : res.available > 0 ? (
                                                <div className="text-yellow-700">⚠️ Parziale: {res.available} disponibili — {res.owners.join(", ")}</div>
                                            ) : (
                                                <div className="text-red-700">❌ Non disponibile</div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={exportDeckResultsToPDF}
                                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    ⬇️ Esporta PDF
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}

        </PasswordGate>
    );
}

export default App;
