const errorHandler = require("./Middleware/ErrorHandler");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const httpError = require('http-errors');
const routes = require('./Routes');
const config = require('./Config/app');

require("@babel/core").transformSync("code", {
  plugins: [
    ["@babel/plugin-proposal-decorators", { version: "2023-05" }],
  ]
});



const app = express();


//increase payload size limit (images)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));






const morganFormat = config.isDev ? "dev" : "combined";
app.use(morgan(morganFormat));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


app.use("/auth", ...routes);

app.use((req, res, next) => {
  next(httpError(404));
});


app.use(errorHandler);


app.listen(config.port, () => {
  console.log(`Server started ${config.host}:${config.port}`);
});
