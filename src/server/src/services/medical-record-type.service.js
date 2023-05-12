var medicalRcTpDao = require('../dao/medical-records-type.dao');
var logger = require('../config/logger');

var createMedicalRecordType = async function (req, res) {
    logger.info(`MedicalRecordType : service : createMedicalRecordType : received request`);
    try {
      var MedicalTprec = await medicalRcTpDao.createMedicalRecordType(req, res);
      return MedicalTprec;
    } catch (e) {
      logger.error(`MedicalRecordType : service : createMedicalRecordType : Error : ${e}`);
      throw e;
    }
  };

  var getMedicalRecordTypes = async function (req, res) {
    logger.info(`MedicalRecordType : service : getMedicalRecordTypes : received request`);
    try {
      var MedicalTpList = await medicalRcTpDao.getMedicalRecordTypes(req, res);
      return MedicalTpList;
    } catch (e) {
      logger.error(`MedicalRecordType : service : getMedicalRecordTypes : Error : ${e}`);
      throw e;
    }
  };

  var updateMedicalRecordType = async function (req, res) {
    logger.info(`MedicalRecordType : service : updateMedicalRecordType : received request`);
    try {
      var MedicalTprec = await medicalRcTpDao.updateMedicalRecordType(req, res);
      return MedicalTprec;
    } catch (e) {
      logger.error(`MedicalRecordType : service : updateMedicalRecordType : Error : ${e}`);

      throw e;
    }
  };

  module.exports.createMedicalRecordType = createMedicalRecordType;
module.exports.getMedicalRecordTypes = getMedicalRecordTypes;
module.exports.updateMedicalRecordType = updateMedicalRecordType;