import jwt from "jsonwebtoken";
import { getUserById } from "../models/user.model.js";

export async function authenticateToken(req, res, next) {
  if (req.session.authenticated && req.session.userId) {
    const user = await getUserById(req.session.userId);
    if (user) {
      req.user = user;
      return next();
    }
  }
  const token = req.cookies.token;
  if (!token) {
    throw new Error("Auth token missing");
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decode.id);
    if (!user) {
      throw new Error("User not found");
    }
    //renew session
    req.session.userId = user.id;
    req.session.authenticated = true;
    req.user = user;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
