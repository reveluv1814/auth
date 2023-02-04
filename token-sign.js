const jwt = require('jsonwebtoken');

//el secret es encriptador del heder y el payload
const secret = 'myCat';

//payload es lo que se va encriptar dentro del token
const payload = {
  sub: 1, //el subjet hace parte del estandar, es la forma que vamos a indentificar al usuario
  //scope: se utiliza para los permisos
  role: 'customer', //se pude agregar un atributo en este caso el role
};

function signToken(payload, secret) {
  return jwt.sign(payload, secret); //hacemos una firma que genera un token
}

const token = signToken(payload, secret);
console.log(token);
