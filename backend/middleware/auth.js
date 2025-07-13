const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check if user has worker role
const requireWorker = (req, res, next) => {
  if (req.user.role !== 'worker' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Worker or admin access required' });
  }
  next();
};

// Middleware to check if user has sales role
const requireSales = (req, res, next) => {
  if (req.user.role !== 'sales' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sales or admin access required' });
  }
  next();
};

// Middleware to check if user has any of the specified roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireWorker,
  requireSales,
  requireRole
}; 