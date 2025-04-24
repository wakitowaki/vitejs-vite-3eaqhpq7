import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default function CardSearch() {
    const [allCards, setAllCards] = useState([]);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchCards = async () => {
            const querySnapshot = await getDocs(collection(db, "cards"));
            const cards = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllCards(cards);
        };

        fetchCards();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        setResults(
            allCards.filter(card =>
                card.name.toLowerCase().includes(value)
            )
        );
    };

    return (
        <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">🔎 Cerca Carta</h2>
            <input
                type="text"
                placeholder="Scrivi il nome della carta..."
                value={search}
                onChange={handleSearch}
                className="w-full p-3 border rounded-lg mb-4"
            />
            {search && (
                <ul className="space-y-3">
                    {results.map(card => (
                        <li key={card.id} className="p-4 bg-gray-50 border rounded">
                            <strong>{card.name}</strong> ({card.copies} copie)<br />
                            👤 {card.owner}<br />
                            🔁 {card.isLoaned ? `Prestata a ${card.loanedTo}` : "Non in prestito"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
