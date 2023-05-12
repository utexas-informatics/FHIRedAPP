var service = require('../services/patient.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var searhcPatient = async function (req, res, next) {
  logger.info(`patient : controller : searhcPatient : received request`);
  try {
    let result = null;
    let flag = await service.getDatavantTableFlag(
      req,
      constants.queries.datavantTableFlag
    );
    if (req.body.iccPatientId) {
      result =
        flag == 1
          ? await service.searhcPatient(
              req,
              req.body.iccPatientId,
              constants.queries.searchPatientByiccID_01
            )
          : await service.searhcPatient(
              req,
              req.body.iccPatientId,
              constants.queries.searchPatientByiccID_02
            );
    } else if (req.body.FHIRedAppPatientID) {
      result =
        flag == 1
          ? await service.searhcPatient(
              req,
              req.body.FHIRedAppPatientID,
              constants.queries.searchPatientByFHIREDAppID_01
            )
          : await service.searhcPatient(
              req,
              req.body.FHIRedAppPatientID,
              constants.queries.searchPatientByFHIREDAppID_02
            );
    }
    if (result != null && result.length > 0) {
      res.json(result[0]);
    } else {
      res.json([]);
    }
  } catch (e) {
    var error = 'Failed to search patient';
    logger.error(`patient : controller : searhcPatient : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var datavantMatchStatus = async function (req, res, next) {
  logger.info(`patient : controller : searhcPatient : received request`);
  try {
    let result = null;
    let flag = await service.getDatavantTableFlag(
      req,
      constants.queries.datavantTableFlag
    );
    if (req.body.FHIRedAppPatientIds) {
      result =
        flag == 1
          ? await service.searhcPatient(
              req,
              req.body.FHIRedAppPatientIds,
              constants.queries.searchPatientsByIds_01
            )
          : await service.searhcPatient(
              req,
              req.body.FHIRedAppPatientIds,
              constants.queries.searchPatientsByIds_02
            );
    }
    if (result != null && result.length > 0) {
      res.json(result);
    } else {
      res.status(200).json([]);
    }
  } catch (e) {
    var error = 'Failed to search patient';
    logger.error(`patient : controller : searhcPatient : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getPatientsWithNewMedicalRecords = async function (req, res, next) {
  logger.info(
    `patient : controller : getPatientsWithNewMedicalRecords : received request`
  );
  try {
    let result = null;
    let flag = await service.getDatavantTableFlag(
      req,
      constants.queries.datavantTableFlag
    );

    if (req.body.date) {
      result =
        flag == 1
          ? await service.getPatientsWithNewMedicalRecords(
              req,
              req.body.date,
              constants.queries.getPatientsWithNewMedicalRecords_01,
              req.body.skip,
              req.body.limit
            )
          : await service.getPatientsWithNewMedicalRecords(
              req,
              req.body.date,
              constants.queries.getPatientsWithNewMedicalRecords_02,
              req.body.skip,
              req.body.limit
            );
    }
    if (result != null && result.length > 0) {
      res.json(result);
    } else {
      res.json([]);
    }
  } catch (e) {
    var error = 'Failed to get patient';
    logger.error(
      `patient : controller : getPatientsWithNewMedicalRecords : Error : ${e}`
    );
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var updateFPDUTUpdateAt = async function (req, res, next) {
  logger.info(`patient : controller : updateFPDUTUpdateAt : received request`);
  try {
    let result = null;
    result = await service.updateFPDUTUpdateAt(
      req,
      constants.queries.updateFPDUTUpdateAt,
      req.body.subKey
    );
    if (result != null && result.length > 0) {
      res.json(result);
    } else {
      res.json([]);
    }
  } catch (e) {
    var error = 'Failed to get patient';
    logger.error(`patient : controller : updateFPDUTUpdateAt : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.searhcPatient = searhcPatient;
module.exports.datavantMatchStatus = datavantMatchStatus;
module.exports.getPatientsWithNewMedicalRecords = getPatientsWithNewMedicalRecords;
module.exports.updateFPDUTUpdateAt = updateFPDUTUpdateAt;
