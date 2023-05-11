const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const users = [
  {
    roleId: "1",
    loginemail: "admin",
    password: "admin123",
  },
];

const driver_struct = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  mobilenumber: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  dob: { type: String },
  timestamp: {
    type: String,
    default: Date.now(),
  },
  alcohol_levels: [
    {
      level: {
        type: String,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
    },
  ],
});

const alcohol_levels = mongoose.Schema({
  alcohol_detected: {
    type: Boolean,
    required: true,
  },
});

const detected_driver = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    default: Date.now(),
  },
  time_in_millis: {
    type: String,
    default: Date.now(),
  },
});

const Driver = mongoose.model("Driver", driver_struct);
const Detected_Driver = mongoose.model("Detected_Driver", detected_driver);
//set cors
app.use(cors());
//parse body
app.use(express.json());

app.post("/alcohol_levels", (req, res) => {
  let body = req.body;
  console.log(body);
  const d = new Date();
  cd = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
  Detected_Driver.find({}, { array: { $slice: -1 } }).then((driver) => {
    console.log(driver);
    c = driver[0];
    // if (Date.now() - parseInt(d.time_in_millis) <= 60000) {
    Driver.findOne({ firstname: c.name }).then((d) => {
      console.log(d);
      add = false;
      if (d.alcohol_levels.length == 0) {
        add = true;
      } else {
        if (d.alcohol_levels[d.alcohol_levels.length - 1].date === cd) {
          d.alcohol_levels[
            d.alcohol_levels.length - 1
          ].level = `${req.body.level}`;
        } else {
          add = true;
        }
      }
      if (add) {
        d.alcohol_levels.push({
          level: `${req.body.level}`,
          date: cd,
        });
      }
      d.save();
      res.status(200).send("Updated");
    });
    // }
  });
});

app.post("/detected", (req, res) => {
  let body = req.body;
  rd = body.name.split(".")[0];
  send_req = true;
  const d = new Date();
  cd = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
  Detected_Driver.find().then((data) => {
    var found = false;
    var oldDate = false;
    data.forEach((driver) => {
      if (driver.name == rd && driver.timestamp == cd) {
        found = true;
      }
      if (driver.timestamp != cd) {
        oldDate = true;
      }
    });
    if (!found) {
      if (oldDate) {
        Detected_Driver.deleteMany({});
      }
      const d1 = new Detected_Driver({
        name: rd,
        timestamp: `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`,
      });
      d1.save();
    }
  });
  res.json(body.name);
});

//set post route for login
app.post("/login", (req, res) => {
  //get body content
  let body = req.body;

  //filter user credentials to match user db
  let roleUsers = users.filter((el, i) => {
    if (el.loginemail === body.loginemail && el.password === body.password) {
      return el;
    }
  });

  if (roleUsers.length > 0) {
    let el = roleUsers[0];
    res.json(el);
  } else {
    res.json("invalid");
  }
});

app.post("/new_driver", (req, res) => {
  const body = req.body;
  const driver = new Driver(body);
  driver.save();
  res.json(driver);
});

//start server on port 3001 or process.env
app.listen(process.env.PORT || 3001, async () => {
  await mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => {
      console.log("Connected to server");
    });
  console.log("started");
});
