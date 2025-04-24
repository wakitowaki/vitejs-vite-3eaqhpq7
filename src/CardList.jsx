import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";

export default function CardList() {
    const [cards, setCards] = useState([]);
    const [filter, setFilter] = useState("Tutti");
    const [editingId, setEditingId] = useState(null);
    const [loanedTo, setLoanedTo] = useState("");
    const [loanQuantity, setLoanQuantity] = useState(1);
    const [editingCopiesId, setEditingCopiesId] = useState(null);
    const [newCopies, setNewCopies] = useState(1);


    const fetchCards = async () => {
        const querySnapshot = await getDocs(collection(db, "cards"));
        const cardData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            loans: doc.data().loans || []
        }));
        setCards(cardData);
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const filteredCards = filter === "Tutti"
        ? cards
        : cards.filter(card => card.owner === filter);

    const handleAddLoan = async (card) => {
        if (!loanedTo.trim() || loanQuantity <= 0) return;

        const cardRef = doc(db, "cards", card.id);

        await updateDoc(cardRef, {
            loans: arrayUnion({
                to: loanedTo.trim(),
                quantity: parseInt(loanQuantity)
            })
        });

        setEditingId(null);
        setLoanedTo("");
        setLoanQuantity(1);
        fetchCards();
    };

    const getTotalLoaned = (loans) =>
        loans.reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">📋 Tutte le carte</h2>

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
                    {filteredCards.map(card => {
                        const totalLoaned = getTotalLoaned(card.loans);
                        const remaining = card.copies - totalLoaned;

                        return (
                            <li key={card.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                                <div className="text-lg font-bold text-gray-800">{card.name}</div>
                                <div className="text-sm text-gray-600">👤 {card.owner}</div>
                                <div className="text-sm text-gray-600">📦 Totale copie: {editingCopiesId === card.id ? (
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={newCopies}
                                            onChange={(e) => setNewCopies(e.target.value)}
                                            className="border p-1 rounded w-20"
                                        />
                                        <button
                                            onClick={async () => {
                                                const cardRef = doc(db, "cards", card.id);
                                                await updateDoc(cardRef, { copies: parseInt(newCopies) });
                                                setEditingCopiesId(null);
                                                fetchCards();
                                            }}
                                            className="text-green-600 font-semibold hover:text-green-800"
                                        >
                                            💾
                                        </button>
                                        <button
                                            onClick={() => setEditingCopiesId(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                        📦 Totale copie: {card.copies}
                                        <button
                                            onClick={() => {
                                                setEditingCopiesId(card.id);
                                                setNewCopies(card.copies);
                                            }}
                                            className="text-blue-600 text-xs font-semibold hover:text-blue-800"
                                            title="Modifica numero copie"
                                        >
                                            ✏️ Modifica
                                        </button>
                                    </div>
                                )}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    🧮 In prestito: {totalLoaned} | Disponibili: {remaining}
                                </div>

                                {/* Visualizzazione prestiti */}
                                {card.loans.length > 0 && (
                                    <ul className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded mb-2 space-y-1">
                                        {card.loans.map((loan, index) => (
                                            <li key={index} className="flex items-center justify-between">
                                                <span>📦 {loan.quantity} a {loan.to}</span>
                                                <button
                                                    onClick={async () => {
                                                        const cardRef = doc(db, "cards", card.id);
                                                        const updatedLoans = card.loans.filter((_, i) => i !== index);
                                                        await updateDoc(cardRef, { loans: updatedLoans });
                                                        fetchCards();
                                                    }}
                                                    className="text-red-600 hover:text-red-800 ml-3"
                                                    title="Rimuovi prestito"
                                                >
                                                    ✖
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {editingId === card.id ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={loanedTo}
                                            onChange={(e) => setLoanedTo(e.target.value)}
                                            placeholder="A chi prestare?"
                                            className="w-full border p-2 rounded"
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            max={remaining}
                                            value={loanQuantity}
                                            onChange={(e) => setLoanQuantity(e.target.value)}
                                            placeholder="Numero copie"
                                            className="w-full border p-2 rounded"
                                        />
                                        <div className="flex gap-2">
                                            {["Matteo", "Giacomo", "Marcello"].map(user => (
                                                <button
                                                    key={user}
                                                    onClick={() => setLoanedTo(user)}
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                                                        loanedTo === user
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
                                                onClick={() => handleAddLoan(card)}
                                                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                                            >
                                                Salva prestito
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setLoanedTo("");
                                                    setLoanQuantity(1);
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
                                            setLoanedTo("");
                                            setLoanQuantity(1);
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Aggiungi prestito
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
