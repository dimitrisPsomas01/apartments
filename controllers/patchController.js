const { Apartment } = require('../models');
const { jwt } = require('../index');
const utilService = require('../services/utilService');
const fetchDataService = require('../services/fetchDataService');
const updateDataService = require('../services/updateDataService');
const patchController = {};
var errorMessage;
        
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
    else if(utilService.check_value_type(apartmentId) !== 0) 
    {
        res.status(400)
        res.json({status : 'Bad request', message : 'The id you gave in the url is invalid'});
        return;
    }
    try 
    {
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
        apartment = await updateDataService.update_apartment(req, userId, apartmentId);
        errorMessage = updateDataService.errorMessage;
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
            userHasApartment = await fetchDataService.fetch_apartments(userId);
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

patchController.patch_apartment = patch_apartment;
module.exports = patchController;