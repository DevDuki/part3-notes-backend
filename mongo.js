const mongoose = require('mongoose')

if(process.argv.length < 3){
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@fullstackopencluster.x9dwg.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean
})

const Note = mongoose.model('note', noteSchema)


Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})