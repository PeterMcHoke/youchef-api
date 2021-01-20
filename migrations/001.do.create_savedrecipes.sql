CREATE TABLE saved_recipes (
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    date_viewed TIMESTAMP DEFAULT now() NOT NULL
    UNIQUE (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
