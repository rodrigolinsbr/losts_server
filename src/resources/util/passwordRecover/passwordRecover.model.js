const mongoose = require("mongoose");

const passwordRecover = new mongoose.Schema({
  token: {
    type: String,
    required: true
  }
});

mongoose.model("PasswordRecover", passwordRecover);
