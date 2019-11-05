const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require('./startup/routes')
const config = require("./config/db");
const status = require("http-status");

// DB config
// DB config
let mongodbAddress = config.mongodbAddress;
mongoose.connect(mongodbAddress, {
  useNewUrlParser: true,
  useCreateIndex: true
});

app.use(cors());

// Server config
app.use(express.json());

// Import routes
app.use("/api", routes);

//tratando erros globais
app.use((request, response, next) => {
  response.status(status.NOT_FOUND).send();
});

app.use((error, request, response, next) => {
  response.status(status.INTERNAL_SERVER_ERROR).json({ error });
});

// Server start
const port = process.env.PORT || 3002;
app.listen(port, () => console.log("on: " + port));
