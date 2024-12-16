const User = require('./user');
const Apartment = require('./apartment');
const Type = require('./type');

Type.belongsTo(Apartment, {foreignKey : 'apartmentId'});
Apartment.belongsTo(User, {foreignKey : 'userId'});
Apartment.hasMany(Type, {foreignKey : 'apartmentId', onDelete : "CASCADE"});
User.hasMany(Apartment, {foreignKey : 'userId', onDelete : "CASCADE"});