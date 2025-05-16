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
    }

    const setupAdminName = process.env.SETUP_ADMIN_USERNAME;
    const setupPwd = process.env.SETUP_ADMIN_PWD;
    const setupEmail = process.env.SETUP_ADMIN_EMAIL;

    const userAdmin = await User.findOne({ username: setupAdminName });
    if (!userAdmin) {
      const roleAdminDoc = await Role.findOne({ role: 'admin' });
      const passwordAdmin = await bcryptjs.hash(setupPwd, 10);
      const newUserAdmin = new User({
        username: setupAdminName,
        email: setupEmail,
        password: passwordAdmin,
        role: roleAdminDoc._id
      });
      await newUserAdmin.save();
      console.log("Roles y usuarios inicializado");
    }
  } catch (error) {
    console.log(error);
  }
};