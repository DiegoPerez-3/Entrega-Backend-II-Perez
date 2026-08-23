import userModel from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { config } from '../config/env.config.js';
import passwordResetModel from '../models/passwordReset.model.js';
import { transporter } from '../config/mailer.js';
import { generateToken } from '../utils/jsonwebtoken.js';

const register = async (req, res) => {

  if (!req.body) {
    return res.status(400).json({ status: 'error', message: 'body vacio o mal formado' });
  }

  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'body vacio o mal formado',
    });
  }

  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({ status: 'error', message: 'el usuario ya existe' });
    }

    const user = await userModel.create({
      first_name,
      last_name,
      email,
      password: createHash(password),
    });

    res.status(201).json({ status: 'success', payload: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const login = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ status: 'error', message: 'body vacio o mal formado' });
  }

  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'body vacio o mal formado',
    });
  }

  try {

    if (email === config.ADMIN_EMAIL && password === config.ADMIN_PASSWORD) {
      req.session.user = {
        first_name: 'Admin',
        last_name: 'Coder',
        email: config.ADMIN_EMAIL,
        role: 'admin',
        id: 'admin-id',
      };
      return res.status(200).json({ status: 'success', payload: req.session.user });
    }

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Usuario desconocido' });
    }

    if (!isValidPassword(password, user.password)) {
      return res.status(401).json({ status: 'error', message: 'Contraseña o email incorrectos' });
    }
    const token = generateToken({first_name:user.first_name,last_name:user.last_name,email:user.email,role:user.role})
    res.cookie("token_coder",token,{httpOnly:true})
    res.status(200).json({ status: 'success', payload: req.user });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const logout = (req, res) => {
  res.clearCookie("token_coder")
  res.status(200).json({message:"User logger out successfully"})
};

const recovery = async (req,res) => {
  const email = req.params.email
  const user = await userModel.findOne({email})
  if(!user){
    return res.status(401).json({status:"error",message:"el usuario no existe"})
  }
  const resetToken = crypto.randomUUID()
  const passwordReset = await passwordResetModel.create({userId:user._id,token:resetToken,expiresAt:new Date(Date.now() + 10 * 60 * 1000)})
  transporter.sendMail({
    from: `"Mi aplicaicion" <${config.GMAIL_USER}>`,
    to:email,
    subject:"recuperar contrasena",
    text: `
      token: + ${resetToken}
    `,

  })
  res.status(200).json({status:"success"})
}

const resetPassword = async (req,res) =>{

  const {token,newPassword} = req.body
  if(!token || !newPassword) return res.json({status:"error",message:"datos faltantes en el body"})

  try{
      const passwordReset  = await passwordResetModel.findOne({token})
      if(!passwordReset) return res.json({status:"error",message:"token invalido"})
      const user = await userModel.findOne({_id:passwordReset.userId})
      if(!user) return res.json({status:"error",message:"Usuario inexistente"})
      const userUpdated = await userModel.updateOne({_id:user._id},{password: createHash(newPassword)})
      res.json({status:"success",message:"Password actualizado"})
  }catch(error){
    res.json({status:"error",message:error.message})
  }
}

export const authController = {
  register,
  login,
  logout,
  recovery,
  resetPassword
};
