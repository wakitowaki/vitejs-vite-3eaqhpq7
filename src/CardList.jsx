import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default function CardList() {
    const [cards, setCards] = useState([]);

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

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">📋 Tutte le carte</h2>
            {cards.length === 0 ? (
                <p className="text-gray-500">Nessuna carta trovata.</p>
            ) : (
                <ul className="space-y-4">
                    {cards.map(card => (
                        <li key={card.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            <div className="text-lg font-bold text-gray-800">{card.name}</div>
                            <div className="text-sm text-gray-600">👤 Proprietario: {card.owner}</div>
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
