const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const apiRouter = require("./routes");
const PORT = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const {v2} = require("cloudinary")
require("dotenv").config();
const cors = require("cors");
const app = express();
connectDB();
v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
app.use(express.json({limit: "5mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors())
app.use(bodyParser.json());
app.use("/api", apiRouter);

app.listen(PORT, () => console.log(`server was started on ${PORT} PORT`));



