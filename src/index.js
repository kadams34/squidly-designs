require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mailgun = require('mailgun-js')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')
const Recaptcha = require('express-recaptcha').RecaptchaV2
const multer = require('multer')
const storage = multer.memoryStorage()


const limits  = {fields: 4, files: 1, parts: 10 }
const fileFilter = ( request, file, callback) => {
  const {originalname} = file
  return originalname.match(/\.(jpg|jpeg|png|gif)$/)
    ? callback(null, true)
    : callback(new Error("only images are allowed to be uploaded"), false)
}

const uploader = multer({storage, limits, fileFilter}).single('upload')
//initializing the express app
const app = express()

//project wide middleware declarations for express
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)
const indexRoute = express.Router()



const requestValidation = [
    check('email', 'A valid Email is required').isEmail().normalizeEmail(),
    check('name', 'A name is required to send an email').not().isEmpty().trim().escape(),
    check('message','A message is required to send an email').not().isEmpty().trim().escape().isLength({max:2000})
  ]

indexRoute.route('/apis')
  .get((request, response) => {
    return response.json('Hello')
  })
  .post(uploader, recaptcha.middleware.verify, requestValidation, (request, response) => {

    response.append('Content-Type', 'text/html')
    //Todo add this line when ready to test multer
    console.log(request.file)
   if (request.recaptcha.error) {
     return response.send(`<div class="alert alert-danger" role="alert"><strong>Oh snap!</strong> There was an error with Recaptcha</div>`)
   }

   const errors = validationResult(request)

   if (!errors.isEmpty()) {
     const currentError = errors.array()[0]
     return response.send(Buffer.from(`<div class="alert alert-danger" role="alert"><strong>Oh snap!</strong> ${currentError.msg}</div>`))
   }

    const domain = process.env.MAILGUN_DOMAIN
    const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: domain})
    const {email, name, message} = request.body

    let attachment = undefined

    if (request.file) {
      attachment = new mg.Attachment({data: request.file.buffer, filename: `${email}-attachment`, contentType: request.file.mimetype, knownLength: request.file.size})
    }

    const mailgunData = {
      to: process.env.MAIL_RECIPIENT,
      from: `Mailgun Sandbox <postmaster@${domain}>`,
      subject: `${name} - ${email}`,
      text: message,
      attachment: attachment
    }
    console.log(mailgunData)

    mg.messages().send(mailgunData, (error) => {
      if (error) {
        return response.send(Buffer.from(`<div class="alert alert-danger" role="alert"><strong>Oh snap!</strong>Unable to send email error with email sender</div>`))
      }
    })

    return response.send(Buffer.from(`<div class="alert alert-success" role="alert">Email successfully sent.</div>`))
  })

app.use(indexRoute)

app.listen(4200, () => {console.log('The server has started')} )
