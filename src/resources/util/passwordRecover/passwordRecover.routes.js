const express = require("express");
const routes = express.Router();
const passwordRecoverController = require('./passwordRecover.controller');


//recoverPassword routes
routes.post('/passwordRecover', passwordRecoverController.new);
routes.patch('/passwordRecover/:token', passwordRecoverController.update);
//routes.get('/passwordRecover/tokenVerification/', passwordRecoverController.tokenVerification);
routes.get('/passwordRecover/', passwordRecoverController.getAll);
routes.get('/passwordRecover/:token', passwordRecoverController.getOne);

module.exports = routes;