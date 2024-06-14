<<<<<<< Updated upstream
// simple node web server that displays hello world
// optimized for Docker image
const express = require("express");
// this example uses express web framework so we know what longer build times
// do and how Dockerfile layer ordering matters. If you mess up Dockerfile ordering
// you'll see long build times on every code change + build. If done correctly,
// code changes should be only a few seconds to build locally due to build cache.
const morgan = require("morgan");
// morgan provides easy logging for express, and by default it logs to stdout
// which is a best practice in Docker. Friends don't let friends code their apps to
// do app logging to files in containers.
const database = require("./database");
// Appi
const app = express();
//Session
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
//Database
=======
const express = require("express");
const morgan = require("morgan");
>>>>>>> Stashed changes
const { Pool } = require("pg");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const config = require("./config");
<<<<<<< Updated upstream
=======

const app = express();

>>>>>>> Stashed changes
// PostgreSQL pool setup
const pool = new Pool(config.database);



app.use(morgan("common"));
app.use(bodyParser.json());

const secretKey = process.env.JWT_SECRET || "secret"; // strong secret key store it in environment variables

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
// Set up session middleware
app.use(session({
  store: new PgSession({
    pool: pool, // Connection pool
    tableName: 'session' // Use another table-name if you want to override default
  }),
  secret: 'your-session-secret-key', // Change this to a secure secret key
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// User registration route
app.post("/register", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
      [email, password]
    );
    res.status(201).json({ userId: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

// User login route
app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM instructor WHERE email = $1", [email]);
    const user = result.rows[0];
    if (user && user.password === password) {
<<<<<<< Updated upstream
      const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "1h" });
      res.json({ token });
      // Save user information in the session
      req.session.userId = user.id;
      res.json({ message: "Login successful" });
=======
      // Save user information in the session
      req.session.userId = user.id;
      req.session.save(err => {
        if (err) {
          return next(err);
        }
        res.json({ message: "Login successful" });
      });
>>>>>>> Stashed changes
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
});

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "You need to log in" });
  }
};

<<<<<<< Updated upstream
// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});


=======
// Protected route example
app.get("/profile", isAuthenticated, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.session.userId]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});
>>>>>>> Stashed changes

app.get("/healthz", function(req, res) {
  // do app logic here to determine if app is truly healthy
  // you should return 200 if healthy, and anything else will fail
  // if you want, you should be able to restrict this to localhost (include ipv4 and ipv6)
  
  res.send("I am happy and healthy\n");
});


const PORT = process.env.PORT || 80;
console.log(`Starting server on port ${PORT}`);
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
