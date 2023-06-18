const DButils = require("./DButils");


async function handleCreateSteps(steps, createdRecipeID)
{
    for (let i=0; i < steps.length; i++)
    {
        let currStep = steps[i];
        await DButils.execQuery(`INSERT INTO steps_recipes (stepDesc, recipe_id, stepNumber) VALUES ('${currStep.stepDesc}', '${createdRecipeID}', '${currStep.stepNumber}')`);
    }
}
exports.handleCreateSteps = handleCreateSteps;