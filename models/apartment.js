const { DataTypes, sequelize } = require('../index');

const Apartment = sequelize.define("Apartment", 
{
    id: 
    {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    
    picture: 
    {
        type: DataTypes.STRING,
        allowNull: false,
    },

    address: 
    {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    area: 
    {
        type: DataTypes.FLOAT, 
        allowNull: false,
    },
    
    price: 
    {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    
    userId: 
    { 
        type: DataTypes.INTEGER,
        allowNull: false, 
    }
});

module.exports = Apartment;