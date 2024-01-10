import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({error:'Access denied'});
  }
  jwt.verify(token.replace('Bearer ', ''), secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({err: 'Invalid token'});
    } else {

        req.userID = decoded.userID;
        next();
    }
  });
};

export {verifyToken};