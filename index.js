require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note')

//Middlewares (orders of app.use(<Middleware>) matters, so be careful)

//this middleware is used to show every propperty of the request, after parsing it in json
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---')
  next()
}

//this middleware is used to handle all requests with not yet handled endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' })
}

//this middleware is used to handle all errors
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.static('build')) // Make the backend use the build directory (which was copied from frontent), whenever a request is received

app.use(express.json())

app.use(cors()) // Cross origin resource changing: from frontend (port 3000) to backend (port3001)

app.use(requestLogger)

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormattedNote => {
      response.json(savedAndFormattedNote)
    })
    .catch(error => next(error))
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes.map(note => note.toJSON()))
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if(note){ // if no note could be found by the database "note" will be null
        response.json(note.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote.toJSON())
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})