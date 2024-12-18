const { Type, Apartment } = require('../models');
const utilService = require('../services/utilService');
const storeDataService = {};
storeDataService.errorMessage = " ";

storeDataService.store_apartment = async function(req, userId)
{
    var packet = {};
    this.errorMessage = 'no_bad_input';
    if(req.body.picture == undefined)
    {
        this.errorMessage = 'Error, you should give a name of the apartment picture';
        return(undefined);
    }
    else if(req.body.address == undefined)
    {
        this.errorMessage = 'Error, you should give the address of the apartment';
        return(undefined);
    }
    else if(req.body.area == undefined)
    {
        this.errorMessage = 'Error, you should give the area of the apartment';
        return(undefined);
    }
    else if(req.body.price == undefined)
    {
        this.errorMessage = 'Error, you should give the price of the apartment';
        return(undefined);
    }
    else
    {
        packet = this.store_total_data_of_apartment(req, packet, userId);
    }
    return(packet);
}

storeDataService.store_total_data_of_apartment = async function(req, packet, userId)
{
    var bedroom;
    var bathroom;
    var diningroom;
    var livingroom;
    var kitchen;
    var balcony;
    var apartment;
    var apartmentId;

    if(utilService.check_value_type(req.body.picture) !== 3)
    {
        this.errorMessage = 'picture_bad_input';
        return(0);
    }
    else if(utilService.check_value_type(req.body.address) !== 3)
    {
        this.errorMessage = 'address_bad_input';
        return(0);
    }
    else if(utilService.check_value_type(req.body.area) !== 0 && utilService.check_value_type(req.body.area) != 1)
    {
        this.errorMessage = 'area_bad_input';
        return(0);
    } 
    else if(utilService.check_value_type(req.body.price) !== 0 && utilService.check_value_type(req.body.price) != 1)
    {
        this.errorMessage = 'price_bad_input';
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
        if(utilService.check_value_type(req.body.rooms.Bedroom) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
            return(0);
        }
        bedroom = await Type.create({type : 'Bedroom', count : req.body.rooms.Bedroom, apartmentId : apartmentId});
        packet.rooms.Bedroom = bedroom.dataValues.count;
    }
    
    if(req.body.rooms.Bathroom != undefined && req.body.rooms.Bathroom != 0)
    {
        if(utilService.check_value_type(req.body.rooms.Bathroom) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
            return(0);
        }
        bathroom = await Type.create({type : 'Bathroom', count : req.body.rooms.Bathroom, apartmentId : apartmentId});
        packet.rooms.Bathroom = bathroom.dataValues.count;
    }
    
    if(req.body.rooms.Dining_room != undefined && req.body.rooms.Dining_room != 0)
    {
        if(utilService.check_value_type(req.body.rooms.Dining_room) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
            return(0);
        }
        diningroom = await Type.create({type : 'Dining_room', count : req.body.rooms.Dining_room, apartmentId : apartmentId});
        packet.rooms.Dining_room = diningroom.dataValues.count;
    }
            
    if(req.body.rooms.Living_room != undefined && req.body.rooms.Living_room != 0)
    {
        if(utilService.check_value_type(req.body.rooms.Living_room) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
            return(0);
        }
        livingroom = await Type.create({type : 'Living_room', count : req.body.rooms.Living_room, apartmentId : apartmentId});
        packet.rooms.Living_room = livingroom.dataValues.count;   
    }
     
    if(req.body.rooms.Kitchen != undefined && req.body.rooms.Kitchen != 0)
    {
        if(utilService.check_value_type(req.body.rooms.Kitchen) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
            return(0);
        }
        kitchen = await Type.create({type : 'Kitchen', count : req.body.rooms.Kitchen, apartmentId : apartmentId});
        packet.rooms.Kitchen = kitchen.dataValues.count;
    }            
    
    if(req.body.rooms.Balcony != undefined && req.body.rooms.Balcony != 0)
    {
        if(utilService.check_value_type(req.body.rooms.Balcony) !== 0)
        {
            this.errorMessage = 'room_type_bad_input';
            return(0);
        }
        balcony = await Type.create({type : 'Balcony', count : req.body.rooms.Balcony, apartmentId : apartmentId});
        packet.rooms.Balcony = balcony.dataValues.count;               
    }              
    return(packet);           
}

module.exports = storeDataService;