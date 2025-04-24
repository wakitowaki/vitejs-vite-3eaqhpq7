import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export default function CardList() {
    const [cards, setCards] = useState([]);
    const [filter, setFilter] = useState("Tutti");
    const [editingId, setEditingId] = useState(null);
    const [loanedToInput, setLoanedToInput] = useState("");

    const fetchCards = async () => {
        const querySnapshot = await getDocs(collection(db, "cards"));
        const cardData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setCards(cardData);
    };

    useEffect(() => {
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
        fetchCards();
    };

    const handleRemoveLoan = async (card) => {
        const cardRef = doc(db, "cards", card.id);
        await updateDoc(cardRef, {
            isLoaned: false,
            loanedTo: ""
        });
        fetchCards();
    };

    const handleDeleteCard = async (card) => {
        const confirmed = window.confirm(`Vuoi davvero eliminare "${card.name}"?`);
        if (!confirmed) return;

        await deleteDoc(doc(db, "cards", card.id));
        fetchCards();
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">📋 Tutte le carte</h2>

            {/* Filtro proprietario */}
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
                                🔁 Prestito: {card.isLoaned ? (
                                <div className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-3 py-2 rounded mb-2 inline-block">
                                    🔒 Prestata a: {card.loanedTo}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600 mb-2">
                                    🔓 Non in prestito
                                </div>
                            )}
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
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingId(card.id);
                                            setLoanedToInput(card.loanedTo || "");
                                        }}
                                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                                    >
                                        {card.isLoaned ? "Modifica prestito" : "Segna come prestata"}
                                    </button>
                                    {card.isLoaned && (
                                        <button
                                            onClick={() => handleRemoveLoan(card)}
                                            className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                                        >
                                            Rimuovi prestito
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteCard(card)}
                                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                                    >
                                        Elimina
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
