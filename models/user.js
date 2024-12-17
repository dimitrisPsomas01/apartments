const { DataTypes, sequelize } = require('../index');

const User = sequelize.define("User", 
{
    id: 
    {   
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true, 
        allowNull: false,
    },
    
    username: 
    {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: true,
    },
    
    email: 
    {
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true,
        validate: 
        {
             isEmail: true, 
        }
    },
    
    password: 
    {
        type: DataTypes.STRING, 
        allowNull: false,
    }
});

module.exports = User;