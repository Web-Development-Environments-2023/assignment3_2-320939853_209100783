const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
require("dotenv").config();
const apikeys_recipes = process.env.APIKEYS_SPOON;
const DButils = require("./DButils");
const users = require("./user_utils")



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function handlegetRecipeDetails(recipe_id,nutritional=false) {
    //Need To Implement Here Logic of 
    let recpieBeforeParse = await axios.get(`${api_domain}/${recipe_id}/information`, {
        headers: {
            "x-api-key":apikeys_recipes
        },
        params: {
            includeNutrition: nutritional,
        }
    });
    let afterParse = extractInfoFromRecipe([recpieBeforeParse.data]);
    return afterParse;
    
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
// This function handle the api call to get all the info about the recipes in bulk
async function handlegetArrayOfRecipes(recipesIds) {
    let ans =  await axios.get(`${api_domain}/informationBulk`, {
        headers: {
            "x-api-key":apikeys_recipes

        },
        params: {
            "ids":recipesIds
        }
    });
    return ans
}
// This function get a random 3 recipes
async function getRandomRecipes(number_of_recipes) {
    let recipe_info = await handleGetRandomRecipes(number_of_recipes);
    let recipes = recipe_info.data.recipes
    

    return recipes
}
// This fucntion handle the the get the infromation about the recipe
async function getRecipeDetails(recipe_id,nutritional=false) {
    let recipe_info = await handlegetRecipeDetails(recipe_id,nutritional);
    return recipe_info[0];
}
// This function handle get the recipes from the DB 
async function getRecipeDetailsDB(recipe_id) {
    let recipe_info = await users.functions.handleGetRecipesOfDB([recipe_id]);
    return recipe_info[0];
}


async function getArrayOfRecipes(recipesIds) {
    let recipe_info = await handlegetArrayOfRecipes(recipesIds);
    return recipe_info.data;
    
}
// This function Parse the recipes acording to the format agreed by the Fron end
function extractInfoFromRecipe(recipesArr){
    let parsedRecipes = [];
    recipesArr.forEach((element) =>{
        let filteredRecpie = {
            "id": element.id,
            "name": element.title,
            "Time": element.readyInMinutes,
            "isVeget": element.vegetarian,
            "isVegan": element.vegan,
            "isGfree": element.glutenFree,
            "portions": element.servings,
            "image": element.image, 
            "ingredients": parseIngridFromAPI(element.extendedIngredients),
            "steps" : parseStepsFromAPI(element.analyzedInstructions),
            "diets" : element.diets,
            "cuisine": element.cuisines,
            "dairyFree": element.dairyFree,
            "Likes":element.aggregateLikes
        };
        parsedRecipes.push(filteredRecpie);
    }
    );
    return parsedRecipes;

}
//This function Parsing the Ingiridiands of each of the Steps from the spoonacular 

function parseIngridFromAPI(items){
    let parsedIngredient = [];
    items.forEach(element =>{
        let filteredIngredient = {
            "recipe_id": element.id,
            "ingredient_id": element.id,
            "ingredient": element.name,
            "amount": element.amount,
            "type": element.unit,
        };
        parsedIngredient.push(filteredIngredient);
    });
    return parsedIngredient;
}
//This function Parsing the steps of each of the Steps from the spoonacular 

function parseStepsFromAPI(items){
    let parsedSteps = [];
    items.forEach((elem)=>{elem.steps.forEach((element) =>{
            let parsedStep = {
                "stepDesc": element.step,
                "recipe_id": element.number,
                "stepNumber": element.number,
            };
            parsedSteps.push(parsedStep);
        });
    });
    return parsedSteps;
}
exports.extractInfoFromRecipe = extractInfoFromRecipe;
exports.getRecipeDetails = getRecipeDetails;
exports.getArrayOfRecipes = getArrayOfRecipes;
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipeDetailsDB = getRecipeDetailsDB;