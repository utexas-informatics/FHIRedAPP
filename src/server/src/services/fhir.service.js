const fetchWrapper = require('../config/fetch-wrapper');
var logger = require('../config/logger');
const jwt_decode = require('jwt-decode');
const { createAudit } = require('../services/audit.service');
var userDAO = require('../dao/user.dao');
var userService = require('../services/user.service');
var clinicalDataByCategory = async function (req, res) {
  const decodedHeader = jwt_decode(
    req.headers['authorization'].replace('bearer ', '')
  );
  req.body = { ...req.body, emailId: decodedHeader.email };
  var user = await userDAO.getUserByEmailId(req, res);
  // Temp code added for updating the FHIR Patient id
  if (
    user.fhiredPatientId == null &&
    user.datavantMatchStatus == 'matchFound'
  ) {
    var newBody = { ...req };
    newBody.body = { FHIRedAppPatientID: user._id };
    var patient = await userService.getCrosswalkID(newBody, res);
    if (patient != null && patient.source_patient_id != null) {
      var patientDetailsFromFhir = await userService.getPatientIDFromFhir(
        patient.source_patient_id
      );
      if (patientDetailsFromFhir.total > 0) {
        user = await userService.updateFhiredPatientID(
          newBody,
          patientDetailsFromFhir.entry[0].resource.id
        );
      }
    }
  }
  /************** remove the above code once frontend is fixed */
  sendAudit(req, res);
  let url = '';
  switch (req.body.categoryName.toLowerCase()) {
    case 'medication':
      url = [];
      url.push({
        resourceName: 'MedicationStatement',
        url: `${process.env.FHIR_API_BASE_URL}/MedicationStatement?subject=${user.fhiredPatientId}&_count=${req.body.pageCount}&_getpagesoffset=${req.body.offset}`,
      });
      url.push({
        resourceName: 'MedicationDispense',
        url: `${process.env.FHIR_API_BASE_URL}/MedicationDispense?subject=${user.fhiredPatientId}&_count=${req.body.pageCount}&_getpagesoffset=${req.body.offset}`,
      });
      // url.push({resourceName: "MedicationRequest", url:`${process.env.FHIR_API_BASE_URL}/MedicationRequest?subject=${req.body.globalPatientId}&_count=${req.body.pageCount}&_getpagesoffset=${req.body.offset}`})

      break;
    case 'vitals':
      url = `${process.env.FHIR_API_BASE_URL}/Observation?subject=${user.fhiredPatientId}&category=observationType|2&_count=${req.body.pageCount}&_getpagesoffset=${req.body.offset}`;

      break;
    case 'lab results':
      // url=`${process.env.FHIR_API_BASE_URL}/Observation?subject=${req.body.globalPatientId}&_count=${req.body.pageCount}&_getpagesoffset=${req.body.offset}&_format=json`
      url = `${process.env.FHIR_API_BASE_URL}/Observation?subject=${user.fhiredPatientId}&category=observationType|1&_count=${req.body.pageCount}&_getpagesoffset=${req.body.offset}`;

      break;
    case 'diagnosis':
      url = `${process.env.FHIR_API_BASE_URL}/Condition?subject=${user.fhiredPatientId}&_count=${req.body.pageCount}&category=Condition|Diagnosis&_getpagesoffset=${req.body.offset}&_format=json`;
      break;
    case 'procedures':
      url = `${process.env.FHIR_API_BASE_URL}/Procedure?subject=${user.fhiredPatientId}&_count=${req.body.pageCount}&_getpagesoffset=${req.body.offset}&_format=json`;
      break;
    case 'visits': // This is mapped to
      url = `${process.env.FHIR_API_BASE_URL}/Encounter?subject=${user.fhiredPatientId}&_count=${req.body.pageCount}&_getpagesoffset=${req.body.offset}&_format=json`;
      break;
  }

  try {
    if (Array.isArray(url)) {
      let finalResp = [];
      for (let i = 0; i < url.length; i++) {
        // url[i].url = url[i].url+(req.body.searchText!= null && req.body.searchText != ''?'&_content='+req.body.searchText:'');
        const resp = await fetchWrapper.get(url[i].url);
        finalResp.push({ resourceName: url[i].resourceName, response: resp });
      }
      return finalResp;
    } else {
      // url = url+(req.body.searchText?'&_content='+req.body.searchText:'');
      const resp = await fetchWrapper.get(url);

      return resp;
    }
    // const resp = await fetch()
  } catch (e) {
    logger.error(`Fhir Service : service : Fhir Service : Error : ${e}`);
    throw e;
  }
};

const sendAudit = function (req, res) {
  logger.info(
    `fhir : service : clinical data : category: ${req.body.categoryName}`
  );
  createAudit({
    system: 'LEAP',
    action: 'PageVisits',
    actionData: [
      {
        name: 'session_state',
        value: req.headers['session_state'] ? req.headers['session_state'] : '',
      },
      {
        name: 'page',
        value: `my records - ${req.body.categoryName}`,
      },

      { name: 'timestamp', value: new Date() },
    ],
    platform: req.headers['platform'],
    source: req.headers['source'],
    entity: 'visits',
    documentId: req.headers.userid,
    change: [],
    createdBy: req.headers.userid,
  });
};

module.exports.clinicalDataByCategory = clinicalDataByCategory;
