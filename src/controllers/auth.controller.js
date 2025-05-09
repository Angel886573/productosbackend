//Importamos el modelo de datos
import User from "../models/user.models.js";
import bcryptjs from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Funcion para registrar usuarios
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //Validamos que el email no este registrado en la base de datos
    const userFound = await User.findOne({ email });
    if (userFound) {
      //si, se encontro ese email registrado en la db
      return res
        .status(400) //Retorna mensaje de error
        .json({ message: ["El email ya esta registrado"] });
    }
    const passwordHash = await bcryptjs.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: passwordHash,
    });

    const userSaved = await newUser.save();
    const token = await createAccessToken({ id: userSaved._id });
    res.cookie("token", token, {
      sameSite: "none", //para indicar que el back y el front estan en distintos servidores
      secure: true //Activamos esta opcion cuando hagamos el deployment, para que funciones el https
    });
    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; //fin de resiter

//Funcion para iniciar sesion
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: ["Usuario no encontrado"] });
    }
    //comparamos el password
    const isMatch = await bcryptjs.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: ["Password no coincide"] });
    }
    const token = await createAccessToken({ id: userFound._id });
    res.cookie("token", token, {
      sameSite: "none", //para indicar que el back y el front estan en distintos servidores
      secure: true //Activamos esta opcion cuando hagamos el deployment, para que funciones el https
    });
    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; //fin de login

//Funcion para cerrar sesion
export const logout = (req, res) => {
  res.Cookie("token", "", {
    expires: new Date(0)
  });
  return res.sendStatus(200);
}; //fin de logout

//Funcion para mostrar el perfil del usuario
export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);

  if (!userFound)
    return res.status(400).json({ message: ["Usuario no encontrado"] });

  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
  });
};

// Función para validar el token
export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: ["No autorizado"] });
  }

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: ["No autorizado"] });
    }

    const userFound = await User.findById(user.id);
    if (!userFound) {
      return res.status(401).json({ message: ["No autorizado"] });
    }

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  });
};
