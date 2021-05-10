const express = require("express")
const server = express()

//pegar o banco de dados
const db = require("./database/db.js")

// Configurar pasta publica para ser "pasta mãe" ao navegar pela página
// Ou seja, de localhost:3000/public/styles.... para /localhost:3000/styles....
server.use(express.static("public"))

//habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }))

// utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views",{
    express: server,
    noCache: true
})

//configurar caminhos da minha aplicação
//página inicial
//req: Requisição
//res: Resposta
server.get("/", (req, res) => {
    return res.render("index", { title: "um título"})
})

server.get("/create-point", (req, res) => {

    // req.query: Query Strings da nossa url
    //  console.log(req.query)

    return res.render("create-point.html")
    
})

server.post("/savepoint", (req, res) => {

    // req.body: O corpo do formulário
    // console.log(req.body)

    // inserir dados no banco de dados
        const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items                                                    
            ) VALUES (?,?,?,?,?,?,?);
            `

        const values = [
            req.body.image,
            req.body.name,
            req.body.address,
            req.body.address2,
            req.body.state,
            req.body.city,
            req.body.items
        ]

        function afterInsertData(err){
            if(err) {
                console.log(err)
                return res.render("Etanozes. Deu erro!")
            }

            console.log("Cadastrado com Sucesso")
            console.log(this)

            return res.render("create-point.html", {saved: true})

        }

        db.run(query, values, afterInsertData)
        
})

server.get("/search", (req, res) => {

    const search = req.query.search
    if(search == "")
    {
        //pesquisas vazias
            // mostrar a página html com os dados do banco de dados
        return res.render("search-results.html", {total: 0})
    }

    //pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }

        const total = rows.length

        // mostrar a página html com os dados do banco de dados
        return res.render("search-results.html", { places:rows, total: total})

    })
})

// set default express engine and extension
server.engine('html', nunjucks.render);
server.set('view engine', 'html');

// ligar o servidor
server.listen(3000)