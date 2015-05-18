var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

var opt = {
  from: 'Wave Farm <info@wavefarm.org>',
  to: process.env.ADMIN_MAIL,
  subject: 'Notice from the Wave Farm app'
}

module.exports = function (body) {
  opt.text = body
  transporter.sendMail(opt, function (err, info) {
    if (err) return console.error(err)
    console.log('Email sent: ' + info.response)
  })
}
