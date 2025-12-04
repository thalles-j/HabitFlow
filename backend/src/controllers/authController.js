import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao registrar', details: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login', details: err.message });
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    if (!currentPassword) {
      return res.status(400).json({ error: 'Senha atual é obrigatória para confirmar alterações.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(403).json({ error: 'Senha atual incorreta.' });
    }

    const dataToUpdate = { name, email };

    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true }
    });

    res.json(updatedUser);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar perfil', details: err.message });
  }
}
