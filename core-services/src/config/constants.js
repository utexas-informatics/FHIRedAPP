module.exports = Object.freeze({
  environments: ['development', 'test', 'production'],
  error: {
    notFound: { status: 404, type: 'Not Found' },
    internalServerError: { status: 500, type: 'Internal Server Error' },
    badRequest: { status: 400, type: 'Bad Request' },
    unauthorized: { status: 401, type: 'unauthorized' },
    conflict: { status: 409, type: 'Conflict' },
  },
  queries: {
    searchPatientByiccID_01:
      "select global_patient_id, source_patient_id, source_site_name from datavant_patient_match_leap_v01 where  dv_match_id = (SELECT dv_match_id  FROM public.datavant_patient_match_leap_v01 where source_patient_id= :id and source_site_name='icc' limit 1)",
    searchPatientByFHIREDAppID_01:
      "select global_patient_id, source_patient_id, source_site_name from datavant_patient_match_leap_v01 where  dv_match_id = (SELECT dv_match_id  FROM public.datavant_patient_match_leap_v01 where source_patient_id= :id and source_site_name='fhiredapp' limit 1) and source_site_name = 'icc'",
    searchPatientsByIds_01:
      // "SELECT global_patient_id, source_patient_id, source_site_name FROM public.datavant_patient_match_leap_v01 where source_patient_id IN (:id) and source_site_name='fhiredapp'",


      "select b.* from datavant_patient_match_leap_v01 as a INNER JOIN datavant_patient_match_leap_v01 as b on a.dv_match_id=b.dv_match_id and a.source_site_name='icc'and b.source_site_name='fhiredapp' and b.dv_match_id in (SELECT dv_match_id FROM public.datavant_patient_match_leap_v01 where source_patient_id IN (:id) and source_site_name='fhiredapp')",

    getPatientsWithNewMedicalRecords_01:
      "select dvpm2.*,fpd.updated_at,resource_type from datavant_patient_match_leap_v01 as dvpm join fhir_patient_data_update_tracker as fpd on dvpm.source_patient_id = fpd.subject_key join datavant_patient_match_leap_v01 as dvpm2 on dvpm2.dv_match_id=dvpm.dv_match_id and dvpm2.source_site_name='fhiredapp' and fpd.updated_at> (:date)  offset (:skip) limit (:limit)",

    searchPatientByiccID_02:
      "select global_patient_id, source_patient_id, source_site_name from datavant_patient_match_leap_v02 where  dv_match_id = (SELECT dv_match_id  FROM public.datavant_patient_match_leap_v02 where source_patient_id= :id and source_site_name='icc' limit 1)",
    searchPatientByFHIREDAppID_02:
      "select global_patient_id, source_patient_id, source_site_name from datavant_patient_match_leap_v02 where  dv_match_id = (SELECT dv_match_id  FROM public.datavant_patient_match_leap_v02 where source_patient_id= :id and source_site_name='fhiredapp' limit 1) and source_site_name = 'icc'",
    searchPatientsByIds_02:
      // "SELECT global_patient_id, source_patient_id, source_site_name FROM public.datavant_patient_match_leap_v02 where source_patient_id IN (:id) and source_site_name='fhiredapp'",
      "select b.* from datavant_patient_match_leap_v02 as a INNER JOIN datavant_patient_match_leap_v02 as b on a.dv_match_id=b.dv_match_id and a.source_site_name='icc'and b.source_site_name='fhiredapp' and b.dv_match_id in (SELECT dv_match_id FROM public.datavant_patient_match_leap_v02 where source_patient_id IN (:id) and source_site_name='fhiredapp')",
    getPatientsWithNewMedicalRecords_02:
      "select dvpm2.*,fpd.updated_at,resource_type from datavant_patient_match_leap_v02 as dvpm join fhir_patient_data_update_tracker as fpd on dvpm.source_patient_id = fpd.subject_key join datavant_patient_match_leap_v02 as dvpm2 on dvpm2.dv_match_id=dvpm.dv_match_id and dvpm2.source_site_name='fhiredapp' and fpd.updated_at> (:date)  offset (:skip) limit (:limit)",

    datavantTableFlag:
      "select datavant_table_flag from datavant_table_update_flag where datavant_table_name='datavant_leap_tables'",
    updateFPDUTUpdateAt:
      "update fhir_patient_data_update_tracker set updated_at=(:date) where subject_key='(:subKey)'",
  },
});
