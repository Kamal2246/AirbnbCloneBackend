const Users = require("../Models/User_model");
const Places_model = require("../Models/Places_schema");
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const fs = require("fs");
const imageDownloader = require("image-downloader");

app.use(express.json());

const cookieParser = require("cookie-parser");
const BookingsModel = require("../Models/BookingsModel");

// use cookie-parser middleware to parse cookies from the request headers
app.use(cookieParser());

const secret = bcrypt.genSaltSync(5);
const getAllUsers = async (req, res) => {
  try {
    const allusers = await Users.find({});
    res.send(allusers);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const GetAllPlaces = async (req, res) => {
  try {
    const gotallPlaces = await Places_model.find({});
    res.status(200).send(gotallPlaces);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await Users.create({
      username,
      email,
      password: bcrypt.hashSync(password, secret),
    });
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};
const jwtSectret = "ccSFRcsFeFHTRHfds";
const LoginUser = async (req, res) => {
  const { email, password } = req.body;
  const UserDoc = await Users.findOne({ email });
  if (UserDoc) {
    const passOk = bcrypt.compareSync(password, UserDoc.password);
    if (passOk) {
      jwt.sign(
        { email: UserDoc.email, id: UserDoc._id, username: UserDoc.username },
        jwtSectret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(UserDoc);
        }
      );
    } else {
      res.status(422).json("Pass not ok");
    }
  } else {
    res.json("not found");
  }
};

const Profile = (req, res) => {
  const token = req.headers.cookie ? req.headers.cookie.split("=")[1] : "";

  if (token) {
    jwt.verify(token, jwtSectret, {}, (err, tokendata) => {
      if (err) throw err;
      const { username, email } = tokendata;
      res.json({ username, email });
    });
  }
};

const Logout = (req, res) => {
  res.cookie("token", "").json(true);
};

const LinkUpload = async (req, res) => {
  const { link } = req.body;

  const newName = Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: path.join(__dirname, "..", "Models", "Uploads/") + newName,
  });
  res.json(`${newName}`);
  // res.json(`http://localhost:5000/Models/Uploads/${newName}`);
};

const FileUpload = async (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { originalname, path } = req.files[i];
    console.log(req.files[i]);
    const oldPath = path;
    const newPath = `F:\\pythonProject\\portfolio\\react\\AirBnb_clone\\backend\\Models\\Uploads\\${originalname}`;

    fs.rename(oldPath, newPath, (err) => {
      if (err) throw err;
    });

    uploadedFiles.push(originalname);
  }

  res.json(uploadedFiles);
};
const AddPlace = async (req, res) => {
  const {
    id,
    title,
    address,
    photos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuest,
  } = req.body;

  if (req.method === "POST") {
    // Handle POST request to add a new place
    // ...

    const token = req.headers.cookie ? req.headers.cookie.split("=")[1] : "";
    jwt.verify(token, jwtSectret, {}, async (err, Userdata) => {
      if (err) throw err;

      const Place_Doc = await Places_model.create({
        owner: Userdata.id,
        title,
        address,
        photos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuest,
      });
      res.json(Place_Doc);
    });
  } else if (req.method === "PATCH") {
    // Handle PATCH request to update an existing place
    // ...

    const place = await Places_model.findById(id);

    if (title) place.title = title;
    if (address) place.address = address;
    if (photos) place.photos = photos;
    if (description) place.description = description;
    if (perks) place.perks = perks;
    if (extraInfo) place.extraInfo = extraInfo;
    if (checkIn) place.checkIn = checkIn;
    if (checkOut) place.checkOut = checkOut;
    if (maxGuest) place.maxGuest = maxGuest;

    // Save the updated place to the database
    await place.save();

    res.json(place);
  }
};

const getUserPlaces = (req, res) => {
  const token = req.headers.cookie ? req.headers.cookie.split("=")[1] : "";
  jwt.verify(token, jwtSectret, {}, (err, User) => {
    if (err) throw err;
    Places_model.find({ owner: User.id })
      .then((Places_docs) => {
        res.json(Places_docs);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      });
  });
};
const GetSinglePlaces = async (req, res) => {
  const { id } = req.params;

  Places_model.find({ _id: id }).then((data) => {
    res.send(data);
  });
};
const CreateBooking = async (req, res) => {
  const token = req.headers.cookie ? req.headers.cookie.split("=")[1] : "";
  jwt.verify(token, jwtSectret, {}, async (err, Userdata) => {
    if (err) throw err;

    const { place, name, email, checkIn, checkout } = req.body;

    const Booking_Doc = await BookingsModel.create({
      owner: Userdata.id,
      place,
      name,
      email,
      checkIn,
      checkout,
    });
    res.json(Booking_Doc);
  });
};

const GetMyBookings = async (req, res) => {
  const token = req.headers.cookie ? req.headers.cookie.split("=")[1] : "";
  jwt.verify(token, jwtSectret, {}, async (err, Userdata) => {
    if (err) throw err;
    const Booking_doc = await BookingsModel.find({ owner: Userdata.id });
    const places_id = Booking_doc.map((booking) => booking.place);
    const place_docs = await Places_model.find({ _id: { $in: places_id } });

    res.json(place_docs);
  });
};

const GetThisBooking = async (req, res) => {
  const token = req.headers.cookie ? req.headers.cookie.split("=")[1] : "";
  jwt.verify(token, jwtSectret, {}, async (err, Userdata) => {
    if (err) throw err;

    const { id } = req.params;
    const Booking_doc = await BookingsModel.find({
      owner: Userdata.id,
      place: id,
    });

    res.send(Booking_doc);
  });
};
module.exports = {
  LinkUpload,
  getAllUsers,
  GetAllPlaces,
  registerUser,
  LoginUser,
  Profile,
  Logout,
  FileUpload,
  AddPlace,
  getUserPlaces,
  GetSinglePlaces,
  CreateBooking,
  GetMyBookings,
  GetThisBooking,
};
