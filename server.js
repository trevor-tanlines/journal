const moment = require("moment");
const express = require("express");
const pg = require("pg");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

// Database connection setup
const db = new pg.Pool({
    user: "postgres",  
    host: "localhost",
    database: "journal",
    password: "1234567",
    port: 5432,
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home Route - Display all journal entries
app.get("/", async (req, res) => {
    const searchQuery = req.query.search || '';  // Get search query from request (if available)

    try {
        // Fetch entries from the database (with or without filtering)
        const queryText = searchQuery
            ? "SELECT * FROM entries WHERE title ILIKE $1 OR category ILIKE $1 ORDER BY created_at DESC"
            : "SELECT * FROM entries ORDER BY created_at DESC";

        const result = await db.query(queryText, searchQuery ? [`%${searchQuery}%`] : []);

        // Format the created_at date for each entry
        const entries = result.rows.map(entry => {
            entry.created_at = moment(entry.created_at).format('MMMM Do YYYY, h:mm:ss a'); // Format date here
            return entry;
        });

        // Render the view and pass entries and searchQuery to the layout
        res.render("index", { entries, searchQuery, body: 'index' }); // This is crucial to render the body properly
    } catch (err) {
        console.error("Database Error:", err); // Print actual error
        res.send("Error loading journal entries");
    }
});




// GET route for adding a new journal entry
app.get("/add", (req, res) => {
res.render('add', { body: '' });
});


// Add a new journal entry
app.post("/add", async (req, res) => {
    const { title, content, category } = req.body;
    try {
        await db.query("INSERT INTO entries (title, content, category) VALUES ($1, $2, $3)", [title, content, category]);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.send("Error adding journal entry");
    }
});

// Route for editing an entry
app.get("/edit/:id", async (req, res) => {
    const entryId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM entries WHERE id = $1", [entryId]);
        const entry = result.rows[0];
        res.render("edit", { entry });
    } catch (err) {
        console.error(err);
        res.send("Error retrieving journal entry for editing");
    }
});

// Handle updating an entry
app.post("/edit/:id", async (req, res) => {
    const entryId = req.params.id;  // Get the entry ID from the URL
    const { title, content, category } = req.body;  // Get updated data from the form

    try {
        // Update the entry in the database
        await db.query(
            "UPDATE entries SET title = $1, content = $2, category = $3 WHERE id = $4", 
            [title, content, category, entryId]
        );
        
        // Redirect to the homepage to see the updated entries
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.send("Error updating journal entry");
    }
});

// Search
app.get("/search", async (req, res) => {
    const query = req.query.query;
    try {
        const result = await db.query("SELECT * FROM entries WHERE title ILIKE $1 OR content ILIKE $1", [`%${query}%`]);
        res.render("index", { entries: result.rows });
    } catch (err) {
        console.error(err);
        res.send("Error searching journal entries");
    }
});


// Delete an entry
app.post("/delete/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM entries WHERE id = $1", [req.params.id]);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.send("Error deleting journal entry");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
