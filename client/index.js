"use strict";
// import './css/input.css';
require("dotenv").config();

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

s3.listBuckets((err, data) => {
    if (err)
        console.log(err, err.stack);
    else
        console.log(data);
});
