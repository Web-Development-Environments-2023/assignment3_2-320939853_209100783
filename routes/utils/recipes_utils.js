const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
require("dotenv").config();
const apikeys_recipes = process.env.APIKEYS_SPOON;
const DButils = require("./DButils");



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function handlegetRecipeDetails(recipe_id,nutritional=false) {
    //Need To Implement Here Logic of 
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        headers: {
            "x-api-key":apikeys_recipes
        },
        params: {
            includeNutrition: nutritional,
        }
    });
}

// this func is sending a http request to the domain and return 3 random recipes
async function handleGetRandomRecipes(number_of_recipes) {
    return await axios.get(`${api_domain}/random`, {
        headers: {
            "x-api-key":apikeys_recipes

        },
        params: {
            "number":number_of_recipes
        }
    });
}

async function handlegetArrayOfRecipes(recipesIds) {
    return await axios.get(`${api_domain}/informationBulk`, {
        headers: {
            "x-api-key":apikeys_recipes

        },
        params: {
            "ids":recipesIds
        }
    });
}

async function getRandomRecipes(number_of_recipes) {
    let recipe_info = await handleGetRandomRecipes(number_of_recipes);
    let recipes = recipe_info.data.recipes
    

    return recipes
}

async function getRecipeDetails(recipe_id,nutritional=false) {
    let recipe_info = await handlegetRecipeDetails(recipe_id,nutritional);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    }
}

async function getArrayOfRecipes(recipesIds) {
    let recipe_info = await handlegetArrayOfRecipes(recipesIds);
    return recipe_info.data;
    

   
}
async function VisitRecipe(username, recipeID, source) {
    let query = `INSERT INTO visited_recipes (username, recipeID, timestamp, source)
                 VALUES ('${username}', ${recipeID}, CURRENT_TIMESTAMP(), ${source})`;
    let result = await DButils.execQuery(query);
    return result;
 }
async function getLastVisitedRecipes(username, limit = 3) {
    let query = `SELECT recipeID FROM visited_recipes
                 WHERE username = '${username}'
                 ORDER BY timestamp DESC
                 LIMIT ${limit}`;
    let result = await DButils.execQuery(query);
    return result;
}

/**
 * @description Do not USE
 */
async function CreateRecipe(name,Time,Likes,isVegan,isVeget,isGfree,portions,image,instructions,intolerances,cuisine) {

    let recipe_info = await DButils.execQuery(
        `INSERT INTO recipes (name, Time, Likes, isVegan, isVeget, isGfree, Portions, Image, Instructions, Intolerances, Cuisine)
         VALUES ('${name}', '${Time}', '${Likes}', '${isVegan}', '${isVeget}', '${isGfree}', '${portions}', '${image}', '${instructions}', '${intolerances}', '${cuisine}')`
    );
    console.log("Recipe ID");
    console.log(recipe_info.insertId);
    return recipe_info.insertId;
}

//HERE'S LOGIC OF ADDING RECIPE TO PERSONAL
// recipes_utils.addRecipeToPersonal(currentUserId, CreatedRecipeID)

// async function addRecipeToPersonal(currentUserId,recipe_id)
// {
//     let user_ID = user.user_ID;
//     let username = awaitDButils.execQuery( `SELECT username FROM users WHERE userID = '${currentUserId}'`)
//     let Query_Exec = await DButils.execQuery(`INSERT INTO personal_recipes (username, recipeID)
//     VALUES ('${username}', '${recipe_id}')`);
//     return Query_Exec.data;
// }

exports.getRecipeDetails = getRecipeDetails;
exports.getArrayOfRecipes = getArrayOfRecipes;
exports.getRandomRecipes = getRandomRecipes;
// exports.addRecipeToPersonal = addRecipeToPersonal;
exports.CreateRecipe = CreateRecipe;
exports.VisitRecipe = VisitRecipe;
exports.getLastVisitedRecipes = getLastVisitedRecipes;