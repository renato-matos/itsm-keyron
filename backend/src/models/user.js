'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Associações futuras com outras tabelas podem ser definidas aqui
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false, // Campo obrigatório
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Não permitir e-mails duplicados
        validate: {
          isEmail: true, // Validação automática de e-mail
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      hooks: {
        beforeCreate: async (user) => {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    }
  );
  return User;
};