const jwt = require('jsonwebtoken');

//el secret es encriptador del heder y el payload
const secret = 'myCat';

//es el token que recibimos, en este caso el generado por el archivo token-sign.js
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTY3NDg1ODc0NH0.ZwfL2FG0mmQRVWONe-YFGC8IuLk3e_Jw1WsYLNKgjqM';

function verifyToken(token, secret) {
  return jwt.verify(token, secret); //hacemos la verificacion del token
}

const payload = verifyToken(token, secret);
console.log(payload);
