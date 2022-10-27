const express = require('express')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const db = require('./database/connection')
const { uploadFile, getFileStream, deleteFileStream } = require('./s3')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'})
const mysql = require('mysql');
const multer = require('multer');
const emailer = require('./mail/mailer')

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname,'./projects/downloads')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const upload = multer({ dest: './images' })

const diskstorage = multer.diskStorage({
    destination: path.join(__dirname, './projects/uploads'),
    filename: (req, file, cb) =>{
        cb(null, Date.now() + file.originalname)
    }
})

const uploadproject = multer({
    storage: diskstorage
})

app.post('/api/create-user',(req,res)=>{
    const name = req.body.name;
    const lastname = req.body.lastname;
    const rut = req.body.rut;
    const bornDate = req.body.bornDate;
    const phone = req.body.phone;
    const email = req.body.email;
    const region = req.body.region;
    const city = req.body.city;
    const comunne = req.body.comunne;
    const area = req.body.area;
    const role = (req.body.role === undefined || req.body.role === null) ? "" : req.body.role;
    const yearsExperience = req.body.yearsExperience;
    const resume = (req.body.resume === undefined || req.body.resume === null) ? "" : req.body.resume;
    const pass = (req.body.pass === undefined || req.body.pass === null) ? "" : req.body.pass;
    const agreeconditions = req.body.agreeconditions;

    const sqlInsert1 = "INSERT INTO user_info(rutUser,nameUser,lastnamesUser,bornDate,cellphone,email,regionUser,cityUser,communeUser,workareaUser,chargeUser,experienceYears,workResume,agreeconditions)" + 
    "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const sqlInsert2 = "INSERT INTO user_credentials(userName, userPass)" + 
    "VALUES(?,?)";
    db.query(sqlInsert1,[rut,name,lastname,bornDate,phone,email,region,city,comunne,area,role,yearsExperience,resume,agreeconditions],(err,result)=>{
        if(err){
            res.status(500).send({ error: 'Algo falló!' });
        }else{
            db.query(sqlInsert2,[email,pass],(err,result)=>{
                if(err){
                    res.status(500).send({ error: 'Algo falló!' });
                }else{
                    res.send(result);
                }
            })
        }
    })
});

app.post('/api/login', (req,res)=>{
    const user = req.body.userName;
    const pass = req.body.userPass;
    const sqlGetUserCredentials = "SELECT u.userName, u.userPass FROM user_credentials u WHERE u.userName = "+mysql.escape(user)+ "AND u.userPass ="+mysql.escape(pass);
    db.query(sqlGetUserCredentials,(err,result) =>{
        if(result.length === 0){
            res.status(403).send({ error: 'Error o contraseñas incorrectos' });
        }else{
            const accessToken = generateAccessToken(req.body);
            res.header('authorization', accessToken).json({
                message: 'User authenticated',
                accessToken: accessToken
            })
        }
    })
});

app.get('/api/localidades', (req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    const sqlGetLocalidades = "SELECT r.region, p.provincia, c.comuna FROM regiones r, provincias p, comunas c  WHERE r.id = p.region_id AND p.id = c.provincia_id ORDER BY r.region ASC, p.provincia"
    db.query(sqlGetLocalidades,(err,result) =>{
        if(err){
            res.send(err);
        }else{
            let arrayLocations = [];
            let region = '';
            for(let i=0; i < (result).length -1; i++){
                if((result)[i + 1].region !== (result)[i].region){
                    let locationsObject = {
                        "region": region,
                        "ciudad" : []
                    }
                    locationsObject.region = ((result)[i].region);
                    const results = (result).filter(filterRegion);
                    for(let j=0; j < (results).length; j++){
                        if((results)[j + 1] === undefined || (results)[j + 1].provincia !== (results)[j].provincia){
                            let arrayCiudad = [{comunas: []}];
                            arrayCiudad.unshift((results)[j].provincia);
                            for(let k=0; k < (results).length; k++){
                                if(arrayCiudad[0] === (results)[k].provincia){
                                    arrayCiudad[1].comunas.push((results)[k].comuna);
                                }
                            }
                            (locationsObject.ciudad).push(arrayCiudad);
                        }
                    }
                    function filterRegion(e){
                        return e.region === locationsObject.region;
                    }
                    arrayLocations.push(locationsObject);      
                }
            }
            res.send(arrayLocations);
        }
    })
});

app.get('/api/usuarios', (req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    const sqlGetUsers = "SELECT * FROM user_info"
    db.query(sqlGetUsers,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});

app.get('/api/user-profile/:key', (req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    const userRut = req.params.key
    const sqlGetUsers = "SELECT * FROM user_info WHERE user_info.rutUser="+mysql.escape(userRut)
    db.query(sqlGetUsers,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});

app.get('/api/view/profile/:key', (req,res)=>{
    const userId = req.params.key
    const sqlGetUsers = "SELECT * FROM user_info WHERE user_info.id="+mysql.escape(userId)
    db.query(sqlGetUsers,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});

app.post('/api/user-info', validateToken, (req,res)=>{
    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());;
    const sqlGetUser = "SELECT * FROM user_info u WHERE u.email ="+mysql.escape(userLogged.userName);
    db.query(sqlGetUser,(err,result) =>{
        if(err){
            res.status(500).send('Problema buscando información del usuario')
        }else{
            res.send(result);
        }
    })
});

app.put('/api/update-user', validateToken,(req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());

    const dataToUpdate  = req.body.newArrayValues

    website = (dataToUpdate[0].value === undefined || dataToUpdate[0].value === null) ? "" : dataToUpdate[0].value;
    instagram = (dataToUpdate[1].value === undefined || dataToUpdate[1].value === null) ? "" : dataToUpdate[1].value;
    facebook = (dataToUpdate[2].value === undefined || dataToUpdate[2].value === null) ? "" : dataToUpdate[2].value;
    twitter = (dataToUpdate[3].value === undefined || dataToUpdate[3].value === null) ? "" : dataToUpdate[3].value;
    whatsapp = (dataToUpdate[4].value === undefined || dataToUpdate[4].value === null) ? "" : dataToUpdate[4].value;
    cell = dataToUpdate[5].value;
    colorInput = (dataToUpdate[6].value === undefined || dataToUpdate[6].value === null) ? "" : dataToUpdate[6].value;

    const sqlUpdate1 = "UPDATE user_info SET cellphone="+mysql.escape(cell)+",webSite="+mysql.escape(website)
    +",instagramSite="+mysql.escape(instagram)+",facebookSite="+mysql.escape(facebook)+",twitterSite="+mysql.escape(twitter)+",whatsappSite="+mysql.escape(whatsapp)
    +",userColor="+mysql.escape(colorInput)+"WHERE user_info.email="+mysql.escape(userLogged.userName);

    db.query(sqlUpdate1,(err,result) =>{
        if(err){
            res.status(500).send('Problema actualizando datos')
        }else{
            res.send(result);
        }
    })
});

app.put('/api/images',upload.single('formFile'),async (req,res)=>{
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const file = req.file
    const result = await uploadFile(file)
    await unlinkFile(file.path)
    const imgSrc = {imagePath: `/api/images/${result.Key}`}
    const sqlInsert1 = "UPDATE user_info SET userPhoto="+mysql.escape(result.Key)+"WHERE user_info.email="+mysql.escape(userLogged.userName);
    db.query(sqlInsert1,(err,result) =>{
        if(err){
            res.status(500).send('Problema subiendo Foto')
        }else{
            res.send(imgSrc);
        }
    })
});

app.get('/api/images/:key', (req, res) => {
    if(req.params.key !== 'null'){
        const key = req.params.key
        const readStream = getFileStream(key)
        res.writeHead(200, {
            'Content-Type' : 'image/png'
          });
        readStream.pipe(res)
    }
})

app.delete('/api/images/delete/:key', async (req, res) => {
    console.log(req.params)
    const key = req.params.key
    const deleteStream = await deleteFileStream(key).promise()
    res.send('previous photo deleted successfully')
})

app.delete('/api/image/delete-project:key',(req, res) => {
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const idphoto = req.params.key
    const sqlDelete = "DELETE FROM projects_user WHERE projects_user.userName="+mysql.escape(userLogged.userName)+"AND projects_user.id_img="+mysql.escape(idphoto);
    db.query(sqlDelete,(err,result) =>{
        if(err){
            res.status(500).send('Problema eliminando Foto')
        }else{
            res.send(result)
        }
    })
})

app.post('/api/image/upload-project',uploadproject.single('photofile'),async (req,res)=>{
    const body = JSON.parse(req.body.params)
    const token = req.body.token
    const userLogged = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const file = req.file
    const name = body.name
    const workresume = body.workresume
    const originalname = file.originalname
    const username = userLogged.userName
    const workdate = body.date
    const filetype = file.mimetype
    const imageClient = fs.readFileSync(path.join(__dirname, './projects/uploads/' + file.filename))
    await unlinkFile(file.path)
    const sqlLimit = "SELECT * FROM projects_user WHERE projects_user.userName="+mysql.escape(userLogged.userName)
    const sqlInsert1 = "INSERT INTO projects_user(clientName,imageName,userName,workDate,imageClient,imageType,workResume) VALUES(?,?,?,?,?,?,?)"
    db.query(sqlLimit,(err,result) =>{
        if(err){
            res.status(500).send('Problema subiendo Foto')
        }else{
            if(result.length <= 8){
                db.query(sqlInsert1,[name, originalname, username, workdate, imageClient , filetype, workresume],(err,result) =>{
                    if(err){
                        res.status(500).send('Problema subiendo Foto')
                    }else{
                        res.send(result);
                    }
                })
            }else{
                res.status(500).send('Error: El límite son 8 fotos por usuario')
            }

        }
    })
});

app.get('/api/image/user-projects',validateToken, (req, res) => {
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const sqlInsert1 = "SELECT * FROM projects_user WHERE projects_user.userName="+mysql.escape(userLogged.userName);
    db.query(sqlInsert1,(err,result) =>{
        if(err){
            console.log(err);
            res.status(500).send('Problema obteniendo tus proyectos')
        }else{
            result.map(image => {
                fs.writeFileSync(path.join(__dirname, './projects/downloads/' + image.imageName),image.imageClient)
            })
            res.send(result)
        }
    })
})

app.get('/api/image/view-projects/:id', (req, res) => {
    const userId = req.params.id
    const sqlClientRequest = "SELECT * FROM user_info ui, projects_user pu WHERE ui.id="+mysql.escape(userId)+" AND ui.email = pu.userName"
    db.query(sqlClientRequest,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo tus proyectos')
        }else{
            result.map(image => {
                fs.writeFileSync(path.join(__dirname, './projects/downloads/' + image.imageName),image.imageClient)
            })
            res.send(result)
        }
    })
})

app.post('/api/request-work',(req,res)=>{

    let calle = '';
    let pasaje = '';
    let NumeroCasa = '';

    let dptoDirec = '';
    let NumeroPiso = '';
    let NumeroDepto = '';

    const nombre = req.body[0];
    const apellidos = req.body[1];
    const rut = req.body[2];
    const email = req.body[3];
    const celular = '569'+req.body[4];
    if(req.body[5] === false){
        calle = req.body[6];
        pasaje = req.body[7];
        NumeroCasa = req.body[8];
    }else{
        dptoDirec = req.body[6];
        NumeroPiso = req.body[7];
        NumeroDepto = req.body[8];
    }

    const comuna = req.body[11];
    const descripcionTrabajo = req.body[12];
    const emailWorker = req.body[13];
    const rutWorker = req.body[14];
    const estado = 'acordar'

    const sqlInsertRequest = "INSERT INTO work_requests(nombre,apellidos,rut,email,celular,calle,pasaje,NumeroCasa,dptoDirec,NumeroPiso,NumeroDepto,comuna,descripcionTrabajo,emailWorker,rutWorker,estado)" + 
    "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    db.query(sqlInsertRequest,[nombre,apellidos,rut,email,celular,calle,pasaje,NumeroCasa,dptoDirec,NumeroPiso,NumeroDepto,comuna,descripcionTrabajo,emailWorker,rutWorker,estado],(err,result)=>{
        if(err){
            res.status(500).send({ error: 'No se pudo enviar la solicitud!' });
        }else{
            res.send(result);
        }
    })
});

app.get('/api/user/user-requests',(req,res)=>{
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const sqlGetRequests = "SELECT * FROM work_requests WHERE work_requests.emailWorker="+mysql.escape(userLogged.userName);
    db.query(sqlGetRequests,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});

app.post('/api/welcomeMail',async (req,res)=>{
    const userObject = {
        name: req.body.name,
        email: req.body.email
    }
    const response = await emailer.sendWelcomeEmail(userObject)
    res.send(response)
});

app.post('/api/requestEmail',async (req,res)=>{
    const userObjectRequest = {
        nameClient: req.body[0],
        emailClient: req.body[3],
        message: req.body[12],
        emailWorker: req.body[13],
        nameWorker: req.body[15]
    }
    const response = await emailer.sendRequestEmail(userObjectRequest)
    res.send(response)
});

app.put('/api/update/agreement/',async (req,res)=>{
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const estado = req.body.estado;
    const idRequest = parseInt(req.body.idRequest,10);
    const buttonactioned = req.body.actionbutton;

    let userObjectRequest = null;
    if(buttonactioned === 'emailbutton'){
        userObjectRequest = {
            solicitud: idRequest,
            nameClient: req.body.nameClient,
            emailClient: req.body.emailClient,
            message: req.body.message,
            emailWorker: req.body.emailWorker,
            nameWorker: req.body.nameWorker,
            requestInfo: req.body.requestInfo
        }
    }
    const sqlUpdateRequest = "UPDATE work_requests SET estado="+mysql.escape(estado)+"WHERE work_requests.idRequest="+mysql.escape(idRequest);
    db.query(sqlUpdateRequest,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            if(buttonactioned === 'emailbutton'){
                emailer.sendRequestResponseEmail(userObjectRequest)
            }
            res.send(result);
        }
    })
    
});

function generateAccessToken(data){
    return jwt.sign(data,process.env.SECRET, {expiresIn: '60m'});
}

function validateToken(req,res,next){
    const accessToken = req.body['authorization'] || req.body['x-access-token'] || req.headers['authorization'];
    if(!accessToken){
        res.status(401).send({error: 'Access Denied'});
    }
    jwt.verify(accessToken, process.env.SECRET, (err,response) =>{
        if(err){
            res.status(403).send('Access denied, token expired or incorrect')
        }else{
            next();
        }
    })
}

app.listen(3001,()=>{
    console.log("escuchando en el puerto 3001");
});