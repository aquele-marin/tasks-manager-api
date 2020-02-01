const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gabrielvbmarin21@gmail.com',
        subject: 'Thanks for joining in !',
        text: `${name}, welcome to the task manager app !!!`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gabrielvbmarin21@gmail.com',
        subject: 'Goodbye son, see you later !',
        text: 'It was a pleasure to have you with us, ma bro'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}
