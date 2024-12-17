const { DataTypes, sequelize } = require('../index');
const User = require('../models/user');
const Apartment = require('../models/apartment');
const Type = require('../models/type');    

User.hasMany(Apartment, {foreignKey : 'userId', onDelete : "CASCADE"});
Apartment.belongsTo(User, {foreignKey : 'userId'});
Apartment.hasMany(Type, {foreignKey : 'apartmentId', onDelete : "CASCADE"});
Type.belongsTo(Apartment, {foreignKey : 'apartmentId'});

module.exports = 
{
    User,
    Apartment,
    Type
};