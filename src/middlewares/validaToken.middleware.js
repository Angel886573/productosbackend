import { TOKEN_SECRET } from '../config.js';
import jwt from 'jsonwebtoken';



export const authRequired = (req, res, next)=>{
    const {token} = req.cookies;

  //console.log("Validando token");

  //Imprimimos a consola los headers de la peticion
  console.log (req.cookies);
  if (!token)
    return res.status(401)
              .json ({message: ['No token autorizacion denegada']})
  jwt.verify(token, TOKEN_SECRET, (err, user)=>{
    if (err){
        console.log(err);
        return res.status(403)
                  .json({message: ['Token inválido']})
    }
    //Si no hay error, imprimimos el usuario que inicio sesion
    //en el objeto request
    req.user = user;
    
    next();
  })

  
}//fin del auth required