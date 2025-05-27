// Mock simple pour jwt-decode
const jwtDecode = jest.fn().mockImplementation((token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token specified');
  }
  
  // Retourne un objet décodé simulé
  return {
    id: 'user123',
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600 // Expiration dans 1 heure
  };
});

module.exports = jwtDecode;