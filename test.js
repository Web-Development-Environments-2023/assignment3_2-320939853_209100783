var express = require("express");
var app = express();
app.use(express.json()); // parse application/json
const server = app.listen(5000, () => {
   console.log(`Server listen on port ${port}`);
 });