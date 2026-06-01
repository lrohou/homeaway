import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.js';
import * as db from '../../config/database.js';
import bcrypt from 'bcryptjs';

// Configuration du serveur de test
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock de la base de données et de l'envoi d'email
vi.mock('../../config/database.js');
vi.mock('../../utils/email.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(true)
}));

describe('Auth Routes - Tests Intégration & Sécurité', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/send-code', () => {
    it('devrait retourner 400 si l\'email est manquant (Edge Case)', async () => {
      const response = await request(app).post('/api/auth/send-code').send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email is required');
    });

    it('devrait envoyer un code et retourner 200 (Cas Nominal)', async () => {
      db.run.mockResolvedValueOnce({}); // DELETE précédent code
      db.run.mockResolvedValueOnce({}); // INSERT nouveau code

      const response = await request(app)
        .post('/api/auth/send-code')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Verification code sent');
      expect(db.run).toHaveBeenCalledTimes(2);
    });
  });

  describe('POST /api/auth/register', () => {
    const validPayload = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
      name: 'Test User',
      code: '123456'
    };

    it('devrait retourner 409 si l\'utilisateur existe déjà (Security Case)', async () => {
      // Simulation d'un utilisateur existant
      db.query.mockResolvedValueOnce([{ id: 1 }]); 

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Email already registered');
    });

    it('devrait retourner 400 pour un code de vérification invalide (Security Case)', async () => {
      db.query.mockResolvedValueOnce([]); // Aucun utilisateur existant
      db.query.mockResolvedValueOnce([]); // Code invalide ou expiré

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid or expired verification code');
    });

    it('devrait créer un utilisateur et retourner un token (Cas Nominal)', async () => {
      db.query.mockResolvedValueOnce([]); // Aucun utilisateur existant
      db.query.mockResolvedValueOnce([{ id: 1, email: validPayload.email }]); // Code valide
      db.run.mockResolvedValueOnce({ lastID: 1 }); // INSERT user
      db.run.mockResolvedValueOnce({}); // DELETE code
      db.query.mockResolvedValueOnce([{ id: 1, email: validPayload.email, name: validPayload.name }]); // Fetch user

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', validPayload.email);
    });

    it('devrait interdire un mot de passe trop court (Edge Case)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validPayload, password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Password must be at least 6 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait retourner 401 avec un message générique en cas de mauvais email (Security Case)', async () => {
      db.query.mockResolvedValueOnce([]); // Utilisateur non trouvé

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'password' });

      expect(response.status).toBe(401);
      // Le message ne doit pas indiquer si c'est l'email ou le mot de passe qui est faux (Prévention d'énumération d'utilisateurs)
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('devrait bloquer un compte inactif (Security Case)', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.query.mockResolvedValueOnce([{ 
        id: 1, 
        email: 'test@example.com', 
        password: hashedPassword,
        is_active: 0 // Compte bloqué
      }]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Account is disabled');
    });
  });
});
