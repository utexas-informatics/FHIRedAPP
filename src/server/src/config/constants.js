module.exports = Object.freeze({
  environments: ['development', 'test', 'production'],
  error: {
    notFound: { status: 404, type: 'Not Found' },
    internalServerError: { status: 500, type: 'Internal Server Error' },
    badRequest: { status: 400, type: 'Bad Request' },
    unauthorized: { status: 401, type: 'unauthorized' },
    conflict: { status: 409, type: 'Conflict' },
  },
  coreServicesEndpoints: {
    createAudit: `/audits`,
    sendEmail: `/email`,
  },
});
