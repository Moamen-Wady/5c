const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const compression = require("compression");
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://c5.damansolutions.com"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routes/resvRoute"));
app.listen(3005);
mongoose
  .connect(
    `mongodb+srv://${process.env.MDBUSER}:${process.env.MDBPWD}@cluster0.iumas.mongodb.net/${process.env.MDBDB}`
  )
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    {
      console.log(err.message);
    }
  });

app.get("/", (req, res) => {
  res.send("ok");
});
