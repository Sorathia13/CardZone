import { useState } from 'react';
import { registerUser } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(form);
      alert('Utilisateur créé avec succès');
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Nom d'utilisateur" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default Register;