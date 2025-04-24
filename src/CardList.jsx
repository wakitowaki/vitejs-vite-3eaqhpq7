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
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">📋 Tutte le carte</h2>
            {cards.length === 0 ? (
                <p className="text-gray-500">Nessuna carta trovata.</p>
            ) : (
                <ul className="space-y-4">
                    {cards.map(card => (
                        <li key={card.id} className="border p-4 rounded bg-gray-50">
                            <div className="text-lg font-medium">{card.name} <span className="text-sm text-gray-500">({card.copies} copie)</span></div>
                            <div className="text-sm text-gray-600">👤 {card.owner}</div>
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
