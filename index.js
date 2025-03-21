require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

// Custom Morgan token to log request body for POST requests
morgan.token('body', (req) => {
    return req.method == 'POST' ? JSON.stringify(req.body) : ''
})

// Use morgan with custom body token
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request,response) => {
    response.send('Hello')
})

app.get('/api/persons', (request,response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request,response) => {
    Person.countDocuments({}).then(count =>{
        const date = new Date()
        response.send(`Phonebook has info for ${count} people
            <br></br>${date}`)
    })
})

app.get('/api/persons/:id', (request,response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person){
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request,response) => {
    Person.findByIdAndDelete(request.params.id).then(deletedPerson =>{
        if (!deletedPerson){
            return response.status(404).json({error: 'Person not found'})
        }

        response.status(204).end()
    })
    .catch(error =>{
        response.status(400).json({error: 'Invalid ID format'})
    })
})

/*const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => Number(n.id)))
        : 0
   return maxId
}*/ 

app.post('/api/persons', (request,response,next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request,response,next) => {
    const {name, number} = request.body

    Person.findByIdAndUpdate(
        request.params.id,
        {name, number},
        {new: true, runValidators: true, context:'query'}
    )
    .then(updatedPerson =>{
        if (!updatedPerson){
            return response.status(404).json({error: 'person not found'})
        }
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError'){
        return response.status(400).json({error: error.message})
    }

    next(error)
  }
  
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})