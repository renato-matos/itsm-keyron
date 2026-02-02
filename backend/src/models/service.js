'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      // Associações podem ser configuradas aqui no futuro
      // Ex.: Service.belongsTo(models.User, { foreignKey: 'userId', as: 'creator' });
    }
  }
  
  Service.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Nome do serviço é obrigatório.'
          },
          len: {
            args: [3, 100],
            msg: 'Nome deve ter entre 3 e 100 caracteres.'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Geral',
        validate: {
          isIn: {
            args: [['Infraestrutura', 'Software', 'Hardware', 'Suporte', 'Geral']],
            msg: 'Categoria deve ser uma das opções válidas.'
          }
        }
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Ativo',
        validate: {
          isIn: {
            args: [['Ativo', 'Inativo', 'Em Manutenção']],
            msg: 'Status deve ser Ativo, Inativo ou Em Manutenção.'
          }
        }
      },
      owner: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Responsável pelo serviço é obrigatório.'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'Service',
    }
  );
  
  return Service;
};