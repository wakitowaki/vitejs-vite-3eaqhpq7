// AddCard.jsx
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
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded shadow">
      <h2 className="font-bold mb-2">Aggiungi Carta</h2>
      <input
        type="text"
        placeholder="Nome carta"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block mb-2 p-2 border w-full"
      />
      <input
        type="number"
        placeholder="Numero copie"
        value={copies}
        onChange={(e) => setCopies(e.target.value)}
        className="block mb-2 p-2 border w-full"
      />
      <select
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        className="block mb-2 p-2 border w-full"
      >
        <option>Matteo</option>
        <option>Giacomo</option>
        <option>Marcello</option>
      </select>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Aggiungi
      </button>
    </form>
  );
}
