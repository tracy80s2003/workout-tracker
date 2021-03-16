const express = require("express");
// const mongojs = require("mongojs");
const path = require("path")
const logger = require("morgan");
const mongoose = require("mongoose");
let total = 0;
const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/infinite-harbor", 
{ 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false 
  }
);

// db.Workout.create({ name: "Workout" })
//   .then(dbWorkout => {
//     console.log(dbWorkout);
//   })
//   .catch(({message}) => {
//     console.log(message);
//   });

app.get("/stats", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/stats.html"))
})

app.get("/exercise", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/exercise.html"))
})

app.get("/api/workouts", (req, res) => {
    db.Workout.find({})
        .then(data => {
            res.json(data)
        })
})

app.post("/api/workouts", (req, res) => {
    total = 0;

    db.Workout.create({})
        .then(data => {
            res.json(data)
        })
})

app.put("/api/workouts/:id", (req, res) => {
    console.log(req.body)
    let duration = req.body.duration

    total += duration;

    db.Workout.findOneAndUpdate({_id: req.params.id},
        {
            $push: {exercises: req.body},
            totalDuration: total
        }).then(updated => {
            res.json(updated)
        })
})

app.post("/submit", ({body}, res) => {
  db.Exercise.create(body)
    .then(({_id}) => db.Workout.findOneAndUpdate({}, { $push: { exercises: _id } }, { new: true }))
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

app.get("/exercises", (req, res) => {
  db.Exercise.find({})
    .then(dbExercise => {
      res.json(dbExercise);
    })
    .catch(err => {
      res.json(err);
    });
});

app.get("/Workout", (req, res) => {
  db.Workout.find({})
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

// app.get("/populated", (req, res) => {
//   db.Workout.find({})
//     .populate("exercises")
//     .then(dbWorkout => {
//       res.json(dbWorkout);
//     })
//     .catch(err => {
//       res.json(err);
//     });
// });

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});