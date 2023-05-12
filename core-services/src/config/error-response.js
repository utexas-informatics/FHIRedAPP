/* eslint-disable no-param-reassign */
module.exports = {
  construct(status, type, error, message) {
    // Set error fields
    this.status = status;
    this.type = type;
    this.error = error;
    this.message = message;
    return this;
  },
  build(errorCode, error, message) {
    // Build error response
    if (!error) {
      error = 'An unexpected error occurred';
    }
    if (!message) {
      message = error;
    }
    return this.construct(errorCode.status, errorCode.type, error, message);
  },
};
