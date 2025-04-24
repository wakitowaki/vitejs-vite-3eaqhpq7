import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function AddCard() {
    const [name, setName] = useState("");
    const [copies, setCopies] = useState(1);
    const [owner, setOwner] = useState("Matteo");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;

        await addDoc(collection(db, "cards"), {
            name,
            copies: parseInt(copies),
            owner,
            isLoaned: false,
            loanedTo: ""
        });

        setName("");
        setCopies(1);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-2xl font-semibold text-gray-700">➕ Aggiungi Carta</h2>
            <input
                type="text"
                placeholder="Nome carta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            />
            <input
                type="number"
                placeholder="Numero copie"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            />
            <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            >
                <option>Matteo</option>
                <option>Giacomo</option>
                <option>Marcello</option>
            </select>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
                Aggiungi
            </button>
        </form>
    );
}
