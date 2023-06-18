const DButils = require("./DButils");

async function handleCreateIngredient(ingredients, createdRecipeID) {
    let ingredients_IDs = [];
    for (let i = 0; i < ingredients.length; i++) {
        let currIngredient = ingredients[i];
        let name = currIngredient.name;
        let amount = currIngredient.amount;
        let type = currIngredient.type;
        let ingredient_info = await DButils.execQuery(`INSERT INTO ingredients (recipe_id, ingredient, amount, type) VALUES ('${createdRecipeID}', '${name}', '${amount}', '${type}')`);
        ingredients_IDs.push(ingredient_info.insertId);
    }
    return ingredients_IDs;
}
exports.handleCreateIngredient = handleCreateIngredient;
