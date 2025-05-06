import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { forwardRef, useImperativeHandle } from "react";

const UserDashboard = forwardRef((props, ref) => {
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
    const [priceEur, setPriceEur] = useState(null);
    const [priceEurFoil, setPriceEurFoil] = useState(null);
    const [sortOption, setSortOption] = useState("nameAsc"); // default: Nome A-Z
    const [searchTerm, setSearchTerm] = useState(""); // testo di ricerca
    const [viewMode, setViewMode] = useState("list"); // "list" o "grid"
    const [editionOptions, setEditionOptions] = useState([]);
    const [selectedEditionId, setSelectedEditionId] = useState("");
    const [manualSelection, setManualSelection] = useState(false);






    useEffect(() => {
        fetchCards();
    }, []);

    useEffect(() => {
        if (manualSelection) {
            setManualSelection(false); // reset per prossime digitazioni
            return;
        }

        const delayDebounce = setTimeout(async () => {
            if (name.trim().length > 1) {
                try {
                    const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(`name:${name}`)}`);
                    const data = await res.json();
                    const results = data.data.map(card => ({
                        name: card.name,
                        image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null,
                        priceEur: card.prices?.eur || null,
                        priceEurFoil: card.prices?.eur_foil || null,
                        prints_search_uri: card.prints_search_uri
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
        }, 150);

        return () => clearTimeout(delayDebounce);
    }, [name, manualSelection]);




    const fetchCards = async () => {
        const querySnapshot = await getDocs(collection(db, "cards"));
        const allCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000; // un giorno in millisecondi

        for (const card of allCards) {
            const lastUpdate = card.lastPriceUpdate ? new Date(card.lastPriceUpdate) : null;

            if (!lastUpdate || (now - lastUpdate > oneDayMs)) {
                // mai aggiornato o aggiornato più di 1 giorno fa
                await updateCardPrice(card);
            }
        }

        setCards(allCards); // carichiamo comunque tutte
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
                imageUrl: previewImage || null,
                priceEur: priceEur,
                priceEurFoil: priceEurFoil,
                lastPriceUpdate: new Date().toISOString()
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
                imageUrl: previewImage || null,
                priceEur: priceEur,
                priceEurFoil: priceEurFoil,
                lastPriceUpdate: new Date().toISOString()
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
        setPriceEur(null);
        setPriceEurFoil(null);
        setSelectedEditionId(""); // 🔄 Reset della tendina edizione
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

    const updateCardPrice = async (card) => {
        try {
            const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(`name:${card.name}`)}`);
            const data = await res.json();
            const foundCard = data.data?.[0];

            if (foundCard) {
                const cardRef = doc(db, "cards", card.id);
                await updateDoc(cardRef, {
                    priceEur: foundCard.prices?.eur || null,
                    priceEurFoil: foundCard.prices?.eur_foil || null,
                    lastPriceUpdate: new Date().toISOString() // aggiorniamo anche la data
                });
            }
        } catch (error) {
            console.error("Errore aggiornamento prezzo:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditingCardId(null);
        setOriginalCardData(null);
        setName("");
        setEdition("");
        setFoilCopies(0);
        setNonFoilCopies(0);
        setNotes("");
        setPreviewImage(null);
        setSuggestions([]);
        setPriceEur(null);
        setPriceEurFoil(null);
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

    const handleDownloadCSV = () => {
        const header = ["Nome", "Edizione", "Foil", "Non Foil", "Note", "Prezzo EUR", "Prezzo EUR Foil"];
        const rows = ownerCards.map(card => {
            const foilCount = (card.copies || []).filter(c => c.foil).length;
            const nonFoilCount = (card.copies || []).filter(c => !c.foil).length;
            return [
                `"${card.name}"`,
                `"${card.edition || ""}"`,
                foilCount,
                nonFoilCount,
                `"${card.notes?.replace(/"/g, '""') || ""}"`,
                card.priceEur || "",
                card.priceEurFoil || ""
            ];
        });

        const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `collezione_${selectedOwner}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useImperativeHandle(ref, () => ({
        downloadCSV: handleDownloadCSV,
        getCollection: () => cards
    }));



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
                    {["Matteo", "Giacomo", "Marcello", "Umberto", "DanMarc"].map(user => (
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
                                onChange={(e) => setName(e.target.value)}
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
                                            onClick={async () => {
                                                setManualSelection(true); // blocca il debounce
                                                setSuggestions([]); // chiude la tendina
                                                setName(s.name);
                                                setPreviewImage(s.image);
                                                setPriceEur(s.priceEur);
                                                setPriceEurFoil(s.priceEurFoil);

                                                try {
                                                    const res = await fetch(s.prints_search_uri);
                                                    const data = await res.json();
                                                    const editions = data.data.map(card => ({
                                                        id: card.id,
                                                        name: card.name,
                                                        set_name: card.set_name,
                                                        set: card.set,
                                                        collector_number: card.collector_number,
                                                        image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null,
                                                        priceEur: card.prices?.eur ?? null,
                                                        priceEurFoil: card.prices?.eur_foil ?? null,
                                                    }));

                                                    setEditionOptions(editions);
                                                    setEdition(""); // reset edizione selezionata
                                                } catch (error) {
                                                    console.error("Errore caricamento edizioni:", error);
                                                    setEditionOptions([]);
                                                }
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

                    <select
                        value={selectedEditionId}
                        onChange={(e) => {
                            const selected = editionOptions.find(opt => opt.id === e.target.value);
                            setSelectedEditionId(e.target.value);
                            if (selected) {
                                setEdition(selected.set); // ancora utile per salvarlo su Firestore
                                setPreviewImage(null); // reset per forzare immagine
                                setTimeout(() => {
                                    setPreviewImage(selected.image);
                                }, 10);
                                setPriceEur(selected.priceEur);
                                setPriceEurFoil(selected.priceEurFoil);
                            }
                        }}
                        disabled={editionOptions.length === 0}
                        className="w-full border p-2 rounded bg-white"
                    >
                        <option value="">Seleziona una stampa</option>
                        {editionOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.set_name} - #{opt.collector_number}
                            </option>
                        ))}
                    </select>



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
                    {editingCardId && (
                        <button
                            onClick={handleCancelEdit}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2"
                        >
                            ❌ Annulla modifica
                        </button>
                    )}

                    {successMessage && (
                        <div className="text-green-600 text-center mt-2">{successMessage}</div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-100 p-4 rounded text-center">
                    <div className="text-sm text-gray-500">Carte Diverse</div>
                    <div className="text-xl font-bold">{ownerCards.length}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded text-center">
                    <div className="text-sm text-gray-500">Copie Foil Totali</div>
                    <div className="text-xl font-bold">{ownerCards.reduce((sum, card) => sum + (card.copies?.filter(c => c.foil).length || 0), 0)}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded text-center">
                    <div className="text-sm text-gray-500">Copie Non Foil Totali</div>
                    <div className="text-xl font-bold">{ownerCards.reduce((sum, card) => sum + (card.copies?.filter(c => !c.foil).length || 0), 0)}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded text-center">
                    <div className="text-sm text-gray-500">Valore Stimato</div>
                    <div className="text-xl font-bold">
                        €{ownerCards.reduce((sum, card) => sum + (parseFloat(card.priceEur || 0) * (card.copies?.filter(c => !c.foil).length || 0)) + (parseFloat(card.priceEurFoil || 0) * (card.copies?.filter(c => c.foil).length || 0)), 0).toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-xl font-semibold text-yellow-700 mb-2">🔒 Carte in prestito</h3>
                {inPrestito.length === 0 ? (
                    <p className="text-gray-500">Nessuna carta in prestito.</p>
                ) : (
                    <ul className="space-y-4">
                        {inPrestito.map(card => (
                            <li key={card.id} className="border p-3 rounded bg-yellow-50 flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <div className="font-bold">{card.name}</div>
                                    <div className="text-xs text-gray-500 italic">
                                        {card.edition ? `Edizione: ${card.edition.toUpperCase()}` : "Edizione non specificata"}
                                    </div>
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
                                </div>
                                {card.imageUrl && (
                                    <div
                                        className="w-24 overflow-hidden rounded shadow-md cursor-pointer"
                                        onMouseEnter={() => setHoveredImage(card.imageUrl)}
                                        onMouseLeave={() => setHoveredImage(null)}
                                    >
                                        <img src={card.imageUrl} alt={card.name} className="rounded" />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="🔍 Cerca per nome..."
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-4 py-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        📝 Lista
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`px-4 py-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        🖼️ Griglia
                    </button>
                </div>
                <div className="flex-1">
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="nameAsc">🔠 Nome A-Z</option>
                        <option value="nameDesc">🔠 Nome Z-A</option>
                        <option value="priceAsc">💶 Prezzo crescente</option>
                        <option value="priceDesc">💶 Prezzo decrescente</option>
                    </select>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">✅ Carte disponibili</h3>
                {disponibili.length === 0 ? (
                    <p className="text-gray-500">Nessuna carta disponibile.</p>) : 
                    (
                        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
                            {disponibili
                                .filter(card => card.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .sort((a, b) => {
                                    const nameA = a.name.toLowerCase();
                                    const nameB = b.name.toLowerCase();
                                    const priceA = parseFloat(a.priceEur || 0) + parseFloat(a.priceEurFoil || 0);
                                    const priceB = parseFloat(b.priceEur || 0) + parseFloat(b.priceEurFoil || 0);
                                    if (sortOption === "nameAsc") return nameA.localeCompare(nameB);
                                    if (sortOption === "nameDesc") return nameB.localeCompare(nameA);
                                    if (sortOption === "priceAsc") return priceA - priceB;
                                    if (sortOption === "priceDesc") return priceB - priceA;
                                    return 0;
                                })
                                .map(card => {
                                    const copies = Array.isArray(card.copies) ? card.copies : Array(card.copies).fill({ foil: false });
                                    const totalLoanedFoil = getTotalLoanedFoil(card.loans || [], true);
                                    const totalLoanedNonFoil = getTotalLoanedFoil(card.loans || [], false);
                                    const availableFoil = copies.filter(c => c.foil).length - totalLoanedFoil;
                                    const availableNonFoil = copies.filter(c => !c.foil).length - totalLoanedNonFoil;

                                    return (
                                        <div
                                            key={card.id}
                                            className={`p-4 rounded-lg transition-all duration-300 ${viewMode === "grid"
                                                ? "bg-white bg-opacity-70 shadow-md border border-gray-200 flex flex-col items-center text-center hover:shadow-lg hover:scale-105 min-h-[300px]"
                                                : "bg-green-50 flex justify-between items-start"
                                            }`}
                                        >
                                            <div className={`flex-1 ${viewMode === "grid" ? "" : "pr-4"}`}>
                                                <div className="font-bold">{card.name}</div>
                                                <div className="text-xs text-gray-500 italic">
                                                    {card.edition ? `Edizione: ${card.edition.toUpperCase()}` : "Edizione non specificata"}
                                                </div>
                                                {card.notes && (
                                                    <div className="text-sm italic text-gray-500 mt-1">📝 {card.notes}</div>
                                                )}
                                                <div className="text-sm text-gray-700 mt-1">
                                                    ✨ Foil disponibili: {availableFoil >= 0 ? availableFoil : 0}<br />
                                                    🃏 Non Foil disponibili: {availableNonFoil >= 0 ? availableNonFoil : 0}
                                                </div>
                                                {(card.priceEur || card.priceEurFoil) && (
                                                    <div className="text-sm text-gray-700 mt-1">
                                                        💶 Prezzo stimato: {card.priceEur ? `Normale €${parseFloat(card.priceEur).toFixed(2)}` : "-"}
                                                        {card.priceEurFoil ? ` / Foil €${parseFloat(card.priceEurFoil).toFixed(2)}` : ""}
                                                    </div>
                                                )}
                                                {viewMode === "list" && (
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
                                                )}
                                            </div>
                                            {card.imageUrl && (
                                                <div
                                                    className={`mt-3 ${viewMode === "grid" ? "w-32" : "w-24"} overflow-hidden rounded shadow-md cursor-pointer`}
                                                    onMouseEnter={() => setHoveredImage(card.imageUrl)}
                                                    onMouseLeave={() => setHoveredImage(null)}
                                                >
                                                    <img src={card.imageUrl} alt={card.name} className="rounded" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>

                    )}
            </div>

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

});

export default UserDashboard;
