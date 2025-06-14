// Importaciones necesarias
import User from "../models/user.models.js";
import bcryptjs from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import Role from "../models/roles.models.js";
import dotenv from "dotenv";

dotenv.config();
const roleAdmin = process.env.SETUP_ROLE_ADMIN;
const roleUser = process.env.SETUP_ROLE_USER;

// Registrar usuario
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({ message: ["El email ya está registrado"] });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const role = await Role.findOne({ role: roleUser });

    if (!role) {
      return res.status(500).json({ message: "No se encontró el rol de usuario." });
    }

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      role: role._id
    });

    const userSaved = await newUser.save();
    const token = await createAccessToken({ id: userSaved._id });

    // Cookie con httpOnly
    res.cookie("token", token, {
      sameSite: process.env.ENVIRONMENT === "local" ? "lax" : "none",
      secure: process.env.ENVIRONMENT !== "local",
      httpOnly: true,
    });

    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      isAdmin: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login de usuario
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ email }).populate("role");
    if (!userFound) {
      return res.status(400).json({ message: ["Usuario no encontrado"] });
    }

    const isMatch = await bcryptjs.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: ["Password no coincide"] });
    }

    const token = await createAccessToken({ id: userFound._id });

    // Cookie con httpOnly
    res.cookie("token", token, {
      sameSite: process.env.ENVIRONMENT === "local" ? "lax" : "none",
      secure: process.env.ENVIRONMENT !== "local",
      httpOnly: true,
    });

    const isAdmin = userFound.role?.role === roleAdmin;

    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      isAdmin
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Logout
export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true
  });
  return res.sendStatus(200);
};

// Perfil del usuario autenticado
export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id).populate("role");

  if (!userFound)
    return res.status(400).json({ message: ["Usuario no encontrado"] });

  const isAdmin = userFound.role?.role === roleAdmin;

  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    isAdmin
  });
};

// Verificación del token
export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: ["No autorizado"] });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: ["No autorizado"] });

    const userFound = await User.findById(user.id).populate("role");
    if (!userFound)
      return res.status(401).json({ message: ["No autorizado"] });

    const isAdmin = userFound.role?.role === roleAdmin;

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      isAdmin
    });
  });
};

