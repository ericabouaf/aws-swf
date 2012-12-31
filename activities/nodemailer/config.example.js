
// cf https://github.com/andris9/Nodemailer/ for full options

exports.transport = {
    type: "SMTP",

    options: {
        service: "Gmail",
        auth: {
            user: "myusername@gmail.com",
            pass: "mypassword"
        }
    }

};

