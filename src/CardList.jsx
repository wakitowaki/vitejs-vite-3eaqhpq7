import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default function CardList() {
    const [cards, setCards] = useState([]);
    const [filter, setFilter] = useState("Tutti");

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

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">📋 Tutte le carte</h2>

            {/* 🔘 Filtro per proprietario */}
            <div className="mb-6 flex flex-wrap gap-2">
                {["Tutti", "Matteo", "Giacomo", "Marcello"].map(owner => (
                    <button
                        key={owner}
                        onClick={() => setFilter(owner)}
                        className={`px-4 py-2 rounded-full font-semibold transition
              ${filter === owner
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"}
            `}
                    >
                        {owner}
                    </button>
                ))}
            </div>

            {/* 📋 Lista carte */}
            {filteredCards.length === 0 ? (
                <p className="text-gray-500">Nessuna carta trovata.</p>
            ) : (
                <ul className="space-y-4">
                    {filteredCards.map(card => (
                        <li key={card.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            <div className="text-lg font-bold text-gray-800">{card.name}</div>
                            <div className="text-sm text-gray-600">👤 {card.owner}</div>
                            <div className="text-sm text-gray-600">📦 Copie: {card.copies}</div>
                            <div className="text-sm text-gray-600">
                                🔁 Prestito: {card.isLoaned ? `Sì, a ${card.loanedTo}` : "No"}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
