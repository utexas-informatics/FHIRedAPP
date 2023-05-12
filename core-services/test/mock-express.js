const express = require('express');
const cookieParser = require('cookie-parser');

exports.getApp = (path, routes) => {
  const app = express();
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: false,
    })
  );
  app.use(cookieParser());
  app.use(path, routes);
  app.use((err, req, res, next) => {
    res.status(err.statusCode).json(err);
  });
  return app;
};
