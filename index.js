const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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

persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request,response) => {
    response.send('Hello')
})

app.get('/api/persons', (request,response) => {
    response.json(persons)
})

app.get('/info', (request,response) => {
    const date = new Date()
    const num = persons.length
    response.send(`Phonebook has info for ${num} people
                   <br></br>${date}`)
})

app.get('/api/persons/:id', (request,response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person){
        response.json(person)
    } else {
        response.status(404).end()
    }
    
})

app.delete('/api/persons/:id', (request,response) => {
    const id = request.params.id
    const initialLength = persons.length
    persons = persons.filter(person => person.id !== id)

    if (persons.length === initialLength){
        return response.status(404).json({
            error: "Person not found"
        })
    }

    console.log(`deleted id:${id}`)
    response.status(204).end()
})

/*const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => Number(n.id)))
        : 0
   return maxId
}*/

app.post('/api/persons', (request,response) => {
    const body = request.body

    if (!body.name){
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number){
        return response.status(400).json({
            error: 'number missing'
        })
    }

    if (persons.some(person => person.name === body.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: String(Math.floor(Math.random() * 100000) + 1),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})