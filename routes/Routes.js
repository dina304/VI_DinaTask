const express = require("express");
const router = express.Router();
const getDataController = require("../controller/GetData");
const baseController = require("../controller/BaseController");

router.get("/isAlive",baseController.isAlive);

router.get("/marvelByActor",getDataController.getMarvelMoviesByActors);
router.get("/actorByMarvelRole",getDataController.getActorsWhoPlayMoreThenOneMarvel);
router.get("/whoPlayManyMarvel",getDataController.getActorsPlayedMoreThenOneRole);

router.get("/reloadData",getDataController.onLoad);

module.exports=router;
