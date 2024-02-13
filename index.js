import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATA_BASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId4 = 1;
let currentUserId3 = 1;
let currentUserId2 = 1;
let currentUserId = 1;
let currentNameUser = "";


let users = []; 
async function addAllUsers(){

 // var result = await db.query("SELECT * FROM users");
 // for( var i = 0 ; i < result.length ; i++){
   // const data = result.rows[i];
   // users.push(data[i])
  //}
  //console.log(users)
  const userResult = await db.query("SELECT * FROM users");
  console.log(userResult.rows[0])
  userResult.rows.forEach((use) => {
   users.push(use);
  }); 
  
  
 }
addAllUsers();



async function checkVisisted() {

 /* if(currentUserId3 !== undefined){
  const result = await db.query("SELECT country_code FROM visited_countries JOIN users ON visited_countries.user_name = users.user_name WHERE users.id = $1"
  [currentUserId3]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
}else{
  const result = await db.query("SELECT country_code FROM visited_countries JOIN users ON visited_countries.user_name = users.user_name WHERE users.id = 1");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
}
  return countries;
  */
  let countries = []; // Оголошення countries поза блоками if/else
  
  let userId = currentUserId3 !== undefined ? currentUserId3 : 1; // Визначення userId залежно від currentUserId3

  try {
    const result = await db.query("SELECT country_code FROM visited_countries JOIN users ON visited_countries.user_name = users.user_name WHERE users.id = $1", [userId]);
    
    result.rows.forEach((country) => {
      countries.push(country.country_code);
    });
  } catch (error) {
    console.error("Помилка бази даних:", error);
  }

  return countries; // Повернення значення після завершення блоку try/catch
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: users[currentUserId4 - 1].color ,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  
  try {
    const result = await db.query(
      "SELECT country_code FROM country WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      
      let arrId = currentUserId2 - 1;
      var userName = users[0].user_name;
      console.log(currentUserId2)
      console.log(userName);
      await db.query(
        "INSERT INTO visited_countries (country_code , color , user_name , user_id) VALUES ($1 , $2 , $3 , $4)",
        [countryCode , users[arrId].color , users[arrId].user_name , currentUserId2 ]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  if( req.body.add === "new"){
    res.render("new.ejs")
  }else{
  currentUserId = req.body.user;
   currentUserId2 = currentUserId;
   currentUserId3 = currentUserId;
   currentUserId4 = currentUserId;
  //console.log(currentUserId);
  try {
  const result = await db.query("SELECT country_code FROM visited_countries JOIN users ON visited_countries.user_name = users.user_name WHERE users.id = $1" , 
  [currentUserId]);
  let countr = [];

  result.rows.forEach((country) => {
    countr.push(country.country_code);
  });
 //console.log(users[currentUserId - 1].color)
  res.render("index.ejs" , {
    countries: countr,
    total: countr.length,
    users: users,
    color: users[currentUserId - 1].color,
  })

  }catch (err){
    console.log(err);
  }}
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const name = req.body.name ;
  const color = req.body.color;
  
  await db.query("INSERT INTO users (user_name , color) VALUES ($1 , $2 )" ,
  [name , color]);
  const userResult = await db.query("SELECT * FROM users");
  console.log(userResult.rows.length);
  var len = userResult.rows.length;
  console.log(userResult.rows[len - 1]);
  //users.push(userResult[len])
  users.push(userResult.rows[len - 1]);
  res.redirect("/")
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
