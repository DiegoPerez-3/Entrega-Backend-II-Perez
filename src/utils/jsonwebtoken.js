import jwt from "jsonwebtoken"
import { config } from "../config/env.config.js"

export const generateToken = (user) => {
    return jwt.sign({user},config.JWT_SECRET,{expiresIn:"1h"})
}

export const authToken = (req, res, next) => {
  const token = req.cookies.token_coder;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = decoded.user || decoded;
    next();
  });
};

export const authTokenView = (req, res, next) => {
  const token = req.cookies.token_coder;
  if (!token) {
    return res.redirect('/login');
  }
  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }
    req.user = decoded.user || decoded;
    next();
  });
};