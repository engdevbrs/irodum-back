const express = require('express')
const bcrypt = require("bcryptjs")
//const https = require('https')
const sharp = require('sharp')
const rondasDeSal = 10;
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
app.use(express.static(path.join(__dirname,'./projects/downloads')))
app.use(express.static(path.join(__dirname,'./projects/commentsdownload')))
app.use(express.static(path.join(__dirname,'./projects/commentsupload')))
app.use(express.static(path.join(__dirname,'./projects/uploads')))
app.use(express.static(path.join(__dirname,'./projects/especialitydownload')))
app.use(express.static(path.join(__dirname,'./projects/especialityupload')))
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const cert = fs.readFileSync(path.join(__dirname, 'certificate.crt'))
const key = fs.readFileSync(path.join(__dirname, 'private.pem'))

const upload = multer({ dest: __dirname +'/images'})

const diskstorage = multer.diskStorage({
    destination: path.join(__dirname, '/projects/uploads'),
    filename: (req, file, cb) =>{
        cb(null, Date.now() + file.originalname)
    }
})

const uploadproject = multer({
    storage: diskstorage
})

const diskstorageComment = multer.diskStorage({
    destination: path.join(__dirname, '/projects/commentsupload'),
    filename: (req, file, cb) =>{
        cb(null, Date.now() + file.originalname)
    }
})

const uploadComment = multer({
    storage: diskstorageComment
})

const diskstorageEspeciality = multer.diskStorage({
    destination: path.join(__dirname, '/projects/especialityUpload'),
    filename: (req, file, cb) =>{
        cb(null, Date.now() + file.originalname)
    }
})

const uploadEspeciality = multer({
    storage: diskstorageEspeciality
})

app.post('/api/create-user',async (req,res)=>{

    const date = new Date()
    const dateRegister = date.toLocaleDateString()

    const name = req.body.name;
    const lastname = (req.body.lastname === undefined || req.body.lastname === null) ? "" : req.body.lastname;
    const rut = req.body.rut;
    const email = req.body.email;
    const pass = (req.body.password === undefined || req.body.password === null) ? "" : req.body.password;
    const agreeconditions = true;
    const type = parseInt(req.body.type,10);

    const sqlInsertNewEmployed = "CALL SP_INSERT_USER(?,?,?,?,?,?,?,?,?,@p_return_code)";
    bcrypt.hash(pass, rondasDeSal, (err, palabraSecretaEncriptada) => {
        if (err) {
            res.status(500).send({ error: 'Error hasheando' });
        } else {
            db.query(sqlInsertNewEmployed,[rut,email,name,lastname,agreeconditions,dateRegister,palabraSecretaEncriptada,type === 0 ? 'independiente' : 'hiring',type],(err,result)=>{
                let statusCode = null;
                if(result.serverStatus === 2 && result.serverStatus !== undefined){
                    res.send(result);
                }else if(result.length > 0){
                    statusCode = result[0][0]
                    if(statusCode.RETURNED_SQLSTATE){
                        res.status(500).send({ error: 'Algo falló!' });
                    }
                }
            })
        }
    });
    
});


app.post('/api/login', (req,res)=>{
    const user = req.body.userName;
    const pass = req.body.userPass;
    const sqlGetUserCredentials = "SELECT UC.userName, UC.userPass, U.classUser FROM UserCredentials UC, Users U WHERE U.idUser = UC.idUserCredentials AND UC.userName = "+mysql.escape(user);
    db.query(sqlGetUserCredentials, async (err,result) =>{
        if(err){
            res.status(500).send({ error: 'Problema con el servidor' });
        }else if(result.length === 0){
            res.status(403).send({ error: 'Error o contraseñas incorrectos' });
        }else{
            const passHashed = result[0].userPass;
            const palabraSecretaValida = await bcrypt.compare(pass, passHashed);
            if(palabraSecretaValida){
                const accessToken = generateAccessToken(req.body);
                res.header('authorization', accessToken).json({
                    message: 'User authenticated',
                    accessToken: accessToken,
                    userType: result[0].classUser
                })
            }else{
                res.status(403).send({ error: 'Error o contraseñas incorrectos' });
            }
        }
    })
});

app.get('/api/localidades', async(req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    const sqlGetLocalidades = "SELECT r.region, p.provincia, c.comuna FROM regiones r, provincias p, comunas c  WHERE r.id = p.region_id AND p.id = c.provincia_id ORDER BY r.region ASC, p.provincia"
    db.query(sqlGetLocalidades,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo regiones,ciudades y comunas')
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

app.post('/api/add-service',uploadComment.array('formFileMultiple',10),async (req,res)=>{
    const body = JSON.parse(req.body.params)
    const infoAboutService = body.basicInformation
    const extraServices = body.extraService
    const token = body.token
    const date = new Date()
    const dateAdded = date.toLocaleDateString()
    const infoLogin = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let arrayFiles = []

    for(let i = 0; i < (req.files).length; i++){
        const { originalname } = req.files[i];
        const ref = `${Date.now()}-${originalname}`;
        await sharp(req.files[i].path)
            .resize({height: 400})
            .toFile(path.join(__dirname, '/projects/commentsupload/' + ref))
        let filesComment = {
            filename: fs.readFileSync(path.join(__dirname, '/projects/commentsupload/' + ref)),
            originalname: req.files[i].originalname
        }
        arrayFiles.push(filesComment)
        await unlinkFile((req.files[i]).path)
    }

    if((req.files).length <= 6){
        const sqlRating = "CALL SP_ADD_SERVICE(?,?,?,?,?,@p_return_code)"
        db.query(sqlRating,[JSON.stringify(arrayFiles),JSON.stringify(infoAboutService),JSON.stringify(extraServices),infoLogin.userName,dateAdded],(err,result) =>{
            if(err){
                res.status(500).send('Problema subiendo servicio')
            }else if(result.length > 0){
                res.status(500).send(result[0][0].MESSAGE_TEXT)
            }else{
                res.send(result);
            }
        })
    }
});

app.post('/api/add-skills',validateToken,async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const skillsdata = req.body.data;

    if(skillsdata.length <= 5 && skillsdata.length >= 1){
        const sqlAddSkills = "CALL SP_ADD_SKILLS(?,?,@p_return_code)"
        db.query(sqlAddSkills,[JSON.stringify(skillsdata),userLogged.userName],(err,result) =>{
            if(err){
                res.status(500).send('Problema subiendo servicio')
            }else if(result.length > 0){
                res.status(500).send(result[0][0].MESSAGE_TEXT)
            }else{
                res.send(result);
            }
        })
    }
});

app.put('/api/update-skills',validateToken,async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const skillsdata = req.body.data;

    if(skillsdata.length <= 5 && skillsdata.length >= 1){
        const sqlUpdateSkills = "CALL SP_UPDATE_SKILLS(?,?,@p_return_code)"
        db.query(sqlUpdateSkills,[JSON.stringify(skillsdata),userLogged.userName],(err,result) =>{
            if(err){
                res.status(500).send('Problema subiendo servicio')
            }else if(result.length > 0){
                res.status(500).send(result[0][0].MESSAGE_TEXT)
            }else{
                res.send(result);
            }
        })
    }
});

app.post('/api/get-skills',validateToken,async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const skillsdata = "SELECT S.SkillsUsers FROM SkillsUsers S, Users U WHERE S.idSkillsUser_FK = U.idUser AND U.emailUser="+mysql.escape(userLogged.userName)

    db.query(skillsdata,(err,result) =>{
        if(err){
            res.status(500).send('Problema subiendo servicio')
        }else{
            if(result.length === 0){
                res.send(null)
            }else{
                res.send(result[0]);
            }
        }
    })
});


app.post('/api/add-education',validateToken,async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const { grade, title, establishment,datestart,datefinish } = req.body.data

    const sqlAddSkills = "CALL SP_ADD_EDUCATION(?,?,?,?,?,?,@p_return_code)"
    db.query(sqlAddSkills,[JSON.stringify(grade), title, establishment,datestart,datefinish,userLogged.userName],(err,result) =>{
        if(err){
            res.status(500).send('Problema agregando educacion')
        }else if(result.length > 0){
            res.status(500).send(result[0][0].MESSAGE_TEXT)
        }else{
            res.send(result);
        }
    })
});

app.post('/api/get-education',validateToken,async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());

    const sqlGetEducation = "SELECT E.degree, E.title, E.establishment, E.studystart, E.studyends FROM EducationHistory E, Users U WHERE U.idUser = E.idEducation_History_FK AND U.emailUser ="+mysql.escape(userLogged.userName)
    db.query(sqlGetEducation,(err,result) =>{
        if(err){
            res.status(500).send('Problema encontrando educacion')
        }else{
            res.send(result);
        }
    })
});

app.get('/api/freelancer/get-education/:key',async (req,res)=>{
    const idfreelancer = req.params.key
    const sqlGetEducation = "SELECT E.degree, E.title, E.establishment, E.studystart, E.studyends FROM EducationHistory E, Users U WHERE U.idUser = E.idEducation_History_FK AND U.idUser ="+mysql.escape(idfreelancer)
    db.query(sqlGetEducation,(err,result) =>{
        if(err){
            res.status(500).send('Problema encontrando educacion')
        }else{
            res.send(result);
        }
    })
});

app.get('/api/freelancer/get-workexperience/:key',async (req,res)=>{

    const idfreelancer = req.params.key

    const sqlGetWorkExp = "SELECT W.roleWork, W.companyWork, W.roledetailsWork, W.dateStart, W.dateFinish FROM WorkExperience W, Users U WHERE U.idUser = W.idWork_Experience_FK AND U.idUser ="+mysql.escape(idfreelancer)
    db.query(sqlGetWorkExp,(err,result) =>{
        if(err){
            res.status(500).send('Problema encontrando experiencia laboral')
        }else{
            res.send(result);
        }
    })
});

app.post('/api/add-workexperience',validateToken,async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const { role, company, roledetails,datestart,datefinish } = req.body.data

    const sqlWorkExp = "CALL SP_ADD_WORKEXPERIENCE(?,?,?,?,?,?,@p_return_code)"
    db.query(sqlWorkExp,[role, company, roledetails,datestart,datefinish,userLogged.userName],(err,result) =>{
        if(err){
            res.status(500).send('Problema agregando educacion')
        }else if(result.length > 0){
            res.status(500).send(result[0][0].MESSAGE_TEXT)
        }else{
            res.send(result);
        }
    })
});

app.post('/api/get-workexperience',validateToken,async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());

    const sqlGetWorkExp = "SELECT W.roleWork, W.companyWork, W.roledetailsWork, W.dateStart, W.dateFinish FROM WorkExperience W, Users U WHERE U.idUser = W.idWork_Experience_FK AND U.emailUser ="+mysql.escape(userLogged.userName)
    db.query(sqlGetWorkExp,(err,result) =>{
        if(err){
            res.status(500).send('Problema encontrando educacion')
        }else{
            res.send(result);
        }
    })
});


app.get('/api/get-services/:key', async (req, res) => {
    const userId = req.params.key
    const sqlGetServices = "SELECT S.infoAboutService,S.emailUser, S.extraServices,S.imageServices, S.idServices, U.photoUser, U.cityUser, U.communeUser,U.rankingUser,U.registerDay,U.workResume,U.slogan, I.nameUser, I.LastNameUser,I.workAreaUser, I.bornDate,I.priceWork FROM Services S, Users U, Independent I WHERE S.idServices="+mysql.escape(userId)+"AND S.idUser=U.idUser AND U.idUser = I.idUserIndp"
    db.query(sqlGetServices,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo tus servicios')
        }else{
            result.map((service) => {
                if((service.imageServices).length > 0 ){
                    let element = JSON.parse((service.imageServices))
                    element.forEach(value => {
                        fs.writeFileSync(path.join(__dirname, '/projects/commentsdownload/' + value.originalname),Buffer.from(value.filename))
                    });                }
            })
            res.send(result[0])
        }
    })
})

app.get('/api/get-all-services', async (req, res) => {
    const sqlGetServices = "SELECT S.infoAboutService, S.extraServices,S.imageServices, S.idServices, U.photoUser, U.cityUser, U.communeUser,U.rankingUser, I.nameUser, I.LastNameUser FROM Services S, Users U, Independent I WHERE S.idUser=U.idUser AND U.idUser = I.idUserIndp"
    db.query(sqlGetServices,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo tus servicios')
        }else{
            result.map((service) => {
                if((service.imageServices).length > 0 ){
                    let element = JSON.parse((service.imageServices))
                    fs.writeFileSync(path.join(__dirname, '/projects/commentsdownload/' + element[0].originalname),Buffer.from(element[0].filename))
                }
            })
            res.send(result)
        }
    })
})

app.get('/api/get-services',validateToken, async (req, res) => {
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const sqlGetServices = "SELECT S.infoAboutService, S.extraServices,S.imageServices, S.idServices FROM Services S WHERE S.emailUser="+mysql.escape(userLogged.userName);
    db.query(sqlGetServices,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo tus servicios')
        }else{
            result.map((service) => {
                if((service.imageServices).length > 0 ){
                    let element = JSON.parse((service.imageServices))
                    fs.writeFileSync(path.join(__dirname, '/projects/commentsdownload/' + element[0].originalname),Buffer.from(element[0].filename))
                }
            })
            res.send(result)
        }
    })
})

app.put('/api/update-user',validateToken, async (req, res) => {
    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const userEmail = userLogged.userName
    const userUpdateData = req.body.personalData
    const nameUser = userUpdateData.name
    const LastNameUser = userUpdateData.lastname
    const rutUser = userUpdateData.rut
    const cellphone = userUpdateData.cellphone
    const bornDate = userUpdateData.birthday
    const priceWork = userUpdateData.price
    const gender = userUpdateData.gender
    const slogan = userUpdateData.slogan
    const workAreaUser = userUpdateData.specialization
    const regionUser = userUpdateData.region
    const cityUser = userUpdateData.city
    const communeUser = userUpdateData.commune
    const workResume = userUpdateData.presentation
    const typeEmployed = userUpdateData.classUser === "independiente" ? 0 : 1

    const sqlUpdateUser = "CALL SP_UPDATE_USERS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@p_return_code)"
        db.query(sqlUpdateUser,[userEmail,nameUser,LastNameUser,rutUser,cellphone,bornDate,priceWork,gender,slogan,workAreaUser,regionUser,cityUser,communeUser,workResume,typeEmployed],(err,result) =>{
            if(err){
                res.status(500).send('Problema actualizando usuario')
            }else{
                res.send(result);
            }
        })
})

app.get('/api/get-all-freelancers', async (req, res) => {
    const sqlGetFreelancers = "CALL SP_GET_FREELANCERS()"
    db.query(sqlGetFreelancers,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo freelancers')
        }else{
            res.send(result)
        }
    })
})

app.get('/api/services/freelancers/:key', async (req, res) => {
    const userId = req.params.key
    const sqlGetServices = "SELECT S.infoAboutService,S.imageServices, S.idServices, S.emailUser FROM Services S WHERE S.idUser="+mysql.escape(userId)
    db.query(sqlGetServices,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo tus servicios')
        }else{
            result.map((service) => {
                if((service.imageServices).length > 0 ){
                    let element = JSON.parse((service.imageServices))
                    element.forEach(value => {
                        fs.writeFileSync(path.join(__dirname, '/projects/commentsdownload/' + value.originalname),Buffer.from(value.filename))
                    });                }
            })
            res.send(result)
        }
    })
})



app.get('/api/get-freelancers/:key', async (req, res) => {
    const userId = req.params.key
    const sqlGetServices = "SELECT U.idUser,U.photoUser,U.rutUser,U.emailUser, U.cityUser,U.skillsUser, U.communeUser,U.rankingUser,U.cellphone,U.registerDay,U.workResume,U.slogan, I.nameUser, I.LastNameUser,I.workAreaUser, I.bornDate,I.priceWork,I.gender, SK.SkillsUsers FROM Users U, Independent I, Services S, SkillsUsers SK WHERE U.idUser="+mysql.escape(userId)+"AND U.idUser=I.idUserIndp AND U.idUser = SK.idSkillsUser_FK"
    db.query(sqlGetServices,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo tus servicios')
        }else{
            res.send(result[0])
        }
    })
})


app.get('/api/usuarios', async (req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    const sqlGetUsers = "CALL SP_GET_EMPLOYEDS()"
    db.query(sqlGetUsers,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});

app.get('/api/pymes', async (req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    const sqlGetUsers = "CALL SP_GET_PYMES()"
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
    const sqlGetUsers = "SELECT * FROM Employed E, Independent I WHERE E.idEmployed="+mysql.escape(userId)+"AND E.idEmployed = I.idEmployedIndp"
    db.query(sqlGetUsers,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});

app.get('/api/view/profile-pyme/:key', (req,res)=>{
    const userId = req.params.key
    const sqlGetUsers = "SELECT * FROM Employed E, PYME P WHERE E.idEmployed="+mysql.escape(userId)+"AND E.idEmployed = P.idEmployedPyme"
    db.query(sqlGetUsers,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});

app.post('/api/user-info', validateToken, (req,res)=>{
    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const sqlGetUser = "SELECT * FROM Users U, Independent I WHERE I.idUserIndp = U.idUser AND U.emailUser ="+mysql.escape(userLogged.userName);
    db.query(sqlGetUser,(err,result) =>{
        if(err){
            res.status(500).send('Problema buscando información del usuario')
        }else{
            res.send(result);
        }
    })
});

app.post('/api/user-info-pyme', validateToken, (req,res)=>{
    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const sqlGetUser = "SELECT * FROM Employed E, PYME P WHERE P.idEmployedPyme = E.idEmployed AND E.emailEmployed ="+mysql.escape(userLogged.userName);
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

    website = (dataToUpdate[1].value === undefined || dataToUpdate[1].value === null) ? "" : dataToUpdate[1].value;
    instagram = (dataToUpdate[2].value === undefined || dataToUpdate[2].value === null) ? "" : dataToUpdate[2].value;
    facebook = (dataToUpdate[3].value === undefined || dataToUpdate[3].value === null) ? "" : dataToUpdate[3].value;
    cell = (dataToUpdate[4].value === undefined || dataToUpdate[4].value === null) ? "" : dataToUpdate[4].value;
    exp = (dataToUpdate[5].value === undefined || dataToUpdate[5].value === null) ? "0" : dataToUpdate[5].value;
    workResume = (dataToUpdate[6].value === undefined || dataToUpdate[6].value === null) ? "" : dataToUpdate[6].value;
    colorInput = (dataToUpdate[7].value === undefined || dataToUpdate[7].value === null) ? "" : dataToUpdate[7].value;

    const sqlUpdate1 = "UPDATE Employed SET cellphone="+mysql.escape(cell)+",webSite="+mysql.escape(website)
    +",instagramSite="+mysql.escape(instagram)+",facebookSite="+mysql.escape(facebook)+",workResume="+mysql.escape(workResume)+",colorEmployed="+mysql.escape(colorInput)
    +",experienceYears="+mysql.escape(exp)+"WHERE Employed.emailEmployed="+mysql.escape(userLogged.userName);

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
    if(file === undefined || file === "" || file === null){
        return res.status(500).send('Problema subiendo Foto')
    }
    const result = await uploadFile(file)
    await unlinkFile(file.path)
    const imgSrc = {imagePath: `/api/images/${result.Key}`}
    const sqlInsert1 = "UPDATE Users SET photoUser="+mysql.escape(result.Key)+"WHERE Users.emailUser="+mysql.escape(userLogged.userName);
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
    await deleteFileStream(key).promise()
    res.send('Foto previa borrada satisfactoriamente!')
})

app.delete('/api/image/delete-project:key',(req, res) => {
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const idphoto = req.params.key
    const sqlDelete = "DELETE FROM ProjectsEmployed WHERE ProjectsEmployed.userName="+mysql.escape(userLogged.userName)+"AND ProjectsEmployed.id_img="+mysql.escape(idphoto);
    db.query(sqlDelete,(err,result) =>{
        if(err){
            res.status(500).send('Problema eliminando Foto')
        }else{
            res.send(result)
        }
    })
})

app.delete('/api/delete-especiality:key',validateToken,(req, res) => {
    const idespeciality = req.params.key
    const sqlDelete = "DELETE FROM EmployedEspeciality WHERE EmployedEspeciality.idworkerEspeciality="+mysql.escape(idespeciality);
    db.query(sqlDelete,(err,result) =>{
        if(err){
            res.status(500).send('Problema eliminando Foto')
        }else{
            res.send(result)
        }
    })
})

app.post('/api/image/upload-project/:key',uploadproject.single('photofile'),async (req,res)=>{
    const idWorker = parseInt(req.params.key,10)
    const body = JSON.parse(req.body.params)
    const token = req.body.token
    const userLogged = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const file = req.file
    const name = body.name
    const clientcell = body.phone
    const clientemail = body.email
    const workresume = body.workresume
    const originalname = file.originalname
    const username = userLogged.userName
    const workdate = body.date
    const filetype = file.mimetype

    const ref = `${Date.now()}-${originalname}`;
    await sharp(file.path)
        .resize({height: 300})
        .toFile(path.join(__dirname, '/projects/uploads/' + ref))

    const imageClient = fs.readFileSync(path.join(__dirname, '/projects/uploads/' + ref))
    await unlinkFile(file.path)
    const sqlLimit = "SELECT * FROM ProjectsEmployed WHERE ProjectsEmployed.userName="+mysql.escape(userLogged.userName)
    const sqlInsert1 = "INSERT INTO ProjectsEmployed(clientName,imageName,userName,workDate,imageClient,imageType,workResume,clientCell,clientEmail,idEmployedProjects) VALUES(?,?,?,?,?,?,?,?,?,?)"
    db.query(sqlLimit,(err,result) =>{
        if(err){
            res.status(500).send('Problema subiendo Foto')
        }else{
            if(result.length <= 8){
                db.query(sqlInsert1,[name, originalname, username, workdate, imageClient , filetype, workresume,clientcell,clientemail,idWorker],(err,result) =>{
                    if(err){
                        res.status(500).send('Problema subiendo Foto')
                    }else{
                        res.send(result);
                    }
                })
            }else{
                res.status(500).send('Error: El límite son 4 fotos por usuario')
            }

        }
    })
});

app.post('/api/rating-service',async (req,res)=>{

    const date = new Date()
    const dateComment = date.toLocaleDateString()
    const body = req.body
    const values = Object.values(body)
    const isSomeEmpty = values.some((element)=> element === "")

    const idservice = body.idservice
    const emailservice = body.emailservice
    const from = body.from
    const rating = body.rating
    const nameuser = body.nameuser
    const comment = body.comment
    const emailuser = body.emailuser

    if(!isSomeEmpty){
        const sqlRating = "CALL SP_SEND_RATING(?,?,?,?,?,?,?,?,@p_return_code)"
        db.query(sqlRating,[idservice,emailservice,from,rating,nameuser,comment,emailuser,dateComment],(err,result) =>{
            if(err){
                res.status(500).send('Problema subiendo evaluación')
            }else{
                res.send(result);
            }
        })
    }else{
        res.status(400).send('Problema subiendo evaluación')
    }
});

app.get('/api/rating-service/:key',async (req,res)=>{
    const idService = parseInt(req.params.key,10)
    const sqlGetRating = "CALL SP_GET_SERVICES_REVIEWS(?,@p_return_code)"
    let allreviews = []
    let reviewobjects = {}
    db.query(sqlGetRating,[idService],(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo evaluaciones')
        }else{
            if(result[0].length >= 1){
                allreviews.push(result[0][0].ratingService)
                result[0].map((values)=>{
                    allreviews.push(reviewobjects.review = values)
                })
            }
            res.send(allreviews);
        }
    })
});

app.get('/api/rating-freelancer/:key',async (req,res)=>{
    const idService = parseInt(req.params.key,10)
    const sqlGetRating = "CALL SP_GET_FREELANCER_REVIEWS(?,@p_return_code)"
    let allreviews = []
    let reviewobjects = {}
    db.query(sqlGetRating,[idService],(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo evaluaciones')
        }else{
            if(result[0].length >= 1){
                allreviews.push(result[0][0].ratingfreelancer)
                result[0].map((values)=>{
                    allreviews.push(reviewobjects.review = values)
                })
            }
            res.send(allreviews);
        }
    })
});

app.post('/api/get-comments',validateToken,async (req,res)=>{

    const accessToken = req.body['authorization'] || req.body['x-access-token'] || req.headers['authorization'];
    const userLogged = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    const objectresume = {
        service: [],
        freelancer: [],
    }
    const sqlGetComments = "CALL SP_GET_COMMENTS(?,@p_return_code)";
    db.query(sqlGetComments,[userLogged.userName],(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo comentarios')
        }else{
            result[0].map(value =>{
                if(value.routeRating === "servicio"){
                    objectresume.service.push(value)
                }else{
                    objectresume.freelancer.push(value)
                }
            })
            res.send(objectresume)
        }
    })
});

app.post('/api/answer/reviews',validateToken,async (req,res)=>{

    const id = req.body.data.id
    const answer = req.body.data.response
    const sqlAnswerComments = "UPDATE RatingsServices SET responseOfUser="+mysql.escape(answer)+"WHERE RatingsServices.idRating="+mysql.escape(id);
    db.query(sqlAnswerComments,(err,result) =>{
        if(err){
            res.status(500).send('Problema respondiendo comentarios')
        }else{
            res.send(result)
        }
    })
});

app.post('/api/upload/speciality',validateToken,uploadEspeciality.single('specialityFormFile'),async (req,res)=>{

    const accessToken = req.body['authorization'] || req.body['x-access-token'] || req.headers['authorization'];
    const userLogged = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    const certificatedescription = req.body.params

    let filesEspeciality = {
        filename: fs.readFileSync(path.join(__dirname, '/projects/especialityUpload/' + (req.file).filename)),
        originalname: req.file.originalname
    }
    await unlinkFile((req.file).path)

    const sqlEspeciality = "CALL SP_ADD_CERTIFICATIONS(?,?,?,?,@p_return_code)"
    db.query(sqlEspeciality,[certificatedescription,JSON.stringify(filesEspeciality),userLogged.userName,req.file.mimetype],(err,result) =>{
        if(err){
            res.status(500).send('Problema subiendo especialidad')
        }else{
            res.send(result);
        }
    })
});

app.post('/api/view/speciality',validateToken, async (req, res) => {
    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const sqlGetEspecilities = "SELECT E.idworkerEspeciality, E.fileType, E.especialityDescript, E.especialityDoc FROM EmployedEspeciality E, Users U  WHERE U.idUser = E.idEmployedEspeciality_FK AND U.emailUser="+mysql.escape(userLogged.userName);
    db.query(sqlGetEspecilities,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo especialidades')
        }else{
            result.map(file => {
                let specialityuser = JSON.parse(file.especialityDoc)
                let fileToString = Buffer.from(specialityuser.filename)
                fs.writeFileSync(path.join(__dirname, '/projects/especialitydownload/' + specialityuser.originalname),fileToString)
            })
            res.send(result)
        }
    })
})

app.get('/api/view/freelancer/speciality/:key',async (req, res) => {
    const idService = parseInt(req.params.key,10)
    const sqlGetEspecilities = "SELECT E.especialityDescript, E.especialityDoc, E.fileType FROM EmployedEspeciality E WHERE E.idEmployedEspeciality_FK ="+mysql.escape(idService);
    db.query(sqlGetEspecilities,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo especialidades')
        }else{
            if(result.length >=1){
                result.map(file => {
                    let specialityuser = JSON.parse(file.especialityDoc)
                    let fileToString = Buffer.from(specialityuser.filename)
                    fs.writeFileSync(path.join(__dirname, '/projects/especialitydownload/' + specialityuser.originalname),fileToString)
                })
            }
            res.send(result)
        }
    })
})


app.get('/api/download/speciality/:key', async (req, res) => {
    const userId = req.params.key
    const sqlGetEspecilities = "SELECT we.idworkerEspeciality, we.fileType, we.especialityDescript, we.especialityDoc FROM EmployedEspeciality we, Employed up  WHERE up.idEmployed = we.idEmployedEspeciality AND up.idEmployed="+mysql.escape(userId);
    db.query(sqlGetEspecilities,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo especialidades')
        }else{
            result.map(image => {
                let comment = JSON.parse(image.especialityDoc)
                let commentToString = ""                    
                comment.forEach(element => {
                    commentToString = Buffer.from(element.filename)
                    fs.writeFileSync(path.join(__dirname, '/projects/especialitydownload/' + element.originalname),commentToString)
                });
            })
            res.send(result)
        }
    })
})

app.get('/api/worker/ratings/:key',async (req, res) => {
    const userId = parseInt(req.params.key,10)
    const sqlGetRatings = "SELECT R.evidencesComment, E.rankingEmployed, C.customerName, C.lastNameCustomer, C.emailCustomer, R.workerComment, R.aptitudRating, R.dateComment, R.idEmployedRatings, R.idCustomerRatings, R.totalRating FROM RatingsEmployed R, Customer C, Employed E WHERE E.idEmployed = R.idEmployedRatings AND R.idCustomerRatings = C.idCustomer AND R.idEmployedRatings="+mysql.escape(userId);
    db.query(sqlGetRatings,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo evaluaciones')
        }else{
            result.map(image => {
                if(image.evidencesComment.length > 0){
                    let element = JSON.parse(image.evidencesComment)
                    element.map(value => {
                        fs.writeFileSync(path.join(__dirname,'/projects/commentsdownload/' + value.originalname),Buffer.from(value.filename))
                    });
                }
            })
            
            res.send(result)
        }
    })
})

app.get('/api/image/user-projects',validateToken, async (req, res) => {
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const sqlInsert1 = "SELECT * FROM ProjectsEmployed P, Employed E WHERE P.idEmployedProjects = E.idEmployed AND P.userName="+mysql.escape(userLogged.userName);
    db.query(sqlInsert1,(err,result) =>{
        if(err){
            console.log(err);
            res.status(500).send('Problema obteniendo tus proyectos')
        }else{
            result.map(image => {
                fs.writeFileSync(path.join(__dirname, '/projects/downloads/' + image.imageName),image.imageClient)
            })
            res.send(result)
        }
    })
})

app.get('/api/image/view-projects/:id', (req, res) => {
    const userId = req.params.id
    const sqlClientRequest = "SELECT * FROM Employed E, ProjectsEmployed P WHERE P.idEmployedProjects = E.idEmployed AND P.idEmployedProjects="+mysql.escape(userId)
    db.query(sqlClientRequest,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo tus proyectos')
        }else{
            result.map(image => {
                fs.writeFileSync(path.join(__dirname, '/projects/downloads/' + image.imageName),image.imageClient)
            })
            res.send(result)
        }
    })
})

app.post('/api/request-work',(req,res)=>{

    const nombre = req.body[0];
    const apellidos = req.body[1];
    const rut = req.body[2];
    const celular = '569'+req.body[3];
    const email = req.body[4];
    const descripcionTrabajo = req.body[5];
    const id = parseInt(req.body[6],10)
    const date = new Date()
    const dateRequest = date.toLocaleDateString()

    const sqlInsertRequest = "CALL SP_SEND_WORKREQUESTS(?,?,?,?,?,?,?,?,@p_return_code)";

    db.query(sqlInsertRequest,[id,nombre,apellidos,rut,email,celular,dateRequest,descripcionTrabajo],(err,result)=>{
        if(err){
            res.status(500).send({ error: 'No se pudo enviar la solicitud!' });
        }else{
            res.send(result);
        }
    })
});

app.post('/api/get/request-work',validateToken,(req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());

    const sqlGetRequestsWork = "CALL SP_GET_WORKREQUESTS(?,@p_return_code)";

    db.query(sqlGetRequestsWork,[userLogged.userName],(err,result)=>{
        if(err){
            res.status(500).send({ error: 'No pudimos obtener sus solicitudes' });
        }else{
            res.send(result[0]);
        }
    })
});

app.get('/api/user/user-requests/:key',async (req,res)=>{
    const idWorker = parseInt(req.params.key,10)
    const sqlGetRequests = "SELECT * FROM WorkRequests W, Employed E, Customer C WHERE W.idEmployedRequests = E.idEmployed AND C.idCustomer = W.idCustomerRequests AND W.idEmployedRequests="+mysql.escape(idWorker);
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
        emailWorker: req.body[17],
        nameWorker: req.body[15]
    }
    const response = await emailer.sendRequestEmail(userObjectRequest)
    res.send(response)
});

app.post('/api/contact-email',async (req,res)=>{
    const userObjectRequest = {
        nameClient: req.body.clienteName,
        emailClient: req.body.email,
        cellClient: req.body.cell,
        message: req.body.message,
    }
    const response = await emailer.sendContactMessagge(userObjectRequest)
    res.send(response)
});

app.put('/api/update/agreement/',async (req,res)=>{
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
    const sqlUpdateRequest = "UPDATE WorkRequests SET estado="+mysql.escape(estado)+"WHERE WorkRequests.idRequest="+mysql.escape(idRequest);
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

app.put('/api/user/request-confirm/',async (req,res)=>{
    const estado = req.body.estado;
    const idRequest = parseInt(req.body.idRequest,10);
    const startDate = req.body.startDate;

    const sqlUpdateRequest = "UPDATE WorkRequests SET estado="+mysql.escape(estado)+", startDate="+mysql.escape(startDate)+"WHERE WorkRequests.idRequest="+mysql.escape(idRequest);
    db.query(sqlUpdateRequest,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
    
});

app.put('/api/user/request-reject/',async (req,res)=>{
    const estado = req.body.estado;
    const idRequest = parseInt(req.body.idRequest,10);

    const sqlUpdateRequest = "UPDATE WorkRequests SET estado="+mysql.escape(estado)+"WHERE WorkRequests.idRequest="+mysql.escape(idRequest);
    db.query(sqlUpdateRequest,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
    
});

app.put('/api/worker/update-rating/:key',async (req,res)=>{
    const idWorker = req.params.key;
    const rank = req.body.rankingTotal;

    const sqlUpdateRating = "UPDATE Employed SET rankingEmployed="+mysql.escape(rank)+"WHERE Employed.idEmployed="+mysql.escape(parseInt(idWorker,10));
    db.query(sqlUpdateRating,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })
});

app.put('/api/forgot-password', (req,res,next) =>{
    const password = req.body.password
    const user = req.body.email
    bcrypt.hash(password, rondasDeSal, (err, palabraSecretaEncriptada) => {
        if (err) {
            res.status(500).send({ error: 'Error hasheando' });
        } else {
            const sqlUpdatePassword = "UPDATE EmployedCredentials SET userPass="+mysql.escape(palabraSecretaEncriptada)+"WHERE EmployedCredentials.userName="+mysql.escape(user);
            db.query(sqlUpdatePassword,(err,result) =>{
                if(err){
                    res.status(500).send(err);
                }else{
                    res.send(result);
                }
            })
        }
    });
})

app.post('/api/recover-password',async (req,res,next) =>{
    const userToRecover = req.body.mailValue
    const sqlGetUser = "SELECT EC.userName, EC.userPass, EC.iduser_credentials FROM EmployedCredentials EC, Employed ED WHERE ED.idEmployed = EC.idEmployedCredentials AND EC.userName ="+mysql.escape(userToRecover);
    db.query(sqlGetUser,(err,result) =>{
        if(err){
            res.status(500).send('Problema buscando información del usuario')
        }else{
            if(result.length < 1){
                res.status(204).send('Usuario no registrado')
            }else{
                const secret = process.env.SECRET + result[0].userPass
                const payload = {
                    email: result[0].userName,
                    id: result[0].iduser_credentials
                }
                const token = jwt.sign(payload,secret, { expiresIn: '15m' })
                const link = `https://www.irodum.com/resetear-password/${result[0].iduser_credentials}/${token}`
                const objectResetPass = {
                    mail: result[0].userName,
                    enlace: link
                }
                emailer.sendResetPasswordLink(objectResetPass)
                res.send(result);
            }
        }
    })
})

app.get('/resetear-password/:id/:token', async(req,res,next) =>{
    const { id, token } = req.params
    const sqlGetUser = "SELECT EC.userName, EC.userPass, EC.idEmployedCredentials FROM EmployedCredentials EC, Employed ED WHERE ED.idEmployed = EC.idEmployedCredentials AND EC.idEmployedCredentials ="+mysql.escape(id);
    db.query(sqlGetUser,(err,result) =>{
        if(err){
            res.status(500).send('Problema buscando información del usuario')
        }else{
            if(result.length < 1){
                res.status(204).send('Id de usuario inválido')
                return;
            }
            try {
                const secret = process.env.SECRET + result[0].userPass
                const payload = jwt.verify(token,secret)
                res.status(200).send(result[0].userName)
            }catch(error){
                res.status(404).send('El enlace ha expirado.')
            }
        }
    })
})

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

const cred = {
    cert,
    key
}

app.listen(3001, () =>console.log("secure server running"))

// const httpServer = https.createServer(cred,app)
// httpServer.listen(8443)