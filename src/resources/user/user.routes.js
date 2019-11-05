const express = require("express");
const routes = express.Router();
const userController = require('../user/user.controller');

//users routes
routes.post('/users', userController.new);
routes.patch('/users/:id', userController.update);
routes.delete('/users/:id', userController.delete);
routes.get('/users/generate_access_token', userController.genToken);
routes.get('/users/:id', userController.getUser);
routes.post('/users/auth', userController.auth);
routes.get('/users',userController.getAll);

module.exports = routes;