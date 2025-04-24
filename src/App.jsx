import './App.css';
import AddCard from './AddCard';
import CardList from './CardList';
import CardSearch from './CardSearch';

function App() {
    return (
        <div className="container">
            <h1>📚 Collezione Carte</h1>
            <AddCard />
            <CardSearch />
            <CardList />
        </div>
    );
}

export default App;