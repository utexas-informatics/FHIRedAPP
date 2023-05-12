
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');
var fhirService = require('../services/fhir.service');

var clinicalDataByCategory = async function (req, res, next) {
    try {
    const resp = await fhirService.clinicalDataByCategory(req,res)
    res.json(resp);
      } catch (e) {
        var error = 'Failed to get data from FHIR server';
        logger.error(`Fhir : controller : clinicalDataByCategory : Error : ${e}`);
        next(
          errorResponse.build(constants.error.internalServerError, error, e.message)
        );
      }

}
module.exports.clinicalDataByCategory = clinicalDataByCategory;


 