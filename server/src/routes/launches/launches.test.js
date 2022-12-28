const request= require ('supertest');
const app= require('../../app');
const {mongoConnect, mongoDisconnect} = require('../../services/mongo')

describe ('launches API',() =>{
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async() =>{
        await mongoDisconnect();
    })
    describe("Test GET /launches",()=>{
        test('It shuold respond with 200 success',async ()=>{
            const response= await request(app)
                .get('/v1/launches')
                .expect('Content-Type',/json/)
                .expect(200);    
        });
    });
    
    describe ('Test POST /launches',()=>{
        const compeleteLaunchData={
            mission: 'API test',
            rocket: 'rocket-API',
            target: 'Kepler-186 f',
            launchDate: 'January 4, 2020',
        }; 
    
        const launchDataWithoutDate={
            mission: 'API test',
            rocket: 'rocket-API',
            target: 'Kepler-186 f',
        }; 
    
        const launchDateWithInvalidDate={
            mission: 'API test',
            rocket: 'rocket-API',
            target: 'Kepler-186 f',
            launchDate: 'J0',
        }; 
    
        test('It should respond with 200', async()=>{
             const response= await request(app)
                .post('/v1/launches')
                .send(compeleteLaunchData)
                .expect('Content-Type',/json/)
                .expect(201);
    
            const requestDate=new Date(compeleteLaunchData.launchDate).valueOf();
            const responseDate= new Date(response.body.launchDate).valueOf();
    
            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });
        
        
    
        test('It should catch missing required properties',async ()=>{
            const response= await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type',/json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: "missing variable ",
            });
        });
    
        test('It should catch invalid date ',async ()=>{
            const response= await request(app)
            .post('/v1/launches')
            .send(launchDateWithInvalidDate)
            .expect('Content-Type',/json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: "invalid input for launchDate",
            });
        });
    });
});
