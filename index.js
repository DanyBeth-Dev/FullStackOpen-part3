/* eslint-disable no-unused-vars */
require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const requestLogger = (request, _response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(cors())
app.use(express.static('build'))
app.use(morgan('tiny'))
app.use(express.json())
app.use(requestLogger)


app.get('/info', (_request, response) => {
  Person
    .find()
    .then((results) => response.send(`<p>Phonebook has info for ${results.length} people</p><p>${new Date()}</p>`))
})

app.get('/api/persons', (_request, response) => {
  Person
    .find()
    .then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', morgan(':response'), async (request, response, next) => {
  const body = request.body
  const persons = await Person.find()
  morgan.token('response', function (_request, _response) { return JSON.stringify(body) })
  if (persons.indexOf(body.name) > 0) {
    return response.status(400).json({ error: 'name must be unique' })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person
    .save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person
    .findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(_result => response.status(204).end())
    .catch(error => next(error))
})

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, _request, response, next) => {
  console.error('error message: ', error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// handler of requests with result to errors
// this has to be the last loaded middleware.
app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})