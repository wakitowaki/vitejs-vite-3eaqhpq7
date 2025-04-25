import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function UserDashboard() {
    const [cards, setCards] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState("Matteo");

    useEffect(() => {
        const fetchCards = async () => {
            const querySnapshot = await getDocs(collection(db, "cards"));
            const allCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCards(allCards);
        };
        fetchCards();
    }, []);

    const getTotalLoaned = (loans) =>
        loans.reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    const ownerCards = cards.filter(card => card.owner === selectedOwner);
    const inPrestito = ownerCards.filter(card => getTotalLoaned(card.loans || []) > 0);
    const disponibili = ownerCards.filter(card => {
        const totalLoaned = getTotalLoaned(card.loans || []);
        return (Array.isArray(card.copies) ? card.copies.length : card.copies) - totalLoaned > 0;
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

            <h2 className="text-2xl font-bold text-blue-800 mb-4">📂 Dashboard di {selectedOwner}</h2>

            <div className="mb-6">
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

            <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">✅ Carte disponibili</h3>
                {disponibili.length === 0 ? (
                    <p className="text-gray-500">Nessuna carta disponibile.</p>
                ) : (
                    <ul className="space-y-4">
                        {disponibili.map(card => {
                            const totalLoaned = getTotalLoaned(card.loans || []);
                            const remaining = (Array.isArray(card.copies) ? card.copies.length : card.copies) - totalLoaned;
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
