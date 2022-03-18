const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db;

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

intializeDbAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name AS movieName FROM movie`;

  const moviesList = await db.all(getMoviesQuery);
  response.send(moviesList);
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMoviesQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (${directorId}, "${movieName}", "${leadActor}")`;

  await db.run(postMoviesQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT
    movie_id AS movieId,
    director_id AS directorId,
    movie_name AS movieName,
    lead_actor AS leadActor
    FROM movie
    WHERE movie_id = ${movieId}`;

  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `
    UPDATE  movie
    SET director_id = ${directorId},
     movie_name =  "${movieName}",
    lead_actor = "${leadActor}"
    WHERE movie_id = ${movieId}`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId}`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
    director_id AS directorId,
    director_name AS directorName
    FROM director`;

  const directorsList = await db.all(getDirectorsQuery);
  response.send(directorsList);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
    movie.movie_name AS movieName
    FROM movie
    INNER JOIN director
    ON movie.director_id = director.director_id
    WHERE movie.director_id = ${directorId}`;

  const directorMoviesList = await db.all(getDirectorMoviesQuery);
  response.send(directorMoviesList);
});

module.exports = app;
