import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification que tous les champs sont remplis
    if (!form.username || !form.email || !form.password) {
      alert('Tous les champs sont obligatoires');
      return;
    }
    
    try {
      const response = await registerUser(form);
      alert('Utilisateur créé avec succès');
      // Rediriger vers la page de connexion
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit} role="form">
        <input type="text" name="username" placeholder="Nom d'utilisateur" onChange={handleChange} value={form.username} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} value={form.email} required />
        <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} value={form.password} required />
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default Register;