const User = require('./models/user');
const Apartment = require('./models/apartment');
const Type = require('./models/type');
const { express, bcrypt, jwt, dotenv, Joi, sequelizeModule, Sequelize, DataTypes, sequelize } = require('./index');

//INITIALIZATIONS

const saltRounds = 10;
var errorMessage;
const app = express();
const registerSchema = Joi.object(
{
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
});

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
  
//DEFINING MODEL ASSOCIATIONS
User.hasMany(Apartment, {foreignKey : 'userId', onDelete : "CASCADE"});
Apartment.belongsTo(User, {foreignKey : 'userId'});

Apartment.hasMany(Type, {foreignKey : 'apartmentId', onDelete : "CASCADE"});
Type.belongsTo(Apartment, {foreignKey : 'apartmentId'});

//CREATING TABLES IN DB, IF THEY ARE NO EXIST
sequelize.sync().then(() => 
{
    console.log('Models: users, apartments and types created successfully!');

}).catch((error) => 
{
    console.error('Unable to create tables: users, apartments and types: ', error);
});


//MIDDLEWARES
app.use(express.json());


//CONTROLLER - ROUTE HANDLERS
const get_user = async (req, res) =>
{
    res.status(500);
    res.json({status : 'error', message : 'This route is not yet defined!'});
}

const patch_user = async (req, res) => 
{
    res.status(500);
    res.json({status : 'error', message : 'This route is not yet defined!'});
}

const delete_user = async (req, res) =>
{
    res.status(500);
    res.json({status : 'error', message : 'This route is not yet defined!'});
}

const delete_apartment = async (req, res) =>
{
    const apartmentId = req.params.id * 1;
    const token = req.headers.authorization?.split(' ')[1]; 
    const secret = process.env.JWT_SECRET;
    var userId; 
    var apartment = {};
    var userHasApartment = [];
    if(token === undefined)
    {
        res.status(400);
        res.json({status : 'Bad request', message : 'Token is missing or malformed'});
        return;
    }
    else if(check_value_type(apartmentId) !== 0) 
    {
        res.status(400)
        res.json({status : 'Bad request', message : 'The id you gave in the url is invalid'});
        return;
    }
    try 
    {
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
        apartment = await fetch_apartment(userId, apartmentId);
        if(apartment != undefined)
        {
            Apartment.destroy({where : {id : apartmentId, userId : userId}});
            res.status(204);
            res.json({status : 'success', message : 'Your selected apartment has been deleted successfully'});
        }
        else
        {
            userHasApartment = await fetch_apartments(userId);
            apartment = await Apartment.findOne({where : {id : apartmentId}});
            if(apartment != undefined)
            {
                if(userHasApartment[0] != undefined)
                {
                    res.status(400);
                    res.json({status : 'Forbidden apartment', message : 'This apartment exists in database, but you can not delete it because it belongs to another user'});
                }
                else
                {
                    res.status(400);
                    res.json({status : 'No apartments', message : 'This apartment exists in database but you can not delete it, because you do not have any apartments in your account'});
                }   
            }
            else
            {
                if(userHasApartment[0] != undefined)
                {
                    res.status(400);
                    res.json({status : 'Non-existent apartment', message : 'You can not delete this apartment because it does not exist in the database, you gave wrong apartment id'});
                }
                else
                {
                    res.status(400);
                    res.json({status : 'No apartments', message : 'You can not delete this apartment because it does not exist in the database, you gave wrong apartment id, also you do not have any apartments in your account'});
                } 
            }
        }
    } 
    catch(error) 
    {
        if(error.name === 'TokenExpiredError') 
        {
            res.status(403);
            res.json({status : 'Forbidden', message : 'Token expired'});
        }
        else 
        {
            console.log(error);
            res.status(401);
            res.json({status : 'Unathorized', message : 'Invalid token'});
        }        
        return;
    }
}

const patch_apartment = async (req, res) =>
{
    const apartmentId = req.params.id * 1;
    const token = req.headers.authorization?.split(' ')[1]; 
    const secret = process.env.JWT_SECRET;
    var userId; 
    var apartment;
    var userHasApartment = [];
    if(token === undefined)
    {
        res.status(400);
        res.json({status : 'Bad request', message : 'Token is missing or malformed'});
        return;
    }
    else if(check_value_type(apartmentId) !== 0) 
    {
        res.status(400)
        res.json({status : 'Bad request', message : 'The id you gave in the url is invalid'});
        return;
    }
    try 
    {
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
        apartment = await update_apartment(req, userId, apartmentId);
        if(apartment != undefined)
        {
            if(errorMessage === 'no_bad_input')
            {
                res.status(200);
                res.json({status : 'success', message : 'Your updated apartment:', data : {apartment : apartment}});
            }
            else if(errorMessage === 'id')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You can not change the id field on your updated data'});
            }
            else if(errorMessage === 'userId')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You can not change the userId field on updated data'});
            }
            else if(errorMessage === 'createdAt')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You can not change the createdAt field on your updated data'});
            }
            else if(errorMessage === 'updatedAt')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You can not change the updatedAt field on your updated data'});
            }
            else if(errorMessage === 'picture_bad_input')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You entered an invalid image name as input, you must enter a string'});
            }
            else if(errorMessage === 'address_bad_input')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You entered an invalid address name as input, you must enter a string'});    
            }
            else if(errorMessage === 'area_bad_input')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You entered an invalid area value as input, you must enter an intenger number or a float number'});        
            }
            else if(errorMessage === 'price_bad_input')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You entered an invalid price value as input, you must enter an intenger number or a float number'});            
            }
            else if(errorMessage === 'room_type_bad_input')
            {
                res.status(400);
                res.json({status : 'bad input', message : 'You entered an invalid room type value as input, you must enter an intenger number'});                
            }                                              
        }
        else 
        {
            userHasApartment = await fetch_apartments(userId);
            apartment = await Apartment.findOne({where : {id : apartmentId}});
            if(apartment != undefined)
            {
                if(userHasApartment[0] != undefined)
                {
                    res.status(400);
                    res.json({status : 'Forbidden apartment', message : 'This apartment exists in database, but belongs to another user'});
                }
                else
                {
                    res.status(400);
                    res.json({status : 'No apartments', message : 'This apartment exists in database but you do not have any apartments in your account'});
                }   
            }
            else
            {
                if(userHasApartment[0] != undefined)
                {
                    res.status(400);
                    res.json({status : 'Non-existent apartment', message : 'This apartment does not exists in the database, you gave wrong apartment id'});
                }
                else
                {
                    res.status(400);
                    res.json({status : 'No apartments', message : 'You do not have any apartments in your account, also this apartment does not exists in the database, you gave wrong apartment id'});
                } 
            }
        }
    } 
    catch(error) 
    {
        if(error.name === 'TokenExpiredError') 
        {
            res.status(403);
            res.json({status : 'Forbidden', message : 'Token expired'});
        }
        else 
        {
            console.log(error);
            res.status(401);
            res.json({status : 'Unathorized', message : 'Invalid token'});
        }        
        return;
    }
}

const get_apartment = async (req, res) =>
{
    const apartmentId = req.params.id * 1;
    const token = req.headers.authorization?.split(' ')[1]; 
    const secret = process.env.JWT_SECRET;
    var userId; 
    var apartment = {};
    var userHasApartment = [];
    if(token === undefined)
    {
        res.status(400);
        res.json({status : 'Bad request', message : 'Token is missing or malformed'});
        return;
    }
    else if(check_value_type(apartmentId) !== 0) 
    {
        res.status(400)
        res.json({status : 'Bad request', message : 'The id you gave in the url is invalid'});
        return;
    }
    try 
    {
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
        apartment = await fetch_apartment(userId, apartmentId);
        if(apartment != undefined)
        {
            res.status(200);
            res.json({status : 'success', message : 'Your selected apartment:', data : {apartment : apartment}});
        }
        else
        {
            userHasApartment = await fetch_apartments(userId);
            apartment = await Apartment.findOne({where : {id : apartmentId}});
            if(apartment != undefined)
            {
                if(userHasApartment[0] != undefined)
                {
                    res.status(400);
                    res.json({status : 'Forbidden apartment', message : 'This apartment exists in database, but belongs to another user'});
                }
                else
                {
                    res.status(400);
                    res.json({status : 'No apartments', message : 'This apartment exists in database but you do not have any apartments in your account'});
                }   
            }
            else
            {
                if(userHasApartment[0] != undefined)
                {
                    res.status(400);
                    res.json({status : 'Non-existent apartment', message : 'This apartment does not exists in the database, you gave wrong apartment id'});
                }
                else
                {
                    res.status(400);
                    res.json({status : 'No apartments', message : 'You do not have any apartments in your account, also this apartment does not exists in the database, you gave wrong apartment id'});
                } 
            }
        }
    } 
    catch(error) 
    {
        if(error.name === 'TokenExpiredError') 
        {
            res.status(403);
            res.json({status : 'Forbidden', message : 'Token expired'});
        }
        else 
        {
            console.log(error);
            res.status(401);
            res.json({status : 'Unathorized', message : 'Invalid token'});
        }        
        return;
    }
}

const get_all_apartments = async (req, res) =>
{
    const token = req.headers.authorization?.split(' ')[1]; 
    const secret = process.env.JWT_SECRET;
    var userId; 
    var apartments = [];
    if(token === undefined)
    {
        res.status(400);
        res.json({status : 'Bad request', message : 'Token is missing or malformed'});
        return;
    }
    try 
    {
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
        apartments = await fetch_apartments(userId);
        if(apartments[0] != undefined)
        {
            if(apartments.length === 1)
            {
                res.status(200);
                res.json({status : 'success', message : 'Your apartment:', data : {apartment : apartments}});
            }
            else if(apartments.length > 1)
            {
                res.status(200);
                res.json({status : 'success', message : 'Your apartments:', data : {apartments : apartments}});
            }
        }
        else
        {
            res.status(400);
            res.json({status : 'No apartments', message : errorMessage});
        }
    } 
    catch(error) 
    {
        if(error.name === 'TokenExpiredError') 
        {
            res.status(403);
            res.json({status : 'Forbidden', message : 'Token expired'});
        }
        else 
        {
            console.log(error);
            res.status(401);
            res.json({status : 'Unathorized', message : 'Invalid token'});
        }        
        return;
    }
}
    
const create_apartment = async (req, res) =>
{
    const token = req.headers.authorization?.split(' ')[1]; 
    const secret = process.env.JWT_SECRET;
    var userId; 
    var existingUser;
    var apartment;
    if(token === undefined)
    {
        res.status(400);
        res.json({status : 'Bad request', message : 'Token is missing or malformed'});
        return;
    }
    try 
    {
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
        existingUser = await User.findOne({where : {id : userId}});
        if(existingUser != undefined)
        {
            apartment = await store_apartment(req, userId);
            if(apartment != undefined)
            {
                if(errorMessage === 'no_bad_input')
                {
                    res.status(201);
                    res.json({status : 'success', message : 'Your apartment was successfully saved to the database', data : {apartment : apartment}});
                }
                else if(errorMessage === 'picture_bad_input')
                {
                    res.status(400);
                    res.json({status : 'bad input', message : 'You entered an invalid image name as input, you must enter a string'});
                }
                else if(errorMessage === 'address_bad_input')
                {
                    res.status(400);
                    res.json({status : 'bad input', message : 'You entered an invalid address name as input, you must enter a string'});    
                }
                else if(errorMessage === 'area_bad_input')
                {
                    res.status(400);
                    res.json({status : 'bad input', message : 'You entered an invalid area value as input, you must enter an intenger number or a float number'});        
                }
                else if(errorMessage === 'price_bad_input')
                {
                    res.status(400);
                    res.json({status : 'bad input', message : 'You entered an invalid price value as input, you must enter an intenger number or a float number'});            
                }
                else if(errorMessage === 'room_type_bad_input')
                {
                    res.status(400);
                    res.json({status : 'bad input', message : 'You entered an invalid room type value as input, you must enter an intenger number'});                
                }           
            } 
            else
            {
                res.status(400);
                res.json({status : 'Incomplete input', message : errorMessage});
            }
        }
        else
        {
            res.status(500);
            res.json({status : 'Deleted account', message : 'Your account has been deleted from the database'});
        }
    } 
    catch(error) 
    {
        if(error.name === 'TokenExpiredError') 
        {
            res.status(403);
            res.json({status : 'Forbidden', message : 'Token expired'});
        }
        else 
        {
            res.status(401);
            res.json({status : 'Unathorized', message : 'Invalid token'});
        }        
        return;
    }
}
    
const register = async (req, res) =>
{
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const {error} = registerSchema.validate(req.body);
    if(error) 
    {
        res.status(400);
        res.json({ status: 'Fail', message: "Bad input of username or email or password"});
        return;
    }
    var existingUsername = await User.findOne({where : {username : username}});
    var existingEmail = await User.findOne({where : {email : email}});
    if(existingEmail != undefined && existingUsername != undefined)
    {
        res.status(409);
        res.json({status : 'fail', message : 'Username and email already exist'});
    }
    else if(existingUsername != undefined)
    {
        res.status(409);
        res.json({status : 'fail', message : 'Username already exists'})
    }
    else if(existingEmail != undefined)
    {
        res.status(409);
        res.json({status : 'fail', message : 'Email already exists'});
    }
    else
    {
        const user = await create_user_with_safe_password(username, email, password);
        user.password = password;
        res.status(201);
        res.set("Location", `/users/${user.id}`);
        res.json({status : 'success', data : {user : user}});
    }
}
    
const login = async (req, res) =>
{
    const username = req.body.username;
    const password = req.body.password;
    var hashedPassword;
    var userId;
    var token;
    const existingUser = await User.findOne({where : {username : username}});
    if(existingUser == undefined)
    {
        res.status(404);
        res.json({status : 'fail', message : 'User not found, please check the username and try again'});
    }
    else
    {
        hashedPassword = existingUser.dataValues.password;
        userId = existingUser.dataValues.id;
        if(await compare_passwords(password, hashedPassword) === false)
        {
            res.status(401);
            res.json({status : 'fail', message : 'Incorrect password, please try again'});
        }
        else
        {
            res.status(200);
            token = create_token(userId);
            jwt.verify(token, process.env.JWT_SECRET);
            delete(existingUser.dataValues.password);
            res.json({status : 'success', message : 'Login successful' ,token : token, data : {user : existingUser}});
        }
    }
}

//ROUTES
app.get('/apartments', get_all_apartments);
app.get('/apartments/:id', get_apartment);
app.patch('/apartments/:id', patch_apartment);
app.post('/apartments', create_apartment);
app.delete('/apartments/:id', delete_apartment);
app.post('/register', register);
app.post('/login', login);

/* OPTIONAL IMPLEMENTATION
app.get('/users/:id', get_user);
app.patch('/users/:id', patch_user);
app.delete('/users/:id', delete_user);
*/

//STARTING SERVER
port = process.env.PORT;
app.listen(port, () =>
{
    console.log(`App running on port: ${port}...`);
});

//HELPFUL FUNCTIONS
async function update_apartment(req, userId, apartmentId)
{      
    var apartment;
    var packet;
    errorMessage = 'no_bad_input';
    apartment = await Apartment.findOne({where : {userId : userId, id : apartmentId}});
    if(apartment != undefined)
    {
        packet = await update_total_data_of_apartment(req, userId, apartmentId, apartment);
        return(packet);
    }
    else
    {
        return(undefined);
    }
}

async function update_total_data_of_apartment(req, userId, apartmentId, apartment)
{
    var bedroom;
    var bathroom;
    var diningroom;
    var livingroom;
    var kitchen;
    var balcony;
    var totalApartment = {};

    bedroom = await Type.findOne({where : {type : 'Bedroom', apartmentId : apartmentId}});
    bathroom = await Type.findOne({where : {type : 'Bathroom', apartmentId : apartmentId}});
    diningroom = await Type.findOne({where : {type : 'Dining_room', apartmentId : apartmentId}});
    livingroom = await Type.findOne({where : {type : 'Living_room', apartmentId : apartmentId}});
    kitchen = await Type.findOne({where : {type : 'Kitchen', apartmentId : apartmentId}});
    balcony = await Type.findOne({where : {type : 'Balcony', apartmentId : apartmentId}});

    if(req.body.id != undefined)
    {
        errorMessage = 'id';
        return(0);
    }
    else if(req.body.userId != undefined)
    {
        errorMessage = 'userId';
        return(0);
    }
    else if(req.body.createdAt != undefined)
    {
        errorMessage = 'createdAt';
        return(0);
    }
    else if(req.body.updatedAt != undefined)
    {
        errorMessage = 'updatedAt';
        return(0);
    }
    totalApartment.id = apartment.dataValues.id;

    if(req.body.picture != undefined)
    {
        if(check_value_type(req.body.picture) !== 3)
        {
            errorMessage = 'picture_bad_input';
            return(0);
        }
        apartment.picture = req.body.picture;
        await apartment.save();
        totalApartment.picture = req.body.picture;
    }
    else
    {
        totalApartment.picture = apartment.dataValues.picture;
    }

    if(req.body.address != undefined)
    {
        if(check_value_type(req.body.address) !== 3)
        {
            errorMessage = 'address_bad_input';
            return(0);
        }
        apartment.address = req.body.address;
        await apartment.save();
        totalApartment.address = req.body.address;
    }
    else
    {
        totalApartment.address = apartment.dataValues.address;
    }

    if(req.body.area != undefined)
    {
        if(check_value_type(req.body.area) !== 0 && check_value_type(req.body.area) != 1)
        {
            errorMessage = 'area_bad_input';
            return(0);
        }
        apartment.area = req.body.area;
        await apartment.save();
        totalApartment.area = req.body.area;
    }
    else
    {
        totalApartment.area = apartment.dataValues.area;
    }

    if(req.body.price != undefined)
    {
        if(check_value_type(req.body.price) !== 0 && check_value_type(req.body.price) != 1)
        {
            errorMessage = 'price_bad_input';
            return(0);
        }
        apartment.price = req.body.price;
        await apartment.save();
        totalApartment.price = req.body.price;
    }
    else
    {
        totalApartment.price = apartment.dataValues.price;
    }

    totalApartment.userId = apartment.dataValues.userId;
    totalApartment.createdAt = apartment.dataValues.createdAt;
    totalApartment.updatedAt = apartment.dataValues.updatedAt;
    totalApartment.rooms = {};

    if(req.body.rooms == undefined)
    {
        if(bedroom != undefined)
        {
            totalApartment.rooms.Bedroom = bedroom.dataValues.count;
        }
        if(bathroom != undefined)
        {
            totalApartment.rooms.Bathroom = bathroom.dataValues.count;
        }
        if(diningroom != undefined)
        {
            totalApartment.rooms.Dining_room = diningroom.dataValues.count;
        }
        if(livingroom != undefined)
        {
            totalApartment.rooms.Living_room = livingroom.dataValues.count;   
        }
        if(kitchen != undefined)
        {
            totalApartment.rooms.Kitchen = kitchen.dataValues.count;         
        }
        if(balcony != undefined)
        {
            totalApartment.rooms.Balcony = balcony.dataValues.count;               
        }
        return(totalApartment);
    }

    if(req.body.rooms.Bedroom != undefined)
    {
        if(check_value_type(req.body.rooms.Bedroom) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        if(bedroom != undefined)
        {
            bedroom.count = req.body.rooms.Bedroom;
            await bedroom.save();
        }
        else
        {
            bedroom = await Type.create({type : 'Bedroom', count : req.body.rooms.Bedroom, apartmentId : apartmentId});
        }
        totalApartment.rooms.Bedroom = bedroom.dataValues.count;
    }
    else if(bedroom != undefined)
    {
        totalApartment.rooms.Bedroom = bedroom.dataValues.count;
    }

    if(req.body.rooms.Bathroom != undefined)
    {
        if(check_value_type(req.body.rooms.Bathroom) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        if(bathroom != undefined)
        {
            bathroom.count = req.body.rooms.Bathroom;
            await bathroom.save();
        }
        else
        {
            bathroom = await Type.create({type : 'Bathroom', count : req.body.rooms.Bathroom, apartmentId : apartmentId});
        }
        totalApartment.rooms.Bathroom = bathroom.dataValues.count;
    }
    else if(bathroom != undefined)
    {
        totalApartment.rooms.Bathroom = bathroom.dataValues.count;
    }

    if(req.body.rooms.Dining_room != undefined)
    {
        if(check_value_type(req.body.rooms.Dining_room) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        if(diningroom != undefined)
        {
            diningroom.count = req.body.rooms.Dining_room;
            await diningroom.save();
        }
        else
        {
            diningroom = await Type.create({type : 'Dining_room', count : req.body.rooms.Dining_room, apartmentId : apartmentId});
        }
        totalApartment.rooms.Dining_room = diningroom.dataValues.count;        
    }
    else if(diningroom != undefined)
    {
        totalApartment.rooms.Dining_room = diningroom.dataValues.count;
    }

    if(req.body.rooms.Living_room != undefined)
    {
        if(check_value_type(req.body.rooms.Living_room) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        if(livingroom != undefined)
        {
            livingroom.count = req.body.rooms.Living_room;
            await livingroom.save();
        }
        else
        {
            livingroom = await Type.create({type : 'Living_room', count : req.body.rooms.Living_room, apartmentId : apartmentId});
        }
        totalApartment.rooms.Living_room = livingroom.dataValues.count; 
    }
    else if(livingroom != undefined)
    {
        totalApartment.rooms.Living_room = livingroom.dataValues.count;
    }

    if(req.body.rooms.Kitchen != undefined)
    {
        if(check_value_type(req.body.rooms.Kitchen) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        if(kitchen != undefined)
        {
            kitchen.count = req.body.rooms.Kitchen;
            await kitchen.save();
        }
        else
        {
            kitchen = await Type.create({type : 'Kitchen', count : req.body.rooms.Kitchen, apartmentId : apartmentId});
        }
        totalApartment.rooms.Kitchen = kitchen.dataValues.count;                        
    }
    else if(kitchen != undefined)
    {
        totalApartment.rooms.Kitchen = kitchen.dataValues.count;
    }

    if(req.body.rooms.Balcony != undefined)
    {
        if(check_value_type(req.body.rooms.Balcony) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        if(balcony != undefined)
        {
            balcony.count = req.body.rooms.Balcony;
            await balcony.save();
        }
        else
        {
            balcony = await Type.create({type : 'Balcony', count : req.body.rooms.Balcony, apartmentId : apartmentId});
        }
        totalApartment.rooms.Balcony = balcony.dataValues.count;
    }   
    else if(balcony != undefined)
    {
        totalApartment.rooms.Balcony = balcony.dataValues.count;
    }  
    return(totalApartment);
}

async function fetch_apartment(userId, apartmentId)
{
    var apartment;
    var packet;
    apartment = await Apartment.findOne({where : {userId : userId, id : apartmentId}});
    if(apartment != undefined)
    {
        packet = await fetch_total_data_of_apartment(apartment);
        return(packet);
    }
    else 
    {
        return(undefined);
    }
}

async function fetch_total_data_of_apartment(apartment)
{
    return await(fetch_total_data_of_apartments(apartment));
}

async function fetch_apartments(userId)
{
    var i;
    var apartments = [];
    var packet = [];
    apartments = await Apartment.findAll({where : {userId : userId}});
    if(apartments.length > 1)
    {
        for(i = 0; i < apartments.length; i++)
        {
            var apartment = {};
            apartment = await fetch_total_data_of_apartments(apartments[i]);
            packet.push(apartment);
        }
    }
    else if(apartments.length === 1)
    {
        var apartment = {};
        apartment = await fetch_total_data_of_apartments(apartments[0]);
        packet.push(apartment);
    }
    else if(apartments.length === 0)
    {
        errorMessage = 'Error, you do not have any apartments in your account';
        packet[0] = undefined;
    }
    return(packet);
}

async function fetch_total_data_of_apartments(apartment)
{
    var bedroom;
    var bathroom;
    var diningroom;
    var livingroom;
    var kitchen;
    var balcony;
    var totalApartment = {};
    var apartmentId;

    totalApartment.id = apartment.dataValues.id;
    totalApartment.picture = apartment.dataValues.picture;
    totalApartment.address = apartment.dataValues.address;
    totalApartment.area = apartment.dataValues.area;
    totalApartment.price = apartment.dataValues.price;
    totalApartment.userId = apartment.dataValues.userId;
    totalApartment.createdAt = apartment.dataValues.createdAt;
    totalApartment.updatedAt = apartment.dataValues.updatedAt;
    totalApartment.rooms = {};
    apartmentId = apartment.dataValues.id;

    bedroom = await Type.findOne({where : {type : 'Bedroom', apartmentId : apartmentId}});
    bathroom = await Type.findOne({where : {type : 'Bathroom', apartmentId : apartmentId}});
    diningroom = await Type.findOne({where : {type : 'Dining_room', apartmentId : apartmentId}});
    livingroom = await Type.findOne({where : {type : 'Living_room', apartmentId : apartmentId}});
    kitchen = await Type.findOne({where : {type : 'Kitchen', apartmentId : apartmentId}});
    balcony = await Type.findOne({where : {type : 'Balcony', apartmentId : apartmentId}});

    if(bedroom != undefined && bedroom.dataValues.count != 0)
    {
        totalApartment.rooms.Bedroom = bedroom.dataValues.count;
    }
    if(bathroom != undefined && bathroom.dataValues.count != 0)
    {
        totalApartment.rooms.Bathroom = bathroom.dataValues.count;
    }
    if(diningroom != undefined && diningroom.dataValues.count != 0)
    {
        totalApartment.rooms.Dining_room = diningroom.dataValues.count;
    }
    if(livingroom != undefined && livingroom.dataValues.count != 0)
    {
        totalApartment.rooms.Living_room = livingroom.dataValues.count;
    }
    if(kitchen != undefined && kitchen.dataValues.count != 0)
    {
        totalApartment.rooms.Kitchen = kitchen.dataValues.count;
    }
    if(balcony != undefined && balcony.dataValues.count != 0)
    {
        totalApartment.rooms.Balcony = balcony.dataValues.count;
    }
    return(totalApartment);
}

async function store_apartment(req, userId)
{
    var packet = {};
    errorMessage = 'no_bad_input';
    if(req.body.picture == undefined)
    {
        errorMessage = 'Error, you should give a name of the apartment picture';
        return(undefined);
    }
    else if(req.body.address == undefined)
    {
        errorMessage = 'Error, you should give the address of the apartment';
        return(undefined);
    }
    else if(req.body.area == undefined)
    {
        errorMessage = 'Error, you should give the area of the apartment';
        return(undefined);
    }
    else if(req.body.price == undefined)
    {
        errorMessage = 'Error, you should give the price of the apartment';
        return(undefined);
    }
    else
    {
        packet = store_total_data_of_apartment(req, packet, userId);
    }
    return(packet);
}

async function store_total_data_of_apartment(req, packet, userId)
{
    var bedroom;
    var bathroom;
    var diningroom;
    var livingroom;
    var kitchen;
    var balcony;
    var apartment;
    var apartmentId;

    if(check_value_type(req.body.picture) !== 3)
    {
        errorMessage = 'picture_bad_input';
        return(0);
    }
    else if(check_value_type(req.body.address) !== 3)
    {
        errorMessage = 'address_bad_input';
        return(0);
    }
    else if(check_value_type(req.body.area) !== 0 && check_value_type(req.body.area) != 1)
    {
        errorMessage = 'area_bad_input';
        return(0);
    } 
    else if(check_value_type(req.body.price) !== 0 && check_value_type(req.body.price) != 1)
    {
        errorMessage = 'price_bad_input';
        return(0);
    }   

    apartment = await Apartment.create({picture : req.body.picture, address : req.body.address, area : req.body.area, price : req.body.price, userId : userId});
    packet.id = apartment.dataValues.id;
    packet.picture = apartment.dataValues.picture;
    packet.address = apartment.dataValues.address;
    packet.area = apartment.dataValues.area;
    packet.price = apartment.dataValues.price;
    packet.userId = apartment.dataValues.userId;
    packet.createdAt = apartment.dataValues.createdAt;
    packet.updatedAt = apartment.dataValues.updatedAt;
    packet.rooms = {};
    apartmentId = apartment.dataValues.id;

    if(req.body.rooms.Bedroom != undefined && req.body.rooms.Bedroom != 0) 
    {
        if(check_value_type(req.body.rooms.Bedroom) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        bedroom = await Type.create({type : 'Bedroom', count : req.body.rooms.Bedroom, apartmentId : apartmentId});
        packet.rooms.Bedroom = bedroom.dataValues.count;
    }
    
    if(req.body.rooms.Bathroom != undefined && req.body.rooms.Bathroom != 0)
    {
        if(check_value_type(req.body.rooms.Bathroom) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        bathroom = await Type.create({type : 'Bathroom', count : req.body.rooms.Bathroom, apartmentId : apartmentId});
        packet.rooms.Bathroom = bathroom.dataValues.count;
    }
    
    if(req.body.rooms.Dining_room != undefined && req.body.rooms.Dining_room != 0)
    {
        if(check_value_type(req.body.rooms.Dining_room) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        diningroom = await Type.create({type : 'Dining_room', count : req.body.rooms.Dining_room, apartmentId : apartmentId});
        packet.rooms.Dining_room = diningroom.dataValues.count;
    }
            
    if(req.body.rooms.Living_room != undefined && req.body.rooms.Living_room != 0)
    {
        if(check_value_type(req.body.rooms.Living_room) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        livingroom = await Type.create({type : 'Living_room', count : req.body.rooms.Living_room, apartmentId : apartmentId});
        packet.rooms.Living_room = livingroom.dataValues.count;   
    }
     
    if(req.body.rooms.Kitchen != undefined && req.body.rooms.Kitchen != 0)
    {
        if(check_value_type(req.body.rooms.Kitchen) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        kitchen = await Type.create({type : 'Kitchen', count : req.body.rooms.Kitchen, apartmentId : apartmentId});
        packet.rooms.Kitchen = kitchen.dataValues.count;
    }            
    
    if(req.body.rooms.Balcony != undefined && req.body.rooms.Balcony != 0)
    {
        if(check_value_type(req.body.rooms.Balcony) !== 0)
        {
            errorMessage = 'room_type_bad_input';
            return(0);
        }
        balcony = await Type.create({type : 'Balcony', count : req.body.rooms.Balcony, apartmentId : apartmentId});
        packet.rooms.Balcony = balcony.dataValues.count;               
    }              
    return(packet);           
}

async function create_user_with_safe_password(username, email, plainPassword)
{
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const record = await User.create({username : username, email : email, password : hashedPassword});
    const user = record.dataValues;
    return(user);
}

function create_token(userId)
{
    const payload = {id : userId}; 
    const secret = process.env.JWT_SECRET;
    const options = {expiresIn : '10h'};
    return(jwt.sign(payload, secret, options));
}

async function compare_passwords(plainPassword, hashedPassword)
{
    return await bcrypt.compare(plainPassword, hashedPassword);
}

function check_value_type(value) 
{
    if(Number.isInteger(value)) 
    {
        return(0);  //integer
    } 
    else if(typeof value === "number" && !Number.isInteger(value)) 
    {
        return(1);  //float
    } 
    else if(typeof value === "string" && value.length === 1) 
    {
        return(2);  //character
    } 
    else if(typeof value === "string") 
    {
        return(3);  //string
    } 
    else 
    {
        return(4);  //unknown
    }
}
