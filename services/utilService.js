const { User } = require('../models');
const { bcrypt, jwt } = require('../index');
const saltRounds = 10;
const utilService = {};

utilService.create_user_with_safe_password = async function(username, email, plainPassword)
{
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const record = await User.create({username : username, email : email, password : hashedPassword});
    const user = record.dataValues;
    return(user);
}
 
utilService.create_token = function(userId)
{
    const payload = {id : userId}; 
    const secret = process.env.JWT_SECRET;
    const options = {expiresIn : '10h'};
    return(jwt.sign(payload, secret, options));
}

utilService.compare_passwords = async function(plainPassword, hashedPassword)
{
    return await bcrypt.compare(plainPassword, hashedPassword);
}

utilService.check_value_type = function(value) 
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

module.exports = utilService;