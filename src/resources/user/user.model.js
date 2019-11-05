const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  createAt: { type: Date, default: Date.now },
  auth: {
    access_token: { type: String },
    refresh_token: { type: String },
    lifetime: { type: Date }
  },
  email_confirmed: { type: Boolean, default: false },
  email_hash: { type: String },
  item:{type: [String]},
  situation: { type: String, default: "active", enum:["active", "inactive"]},
  isDeleted: { type: Boolean, default: false }
});

mongoose.model("User", userSchema);


