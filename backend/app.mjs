// import './config.mjs';
// import './db.mjs';
// import './passportConfig.mjs';
// import passport from 'passport';
// import session from 'express-session';
// import helmet from 'helmet';
// import fs from "fs";
// import https from "https";
// import logger from "./logger.mjs";

import dotenv from 'dotenv';
dotenv.config();
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {router as wordleRouter, exists} from "./routes/wordleRouter.mjs"

// -------------------------------------------------------------------------------- Path Setup ----------------------------------------------------------------------------------------------
//getting file path to app.mjs
const __filename = fileURLToPath(import.meta.url);

//same as __filename but excluding file name (app.mjs)
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------------------------- Creating Express App ------------------------------------------------------------------------------------
const app = express();

// -------------------------------------------------------------------------------- (Later implement SSL Certificates) ----------------------------------------------------------------------
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, '../cert/key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, '../cert/cert.pem'))
// };

// -------------------------------------------------------------------------------- Cross Origin Resource Sharing (CORS) ---------------------------------------------------------------------
//NO ONE IS ALLOWED TO ACCESS MY API EXCEPT FOR LOCALHOST, AND WHATEVER URLS I WILL USE FOR PRODUCTION
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

//protects users by only allowing requests with no origin (like a curl request) or from my whitelist
//simple requests will allow the request but cause the user's browser to block the response from my server
//non-simple requests will deny the request itself
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,                                                //allows cookies to be sent with requests
}));


// -------------------------------------------------------------------------------- Helmet Security Headers ----------------------------------------------------------------------------------
//adds the Helmet library's default security headers
// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       imgSrc: ["'self'", "data:", "blob:"],
//       connectSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );
app.disable("x-powered-by");

// -------------------------------------------------------------------------------- Compression ----------------------------------------------------------------------------------------------
//compress data sent over to increase speed
app.use(compression());

// -------------------------------------------------------------------------------- Accepted formats for body parsing ------------------------------------------------------------------------
//Automatically parses req.body as json
app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------------------------- Session and Passport Session -----------------------------------------------------------------------------
//use an array of long randomly generate strings as the session key. Change these every so often to keep the session secure.
// app.use(
//   session({
//     secret: process.env.sessionKey ?? 'LocalSecret',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 1000 * 60 * 60 * 2, rolling: true }, //logout automatically after an hour of inactivity
//   })
// );

// //setting up passport to use my session. First one intializes passport, second one lets passport access my sessions made with express-session
// app.use(passport.initialize());
// app.use(passport.session());

// -------------------------------------------------------------------------------- Logging pages accessed for local testing -----------------------------------------------------------------
//logs all pages accessed
app.use((req, res, next) => {
  console.log(req.path, req.body ? req.body : "");
  // logger.info(`${req.path} was visited`, req.body ? req.body : "");
  next();
});

// -------------------------------------------------------------------------------- Authentication Checks ------------------------------------------------------------------------------------
//checks every request to see if the path requested is a protected route. If they're not logged in, redirect to login page
// app.use(isAuthenticated);

// -------------------------------------------------------------------------------- Route Handlers ------------------------------------------------------------------------------------------
app.use("/game", exists);
app.use(wordleRouter)

// -------------------------------------------------------------------------------- Cacheability and Static File Directories ----------------------------------------------------------------
//globally set no-store caching (We don't want old API responses to be stored)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

//serve static files WITH caching from the dist directory
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
  setHeaders: (res, path) => {
   if (path.endsWith(".html")) {
      //Don't cache HTML. New builds do not change the name of the HTML file. So old cache can refer to older builds by accident
      res.setHeader("Cache-Control", "no-cache");
    } else {
      //Cache bundled assers to speed up loads for user. Every build uses different names for JS/CSS files, so we don't have to worry about pointing to older cache
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));

// -------------------------------------------------------------------------------- Fallback ------------------------------------------------------------------------------------------------
//if an API is not called, send the index.html file over to the user.
//after receiving it once, the user should hopefully not need it again and use Link and Navigate from react-router-dom to change pages
app.get(/.*/, (req, res) => {
  return res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// -------------------------------------------------------------------------------- Starting the Server -------------------------------------------------------------------------------------
app.listen(process.env.PORT ?? 3000, () => {
  console.log('backend is running on port: ' + process.env.PORT);
});

// -------------------------------------------------------------------------------- (Later implement SSL Certificates with HTTPS) -----------------------------------------------------------
// https.createServer(sslOptions, app).listen(process.env.PORT ?? 3000, () => {
//   console.log('HTTPS server is running on port: ' + process.env.PORT);
// });

