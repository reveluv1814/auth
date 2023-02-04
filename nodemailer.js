const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function sendMail() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  //let testAccount = await nodemailer.createTestAccount();//crea una cuenta para hacer pruebas

  // create reusable transporter object using the default SMTP transport
  //transporte
  //sevidor para hacer el envio de correos en este caso el smtp
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", //servidor de correo
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'neilgraneros11@gmail.com',
        pass: 'uxzsxmhiuldcqbcf'
    }
  });

  // send mail with defined transport object
  //configuramos el transporter creado arriba
  let info = await transporter.sendMail({
    //enviamos el correo
    from: 'neilgraneros11@gmail.com', // sender address/de quien 
    to: "neilgraneros11@gmail.com", // list of receivers/ para quien
    subject: "Este es un nuevo correo de prueba ✔", // Subject line / titulo del correo
    text: "Hola Neil", // plain text body / text del correo 
    html: "<b>Hola Neil!!!</b>", // html body 
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

sendMail();
