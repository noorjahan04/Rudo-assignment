const admin = require('../config/firebase');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided. Please provide a Firebase ID token in Authorization header as: Bearer <token>' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format' 
      });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUID = decodedToken.uid;

    // Find or create user in database
    let user = await User.findOne({ firebaseUID });
    
    if (!user) {
      // Create user if doesn't exist
      user = await User.create({
        firebaseUID,
        email: decodedToken.email || '',
        name: decodedToken.name || ''
      });
    } else {
      // Update email if changed
      if (decodedToken.email && user.email !== decodedToken.email) {
        user.email = decodedToken.email;
        await user.save();
      }
    }

    // Attach user to request
    req.user = user;
    req.firebaseUID = firebaseUID;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please refresh your token.' 
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format' 
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed. Invalid or expired token.' 
    });
  }
};

module.exports = { authenticate };
