
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
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

    const [editingCardId, setEditingCardId] = useState(null);
    const [editData, setEditData] = useState({ name: "", edition: "", notes: "", foil: 0, nonFoil: 0 });

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
            loans: [],
            imageUrl: previewImage || null
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

    const handleSaveEdit = async (cardId) => {
        const cardRef = doc(db, "cards", cardId);
        const copies = [];
        for (let i = 0; i < editData.foil; i++) copies.push({ foil: true });
        for (let i = 0; i < editData.nonFoil; i++) copies.push({ foil: false });

        await updateDoc(cardRef, {
            name: editData.name,
            edition: editData.edition,
            notes: editData.notes,
            copies: copies,
        });

        setEditingCardId(null);
        fetchCards();
    };

    const getTotalLoanedFoil = (loans, foilStatus) =>
        loans.filter(loan => loan.foil === foilStatus).reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    const ownerCards = cards.filter(card => card.owner === selectedOwner);
    const disponibili = ownerCards.filter(card => {
        const totalLoaned = card.loans?.reduce((sum, loan) => sum + (loan.quantity || 0), 0) || 0;
        return (Array.isArray(card.copies) ? card.copies.length : card.copies) - totalLoaned > 0;
    });

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleziona utente:</label>
                <select
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                >
                    {["Matteo", "Giacomo", "Marcello"].map(user => (
                        <option key={user} value={user}>{user}</option>
                    ))}
                </select>
            </div>

            {/* Sezione Aggiunta Nuova Carta */}
            {/* (Rimasta uguale) */}

            {/* Carte Disponibili */}
            <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">✅ Carte disponibili</h3>
                {disponibili.length === 0 ? (
                    <p className="text-gray-500">Nessuna carta disponibile.</p>
                ) : (
                    <ul className="space-y-4">
                        {disponibili.map(card => {
                            const copies = Array.isArray(card.copies) ? card.copies : [];
                            const totalLoanedFoil = getTotalLoanedFoil(card.loans || [], true);
                            const totalLoanedNonFoil = getTotalLoanedFoil(card.loans || [], false);

                            const availableFoil = copies.filter(c => c.foil).length - totalLoanedFoil;
                            const availableNonFoil = copies.filter(c => !c.foil).length - totalLoanedNonFoil;

                            return (
                                <li key={card.id} className="border p-4 rounded bg-green-50 flex justify-between items-start">
                                    {editingCardId === card.id ? (
                                        <div className="flex-1 pr-4 space-y-2">
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="w-full border p-2 rounded"
                                                placeholder="Nome carta"
                                            />
                                            <input
                                                type="text"
                                                value={editData.edition}
                                                onChange={(e) => setEditData({ ...editData, edition: e.target.value })}
                                                className="w-full border p-2 rounded"
                                                placeholder="Edizione"
                                            />
                                            <textarea
                                                value={editData.notes}
                                                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                                className="w-full border p-2 rounded"
                                                placeholder="Note"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={editData.foil}
                                                    min="0"
                                                    onChange={(e) => setEditData({ ...editData, foil: parseInt(e.target.value) })}
                                                    className="w-full border p-2 rounded"
                                                    placeholder="Foil"
                                                />
                                                <input
                                                    type="number"
                                                    value={editData.nonFoil}
                                                    min="0"
                                                    onChange={(e) => setEditData({ ...editData, nonFoil: parseInt(e.target.value) })}
                                                    className="w-full border p-2 rounded"
                                                    placeholder="Non Foil"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSaveEdit(card.id)} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
                                                    Salva
                                                </button>
                                                <button onClick={() => setEditingCardId(null)} className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500">
                                                    Annulla
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 pr-4">
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
                                            <button
                                                onClick={() => setEditingCardId(card.id) || setEditData({
                                                    name: card.name,
                                                    edition: card.edition,
                                                    notes: card.notes,
                                                    foil: copies.filter(c => c.foil).length,
                                                    nonFoil: copies.filter(c => !c.foil).length,
                                                })}
                                                className="mt-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                                            >
                                                ✏️ Modifica
                                            </button>
                                        </div>
                                    )}
                                    {card.imageUrl && (
                                        <img src={card.imageUrl} alt={card.name} className="w-24 rounded shadow" />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
