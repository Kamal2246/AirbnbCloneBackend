const mongoose = require("mongoose");

const Places_Shema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String },
  address: { type: String },
  photos: { type: [String], required: true },
  description: { type: String },
  perks: { type: [String] },
  extraInfo: { type: String },
  checkIn: { type: String },
  checkOut: { type: String },
  maxGuest: Number,
});

const Places_model = mongoose.model("Places", Places_Shema);

module.exports = Places_model;
