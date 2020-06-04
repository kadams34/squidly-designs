require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mailgun = require('mailgun-js')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')

//initializing the express app
const app = express()

//project wide middleware declarations for express
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log(process.env)

const indexRoute = express.Router()

const requestValidation = [
    check('email', 'A valid Email is required').isEmail().normalizeEmail(),
    check('name', 'A name is required to send an email').not().isEmpty().trim().escape(),
    check('upload').optional().trim().escape(),
    check('message','A message is required to send an email').not().isEmpty().trim().escape().isLength({max:2000})
  ]

indexRoute.route('/apis')
  .get((request, response) => {
    return response.json('Hello')
  })
  .post(requestValidation, (request, response) => {
    response.append('Content-Type', 'text/html')

    //this line below must be commented out before pwp has been hosted using docker
    response.append('Access-Control-Allow-Origin', ['*'])
    const domain = process.env.MAILGUN_DOMAIN
    const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: domain});

    const {email, upload, name, message} = request.body

    const mailgunData = {
      to: process.env.MAIL_RECIPIENT,
      from: `Mailgun Sandbox <postmaster@${domain}>`,
      subject: `${name} - ${email}`,
      text: message
    }

    mg.messages().send(mailgunData, (error) => {
      if (error) {
        return response.send(Buffer.from(`<div class="alert alert-danger" role="alert"><strong>Oh snap!</strong>Unable to send email error with email sender</div>`))
      }
    })

    const errors = validationResult(request)

    if(!errors.isEmpty()) {
      const currentError = errors.array()[0]
      return response.json(`bad request: ${currentError.msg}`)
    }


    console.log(request.body)
    return response.send(Buffer.from(`<div class="alert alert-success" role="alert">Email successfully sent.</div>`))
  })

app.use(indexRoute)

app.listen(4200, () => {console.log('The server has started')} )
