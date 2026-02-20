const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());


var Blocker = function(){
    this.blocked = true;
};

Blocker.prototype.enableBlock = function(){
    this.blocked = true;
}

Blocker.prototype.disableBlock = function(){
    this.blocked = false;
}

Blocker.prototype.isBlocked = function() {
  return this.blocked === true;
};

Blocker.prototype.middleware = function() {
  var self = this;
  return function(req, res, next) {
    if (self.isBlocked())
        return res.redirect('/Login.html');
    next();
  }
};

let users = []

var blocker = new Blocker();
var BlockingMiddleware  = blocker.middleware();

var lista_paginas = ["success","config"]


lista_paginas.forEach(page =>
    app.get(`/${page}`, BlockingMiddleware, function(req,res){
        res.sendFile(path.join(__dirname, '..', `${page}.html`));
})
)



app.post('/login', function(req, res){
    const {Username, Password} = req.body;
    const userData = users.find(u => u.Username === Username);
    if(!userData){
        return res.sendStatus(402)
    }
    if(userData.Password === Password){
        blocker.disableBlock()
        return res.sendStatus(200) 
    }
    else{
        return res.sendStatus(402)
    }
})

app.post('/sign_up', function(req,res){
    const { Username, Password } = req.body;

    if (!Username || !Password)
        return res.status(400).json({ success: false, message: "Faltan campos" });

    const exists = users.find(u => u.Username === Username);
    if (exists)
        return res.status(409).json({ success: false, message: "Usuario ya existe" });

    users.push({ Username, Password });
    return res.status(201).json({ success: true });
})

app.get('/', (req, res) => {
    blocker.enableBlock()
    res.redirect('/Login.html');
});

// Middleware: proteger accesos directos a archivos .html listados en `lista_paginas`
app.use(function(req, res, next){
    const protectedHtml = lista_paginas.map(p => `/${p}.html`);
    if (protectedHtml.includes(req.path) && blocker.isBlocked()){
        return res.redirect('/Login.html');
    }
    next();
});

app.use(express.static(path.join(__dirname, '..'), {
    extensions: [],
    index: false    
}));

app.listen(3000, () => console.log("Server running on port 3000"));