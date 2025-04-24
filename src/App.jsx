import './App.css';
import AddCard from './AddCard';
import CardList from './CardList';
import { useState } from 'react';

function App() {
    const [refreshFlag, setRefreshFlag] = useState(false);

    const handleCardAdded = () => {
        setRefreshFlag(prev => !prev); // toggla un valore booleano per forzare il refresh
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 font-sans px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-10">📚 Collezione Carte</h1>

                <div className="bg-white rounded-xl shadow-md p-6 mb-10">
                    <AddCard onCardAdded={handleCardAdded} />
                </div>

                <CardList refreshTrigger={refreshFlag} />
            </div>
        </div>
    );
}

export default App;
