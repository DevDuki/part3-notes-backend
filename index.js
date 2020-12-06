require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note')

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
  }
]

//Middlewares (orders of app.use(<Middleware>) matters, so be careful)

//this middleware is used to show every propperty of the request, after parsing it in json
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:', request.path);
  console.log('Body:', request.body);
  console.log('---');
  next()
}

//this middleware is used to handle all requests with not yet handled endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unkown endpoint" })
}

//this middleware is used to handle all errors
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === "CastError"){
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(express.static('build')) // Make the backend use the build directory (which was copied from frontent), whenever a request is received

app.use(express.json())

app.use(cors()) // Cross origin resource changing: from frontend (port 3000) to backend (port3001)

app.use(requestLogger)

// const generateId = () => {
//   const maxId = notes.length > 0 
//     ? Math.max(...notes.map(n => n.id))
//     : 0
  
//   return maxId + 1
// }

app.post('/api/notes', (request, response) => {
  const body = request.body

  if(body.content === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if(note){ // if not note could be found by the database "note" will be null
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
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

  Note.findByIdAndUpdate(request.params.id, note, { new: true})
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})