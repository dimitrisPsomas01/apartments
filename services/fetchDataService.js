const { Type, Apartment } = require('../models');
const fetchDataService = {};
fetchDataService.errorMessage = " ";

fetchDataService.fetch_apartment = async function(userId, apartmentId)
{
    var apartment;
    var packet;
    apartment = await Apartment.findOne({where : {userId : userId, id : apartmentId}});
    if(apartment != undefined)
    {
        packet = await this.fetch_total_data_of_apartment(apartment);
        return(packet);
    }
    else 
    {
        return(undefined);
    }
}

fetchDataService.fetch_total_data_of_apartment = async function(apartment)
{
    return await(this.fetch_total_data_of_apartments(apartment));
}

fetchDataService.fetch_apartments = async function(userId)
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
            apartment = await this.fetch_total_data_of_apartments(apartments[i]);
            packet.push(apartment);
        }
    }
    else if(apartments.length === 1)
    {
        var apartment = {};
        apartment = await this.fetch_total_data_of_apartments(apartments[0]);
        packet.push(apartment);
    }
    else if(apartments.length === 0)
    {
        this.errorMessage = 'Error, you do not have any apartments in your account';
        packet[0] = undefined;
    }
    return(packet);
}

fetchDataService.fetch_total_data_of_apartments = async function(apartment)
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

module.exports = fetchDataService;