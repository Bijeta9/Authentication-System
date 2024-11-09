const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();
//convert data to json format
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

//EJS as view engine
app.set("view engine", "ejs");
//static file
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/home", (req, res) => {
  const username = req.query.username || "User";
  res.render("home", { username });
});

// Register User
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password,
  };

  //check if the user already exists in the database
  const existingUser = await collection.findOne({ name: data.name });
  if (existingUser) {
    res.send("User already exists. Please choose a different username");
  } else {
    //hash the password using bcrypt
    const saltRounds = 10; //Number of saltrounds for bcypt
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword; //Replace the hash password with original password

    const userdata = await collection.insertMany(data);
    console.log(userdata);
    res.redirect(`/home?username=${data.name}`);
  }
});

//Login user
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      res.send("User name cannot be found");
    }

    //Compare the hash password from the database with the plain text
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );
    if (isPasswordMatch) {
      res.redirect(`/home?username=${check.name}`);
    } else {
      req.send("Wrong password");
    }
  } catch {
    res.send("Wrong Details");
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
