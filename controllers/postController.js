const { User } = require('../models');
const { jwt, registerSchema } = require('../index');
const utilService = require('../services/utilService');
const storeDataService = require('../services/storeDataService');
const postController = {};
var errorMessage;
        
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
            apartment = await storeDataService.store_apartment(req, userId);
            errorMessage = storeDataService.errorMessage;
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
        const user = await utilService.create_user_with_safe_password(username, email, password);
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
        if(await utilService.compare_passwords(password, hashedPassword) === false)
        {
            res.status(401);
            res.json({status : 'fail', message : 'Incorrect password, please try again'});
        }
        else
        {
            res.status(200);
            token = utilService.create_token(userId);
            jwt.verify(token, process.env.JWT_SECRET);
            delete(existingUser.dataValues.password);
            res.json({status : 'success', message : 'Login successful' ,token : token, data : {user : existingUser}});
        }
    }
} 
   
postController.create_apartment = create_apartment;
postController.register = register;
postController.login = login;
module.exports = postController;