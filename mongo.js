const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://DanyBeth:${password}@cluster0.xf8rui4.mongodb.net/?retryWrites=true&w=majority`

const peopleSchema = new mongoose.Schema({
  name: String,
  number: Number
})

const Person = mongoose.model('Person', peopleSchema)

mongoose
  .connect(url)
  .then(() => {
    if (!name) {
      Person
        .find()
        .then(console.log('phonebook:'))
        .then(persons => persons.forEach(person => console.log(person.name, person.number)))
        .then(() => mongoose.connection.close())
    } else {
      const person = new Person({ name, number })
      person.save()
        .then(() => console.log(`Added ${name} number ${number} to the phonebook`))
        .then(() => mongoose.connection.close())
    }
  })
  .catch((err) => console.log(err))
