const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
require('dotenv').config();

// Augmenter le timeout global pour tous les tests de ce fichier
jest.setTimeout(30000);

describe('Middleware d\'authentification', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    // Structure le mock pour qu'il soit compatible avec notre middleware
    mockRequest = {
      headers: {},
      header: jest.fn().mockImplementation(x => mockRequest.headers[x.toLowerCase()]),
    };
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(() => mockResponse),
    };
    nextFunction = jest.fn();
  });

  beforeAll(async () => {
    // S'assurer que la connexion MongoDB est établie avant les tests
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Fermer correctement la connexion MongoDB après les tests
    await mongoose.connection.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Doit retourner 401 si le token n\'est pas fourni', async () => {
    await auth(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Accès refusé' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('Doit retourner 401 si le token est invalide', async () => {
    mockRequest.headers.authorization = 'invalid_token';

    await auth(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token invalide' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('Doit appeler next() si le token est valide', async () => {
    // Créer un faux utilisateur pour le test
    const user = new User({
      username: 'testuser',
      email: `middleware_test_${Date.now()}@example.com`,
      password: 'password123'
    });
    const savedUser = await user.save();
    
    // Générer un vrai token JWT pour cet utilisateur
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
    mockRequest.headers.authorization = token;

    await auth(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.userId).toBe(savedUser._id.toString());
    
    // Nettoyer après le test
    await User.findByIdAndDelete(savedUser._id);
  }, 30000); // Timeout spécifique pour ce test

  test('Doit retourner 401 si l\'utilisateur n\'existe plus', async () => {
    // Générer un token avec un ID utilisateur qui n'existe pas
    const nonExistentId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: nonExistentId }, process.env.JWT_SECRET);
    mockRequest.headers.authorization = token;

    await auth(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé' });
    expect(nextFunction).not.toHaveBeenCalled();
  }, 30000); // Timeout spécifique pour ce test
});