const http= require('http');
const app= require('./app');

require('dotenv').config();

const PORT = process.env.PORT || 8000;

const {mongoConnect}= require('./services/mongo');
const {loadPlanetsData} = require('./models/planets.model');
const {loadLaunchesData}= require('./models/launches.model')

const server= http.createServer(app);

async function startServer(){
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();
    await 

    server.listen(PORT,()=> {
        console.log(`Listening on the port ${PORT}`);
    });
}

startServer();
