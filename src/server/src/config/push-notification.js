const FCM = require('fcm-node')
var serverKey = require('./leap-268c4-firebase-adminsdk-l4z12-72e9e1be18.json') //put the generated private key path here    
var fcm = new FCM(serverKey)

module.exports = fcm;
