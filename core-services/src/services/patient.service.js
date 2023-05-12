const constants = require('../config/constants');
var logger = require('../config/logger');
const { sequelize } = require('../config/sequelise');
const { QueryTypes } = require('sequelize');

var searhcPatient = async function (req, id, query) {
  logger.info(`Patient : service : searhcPatient : received request`);
  try {
    const result = await sequelize.query(query, {
      replacements: id.isArray ? [id] : { id },
      type: QueryTypes.SELECT,
    });
    return result;
  } catch (e) {
    logger.error(`Patient : service : searchPatient : Error : ${e}`);
    throw e;
  }
};

var getPatientsWithNewMedicalRecords = async function (
  req,
  date,
  query,
  skip,
  limit
) {
  logger.info(
    `Patient : service : getPatientsWithNewMedicalRecords : received request`
  );
  try {
    const result = await sequelize.query(query, {
      replacements: {
        date,
        skip,
        limit,
      },
      type: QueryTypes.SELECT,
    });
    return result;
  } catch (e) {
    logger.error(
      `Patient : service : getPatientsWithNewMedicalRecords : Error : ${e}`
    );
    throw e;
  }
};

var updateFPDUTUpdateAt = async function (req, query, subKey) {
  logger.info(`Patient : service : updateFPDUTUpdateAt : received request`);
  try {
    const currentTime = new Date();
    const result = await sequelize.query(query, {
      replacements: { subKey, date: currentTime },
      type: QueryTypes.UPDATE,
    });
    return result;
  } catch (e) {
    logger.error(`Patient : service : updateFPDUTUpdateAt : Error : ${e}`);
    throw e;
  }
};
const getDatavantTableFlag = async function (req, query) {
  try {
    const result = await sequelize.query(query, {
      replacements: {},
      type: QueryTypes.SELECT,
    });

    return result[0].datavant_table_flag == '1' ? 2 : 1;
  } catch (e) {
    logger.error(
      `Patient : service : getPatientsWithNewMedicalRecords : Error : ${e}`
    );
    throw e;
  }
};
module.exports.searhcPatient = searhcPatient;
module.exports.getPatientsWithNewMedicalRecords = getPatientsWithNewMedicalRecords;
module.exports.updateFPDUTUpdateAt = updateFPDUTUpdateAt;
module.exports.getDatavantTableFlag = getDatavantTableFlag;
