const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./Database/connect");
const app = express();
app.use(
  "/Models/Uploads",
  express.static(path.join(__dirname, "Models", "Uploads/"))
);

const {
  getAllUsers,
  registerUser,
  LoginUser,
  Profile,
  Logout,
  LinkUpload,
  FileUpload,
  AddPlace,
  getUserPlaces,
  GetSinglePlaces,
  GetAllPlaces,
  CreateBooking,
  GetMyBookings,
  GetThisBooking,
} = require("./Controllers/User_controller");
app.use(express.json());
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const CORS_URI = process.env.CORS_URI;
// enable CORS with options
const corsOptions = {
  origin: `${CORS_URI}`, // allow only requests from this domain
  methods: ["GET", "POST", "PATCH"], // allow only specified HTTP methods
  allowedHeaders: ["Content-Type"], // allow only specified headers
  optionsSuccessStatus: 200, // return 200 instead of 204 for preflight requests
  credentials: true,
};
app.use(cors(corsOptions));

app.get("/", getAllUsers);
app.get("/getAllPlaces", GetAllPlaces);
app.post("/register", registerUser);
app.post("/login", LoginUser);
app.get("/profile", Profile);
app.post("/logout", Logout);
app.post("/logout", Logout);
app.post("/upload-by-link", LinkUpload);
app.post("/addPlace", AddPlace);
app.post("/createBooking", CreateBooking);
app.patch("/addPlace", AddPlace);
app.get("/allPlaces", getUserPlaces);
app.get("/getMyBookings", GetMyBookings);
app.get("/getSinglePlaces/:id", GetSinglePlaces);
app.get("/getThisBooking/:id", GetThisBooking);

const multer = require("multer");
const photosMiddleware = multer({
  dest: path.join(__dirname, "Models", "Uploads"),
});
app.post("/fileUpload", photosMiddleware.array("photos", 100), FileUpload);
const start = async () => {
  try {
    await connectDB(process.env.MANGO_URI).then(
      console.log("Database connected")
    );
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}...`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
