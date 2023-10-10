const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const httpError = require('http-errors');
const routes = require('./Routes');
const config = require('./Config/app');
const graphqlHTTP = require("express-graphql").graphqlHTTP
const errorHandler = require("./Middleware/ErrorHandler") 


const graphqlSchema = require("./graphql/schema")
const graphqlResolvers = require("./graphql/resolvers")


require("@babel/core").transformSync("code", {
  plugins: [
    ["@babel/plugin-proposal-decorators", { version: "2023-05" }],
  ]
});



const app = express();

const morganFormat = config.isDev ? "dev" : "combined";

app.use(morgan(morganFormat));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());






app.use(
  '/graphql',
  graphqlHTTP ({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
    customFormatErrorFn: (error) => {
      const errorStructure = errorHandler(error)
      

      return {
        info: errorStructure
        // You can include additional error information as needed
      };
    }
  })
);



//app.use("/api", ...routes);

app.use((req, res, next) => {
  next(httpError(404));
});


app.use(errorHandler);


app.listen(config.port, () => {
  console.log(`Server started ${config.host}:${config.port}`);
});