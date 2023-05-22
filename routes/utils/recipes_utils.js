const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
require("dotenv").config();




/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
       
        params: {
            includeNutrition: false,
            apiKey: process.env.API_Key_Mark
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
async function getRandomRecipes(number_of_recipes) {
    let recipe_info = await handleGetRandomRecipes(number_of_recipes);
    let recipes = recipe_info.data.recipes;

    return {
        "recipe1": recipes[0],
        "recipe2": recipes[1],
        "recipe3": recipes[2]
        
    }
}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
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


exports.getRecipeDetails = getRecipeDetails;

exports.getRandomRecipes = getRandomRecipes;

