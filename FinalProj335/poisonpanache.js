process.stdin.setEncoding("utf8");
const http = require("http");
const path = require("path");
const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
let fs = require("fs");
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(express.static(__dirname + '/public'));
/*Stuff for express/node ^^^^^ */

/*Stuff for mongo DB  */
require("dotenv").config({ path: path.resolve(__dirname, 'cred/.env') }) 
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: "CMSC335_DB", collection:"campApplicants"};

const { MongoClient, ServerApiVersion } = require('mongodb');
async function main() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.pzymt4q.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        /*Connect to mongo */
        await client.connect();
        /*function calls, and starting the node server? */
        const portNumber = process.argv[2]
        app.listen(portNumber); 
        console.log(`Web server is running at http://localhost:${portNumber}`);
        /*Type stop to shut down server */
        const prompt = "Stop to shutdown the server: ";
        process.stdout.write(prompt); 
        process.stdin.on("readable", function () {
            let dataInput = process.stdin.read();
            if (dataInput !== null) {
                let command = dataInput.trim();
                if (command === "stop") {
                  console.log("Shutting down the server");
                  process.exit(0);    
                } else {
                  console.log(`Invalid command: ${command}`);
                }
                process.stdout.write(prompt)
                process.stdin.resume();
            }
          });

        app.get("/tellUs", async (request, response) => {
            /* Generating the HTML */
            response.render("tellUs");
        });

        app.use(bodyParser.urlencoded({extended:false}));
        app.post("/formResults", async (request, response) => {
            await client.connect();
            const variables = {
                Fname: request.body.Fname,
                Lname: request.body.Lname,
                likes: request.body.likes,
                wants: request.body.wants
            };
            const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(variables);
            response.render("formResults", variables)
        });

        app.get("/location", async (request, response) => {
            /* Generating the HTML */
            response.render("location");
        });

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}


app.get("/", async (request, response) => {
    response.render("index");
});

main().catch(console.error);