const boom = require('@hapi/boom');
//hash
const bcrypt = require('bcrypt');

const { models } = require('./../libs/sequelize');

class UserService {
  constructor() {}

  async create(data) {
    //hash - creamos un nuevo usuario aplicando hash a su password
    const hash = await bcrypt.hash(data.password, 10);

    const newUser = await models.User.create({
      ...data, //copiamostodo el objeto
      password: hash, //reescribimos password con el valor del hash
    });

    //eliminamos el password para que no se muestre y en sequelize eso se encuentra en dataValues
    delete newUser.dataValues.password;
    return newUser;
  }

  async find() {
    const rta = await models.User.findAll({
      include: ['customer'],
    });
    return rta;
  }

  async findByEmail(email) {
    const rta = await models.User.findOne({
      //busca al primer usuario que cumpla con el where
      where: { email },
    });
    return rta;
  }

  async findOne(id) {
    const user = await models.User.findByPk(id);
    if (!user) {
      throw boom.notFound('user not found');
    }
    return user;
  }

  async update(id, changes) {
    const user = await this.findOne(id);
    const rta = await user.update(changes);
    return rta;
  }

  async delete(id) {
    const user = await this.findOne(id);
    await user.destroy();
    return { id };
  }
}

module.exports = UserService;
