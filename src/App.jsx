import './App.css';
import AddCard from './AddCard.jsx';
import CardList from './CardList';

function App() {
  return (
    <div className="p-4 max-w-xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Collezione Carte</h1>
      <AddCard />
    </div>
  );
}

export default App;

