const { Apartment } = require('../models');
const { jwt } = require('../index');
const utilService = require('../services/utilService');
const fetchDataService = require('../services/fetchDataService');
const deleteController = {};    

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
            Apartment.destroy({where : {id : apartmentId, userId : userId}});
            res.status(204);
            res.json({status : 'success', message : 'Your selected apartment has been deleted successfully'});
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

deleteController.delete_apartment = delete_apartment;    
module.exports = deleteController;