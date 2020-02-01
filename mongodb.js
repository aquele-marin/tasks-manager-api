// CRUD create read update and delete

const { MongoClient, ObjectID } = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'


MongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
        console.log("Unable to connect to database")
    }

    // const db = client.db(databaseName)
    //
    // db.collection('users').deleteMany({
    //
    // }, (error, result) => {
    //     if (error) console.log(error)
    //
    //     console.log(result)
    // })

})
