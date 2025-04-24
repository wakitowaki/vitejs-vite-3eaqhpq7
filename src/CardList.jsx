import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export default function CardList() {
    const [cards, setCards] = useState([]);
    const [filter, setFilter] = useState("Tutti");
    const [editingId, setEditingId] = useState(null);
    const [loanedToInput, setLoanedToInput] = useState("");

    useEffect(() => {
        const fetchCards = async () => {
            const querySnapshot = await getDocs(collection(db, "cards"));
            const cardData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCards(cardData);
        };

        fetchCards();
    }, []);

    const filteredCards = filter === "Tutti"
        ? cards
        : cards.filter(card => card.owner === filter);

    const handleUpdateLoan = async (card) => {
        const cardRef = doc(db, "cards", card.id);
        const updatedLoanedTo = loanedToInput.trim();

        await updateDoc(cardRef, {
            isLoaned: !!updatedLoanedTo,
            loanedTo: updatedLoanedTo
        });

        setEditingId(null);
        setLoanedToInput("");

        // Refresh cards
        const querySnapshot = await getDocs(collection(db, "cards"));
        const updatedCards = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setCards(updatedCards);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">📋 Tutte le carte</h2>

            {/* 🔘 Filtro per proprietario */}
            <div className="mb-6 flex flex-wrap gap-2">
                {["Tutti", "Matteo", "Giacomo", "Marcello"].map(owner => (
                    <button
                        key={owner}
                        onClick={() => setFilter(owner)}
                        className={`px-4 py-2 rounded-full font-semibold transition ${
                            filter === owner
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                    >
                        {owner}
                    </button>
                ))}
            </div>

            {/* 🗃️ Lista carte filtrata */}
            {filteredCards.length === 0 ? (
                <p className="text-gray-500">Nessuna carta trovata.</p>
            ) : (
                <ul className="space-y-4">
                    {filteredCards.map(card => (
                        <li key={card.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            <div className="text-lg font-bold text-gray-800">{card.name}</div>
                            <div className="text-sm text-gray-600">👤 {card.owner}</div>
                            <div className="text-sm text-gray-600">📦 Copie: {card.copies}</div>
                            <div className="text-sm text-gray-600 mb-2">
                                🔁 Prestito: {card.isLoaned ? `Sì, a ${card.loanedTo}` : "No"}
                            </div>

                            {editingId === card.id ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={loanedToInput}
                                        onChange={(e) => setLoanedToInput(e.target.value)}
                                        placeholder="A chi è prestata?"
                                        className="w-full border p-2 rounded"
                                    />

                                    {/* Bottoni utenti */}
                                    <div className="flex gap-2">
                                        {["Matteo", "Giacomo", "Marcello"].map(user => (
                                            <button
                                                key={user}
                                                onClick={() => setLoanedToInput(user)}
                                                className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                                                    loanedToInput === user
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                                }`}
                                            >
                                                {user}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Azioni */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateLoan(card)}
                                            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                                        >
                                            Salva
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setLoanedToInput("");
                                            }}
                                            className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500"
                                        >
                                            Annulla
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setEditingId(card.id);
                                        setLoanedToInput(card.loanedTo || "");
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    {card.isLoaned ? "Modifica prestito" : "Segna come prestata"}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
