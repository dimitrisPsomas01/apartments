const { DataTypes, sequelize } = require('../index');

const Type = sequelize.define("Type", 
{
        id: 
        {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
    
        type: 
        {
            type: DataTypes.STRING,
            allowNull: false,
        },
    
        count: 
        {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    
        apartmentId: 
        { 
            type: DataTypes.INTEGER,
            allowNull: false
        } 
});

module.exports = Type;