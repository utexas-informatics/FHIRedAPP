var cron = require('node-cron');
const userController = require('../controllers/user.controller');

module.exports = {
  datavant: () => {
    cron.schedule('*/59 * * * *', () => {
      console.log(
        'datavantMatchStatus running a task every hour------------------------>'
      );
      userController.datavantMatchStatus(
        {
          body: {
            datavantMatchStatus: [
              { datavantMatchStatus: 'pending' },
              { datavantMatchStatus: 'matchNotFound' },
            ],
          },
        },
        {}
      );
    });
    cron.schedule('0 13 * * *', () => {
      console.log(
        'reminderLogin running a task every day at 7am ------------------------>'
      );
      userController.reminderLogin(
        {
          skip: true,
          headers: {
            platform: 'mobile',
            source: 'fhiredApp',
            skip: true,
          },
        },
        {}
      );
    });
    cron.schedule('0 13 * * *', () => {
      console.log(
        'reminderDemographic running a task every day at 7am ------------------------>'
      );
      userController.reminderDemographic(
        {
          skip: true,
          headers: {
            platform: 'mobile',
            source: 'fhiredApp',
            skip: true,
          },
        },
        {}
      );
    });
    cron.schedule('0 13 * * *', () => {
      console.log(
        'reminderNotification running a task every day at 7am ------------------------>'
      );
      userController.reminderNotification(
        {
          skip: true,
          headers: {
            platform: 'mobile',
            source: 'fhiredApp',
            skip: true,
          },
        },
        {}
      );
    });
    cron.schedule('0 13 * * *', () => {
      console.log('running a task every day at 7am ------------------------>');
      userController.newMedicalRecordNotify(
        {
          skip: true,
          headers: {
            platform: 'mobile',
            source: 'fhiredApp',
            skip: true,
          },
        },
        {}
      );
    });
  },
};
