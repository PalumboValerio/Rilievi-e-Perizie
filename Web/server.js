"use strict"

/* ********************** Global requirements & management variables ********************** */

// ************************************ Utilities ************************************ \\
const fs = require("fs");
const colors = require("colors");
const bodyParser = require("body-parser");
const uuidv4 = require("uuid").v4;

// ************************************ Server ************************************ \\
const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("keys/certificate.pem", "utf8");
const credentials = { "key": privateKey, "cert": certificate };

//const http = require("http");
const https = require("https");
const express = require("express");
const app = express();
const cors=require("cors");
const fileupload=require("express-fileupload");
//const server = http.createServer(app);
const server = https.createServer(credentials, app);
const PORT = process.env.PORT || 1337;
const SRVR_LOG = ">>>>>>>> ";
let errorPage;

// ************************************ DB - Atlas ************************************ \\
let mongo = require("mongodb");
let ObjectID = mongo.ObjectID;
let mongoClient = mongo.MongoClient;
const CONNECTIONSTRING = "mongodb+srv://Admin:Admin2021@rilievi-e-perizie.xy2kq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const CONNECTIONOPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
const DBNAME = "Rilievi-e-Perizie";

// ************************************ nodemailer ************************************ \\
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'agenversincofficial@gmail.com',
        pass: 'AGIO-02_ita'
    }
});
let _prefix = "http://localhost:1337";//"https://agenversinc.herokuapp.com/"

// ************************************ Login & registration ************************************ \\
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
const TTL = 18000; //espresso in secondi (5 ore)
const NO_COOKIES = "No cookies found";
let PRIVATE_KEY;

// ************************************ Cloudinary ************************************ \\
const cloudinary = require("cloudinary").v2;
const CLOUDINARY_URL = "cloudinary://361946918882933:JtRuJ45cXqIB29qdqIZ4WC9oRHw@agenvers-inc"
cloudinary.config({
    cloud_name: 'agenvers-inc',
    api_key: '361946918882933',
    api_secret: 'JtRuJ45cXqIB29qdqIZ4WC9oRHw'
});

// ************************************ CORS ************************************ \\
const whitelist = ["http://localhost:8080", "https://localhost:1337",
                   "http://192.168.137.1:8080", "https://192.168.137.1:1337"];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (whitelist.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        else
            return callback(null, true);
    },
    credentials: true
};

/* ********************** Starting listening server ********************** */

server.listen(PORT, function () {
    console.log(`${colors.green(`[${new Date().toLocaleTimeString()}]`)}${colors.blue(`${SRVR_LOG}`)}Server listening on port: ${PORT}`);
    init();
});

/* ********************** Express listener ********************** */

// 1) 
app.use("*", function (req, res, next) {
    console.log(`${colors.blue(`${SRVR_LOG}`)}Risorsa: ${req.originalUrl.split('?')[0]}.`);
    next();
});

// 2) Pagine per cui serve controllare il token
app.get("/", checkToken);
app.get("/index.html", checkToken);

// 3) Route relativa alle risorse statiche
app.use('/', express.static("./static"));

// 4) Route di lettura dei parametri post.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 5) Route di log dei parametri.
/*
app.use("/",function(req,res,next){
    if(Object.keys(req.query).length > 0)
    {
        console.log(">>>>>>>> Parametri: " + JSON.stringify(req.query) + ".");
    }
    if(Object.keys(req.body).length > 0)
    {
        console.log(">>>>>>>> Parametri: " + JSON.stringify(req.body) + ".");
    }
    next();
});
*/

// 6) CORS
app.use("/", cors(corsOptions));

// 7) JSON
app.use(express.json({ limit: '10mb' }));
app.set("json spaces", 4);

// 8) File size
app.use("/", fileupload({"limits": {"fileSize":(10 * 1024 * 1024)}})) // 10Mb

app.get("/api/findMail/", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
        if (err) {
            res.status(503).send("Database connection error.");
        }
        else {
            let mail = req.query.email;

            let db = client.db(DBNAME);
            let collection = db.collection('Users');

            collection.findOne({ "email": mail }, function (err, data) {
                if (err) {
                    res.status(500).send("Internal Error in Query Execution.");
                }
                else {
                    if (data) {
                        res.send({ "email": "find", "collection": "Users" });
                    }
                    else {
                        let collection2 = db.collection('Transition')
                        collection2.findOne({ "email": mail }, function (err, data) {
                            if (err) {
                                res.status(500).send("Internal Error in Query Execution.");
                            }
                            else {
                                if (data) {
                                    res.send({ "email": "find", "collection": "Transition" });
                                }
                                else {
                                    res.send({ "email": "not find" });
                                }
                                client.close();
                            }
                        });
                    }
                }
            });
        }
    });
});

app.post("/api/signUp/", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
        if (err) {
            res.status(503).send("Database connection error.");
        }
        else {
            let email = req.body.email;
            let password = bcrypt.hashSync(req.body.password, 10);
            let gender = req.body.gender;

            let db = client.db(DBNAME);
            let collection = db.collection('transition');

            collection.insertOne({ "email": email, "password": password, "gender": gender, "crediti": 0 }, function (err, data) {
                if (err) {
                    res.status(500).send("Internal Error in Query Execution.");
                }
                else {
                    collection.findOne({ "email": email }, function (err, data) {
                        if (err) {
                            res.status(500).send("Internal server error.");
                        }
                        else {
                            let mailOptions = {
                                from: 'agenversincofficial@gmail.com',
                                to: email,
                                subject: 'Confirm registration',
                                //text: 'Prova' // invia il corpo in plaintext
                                html: `<h1>Congratulations!</h1><p>We are glad that you have decided to join us, ` +
                                    `but you need to do another step beforeyou can consider yoursefl part of us...<br>` +
                                    `Confirm your subscription by pressing <a href="http://${_prefix}/confirmSubscription.html?id=${data["_id"]}">here</a>.` +
                                    `We are waiting for you to complete your registration.<br>See you soon.<br><br>The agenversinc team.</p>`
                                // invia il corpo in html
                            };

                            // invio il messaggio
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    res.send({ "ris": "ok" });
                                    console.log("Error on sending message:     " + error);
                                }
                                else {
                                    res.send({ "ris": "ok" });
                                }
                            });
                            client.close();
                        }
                    });
                }
            });
        }
    });
});

app.get('/api/confirmSignUp', function (req, res, next) {
    let id = ObjectID(req.query.id);

    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
        if (err) {
            res.status(503).send("Database connection error.");
        }
        else {
            let db = client.db(DBNAME);
            let collection = db.collection('transition');
            collection.findOne({ "_id": id }, function (err, data) {
                if (err) {
                    res.send({ "ris": "nok - ID not found" });
                }
                else {
                    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client1) {
                        if (err) {
                            res.status(503).send("Database connection error.");
                        }
                        else {
                            if (data) {
                                let collection1 = db.collection('users');
                                collection1.insertOne(data, function (err, data1) {
                                    if (err) {
                                        res.send({ "ris": "nok - User not insered" });
                                    }
                                    else {
                                        client1.close();
                                        collection.deleteOne({ "_id": id }, function (err, data) {
                                            if (err) {
                                                res.send({ "ris": "nok - ID not deleted" });
                                            }
                                            else {
                                                res.send({ "ris": "ok" });
                                            }
                                            client.close();
                                        });
                                    }
                                });
                            }
                            else {
                                client.close();
                                res.send({ "ris": "nok - No id found. If you think this is an error please contact us at the email address agenversincofficial@gmail.com" })
                            }
                        }
                    });

                }
            });
        }
    });
});

app.post('/api/login', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
        if (err) {
            res.status(503).send("Database connection error.");
        }
        else {
            let db = client.db(DBNAME);
            let collection = db.collection('Users');

            let mail = req.body.email;
            let pw = req.body.password;
            let admin = req.body.admin;
            collection.findOne({ "email": mail }, function (err, dbUser) {
                if (err) {
                    res.status(500).send("Internal Error in Query Execution.");
                }
                else {
                    if (dbUser == null) {
                        res.status(401).send("Email or password not correct.");
                    }
                    else {
                        bcrypt.compare(pw, dbUser.password, function (err, ok) {
                            if (err) {
                                res.status(500).send("Internal Error in bcrypt compare.");
                            }
                            else {
                                if (!ok) {
                                    res.status(401).send("Email or password not correct.");
                                }
                                else {
                                    if((admin && dbUser.admin) || !admin)
                                    {
                                        setTokenAndCookie(dbUser, res);
                                        res.send({ "ris": "ok" });
                                        client.close();
                                    }
                                    else
                                    {
                                        res.status(401).send("Access Denied");
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });
});

app.post("/api/changePassword", function (req, res, next) {
    if (req.body.id) {
        let id = ObjectID(req.body.id);
        let password = bcrypt.hashSync(req.body.password, 10);
        mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
            if (err) {
                res.status(503).send("Database connection error.");
            }
            else {
                let db = client.db(DBNAME);
                let collection = db.collection('Users');
                collection.updateOne({ "_id": id }, { $set: { "password": password } }, function (err, data) {
                    if (err) {
                        res.status(500).send("Internal server error.");
                    }
                    else {
                        res.send(data);
                    }
                    client.close();
                });
            }
        });
    }
    else {
        let email = req.body.email;
        let password = bcrypt.hashSync(req.body.password, 10);
        mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
            if (err) {
                res.status(503).send("Database connection error.");
            }
            else {
                let db = client.db(DBNAME);
                let collection = db.collection('Users');
                collection.updateOne({ "email": email }, { $set: { "password": password } }, function (err, data) {
                    if (err) {
                        res.status(500).send("Internal server error.");
                    }
                    else {
                        res.send(data);
                    }
                    client.close();
                });
            }
        });
    }
});

app.post("/api/checkToken", function (req, res, next) {
    let token = checkToken(req, res, next, "POST");
    res.send(token);
});

app.use("/api", checkToken);

app.post('/api/logout', function (req, res, next) {
    res.set("Set-Cookie", "token=;max-age=-1;Path=/;httponly=true;");
    res.send({ "ris": "ok" });
});

app.post("/api/getInfo", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
        if (err) {
            res.status(503).send("Database connection error.");
        }
        else {
            let db = client.db(DBNAME);
            let collection = db.collection('users');
            let uId = ObjectID(req.payload["_id"]);

            collection.findOne({ "_id": uId }, function (err, data) {
                if (err) {
                    res.status(500).send("Internal server error.");
                }
                else {
                    res.send(data);
                }
                client.close();
            });
        }
    });
});

app.post("/api/updateUser", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
        if (err) {
            res.status(503).send("Database connection error.");
        }
        else {
            let db = client.db(DBNAME);
            let collection = db.collection('users');
            let uId = ObjectID(req.payload["_id"]);
            let password = req.body["password"];

            if (password != "404") {
                collection.updateOne({ "_id": uId }, {
                    $set: {
                        "name": req.body.name,
                        "surname": req.body.surname,
                        "username": req.body.username,
                        "gender": req.body.gender,
                        "dob": req.body.dob,
                        "password": bcrypt.hashSync(password, 10)
                    }
                }, function (err, data) {
                    if (err) {
                        res.status(500).send("Internal server error.");
                    }
                    else {
                        res.send(data);
                        let mailOptions = {
                            from: 'agenversincofficial@gmail.com',
                            to: req.body.email,
                            subject: 'Urgent!!!',
                            html: `<h1>Your password has been changed.</h1><p>If you don't recognise this activity click ` +
                                `<a href="${_prefix}/resetPassword.html?id=${uId}">here</a>.<br>If that was you ignore` +
                                ` this mail.<br><b>Thank you.<b><br><br>The AgenversInc Team</p>`  // invia il corpo in html
                        };
                        client.close();
                        // invio il messaggio
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                res.send({ "ris": "ok" });
                                console.log("Error on sending message:     " + error);
                            }
                            else {
                                res.send({ "ris": "ok" });
                            }
                        });
                    }
                });
            }
            else {
                collection.updateOne({ "_id": uId }, {
                    $set: {
                        "name": req.body.name,
                        "surname": req.body.surname,
                        "username": req.body.username,
                        "gender": req.body.gender,
                        "dob": req.body.dob
                    }
                }, function (err, data) {
                    if (err) {
                        res.status(500).send("Internal server error.");
                    }
                    else {
                        res.send(data);
                    }
                    client.close();
                });
            }
        }
    });
});

app.post("/api/findUsers", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function (err, client) {
        if (err) {
            res.status(503).send("Errore connessione al DB");
        }
        else {
            let db = client.db(DBNAME);
            let id = req.payload["_id"];
            let collection = db.collection("Chatheon");

            collection.find({ "users._id": { $in: [id] } }).project({ "users._id": 1 }).toArray(function (err, data) {
                if (err) {
                    res.status(500).send("Internal Server Error");
                }
                else {
                    let user = [];
                    user.push(ObjectID(id));
                    for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < data[i]["users"].length; j++) {
                            let uId = ObjectID(data[i]["users"][j]["_id"]);
                            let aus = user.find(function (item) {
                                if (item == uId)
                                    return item;
                            });
                            if (!aus && uId != id) {
                                user.push(uId);
                            }
                        }
                    }
                    let collectionUsers = db.collection("Users");
                    collectionUsers.find({ "_id": { $nin: user } }).project({ _id: 1, email: 1, username: 1, gender: 1 }).toArray(function (err, dataUsers) {
                        if (err) {
                            res.status(500).send("Internal Server Error");
                        }
                        else {
                            res.send(dataUsers)
                        }
                        client.close();
                    });
                }
            });
        }
    })
});

/*
* If no previous route is valid for the request this one is done. Send the error page.
*/
app.use("*", function (req, res, next) {
    res.status(404);
    if (req.originalUrl.startsWith("/api/")) {
        //res.json("Sorry, can't find the resource you are looking for.");
        res.send("Resource not found.");
    }
    else {
        res.send(errorPage);
    }
});

/*
* If the server generate an error this route is done. Send the http response code 500.
*/
app.use(function (err, req, res, next) {
    console.log(err.stack); //Stack completo (default).
    if (!err.codice) {
        err.codice = 500;
        err.message = "Internal Server Error.";
        //server.close();
    }
    res.status(err.codice);
    res.send(err.message);
});

/* ********************** Functions ********************** */
/*
 * Prepare or make the error displayed page.
 */
function init() {
    fs.readFile("./static/error.html", function (err, data) {
        if (!err) {
            errorPage = data.toString();
        }
        else {
            errorPage = '<h1 style="color:red;text-align:center;">- Page or resource not found -</h1><br><a class="btn btn-primary" style="margin:0 auto;" href="/index.html">Home</a>';
        }
    });
    fs.readFile("./Keys/privateToken.key", function (err, data) {
        if (!err) {
            PRIVATE_KEY = data.toString();
        }
        else {
            console.log("The private key is missing");
            server.close();
        }
    });

    app.response.log = function (message) {
        console.log(message);
    }
}

/*
 * Write the data that recive as a parameter after date and hour.
*/
function log(data) {
    console.log(`${colors.cyan("[" + new Date().toLocaleTimeString() + "]")} ${data}`);
}

/*
 * Search if a user is already logged in.
*/
function findUser(username, room) {
    return users.find(function (item) {
        return (item.username == username && item.room == room)
    });
}

function checkToken(req, res, next) {
    let token = readCookie(req);

    if (token == NO_COOKIES) {
        sendError(req, res, 403, "Token mancante");
    }
    else {
        jwt.verify(token, PRIVATE_KEY, function (err, payload) {
            if (err) {
                sendError(req, res, 403, "Token expired or corrupted");
            }
            else {
                // ...vet per scomporlo
                setTokenAndCookie(payload, res);
                req.payload = payload;
                next();
            }
        });
    }
}

function sendError(req, res, cod, errMex) {
    if (req.originalUrl.startsWith("/api/")) {
        res.status(cod).send(errMex);
    }
    else {
        res.sendFile(`${__dirname}/static/login.html`);
    }
}

function setTokenAndCookie(payload, res) {
    let newToken = createToken(payload);
    writeCookie(res, newToken);
}

function readCookie(req) {
    let valoreCookie = NO_COOKIES;
    if (req.headers.cookie) {
        let cookies = req.headers.cookie.split(";");
        for (let item of cookies) {
            item = item.split("="); //item da chiave=valore --> [chiave, valore]
            if (item[0].includes("token")) {
                valoreCookie = item[1];
                break;
            }
        }
        //Trasforma cookies in un array di json
        //Object.fromEntries(cookies);
    }
    return valoreCookie;
}

//data --> record dell'utente
function createToken(data) {
    //sign() --> si aspetta come parametro un json con i parametri che si vogliono mettere nel token
    let param = {
        "_id": data["_id"],
        "email": data.email,
        "gender": data.gender,
        "iat": data.iat || Math.floor(Date.now() / 1000),
        "exp": Math.floor(Date.now() / 1000) + TTL
    }
    let token = jwt.sign(param, PRIVATE_KEY);
    return token;
}

function writeCookie(res, token, expires = TTL) {
    //set() --> metodo di express che consente di impostare una o più intestazioni nella risposta HTTP    createCookie(token, expires)
    res.set("Set-Cookie", `token=${token};expires=${expires};path=/;httponly=true;secure=true`);
}