const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}
async function handleAddPrivateRecipeToUser(user_id, recipe){
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe;
    /**
     * @TODO handle the sql query insert into the right tables
     * @this await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
     */
}
async function handleFavoriteRecipesOfUser(user_id){
    const recipesList = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipesList;
}

async function handleDeleteFavoriteRecipesOfUser(user_id,recipeId){
    /**
     * @TODO create a sql query that delete this from the DB
     * const recipesList = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
     * return recipesList;
     */
    
}
async function handleDeleteFamilyRecipeOfUser(user_id,recipeId){
    /**
     * @TODO create a sql query that delete this from the DB
     * const recipesList = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
     * return recipesList;
     */
    
}


let functions = {
    markAsFavorite,
    getFavoriteRecipes,
    handleAddPrivateRecipeToUser,
    handleFavoriteRecipesOfUser,
    handleDeleteFavoriteRecipesOfUser,
    handleDeleteFamilyRecipeOfUser,

};
exports.functions = functions
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
