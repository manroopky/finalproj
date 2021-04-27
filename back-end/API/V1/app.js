const express = require("express");
const mysql = require("mysql");
const app = express();
var http = require('http');
const url = require('url');
const endPointRoot = "/API/V1";


const connection = mysql.createConnection({
    host:"localhost",
    user: "manroopk_finalproj",
    password: "Yolo.246",
    database: "manroopk_finalproj"
});

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.post(endPointRoot + "/user/", (req, res) => {
    let q = url.parse(req.url, true);
    connection.query("INSERT INTO user(username, password) values ('"+ q.query.user + "','" + q.query.password + "')", (err, result) => {
        if (err) throw err;
        res.send('User has been created');
        //console.log(result);
    });
    connection.query("UPDATE adminstats SET requests = requests + 1;", (err, result) => {
        if (err) throw err;
        res.send('Post request stat has been updated');
        //console.log(result);
    });
    
});

app.get(endPointRoot + "/users/", (req, res) => {
    connection.query("SELECT * FROM user", (err, result) => {
        if (err) throw err;
        res.send(JSON.stringify(result));
        console.log(result);
    });
    connection.query("UPDATE adminstats SET requests = requests + 1;", (err, result) => {
        if (err) throw err;
        res.send('Post request stat has been updated');
    
});

app.put(endPointRoot + "/adminstats/", (req, res) => {
    connection.query("SELECT * FROM adminstats", (err, result) => {
        if (err) throw err;
        res.send(JSON.stringify(result));
        console.log(result);
    });
});
app.get(endPointRoot + "/admin/", (req, res) => {
});

app.get(endPointRoot+ "/delete/", (req, res) =>{
    let q = url.parse(req.url, true);
    connection.query("DELETE FROM user WHERE username='" + q.query.username + "'", (err,result)=> {
        if (err) throw err;
        res.send('User has been deleted');
    })
    connection.query("UPDATE adminstats SET requests = requests + 1;", (err, result) => {
        if (err) throw err;
        res.send('Post request stat has been updated');
    
} )

app.listen();
