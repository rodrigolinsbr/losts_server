const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true},
  createAt: { type: Date, default: Date.now },
  location: {
    latitude: { type: String },
    longitude: { type: String },
    adress: { 
      region: {
        type: String,
        enum: ["Nordeste", "Norte", "Sul", "Sudeste", "Centro-Oeste"]
      },
      state: {
        type: String,
        enum: [
          "",
          "Alagoas",
          "Bahia",
          "Ceará",
          "Maranhão",
          "Paraíba",
          "Pernambuco",
          "Piauí",
          "Rio Grande do Norte",
          "Sergipe",
          "Distrito Federal",
          "Goiás",
          "Mato Grosso",
          "Mato Grosso do Sul",
          "Espírito Santo",
          "Minas Gerais",
          "Rio de Janeiro",
          "São Paulo",
          "Paraná",
          "Rio Grande do Sul",
          "Santa Catarina"
        ]
      },
      adress: String 
    }
  },
  situation: { type: String, default: "active", enum:["active", "inactive"]},
  isDeleted: { type: Boolean, default: false }
});

mongoose.model("Item", itemSchema);
