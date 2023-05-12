var medicalRecordType = require('../models/medical-record-type');
var logger = require('../config/logger');

var createMedicalRecordType = async function (req, res) {
  logger.info(
    `medicalRecordType : dao : createmedicalRecordType : received request`
  );
  try {
    const medicalRcTp = await medicalRecordType.create({
      ...req.body,
      createdBy: res.locals.userId || res.locals.adminId,
      updatedBy: res.locals.userId || res.locals.adminId,
    });
    if (medicalRcTp) {
      return medicalRcTp;
    }
    throw new Error(`Error while creating MedicalRecordType`);
  } catch (e) {
    logger.error(
      `MedicalRecordType : dao : createMedicalRecordType : Error : ${e}`
    );
    throw e;
  }
};

var getMedicalRecordTypes = async function (req, res) {
  logger.info(
    `medicalRecordType : dao : getMedicalRecordTypes : received request`
  );
  try {
    const medicalRcTpList = await medicalRecordType.find({});
    if (medicalRcTpList) {
      return medicalRcTpList;
    }
    throw new Error(`Error while getting MedicalRecordType`);
  } catch (e) {
    logger.error(
      `MedicalRecordType : dao : getMedicalRecordType : Error : ${e}`
    );
    throw e;
  }
};

var updateMedicalRecordType = async function (req, res) {
  logger.info(
    `medicalRecordType : dao : updateMedicalRecordType : received request` +
      req.params.id
  );
  try {
    const medicalRcTp = await medicalRecordType.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    if (medicalRcTp) {
      return medicalRcTp;
    }
    throw new Error(`Error while updating MedicalRecordType`);
  } catch (e) {
    logger.error(
      `MedicalRecordType : dao : updateMedicalRecordType : Error : ${e}`
    );
    throw e;
  }
};

module.exports.createMedicalRecordType = createMedicalRecordType;
module.exports.getMedicalRecordTypes = getMedicalRecordTypes;
module.exports.updateMedicalRecordType = updateMedicalRecordType;
