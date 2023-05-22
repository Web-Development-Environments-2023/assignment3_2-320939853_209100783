const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
require("dotenv").config();
const apikeys_recipes = process.env.APIKEYS_SPOON_eitan



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
       
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

// this func is sending a http request to the domain and return 3 random recipes
async function handleGetRandomRecipes(number_of_recipes) {
    return await axios.get(`${api_domain}/recipes/random`, {
        headers: {
            apiKey:apikeys_recipes

        },
        params: {
            number:number_of_recipes
        }
    });
}
async function getRandomRecipes(number_of_recipes) {
    let recipe_info = await handleGetRandomRecipes(number_of_recipes);
    let { recipe1,recipe2,recipe3 } = recipe_info.data;

    return {
        recipe1: recipe1,
        recipe2: recipe2,
        recipe3: recipe3
        
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

