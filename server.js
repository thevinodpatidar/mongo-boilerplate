var express = require('express')
var bodyParser = require('body-parser')
var morgan = require('morgan');
var mongoose = require('mongoose');
const path = require("path");
var cors = require("cors");

const app = express()
const router = express.Router();
const port = process.env.PORT || "3000";

const config = require('./configs/db');
const route = require("./routes");

// process.env.NODE_ENV = "development";
mongoose.connect(config.db_url,{useNewUrlParser : true,
  useUnifiedTopology: true  // Used because of deprecation of Discovery Engine
})
.then(() => console.log("connected to database"))
.catch(err => console.error("could not connect to database", err.message));

// if (app.get("env") == "development") {
// app.use(morgan("tiny"));
// }
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('dev'));
app.use(router);
app.use(cors({
  credentials: true,
  origin: (origin, callback) => callback(null, true),
}));
app.use(function (req, res, next) {
    
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type');
  // res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials',"*");
  // Pass to next layer of middleware
  res.setHeader("Access-Control-Expose-Headers", "AuthToken");
  next();
  });

app.use((err, req, res, next) => {
    if (err) {
      res.status(err.statusCode || err.status || 500).send(err || {});
  
    } else {
      next();
    }
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}));
app.use('/api',route);



app.listen(port,(req,res)=>{
    console.log("Server started at :",port);
})
