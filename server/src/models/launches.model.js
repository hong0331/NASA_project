const axios= require('axios');
const launchesDatabase= require('./launches.mongo');
const planetsDatabase= require ('./planets.mongo');


/**
 * laoding spacex data in API 
 */
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    console.log('Downloading launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            //set the pagination to be false to load all the data
            pagination: false,
            populate: [
                {
                path: 'rocket',
                select: {
                    name: 1
                    }
                },
                {
                path: 'payloads',
                select: {
                 'customers': 1
                 }
                }
            ]
        }
    });
    if (response.status!==200){
        console.log("Problem downlading launch data");
        throw new Error('Launch data download failed'); 
    }

     // mapping spaceX data to the database 
    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs){
         const payloads = launchDoc['payloads'];
         const customers = payloads.flatMap((payload) => {
             return payload['customers'];
         })
 
        const launch = {
             flightNumber: launchDoc['flight_number'],
             mission: launchDoc['name'],
             rocket: launchDoc['rocket']['name'],
             launchDate: launchDoc['date_local'],
             upcoming: launchDoc['upcoming'],
             success: launchDoc['success'],
             customers: customers,
         };
 
        console.log(`${launch.flightNumber} ${launch.mission}`);  
        await saveLaunch(launch);
        }
}




async function loadLaunchesData(){
    //minimizing API load; the first data in SPACEX api.
    const firstLaunch= await findLaunch({
        flightNumber:1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if (firstLaunch){
        console.log("Launch data is already loaded");
    }else{
        await populateLaunches();
    }
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}


async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId,
    });
};


function getAllLaunches(skip, limit){
    //filter the data 
    return launchesDatabase
        .find({},{'_id':0, '__v':0})
        // sort by descendigng number 
        .sort({flightNumber : 1 })
        .skip(skip)
        .limit(limit);
}


/**
 * save the launch data in the database 
 * @param {*} launch 
 */
async function saveLaunch(launch){
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert:true
    })
}


/**
 * schedule and save launch with the flight number 
 * @param {*} launch 
 */
async function scheduleNewLaunch(launch){
    //if target has not assigned, display error msg
    const planet = await planetsDatabase.findOne({
        keplerName: launch.target,
    });
    if (!planet){
        throw new Error('No matching target planets')
    }
    
    const newFlightNumber= await getLatestFlightNumber()+1;
    const newLaunch= Object.assign(launch,{
        success: true,
        upcoming: true,
        customers: ['ZTM','NASA'],
        flightNumber: newFlightNumber,
    });
    await saveLaunch(newLaunch)
}



/**
 * find the the latest flight number
 */
async function getLatestFlightNumber(){
    const latestLaunch= await launchesDatabase
        .findOne()
        .sort('-flightNumber'); 

    if (!latestLaunch){
        // return 100 (default flight number)
        return latestFlightNumber;
    }
    return latestLaunch.flightNumber;
}



/**
 * abort the launches
 * @param {*} launchId 
 */
async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
      flightNumber: launchId,
    }, {
      upcoming: false,
      success: false,
    });
 
    return aborted.ok === 1 && aborted.nModified === 1;
}

module.exports={
    loadLaunchesData,
    existsLaunchWithId,
    scheduleNewLaunch,
    getAllLaunches,
    abortLaunchById,
}
