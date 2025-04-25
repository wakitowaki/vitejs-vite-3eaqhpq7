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
            {/* Selezione utente, Aggiunta/Modifica carta */}

            {/* Carte in prestito */}

            {/* Carte disponibili */}
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
                            <li key={card.id} className="border p-3 rounded bg-green-50 flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <div className="font-bold">{card.name}</div>
                                    {card.notes && (
                                        <div className="text-sm italic text-gray-500 mt-1">📝 {card.notes}</div>
                                    )}
                                    <div className="text-sm text-gray-700 mt-1">
                                        ✨ Foil disponibili: {availableFoil >= 0 ? availableFoil : 0} <br />
                                        🃏 Non Foil disponibili: {availableNonFoil >= 0 ? availableNonFoil : 0}
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleEditCard(card)}
                                            className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                        >
                                            ✏️ Modifica
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCard(card.id)}
                                            className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        >
                                            🗑️ Elimina
                                        </button>
                                    </div>
                                </div>
                                {card.imageUrl && (
                                    <div className="w-24 overflow-hidden rounded shadow-md cursor-pointer">
                                        <img src={card.imageUrl} alt={card.name} className="rounded" />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

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
