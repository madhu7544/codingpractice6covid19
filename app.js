const express = require("express");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//1=get list of states
app.get("/states/", async (request, response) => {
  const getStatesQuery = `SELECT * FROM state
  ORDER BY state_id;`;
  const state = await db.all(getStatesQuery);
  response.send(state);
});

//2=Get 1 state
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT * FROM state 
    WHERE 
    state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});

//3=ADD district
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `INSERT INTO 
  district(district_name,state_id,cases,cured,active,deaths)
  VALUES
  ('${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths});`;
  const dbResponse = await db.run(addDistrictQuery);
  const districtId = dbResponse.lastID;
  response.send("District Successfully Added");
});

//4= Get 1 district
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT * FROM district 
    WHERE 
    district_id = ${districtId};`;
  const district = await db.get(getDistrictQuery);
  response.send(district);
});

//5= Delete district
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `DELETE FROM district
    WHERE
    district_id=${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//6= Update district
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `UPDATE district
    SET 
    district_name = '${districtName}',
    state_id= ${stateId},
    cases=${cases},
    cured=${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE 
    district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//7= get total
app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT SUM(cases) as totalCases,
  SUM(cured) as totalCured,
  SUM(active) as totalActive,
  SUM(deaths) as totalDeaths FROM district 
    WHERE 
    state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});

//8 = get stateName;
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT * FROM district 
    WHERE 
    district_id = ${districtId};`;
  const district = await db.get(getDistrictQuery);
  response.send(district);
});

module.exports = app;
