# journal tasks
I am the only one in this project, I did not have a group, if there is any mistakes I am sorry.

# Instructions on how to run the app locally
1. Open pgAdmin and log in

2. Run this SQL command in pgAdmin to create the database and table:

CREATE DATABASE journal;

\c journal

CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

3. Run "node server.js" in the terminal
