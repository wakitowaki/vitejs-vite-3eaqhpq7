import './App.css';
import AddCard from './AddCard';
import CardList from './CardList';

function App() {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 p-6 font-sans">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">📚 Collezione Carte</h1>
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <AddCard />
                </div>
                <CardList />
            </div>
        </div>
    );
}

export default App;

