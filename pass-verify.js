const bcrypt = require('bcrypt');

const verifyPass = async () => {
  const myPassword = 'admin123456';
  //hash= se envia el password y el numero de veces que va a generar el encriptado
  const hash = '$2b$10$ABdwvQkXz575sfp7n.U7Z.ABCTLV7mN58PUVt/mDwgvjUvqtFPyMy';
  const isMatch = await bcrypt.compare(myPassword, hash);
  console.log(isMatch);
};

verifyPass();
