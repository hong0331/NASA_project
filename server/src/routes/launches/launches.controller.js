const {getAllLaunches, scheduleNewLaunch, existsLaunchWithId, abortLaunchById}= require ('../../models/launches.model');
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req,res){
    const {skip, limit} = getPagination(req.query);
    const launch = await getAllLaunches(skip, limit)
    // manipulate data into array and return it 
    return res.status(200).json(launch);
}; 

function httpAddNewLaunch(req,res){
    const launch = req.body;

    //if one of the value is missing...
    if (!launch.mission ||!launch.rocket|| !launch.target || !launch.launchDate  ){
        return res.status(400).json({
            error: "missing variable "
        });
    }
   
    launch.launchDate= new Date(launch.launchDate);

    // december 20,2022 => 12349042000
    if (isNaN(launch.launchDate)){
        return res.status(400).json({
            error: "invalid input for launchDate"
        });
    }

    scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}



async function httpAbortLaunch(req,res){
    
    const launchId= Number(req.params.id);

    //if the launch NOT found 
    const existsLaunch= await existsLaunchWithId(launchId); 
    if (!existsLaunch){
        return res.status(404).json({
        error: "Launch not found",
        });
    }
    // if the launch has found 
    const aborted = await abortLaunchById(launchId);
    if (!aborted){
        return res.status(400).json({
            error: 'Launch not aborted',
        });
    }
    return res.status(200).json({
        ok: true, 
    });
}

module.exports={
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
};