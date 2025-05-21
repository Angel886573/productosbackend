import Role from '../models/roles.models.js';
import User from '../models/user.models.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

export const initializeSetup = async () => {
  try {
    dotenv.config();
    const roleAdmin = process.env.SETUP_ROLE_ADMIN;
    const roleUser = process.env.SETUP_ROLE_USER;

    const countRoles = await Role.estimatedDocumentCount();
    if (countRoles === 0) {
      await Promise.all([
        new Role({ role: roleUser }).save(),
        new Role({ role: roleAdmin }).save()
      ]);
      console.log("Roles creados");
    }

    const setupAdminName = process.env.SETUP_ADMIN_USERNAME;
    const setupPwd = process.env.SETUP_ADMIN_PWD;
    const setupEmail = process.env.SETUP_ADMIN_EMAIL;

    // buscar por email
    const userAdmin = await User.findOne({ email: setupEmail });
    if (!userAdmin) {
      const roleAdminDoc = await Role.findOne({ role: roleAdmin });
      const passwordAdmin = await bcryptjs.hash(setupPwd, 10);
      const newUserAdmin = new User({
        username: setupAdminName,
        email: setupEmail,
        password: passwordAdmin,
        role: roleAdminDoc._id
      });
      await newUserAdmin.save();
      console.log("Usuario administrador creado correctamente");
    } else {
      console.log("ℹEl usuario administrador ya existe");
    }
  } catch (error) {
    console.error("Error inicializando el admin:", error);
  }
};
