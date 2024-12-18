const { Type, Apartment } = require('../models');
const utilService = require('../services/utilService');
const updateDataService = {};
updateDataService.errorMessage = " ";

updateDataService.update_apartment = async function(req, userId, apartmentId)
{      
    var apartment;
    var packet;
    this.errorMessage = 'no_bad_input';
    apartment = await Apartment.findOne({where : {userId : userId, id : apartmentId}});
    if(apartment != undefined)
    {
        packet = await this.update_total_data_of_apartment(req, userId, apartmentId, apartment);
        return(packet);
    }
    else
    {
        return(undefined);
    }
}

updateDataService.update_total_data_of_apartment = async function(req, userId, apartmentId, apartment)
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
        this.errorMessage = 'id';
        return(0);
    }
    else if(req.body.userId != undefined)
    {
        this.errorMessage = 'userId';
        return(0);
    }
    else if(req.body.createdAt != undefined)
    {
        this.errorMessage = 'createdAt';
        return(0);
    }
    else if(req.body.updatedAt != undefined)
    {
        this.errorMessage = 'updatedAt';
        return(0);
    }
    totalApartment.id = apartment.dataValues.id;

    if(req.body.picture != undefined)
    {
        if(utilService.check_value_type(req.body.picture) !== 3)
        {
            this.errorMessage = 'picture_bad_input';
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
        if(utilService.check_value_type(req.body.address) !== 3)
        {
            this.errorMessage = 'address_bad_input';
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
        if(utilService.check_value_type(req.body.area) !== 0 && utilService.check_value_type(req.body.area) != 1)
        {
            this.errorMessage = 'area_bad_input';
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
        if(utilService.check_value_type(req.body.price) !== 0 && utilService.check_value_type(req.body.price) != 1)
        {
            this.errorMessage = 'price_bad_input';
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
        if(utilService.check_value_type(req.body.rooms.Bedroom) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
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
        if(utilService.check_value_type(req.body.rooms.Bathroom) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
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
        if(utilService.check_value_type(req.body.rooms.Dining_room) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
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
        if(utilService.check_value_type(req.body.rooms.Living_room) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
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
        if(utilService.check_value_type(req.body.rooms.Kitchen) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
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
        if(utilService.check_value_type(req.body.rooms.Balcony) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
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

module.exports = updateDataService;