import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
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
    const [hoveredImage, setHoveredImage] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [editingCardId, setEditingCardId] = useState(null);
    const [originalCardData, setOriginalCardData] = useState(null);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        const querySnapshot = await getDocs(collection(db, "cards"));
        const allCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCards(allCards);
    };

    const handleAddOrUpdateCard = async () => {
        if (!name.trim()) {
            alert("Inserisci il nome della carta!");
            return;
        }

        const copies = [];
        for (let i = 0; i < foilCopies; i++) copies.push({ foil: true });
        for (let i = 0; i < nonFoilCopies; i++) copies.push({ foil: false });

        if (editingCardId) {
            const cardRef = doc(db, "cards", editingCardId);
            await updateDoc(cardRef, {
                name: name.trim(),
                owner: selectedOwner,
                edition: edition.trim(),
                notes: notes.trim(),
                copies: copies,
                imageUrl: previewImage || null
            });
            setSuccessMessage("✅ Carta aggiornata con successo!");
        } else {
            await addDoc(collection(db, "cards"), {
                name: name.trim(),
                owner: selectedOwner,
                edition: edition.trim(),
                notes: notes.trim(),
                copies: copies,
                loans: [],
                imageUrl: previewImage || null
            });
            setSuccessMessage("✅ Carta aggiunta con successo!");
        }

        setName("");
        setEdition("");
        setFoilCopies(0);
        setNonFoilCopies(0);
        setNotes("");
        setSuggestions([]);
        setPreviewImage(null);
        setEditingCardId(null);
        setOriginalCardData(null);
        fetchCards();

        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleEditCard = (card) => {
        setEditingCardId(card.id);
        setOriginalCardData(card);
        setName(card.name);
        setEdition(card.edition || "");
        setNotes(card.notes || "");
        setPreviewImage(card.imageUrl || null);

        const foilCount = (card.copies || []).filter(c => c.foil).length;
        const nonFoilCount = (card.copies || []).filter(c => !c.foil).length;
        setFoilCopies(foilCount);
        setNonFoilCopies(nonFoilCount);
    };

    const handleDeleteCard = async (cardId) => {
        if (confirm("Sei sicuro di voler eliminare questa carta?")) {
            const cardRef = doc(db, "cards", cardId);
            await deleteDoc(cardRef);
            fetchCards();
        }
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

    const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md" onMouseMove={handleMouseMove}>
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

            <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-800 mb-4">{editingCardId ? "💾 Modifica carta" : "➕ Aggiungi nuova carta"}</h3>
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
                                                image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null,
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
                                                setPreviewImage(s.image);
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
                            <div className="hidden sm:block w-52 absolute right-[-220px] top-0 z-20">
                                <img src={previewImage} alt="Preview" className="rounded-xl shadow-lg border border-gray-200" />
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
                        onClick={handleAddOrUpdateCard}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        {editingCardId ? "💾 Salva modifica" : "➕ Aggiungi carta"}
                    </button>

                    {successMessage && (
                        <div className="text-green-600 text-center mt-2">{successMessage}</div>
                    )}
                </div>
            </div>

            {/* Qui continua come prima: carte in prestito, carte disponibili, anteprima immagine */}

            {/* Lista carte in prestito */}

            {/* Lista carte disponibili */}
        </div>
        
    );
}
