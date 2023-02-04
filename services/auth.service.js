//boom
const boom = require('@hapi/boom');
//
//bcrypt
const bcrypt = require('bcrypt');
//
//jwt
const jwt = require('jsonwebtoken');
//
//nodemailer
const nodemailer = require('nodemailer');
//

//el secret
const { config } = require('./../config/config');
//
//servicio de los usuarios
const UserService = require('./user.service');
const service = new UserService();
//

class AuthService {
  //comparar datos
  async getUser(email, password) {
    const user = await service.findByEmail(email);
    if (!user) throw boom.unauthorized(); //si no existe el email sale error

    const isMatch = await bcrypt.compare(password, user.password); //compara password y el hash

    if (!isMatch) throw boom.unauthorized(); //si es falso  sale un error

    delete user.dataValues.password; //elimina el password para que no se vea

    return user;
  }
  //firamdo del token osea encripta los datos
  signToken(user) {
    //payload el cuerpo del token
    const payload = {
      sub: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret); //el secret se guarda como una variable de ambiente

    return { user, token }; //envio el usuario ya verificado por passport  y el token generado
  }

  async sendRecovery(email) {
    //verificamos si existe el usuario
    const user = await service.findByEmail(email);
    if (!user) throw boom.unauthorized(); //si no existe el email sale error
    //verifiacamos que no tenga un recoveryToken en la bd
    jwt.verify(user.recoveryToken, config.jwtSecret, (err) => {
      if (!err) throw boom.badRequest('You already have a active token.');
    });
    /**********generamos token para enviar link de recuperación  */

    const payload = { sub: user.id }; //generamos el payload del token
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '15min' }); //generamos el token
    const link = `http://myfrontend.com/recovery?token=${token}`;
    //guardamos el token en la base de datos por seguridad
    await service.update(user.id, { recoveryToken: token });
    /*******fin del proceso de envio del token */

    //correo
    const mail = {
      //enviamos el correo
      from: config.emailSender, // sender address/de quien
      to: `${user.email}`, // list of receivers/ para quien
      subject: 'E-Mail para recuperar Contraseña', // Subject line / titulo del correo
      text: 'recuperar contraseña', // plain text body / text del correo
      html: `<b>Ingresa a este link =>${link}</b>`, // html body
    };
    const rta = await this.sendMail(mail);
    return rta;
  }

  //envia mail si se olvidó la contraseña
  async sendMail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', //servidor de correo
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: config.emailSender, //'neilgraneros11@gmail.com'
        pass: config.emailPassword, //'uxzsxmhiuldcqbcf',
      },
    });
    await transporter.sendMail(infoMail);
    return { message: 'mail sent' };
  }

  //funcion que recibe la nueva contraseña del fron junto con el token para cambiarlo
  async changePassword(token, newPassword) {
    try {
      //inico verifica
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await service.findOne(payload.sub);
      if (user.recoveryToken !== token) throw boom.unauthorized();
      //fin verifica
      const hash = await bcrypt.hash(newPassword, 10); //hashea la nueva contraseña

      await service.update(user.id, { recoveryToken: null, password: hash }); //actualiza
      return { message: 'password changed' };
    } catch (error) {
      throw boom.unauthorized();
    }
  }
}

module.exports = AuthService;
