const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let userCount = 1;
let userDatabase = [];
let exerciseDatabase = [];

app.post("/api/users", function(req, res) {
  const username = req.body.username;
  console.log("POST USER REQ BODY", req.body);
  console.log("POST USER REQ URL", req.url);
  const existingUser = userDatabase.find(user => user.username === username);
  if (!existingUser) {
    userDatabase.push({
      "username": username,
      "_id": userCount.toString()
    });
    res.json({ username, _id: userCount.toString() });
    userCount++
  } else {
    res.json({ username: existingUser.username, _id: existingUser._id });
  }
});

app.get("/api/users", function (req,res) {
  res.json(userDatabase);
});

app.post("/api/users/:_id/exercises", function (req, res) {
  const userId = req.params._id;
  const descr = req.body.description;
  const duration = parseInt(req.body.duration);
  console.log(req.body);
  let date = req.body.date;
  if ( !descr || !duration ) {
    res.json({error: "Invalid entry"});
    return
  }  
  const user = userDatabase.find(user => user._id == userId);
  if (!user) {
    res.json({ error: "User not found" });
    return
  }
  if ( !date ) {
    date = new Date().toDateString();
  }  else  {
    date = new Date(date).toDateString();
  }
  exerciseDatabase.push({
    _id: userId,
    description: descr,
    duration,
    date
  })
  const response = {
    _id: userId,
    username: user.username,
    date,
    duration,
    description: descr
  };
  console.log("POST EXERCISE RESPONSE", response, "END");
  return res.json(response)
});

app.get("/api/users/:_id/logs", function (req, res) {
  const userId = req.params._id;
  const {from, to, limit} = req.query;
  const user = userDatabase.find(user => user._id === userId);
  if (!user) {
    res.json({error: "User not found"});
    return
  };
  let userLogs = exerciseDatabase.filter(log => log._id === userId);
  if (from) {
    userLogs = userLogs.filter(log => new Date(log.date) >= new Date(from))
  };
  if (to) {
    userLogs = userLogs.filter(log => new Date(log.date) <= new Date(to))
  };
  if (limit) {
    userLogs = userLogs.slice(0, limit)
  };
  res.json({
    ...user,
    count: userLogs.length,
    log: userLogs.map(log => {
      return ({
        "description": log.description,
        "date": log.date,
        "duration": log.duration
      })
    })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
