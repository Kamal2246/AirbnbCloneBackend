const mongoose = require("mongoose");

const BookingsSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  place: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkout: { type: Date, required: true },
});

const BookingsModel = mongoose.model("Bookings", BookingsSchema);
module.exports = BookingsModel;
