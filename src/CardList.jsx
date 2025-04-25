import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";

export default function CardList() {
    const [cards, setCards] = useState([]);
    const [filter, setFilter] = useState("Tutti");
    const [editingId, setEditingId] = useState(null);
    const [loanedTo, setLoanedTo] = useState("");
    const [loanQuantity, setLoanQuantity] = useState(1);
    const [loanFoil, setLoanFoil] = useState(false);
    const [loanNote, setLoanNote] = useState("");
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

    const handleAddLoan = async (card) => {
        if (!loanedTo.trim() || loanQuantity <= 0) return;

        const cardRef = doc(db, "cards", card.id);

        await updateDoc(cardRef, {
            loans: arrayUnion({
                to: loanedTo.trim(),
                quantity: parseInt(loanQuantity),
                foil: loanFoil,
                note: loanNote.trim()
            })
        });

        setEditingId(null);
        setLoanedTo("");
        setLoanQuantity(1);
        setLoanFoil(false);
        setLoanNote("");
        fetchCards();
    };


    const handleDeleteCard = async (card) => {
        const confirmed = window.confirm(`Vuoi davvero eliminare "${card.name}"?`);
        if (!confirmed) return;

        await deleteDoc(doc(db, "cards", card.id));
        fetchCards();
    };

    const getTotalLoaned = (loans) =>
        loans.reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    const filteredCards = filter === "Tutti"
        ? cards
        : cards.filter(card => card.owner === filter);

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
                        const totalCopies = Array.isArray(card.copies) ? card.copies.length : card.copies;
                        const remaining = totalCopies - totalLoaned;

                        return (
                            <li key={card.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                                <div className="text-lg font-bold text-gray-800">{card.name}</div>
                                <div className="text-sm text-gray-600">👤 {card.owner}</div>
                                {card.edition && (
                                    <div className="text-sm text-gray-600">🏷️ Edizione: {card.edition}</div>
                                )}
                                {card.notes && (
                                    <div className="text-sm text-gray-500 italic">📝 {card.notes}</div>
                                )}
                                <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                    📦 Totale copie: {totalCopies}
                                </div>

                                <div className="text-sm text-gray-600 mb-2">
                                    🧮 In prestito: {totalLoaned} | Disponibili: {remaining}
                                </div>

                                {card.loans.length > 0 && (
                                    <ul className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded mb-2 space-y-1">
                                        {card.loans.map((loan, index) => (
                                            <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <span>📦 {loan.quantity} {loan.foil ? "Foil" : "Non Foil"} a {loan.to}
                                                    {loan.note && (
                                                        <span className="text-gray-500 italic ml-2">📝 {loan.note}</span>
                                                    )}
                                                </span>
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
                                            value={loanQuantity}
                                            onChange={(e) => setLoanQuantity(e.target.value)}
                                            placeholder="Numero copie"
                                            className="w-full border p-2 rounded"
                                        />

                                        {/* FOIL o NON FOIL */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setLoanFoil(false)}
                                                type="button"
                                                className={`px-4 py-2 rounded-full ${!loanFoil ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                                            >
                                                Non Foil
                                            </button>
                                            <button
                                                onClick={() => setLoanFoil(true)}
                                                type="button"
                                                className={`px-4 py-2 rounded-full ${loanFoil ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                                            >
                                                Foil
                                            </button>
                                        </div>

                                        {/* NOTA */}
                                        <textarea
                                            value={loanNote}
                                            onChange={(e) => setLoanNote(e.target.value)}
                                            placeholder="Nota sul prestito (facoltativa)"
                                            className="w-full border p-2 rounded"
                                            rows="2"
                                        />

                                        {/* Bottoni Salva/Annulla */}
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
                                                    setLoanFoil(false);
                                                    setLoanNote("");
                                                }}
                                                className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500"
                                            >
                                                Annulla
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {remaining > 0 && (
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
                                        {card.loans.length > 0 && (
                                            <button
                                                onClick={async () => {
                                                    const cardRef = doc(db, "cards", card.id);
                                                    await updateDoc(cardRef, { loans: [] });
                                                    fetchCards();
                                                }}
                                                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                                            >
                                                Rimuovi tutti i prestiti
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
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
