
var SendGrid = require('sendgrid').SendGrid;

exports.worker = function (task, config) {

    var sendgrid = new SendGrid(config.user, config.key);

    var mailOptions = JSON.parse(task.config.input);

    sendgrid.send(mailOptions, function (success, message) {
        if (!success) {
            task.respondFailed(success, "");
        } else {
            task.respondCompleted({message: message});
        }
    });

};


/*

var optionalParams = {
  to: [],
  toname: [],
  from: '',
  fromname: '',
  smtpapi: new SmtpapiHeaders(),
  subject: '',
  text: '',
  html: '',
  bcc: [],
  replyto: '',
  date: new Date(),
  files: [
    {
      filename: '',          // required only if file.content is used.
      contentType: '',       // optional
      path: '',              //
      url: '',               // == One of these three options is required
      content: ('' | Buffer) //
    }
  ],
  file_data: {},
  headers: {}
};

*/

