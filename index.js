const express = require("express");
const app = express();
const config = require('config');
const routes = require("./routes/Routes");
const getDataController=require("./controller/GetData")

getDataController.onLoad().then((res)=> {
    if (res==0){
        console.log("failed to fetch data");
    }else {
        app.listen(config.get('app.port') ,() => {
            console.log("Server running on port 3000");
        });
        app.use("/", routes);
    }
});

