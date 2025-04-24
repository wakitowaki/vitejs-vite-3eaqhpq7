import './App.css';
import AddCard from './AddCard';
import CardList from './CardList';

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 font-sans px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-10">📚 Collezione Carte</h1>
                <div className="bg-white rounded-xl shadow-md p-6 mb-10">
                    <AddCard />
                </div>
                <CardList />
            </div>
        </div>
    );
}

export default App;
