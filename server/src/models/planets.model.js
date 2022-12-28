
const path= require('path');
const {parse} = require('csv-parse');
const fs = require('fs');
// const { launches } = require('./launches.model');

const planets  = require('./planets.mongo')

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData(){
    return new Promise((resolve,reject)=> {
        fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true,
        }))
        .on('data', async (data) => {
            if (isHabitablePlanet(data)) {
            // habitablePlanets.push(data);
                savePlanets(data);
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .on('end', async () => {
            const planetCount= (await getAllPlanets()).length;
            console.log(`${planetCount} habitable planets found!`);
            resolve();
        });

    });
}

async function getAllPlanets(){
    // filtering the db; empty object-> all 
    return await planets.find({
        // filter: keplerName: [planet name]{-keplerName} : exclude the column for keplername
    },{
        '_id':0,'__v':0
        //exclude 
    });
}

async function savePlanets(planet){
    try{
        await planets.updateOne({
            keplerName: planet.kepler_name,
        },{
            keplerName: planet.kepler_name,
        }, {
            upsert: true
        });
    }catch(err) {
        console.error(`could not save planet ${err}`); 
    }
    }
    



module.exports={
    //initialize the var and its value
    loadPlanetsData,
    getAllPlanets,
    
};