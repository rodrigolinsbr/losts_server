const express = require("express");
const routes = express.Router();
const adminController = require("../item/item.controller");

//admins routes
routes.post("/itens", adminController.new);
routes.patch("/itens/:id", adminController.update);
routes.delete("/itens/:id", adminController.delete);
routes.get("/itens/", adminController.getAll);
routes.get("/itens/:id", adminController.getAdmin);
routes.post("/itens/auth", adminController.auth);

module.exports = routes;
