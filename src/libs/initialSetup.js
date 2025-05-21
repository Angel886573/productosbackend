// initializeSetup.js

import Role from '../models/roles.models.js';
import User from '../models/user.models.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const initializeSetup = async () => {
  try {
    const roleAdmin = process.env.SETUP_ROLE_ADMIN;
    const roleUser = process.env.SETUP_ROLE_USER;

    // Crear rol de usuario si no existe
    const userRoleExists = await Role.findOne({ role: roleUser });
    if (!userRoleExists) {
      await new Role({ role: roleUser }).save();
      console.log("✅ Rol USER creado");
    }

    // Crear rol de admin si no existe
    const adminRoleExists = await Role.findOne({ role: roleAdmin });
    if (!adminRoleExists) {
      await new Role({ role: roleAdmin }).save();
      console.log("✅ Rol ADMIN creado");
    }

    const setupAdminName = process.env.SETUP_ADMIN_USERNAME;
    const setupPwd = process.env.SETUP_ADMIN_PWD;
    const setupEmail = process.env.SETUP_ADMIN_EMAIL;

    const adminUserExists = await User.findOne({ email: setupEmail });

    if (!adminUserExists) {
      const roleAdminDoc = await Role.findOne({ role: roleAdmin });

      if (!roleAdminDoc) {
        console.error("❌ Error: El rol 'admin' no se encontró en la base de datos.");
        return;
      }

      const passwordAdmin = await bcryptjs.hash(setupPwd, 10);
      const newUserAdmin = new User({
        username: setupAdminName,
        email: setupEmail,
        password: passwordAdmin,
        role: roleAdminDoc._id
      });

      await newUserAdmin.save();
      console.log("✅ Usuario administrador creado correctamente");
    } else {
      console.log("ℹ️ El usuario administrador ya existe");
    }
  } catch (error) {
    console.error("❌ Error inicializando el setup:", error.message);
  }
};
