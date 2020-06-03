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

    const errors = validationResult(request)

    if(!errors.isEmpty()) {
      const currentError = errors.array()[0]
      return response.json(`bad request: ${currentError.msg}`)
    }

    //this line below must be commented out before pwp has been hosted using docker
    response.append('Access-Control-Allow-Origin', ['*'])
    console.log(request.body)
    return response.json('is this thing on?')
  })

app.use(indexRoute)

app.listen(4200, () => {console.log('The server has started')} )
