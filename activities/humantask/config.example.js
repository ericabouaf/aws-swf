
exports.mailer_transport = {
    service: "Gmail",
    auth: {
        user: "xxxx",
        pass: "xxx"
    }
};

exports.awsCredentials = {
    accessKeyId: "xxxx",
    secretAccessKey: "xxxxxx"
};

exports.server = {
    port: 3000,
    ip: 'localhost',
    host: 'localhost'
};

exports.defaultNotification = {
    "to": "example@gmail.com",
    "subject": "A new task is waiting to be done",
    "from": "AWS-SWF <example@example.com>"
};

exports.region = 'us-east-1';
