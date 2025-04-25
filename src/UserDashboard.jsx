import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function UserDashboard() {
    const [cards, setCards] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState("Matteo");

    const [name, setName] = useState("");
    const [edition, setEdition] = useState("");
    const [foilCopies, setFoilCopies] = useState(0);
    const [nonFoilCopies, setNonFoilCopies] = useState(0);
    const [notes, setNotes] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        const querySnapshot = await getDocs(collection(db, "cards"));
        const allCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCards(allCards);
    };

    const handleAddCard = async () => {
        if (!name.trim()) {
            alert("Inserisci il nome della carta!");
            return;
        }

        const copies = [];
        for (let i = 0; i < foilCopies; i++) copies.push({ foil: true });
        for (let i = 0; i < nonFoilCopies; i++) copies.push({ foil: false });

        await addDoc(collection(db, "cards"), {
            name: name.trim(),
            owner: selectedOwner,
            edition: edition.trim(),
            notes: notes.trim(),
            copies: copies,
            loans: []
        });

        setName("");
        setEdition("");
        setFoilCopies(0);
        setNonFoilCopies(0);
        setNotes("");
        setSuggestions([]);
        setPreviewImage(null);
        setSuccessMessage("✅ Carta aggiunta con successo!");
        fetchCards();

        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const getTotalLoaned = (loans) => loans.reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    const getTotalLoanedFoil = (loans, foilStatus) =>
        loans.filter(loan => loan.foil === foilStatus).reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    const ownerCards = cards.filter(card => card.owner === selectedOwner);
    const inPrestito = ownerCards.filter(card => getTotalLoaned(card.loans || []) > 0);
    const disponibili = ownerCards.filter(card => {
        const totalLoaned = getTotalLoaned(card.loans || []);
        return (Array.isArray(card.copies) ? card.copies.length : card.copies) - totalLoaned > 0;
    });

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            {/* Selezione utente */}
            <div className="mb-6">
                <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">Seleziona utente:</label>
                <select
                    id="owner"
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                >
                    {["Matteo", "Giacomo", "Marcello"].map(user => (
                        <option key={user} value={user}>{user}</option>
                    ))}
                </select>
            </div>

            {/* Aggiunta nuova carta */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-800 mb-4">➕ Aggiungi nuova carta</h3>
                <div className="space-y-3 relative">
                    <div className="relative flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={name}
                                onChange={async (e) => {
                                    const val = e.target.value;
                                    setName(val);

                                    if (val.length > 1) {
                                        try {
                                            const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(`name:${val}`)}`);
                                            const data = await res.json();
                                            const results = data.data.map(card => ({
                                                name: card.name,
                                                image: card.image_uris?.normal || null,
                                            }));
                                            setSuggestions(results.slice(0, 10));
                                        } catch (error) {
                                            console.error("Errore caricamento suggerimenti:", error);
                                            setSuggestions([]);
                                        }
                                    } else {
                                        setSuggestions([]);
                                        setPreviewImage(null);
                                    }
                                }}
                                placeholder="Nome carta"
                                className="w-full border p-2 rounded"
                            />
                            {suggestions.length > 0 && (
                                <ul className="absolute bg-white border w-full mt-1 z-10 max-h-60 overflow-auto rounded shadow">
                                    {suggestions.map((s, idx) => (
                                        <li
                                            key={idx}
                                            onMouseEnter={() => setPreviewImage(s.image)}
                                            onMouseLeave={() => setPreviewImage(null)}
                                            onClick={() => {
                                                setName(s.name);
                                                setSuggestions([]);
                                                setPreviewImage(null);
                                            }}
                                            className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                                        >
                                            {s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {previewImage && (
                            <div className="hidden sm:block w-36 absolute right-[-160px] top-0 z-20">
                                <img src={previewImage} alt="Preview" className="rounded shadow-lg" />
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        value={edition}
                        onChange={(e) => setEdition(e.target.value)}
                        placeholder="Edizione"
                        className="w-full border p-2 rounded"
                    />

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm mb-1">✨ Copie Foil</label>
                            <input
                                type="number"
                                min="0"
                                value={foilCopies}
                                onChange={(e) => setFoilCopies(Number(e.target.value))}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm mb-1">🃏 Copie Non Foil</label>
                            <input
                                type="number"
                                min="0"
                                value={nonFoilCopies}
                                onChange={(e) => setNonFoilCopies(Number(e.target.value))}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    </div>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Note (facoltative)"
                        className="w-full border p-2 rounded"
                        rows="2"
                    />

                    <button
                        onClick={handleAddCard}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        ➕ Aggiungi carta
                    </button>

                    {successMessage && (
                        <div className="text-green-600 text-center mt-2">{successMessage}</div>
                    )}
                </div>
            </div>

            {/* Carte in prestito */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-yellow-700 mb-2">🔒 Carte in prestito</h3>
                {inPrestito.length === 0 ? (
                    <p className="text-gray-500">Nessuna carta in prestito.</p>
                ) : (
                    <ul className="space-y-4">
                        {inPrestito.map(card => (
                            <li key={card.id} className="border p-3 rounded bg-yellow-50">
                                <div className="font-bold">{card.name}</div>
                                <ul className="text-sm text-gray-700 mt-2 space-y-1">
                                    {card.loans.map((loan, i) => (
                                        <li key={i}>
                                            📦 {loan.quantity} {loan.foil ? "Foil" : "Non Foil"} a {loan.to}
                                            {loan.note && (
                                                <span className="text-gray-500 italic ml-2">📝 {loan.note}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Carte disponibili */}
            <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">✅ Carte disponibili</h3>
                {disponibili.length === 0 ? (
                    <p className="text-gray-500">Nessuna carta disponibile.</p>
                ) : (
                    <ul className="space-y-4">
                        {disponibili.map(card => {
                            const copies = Array.isArray(card.copies) ? card.copies : Array(card.copies).fill({ foil: false });
                            const totalLoanedFoil = getTotalLoanedFoil(card.loans || [], true);
                            const totalLoanedNonFoil = getTotalLoanedFoil(card.loans || [], false);

                            const availableFoil = copies.filter(c => c.foil).length - totalLoanedFoil;
                            const availableNonFoil = copies.filter(c => !c.foil).length - totalLoanedNonFoil;

                            return (
                                <li key={card.id} className="border p-3 rounded bg-green-50">
                                    <div className="font-bold">{card.name}</div>
                                    {card.notes && (
                                        <div className="text-sm italic text-gray-500 mt-1">
                                            📝 {card.notes}
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-700 mt-1">
                                        ✨ Foil disponibili: {availableFoil >= 0 ? availableFoil : 0} <br />
                                        🃏 Non Foil disponibili: {availableNonFoil >= 0 ? availableNonFoil : 0}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
