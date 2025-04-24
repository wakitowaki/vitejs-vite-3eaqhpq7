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
        <div className="mt-8 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Tutte le carte</h2>
            {cards.length === 0 ? (
                <p>Nessuna carta trovata.</p>
            ) : (
                <ul className="space-y-2">
                    {cards.map(card => (
                        <li key={card.id} className="border-b pb-2">
                            <strong>{card.name}</strong> ({card.copies} copie) <br />
                            👤 Proprietario: {card.owner} <br />
                            🔁 In prestito: {card.isLoaned ? `Sì, a ${card.loanedTo}` : "No"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
