const bcrypt = require('bcrypt');

const hashPass = async () => {
  const myPassword = 'admin123456';
  //hash= se envia el password y el numero de veces que va a generar el encriptado
  const hash = await bcrypt.hash(myPassword, 10);
  console.log(hash);
};

hashPass();
