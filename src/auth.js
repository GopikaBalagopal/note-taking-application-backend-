const jwt = require('jsonwebtoken');

// Middleware function to check the validity of the token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization; 
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token not provided' });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, 'your-secret-key')

    req.userId = decodedToken.userId;

   
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyToken;
