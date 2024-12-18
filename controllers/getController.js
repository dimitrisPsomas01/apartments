const { Apartment } = require('../models');
const { jwt } = require('../index');
const utilService = require('../services/utilService');
const fetchDataService = require('../services/fetchDataService');
const getController = {};
var errorMessage;

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
        apartment = await fetchDataService.fetch_apartment(userId, apartmentId);
        if(apartment != undefined)
        {
            res.status(200);
            res.json({status : 'success', message : 'Your selected apartment:', data : {apartment : apartment}});
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
        apartments = await fetchDataService.fetch_apartments(userId);
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
            errorMessage = fetchDataService.errorMessage;
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

getController.get_apartment = get_apartment;
getController.get_all_apartments = get_all_apartments;
module.exports = getController;
