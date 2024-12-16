const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Joi = require('joi');
const sequelizeModule = require("sequelize");
const Sequelize = sequelizeModule.Sequelize;
const DataTypes = sequelizeModule.DataTypes;
dotenv.config({path : './config.env'});
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {host : process.env.DB_HOST, dialect : 'mysql'});
const registerSchema = Joi.object({ username: Joi.string().min(3).max(30).required(), email: Joi.string().email().required(), password: Joi.string().min(6).max(128).required(),});

module.exports =
{
    express,
    bcrypt,
    jwt,
    dotenv,
    Joi,
    sequelizeModule,
    Sequelize,
    DataTypes,
    sequelize,
    registerSchema
};