const { sequelize } = require('../index');

//CHECKING IF API IS CONNECTED WITH DATABASE
const connectionPromise = sequelize.authenticate();
connectionPromise.then(() => 
{
    console.log('Connection has been established successfully');
});
connectionPromise.catch((error) => 
{
    console.error('Unable to connect to the database: ', error);
});
  

//CREATING TABLES IN DB, IF THEY ARE NO EXIST
sequelize.sync().then(() => 
{
    console.log('Models: users, apartments and types created successfully!');

}).catch((error) => 
{
    console.error('Unable to create tables: users, apartments and types: ', error);
});