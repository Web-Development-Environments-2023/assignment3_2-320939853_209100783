
CREATE TABLE IF NOT EXISTS `first_schema`.`users` (
  `username` varchar(45) NOT NULL,
  `firstname` varchar(45) NOT NULL,
  `lastname` varchar(45) NOT NULL,
  `country` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(45) NOT NULL,
  `user_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`username`),
  UNIQUE KEY `userID_UNIQUE` (`user_id`));



CREATE TABLE IF NOT EXISTS `first_schema`.`recipes` (
  `recipe_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NOT NULL,
  `Time` INT NOT NULL,
  `Likes` INT NOT NULL,
  `isVegan` ENUM('true', 'false') NOT NULL,
  `isVeget`  ENUM('true', 'false') NOT NULL,
  `isGfree`  ENUM('true', 'false') NOT NULL,
  `Portions` INT NOT NULL,
  `Image` VARCHAR(300) NOT NULL,
  `Intolerances` VARCHAR(45) NULL,
  `Cuisine` VARCHAR(45) NULL,
  PRIMARY KEY (`recipe_id`)
);

CREATE TABLE IF NOT EXISTS `first_schema`.`favorite_recipes` (
  `user_id` INT NOT NULL,
  `recipe_id` INT NOT NULL,
  `source` ENUM('Server', 'API') NOT NULL,
  PRIMARY KEY (`user_id`, `recipe_id`),
  CONSTRAINT `Favorites`
    FOREIGN KEY (`user_id`)
    REFERENCES `first_schema`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE IF NOT EXISTS `first_schema`.`family_recipes` (
  `user_id`  INT NOT NULL,
  `recipe_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`recipe_id`),
  KEY `recipeID_idx` (`recipe_id`),
  CONSTRAINT `recipeIDFamily` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`),
  CONSTRAINT `user_idFamily` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);


CREATE TABLE IF NOT EXISTS `first_schema`.`visited_recipes` (
  `user_id` INT NOT NULL,
  `recipe_id` int NOT NULL,
  `timestamp` timestamp(6) NOT NULL,
  `source` ENUM('Server', 'API') NOT NULL,
  PRIMARY KEY (`user_id`,`recipe_id`),
  CONSTRAINT `user_idVisited` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);


CREATE TABLE IF NOT EXISTS `first_schema`.`personal_recipes` (
  `user_id` INT NOT NULL,
  `recipe_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `recipe_id`),
  CONSTRAINT `user_idPersonal` FOREIGN KEY (`user_id`) REFERENCES `first_schema`.`users` (`user_id`),
  CONSTRAINT `recipeIDPersonal` FOREIGN KEY (`recipe_id`) REFERENCES `first_schema`.`recipes` (`recipe_id`)
);
    

CREATE TABLE IF NOT EXISTS `first_schema`.`liked_recipes` (
  `user_id` INT NOT NULL,
  `recipe_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `recipe_id`),
  CONSTRAINT `user_idLiked` FOREIGN KEY (`user_id`) REFERENCES `first_schema`.`users` (`user_id`),
  CONSTRAINT `recipeIDLiked` FOREIGN KEY (`recipe_id`) REFERENCES `first_schema`.`recipes` (`recipe_id`)
);

CREATE TABLE IF NOT EXISTS `first_schema`.`ingredients` (
  `recipe_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL AUTO_INCREMENT,
  `ingredient` VARCHAR(150) NOT NULL,
  `amount` INT NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ingredient_id`, `ingredient`, `amount`),
  CONSTRAINT `recipeIDIng`
    FOREIGN KEY (`recipe_id`)
    REFERENCES `first_schema`.`recipes` (`recipe_id`));



 
  
CREATE TABLE IF NOT EXISTS  `first_schema`.`steps_recipes` (
	`stepDesc` VARCHAR(255) NOT NULL,
    `recipe_id` INT NOT NULL,
    `stepNumber` INT NOT NULL,
	PRIMARY KEY (`recipe_id`,`stepNumber`),
    CONSTRAINT `RecipeID_Steps` FOREIGN KEY (`recipe_id`) REFERENCES `first_schema`.`recipes` (`recipe_id`)
); 
  




//INSERT:

Actually Useless, We are having an encryption on these users passwords.
better Inserting Them through POSTMAN Login Post Request.
INSERT INTO `first_schema`.`users` (`username`, `firstname`, `lastname`, `country`, `password`, `email`) 
VALUES ('root', 'John', 'Doe', 'USA', 'root', 'root@example.com');

INSERT INTO `first_schema`.`users` (`username`, `firstname`, `lastname`, `country`, `password`, `email`) 
VALUES ('sec', 'Mike', 'Johnson', 'UK', 'sec', 'sec@example.com');

better Inserting Them through POSTMAN Login Post Request.

#### USERS #####
{
  "username": "root",
  "firstname": "John",
  "lastname": "Doe",
  "country": "USA",
  "password": "root",
  "email": "root@gmail.com"
}
{
  "username": "sec",
  "firstname": "Mike",
  "lastname": "Johnson",
  "country": "UK",
  "password": "sec",
  "email": "sec@gmail.com"
}
{
  "username": "Eitan1",
  "firstname": "Eitan",
  "lastname": "Goldstein",
  "country": "Israel",
  "password": "Eitan1",
  "email": "Eitan@gmail.com"
}



###### RECIPES ######
{
  "name": "Pasta Alla Carbonara",
  "Time": 60,
  "Likes": 0,
  "isVegan": "false",
  "isVeget": "false",
  "isGfree" : "false",
  "portions": 5,
  "image": "./static/1685448591395-888513922.jpeg" ,
  "intolerances": "null",
  "cuisine" : "null",
  "ingredients" : [
      {
          "name" : "Flour",
          "amount" : 500,
          "type" : "Grams"
      },
      {
          "name" : "Cream",
          "amount" : 300,
          "type" : "mililiters"
      },
      {
          "name" : "Parmegiano Cheese",
          "amount" : 100,
          "type" : "Grams"
      },
      {
          "name" : "Eggs",
          "amount" : 7,
          "type" : "units"
      }],
    "steps": null
}
{
  "name": "Hamburger ",
  "Time": 15,
  "Likes": 15,
  "isVegan": "false",
  "isVeget": "false",
  "isGfree" : "true",
  "portions": 2,
  "image": "./static/1685448591395-888513922.jpeg" ,
  "intolerances": "null",
  "cuisine" : "null"
}

{
  "name": "Gamburger ",
  "Time": 15,
  "Likes": 15,
  "isVegan": "false",
  "isVeget": "false",
  "isGfree" : "true",
  "portions": 2,
  "image": "./static/1685448591395-888513922.jpeg" ,
  "intolerances": "null",
  "cuisine" : "null"
}


