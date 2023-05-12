var medicalRecordTpService = require('../services/medical-record-type.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');
const medicalRecordType = require('../models/medical-record-type');

var createMedicalRecordType = async function (req, res, next) {
    try {
        var MedicalTprec = await medicalRecordTpService.createMedicalRecordType(req, res);
        res.json(MedicalTprec);
      } catch (e) {
        var error = 'Failed to createMedicalRecordType';
        logger.error(`MedicalRecordType : controller : createMedicalRecordType : Error : ${e}`);
        next(
          errorResponse.build(constants.error.internalServerError, error, e.message)
        );
      }
}

var getMedicalRecordTypes = async function (req, res, next) {
    try {
        var MedicalTpList = await medicalRecordTpService.getMedicalRecordTypes(req, res);
        res.json(MedicalTpList);
      } catch (e) {
        var error = 'Failed to getMedicalRecordTypes';
        logger.error(`MedicalRecordType : controller : getMedicalRecordTypes : Error : ${e}`);
        next(
          errorResponse.build(constants.error.internalServerError, error, e.message)
        );
      }
}

var updateMedicalRecordType = async function (req, res, next) {
    try {
        var MedicalTprec = await medicalRecordTpService.updateMedicalRecordType(req, res);
        res.json(MedicalTprec);
      } catch (e) {
        var error = 'Failed to updateMedicalRecordType';
        logger.error(`MedicalRecordType : controller : updateMedicalRecordType : Error : ${e}`);
        next(
          errorResponse.build(constants.error.internalServerError, error, e.message)
        );
      }
}


module.exports.createMedicalRecordType = createMedicalRecordType;
module.exports.getMedicalRecordTypes = getMedicalRecordTypes;
module.exports.updateMedicalRecordType = updateMedicalRecordType;