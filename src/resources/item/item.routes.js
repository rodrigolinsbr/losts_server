const express = require("express");
const routes = express.Router();
const adminController = require("../item/item.controller");

//admins routes
routes.post("/admins", adminController.new);
routes.patch("/admins/:id", adminController.update);
routes.delete("/admins/:id", adminController.delete);
routes.get("/admins/generate_access_token", adminController.genToken);
routes.get("/admins/", adminController.getAll);
routes.get("/admins/:id", adminController.getAdmin);
routes.post("/admins/auth", adminController.auth);

module.exports = routes;
