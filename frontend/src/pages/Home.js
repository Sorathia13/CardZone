import React, { useEffect, useState } from 'react'; // Importer les hooks React
import { getWelcomeMessage } from '../services/api'; // Importer la fonction API

const Home = () => {
    const [message, setMessage] = useState(''); // Initialiser le message avec une chaîne vide
    const [card, setCard] = useState({ name: '', category: '', price: '' });

    useEffect(() => { // Utiliser un effet pour charger le message au chargement du composant
        getWelcomeMessage().then(data => setMessage(data)); // Appeler la fonction API et mettre à jour le message
    }, []); // Ne lancer l'effet qu'une seule fois

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCard({ ...card, [name]: value });
    };

    const handleAddCard = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(card),
            });
            const data = await response.json();
            console.log('Carte ajoutée :', data);
        } catch (error) {
            console.error("Erreur lors de l'ajout de la carte :", error);
        }
    };

    return (
        <div>
            <h1>Bienvenue sur le site de vente de cartes</h1>
            <p>{message}</p>

            <h2>Ajouter une carte</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    name="name"
                    placeholder="Nom de la carte"
                    value={card.name}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Catégorie"
                    value={card.category}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Prix"
                    value={card.price}
                    onChange={handleInputChange}
                />
                <button onClick={handleAddCard}>Ajouter la carte</button>
            </form>
        </div>
    );
};

export default Home;