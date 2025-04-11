import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
    }
  }, [navigate]);



  return (
    <div>
      <h2>Tableau de bord</h2>
      <p>Bienvenue sur votre tableau de bord, {user?.username}</p>
    </div>
  );
};

export default Dashboard;