import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function UserDashboard() {
    const [cards, setCards] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState("Matteo");
    const [name, setName] = useState("");
    const [edition, setEdition] = useState("");
    const [notes, setNotes] = useState("");
    const [foilCopies, setFoilCopies] = useState(0);
    const [nonFoilCopies, setNonFoilCopies] = useState(0);

    useEffect(() => {
        const fetchCards = async () => {
            const querySnapshot = await getDocs(collection(db, "cards"));
            const allCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCards(allCards);
        };
        fetchCards();
    }, []);

    const handleAddCard = async (e) => {
        e.preventDefault();

        const newCopies = [
            ...Array(parseInt(foilCopies)).fill({ foil: true }),
            ...Array(parseInt(nonFoilCopies)).fill({ foil: false })
        ];

        await addDoc(collection(db, "cards"), {
            name,
            owner: selectedOwner,
            edition,
            notes,
            copies: newCopies,
            loans: []
        });

        setName("");
        setEdition("");
        setNotes("");
        setFoilCopies(0);
        setNonFoilCopies(0);
        const querySnapshot = await getDocs(collection(db, "cards"));
        const allCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCards(allCards);
    };

    const getTotalLoaned = (loans) =>
        loans.reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    const ownerCards = cards.filter(card => card.owner === selectedOwner);
    const inPrestito = ownerCards.filter(card => getTotalLoaned(card.loans || []) > 0);
    const disponibili = ownerCards.filter(card => {
        const totalLoaned = getTotalLoaned(card.loans || []);
        return (card.copies?.length || 0) - totalLoaned > 0;
    });

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="mb-6">
                <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">Seleziona utente:</label>
                <select
                    id="owner"
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                >
                    {['Matteo', 'Giacomo', 'Marcello'].map(user => (
                        <option key={user} value={user}>{user}</option>
                    ))}
                </select>
            </div>

            <form onSubmit={handleAddCard} className="bg-gray-100 p-4 rounded mb-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800">➕ Aggiungi nuova carta</h3>
                <input
                    type="text"
                    placeholder="Nome carta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                />
                <input
                    type="text"
                    placeholder="Edizione"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <input
                    type="text"
                    placeholder="Note"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Copie Non Foil</label>
                        <input
                            type="number"
                            min="0"
                            value={nonFoilCopies}
                            onChange={(e) => setNonFoilCopies(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Copie Foil</label>
                        <input
                            type="number"
                            min="0"
                            value={foilCopies}
                            onChange={(e) => setFoilCopies(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    Aggiungi Carta
                </button>
            </form>

            <h2 className="text-2xl font-bold text-blue-800 mb-4">📂 Dashboard di {selectedOwner}</h2>

            <div className="mb-6">
                <h3 className="text-xl font-semibold text-yellow-700 mb-2">🔒 Carte in prestito</h3>
                {inPrestito.length === 0 ? (
                    <p className="text-gray-500">Nessuna carta in prestito.</p>
                ) : (
                    <ul className="space-y-2">
                        {inPrestito.map(card => (
                            <li key={card.id} className="border p-3 rounded bg-yellow-50">
                                <strong>{card.name}</strong> - {getTotalLoaned(card.loans)} prestata(e)
                                <ul className="text-sm text-gray-700 mt-1">
                                    {card.loans.map((loan, i) => (
                                        <li key={i}>📦 {loan.quantity} a {loan.to}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">✅ Carte disponibili</h3>
                {disponibili.length === 0 ? (
                    <p className="text-gray-500">Nessuna carta disponibile.</p>
                ) : (
                    <ul className="space-y-2">
                        {disponibili.map(card => {
                            const totalLoaned = getTotalLoaned(card.loans || []);
                            const remaining = (card.copies?.length || 0) - totalLoaned;
                            return (
                                <li key={card.id} className="border p-3 rounded bg-green-50">
                                    <strong>{card.name}</strong> - {remaining} disponibile(i)
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
