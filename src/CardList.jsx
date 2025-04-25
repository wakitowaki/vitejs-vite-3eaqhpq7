import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";

export default function CardList() {
    const [cards, setCards] = useState([]);
    const [filter, setFilter] = useState("Tutti");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [hoveredImage, setHoveredImage] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const getTotalLoanedFoil = (loans, foilStatus) =>
        loans
            .filter(loan => loan.foil === foilStatus)
            .reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    const filteredCards = cards.filter(card => {
        const matchesOwner = filter === "Tutti" || card.owner === filter;
        const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesOwner && matchesSearch;
    });

    return (
        <div className="bg-white rounded-xl shadow-md p-6" onMouseMove={handleMouseMove}>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">📋 Tutte le carte</h2>

            {/* Filtro + ricerca */}
            <div className="mb-4 flex flex-wrap gap-2">
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

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="🔎 Cerca carta..."
                    value={searchQuery}
                    onChange={(e) => {
                        const query = e.target.value;
                        setSearchQuery(query);

                        if (query.length > 0) {
                            const filteredSuggestions = cards
                                .map(card => card.name)
                                .filter(name => name.toLowerCase().includes(query.toLowerCase()));
                            setSuggestions(filteredSuggestions.slice(0, 5));
                        } else {
                            setSuggestions([]);
                        }
                    }}
                    className="w-full border p-2 rounded"
                />

                {suggestions.length > 0 && (
                    <ul className="absolute bg-white border rounded w-full mt-1 shadow-lg z-10">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => {
                                    setSearchQuery(suggestion);
                                    setSuggestions([]);
                                }}
                                className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {filteredCards.length === 0 ? (
                <p className="text-gray-500">Nessuna carta trovata.</p>
            ) : (
                <ul className="space-y-4">
                    {filteredCards.map(card => {
                        const totalLoaned = card.loans.reduce((sum, loan) => sum + (loan.quantity || 0), 0);
                        const totalCopies = Array.isArray(card.copies) ? card.copies.length : card.copies;

                        const foilCopies = Array.isArray(card.copies)
                            ? card.copies.filter(copy => copy.foil).length
                            : 0;
                        const nonFoilCopies = Array.isArray(card.copies)
                            ? card.copies.filter(copy => !copy.foil).length
                            : card.copies;

                        const loanedFoil = getTotalLoanedFoil(card.loans, true);
                        const loanedNonFoil = getTotalLoanedFoil(card.loans, false);

                        const availableFoil = foilCopies - loanedFoil;
                        const availableNonFoil = nonFoilCopies - loanedNonFoil;

                        return (
                            <li
                                key={card.id}
                                className="p-4 border rounded-lg bg-gray-50 shadow-sm flex justify-between items-start"
                            >
                                {/* Testo a sinistra */}
                                <div className="flex-1 pr-4">
                                    <div className="text-lg font-bold text-gray-800">{card.name}</div>
                                    <div className="text-sm text-gray-600">👤 {card.owner}</div>
                                    {card.edition && (
                                        <div className="text-sm text-gray-600">🏷️ Edizione: {card.edition}</div>
                                    )}
                                    {card.notes && (
                                        <div className="text-sm text-gray-500 italic">📝 {card.notes}</div>
                                    )}
                                    <div className="text-sm text-gray-600 mt-1">
                                        📦 Totale copie: {totalCopies}
                                        <br />
                                        ✨ Foil: {availableFoil} | 🃏 Non Foil: {availableNonFoil}
                                    </div>
                                </div>

                                {/* Immagine a destra */}
                                {card.imageUrl && (
                                    <div
                                        className="w-24 overflow-hidden rounded shadow-md cursor-pointer"
                                        onMouseEnter={() => setHoveredImage(card.imageUrl)}
                                        onMouseLeave={() => setHoveredImage(null)}
                                    >
                                        <img
                                            src={card.imageUrl}
                                            alt={card.name}
                                            className="rounded transition-opacity duration-200"
                                        />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Overlay immagine ingrandita */}
            {hoveredImage && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        top: mousePosition.y + 20,
                        left: mousePosition.x + 20,
                    }}
                >
                    <img
                        src={hoveredImage}
                        alt="Anteprima"
                        className="w-64 rounded-lg shadow-xl border border-gray-300"
                    />
                </div>
            )}
        </div>
    );
}
