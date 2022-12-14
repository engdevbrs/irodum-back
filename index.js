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
app.use(express.static(path.join(__dirname,'./projects/downloads')))
app.use(express.static(path.join(__dirname,'./projects/commentsdownload')))
app.use(express.static(path.join(__dirname,'./projects/especialitydownload')))
app.use(cors())
app.use(express.json())
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

const diskstorageComment = multer.diskStorage({
    destination: path.join(__dirname, './projects/commentsupload'),
    filename: (req, file, cb) =>{
        cb(null, Date.now() + file.originalname)
    }
})

const uploadComment = multer({
    storage: diskstorageComment
})

const diskstorageEspeciality = multer.diskStorage({
    destination: path.join(__dirname, './projects/especialityUpload'),
    filename: (req, file, cb) =>{
        cb(null, Date.now() + file.originalname)
    }
})

const uploadEspeciality = multer({
    storage: diskstorageEspeciality
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
    const type = "independiente";

    const sqlInsert1 = "INSERT INTO user_info(rutUser,nameUser,lastnamesUser,bornDate,cellphone,email,regionUser,cityUser,communeUser,workareaUser,chargeUser,experienceYears,workResume,agreeconditions)" + 
    "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const sqlInsert2 = "INSERT INTO user_credentials(userName, userPass,accountType)" + 
    "VALUES(?,?,?)";
    db.query(sqlInsert1,[rut,name,lastname,bornDate,phone,email,region,city,comunne,area,role,yearsExperience,resume,agreeconditions],(err,result)=>{
        if(err){
            res.status(500).send({ error: 'Algo fall??!' });
        }else{
            db.query(sqlInsert2,[email,pass,type],(err,result)=>{
                if(err){
                    res.status(500).send({ error: 'Algo fall??!' });
                }else{
                    res.send(result);
                }
            })
        }
    })
});

app.post('/api/create-user-pyme',(req,res)=>{

    const razonSocial = req.body.name;
    const economicActivity = req.body.economicActivity;
    const rut = req.body.rut;
    const phone = req.body.phone;
    const email = req.body.email;
    const region = req.body.region;
    const city = req.body.city;
    const comunne = req.body.comunne;
    const yearsExperience = req.body.yearsExperience;
    const resume = req.body.resume;
    const pass = req.body.pass;
    const agreeconditions = req.body.agreeconditions;
    const type = "pyme";

    const sqlInsert1 = "INSERT INTO user_pyme(rutUser,razonSocial,economicActivity,cellphone,email,regionUser,cityUser,communeUser,experienceYears,workResume,agreeconditions)" + 
    "VALUES(?,?,?,?,?,?,?,?,?,?,?)";
    const sqlInsert2 = "INSERT INTO user_credentials(userName, userPass,accountType)" + 
    "VALUES(?,?,?)";
    db.query(sqlInsert1,[rut,razonSocial,economicActivity,phone,email,region,city,comunne,yearsExperience,resume,agreeconditions],(err,result)=>{
        if(err){
            res.status(500).send({ error: 'Algo fall??!' });
        }else{
            db.query(sqlInsert2,[email,pass,type],(err,result)=>{
                if(err){
                    res.status(500).send({ error: 'Algo fall??!' });
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
    const sqlGetUserCredentials = "SELECT u.userName, u.userPass, u.accountType FROM user_credentials u WHERE u.userName = "+mysql.escape(user)+ "AND u.userPass ="+mysql.escape(pass);
    db.query(sqlGetUserCredentials,(err,result) =>{
        if(result.length === 0){
            res.status(403).send({ error: 'Error o contrase??as incorrectos' });
        }else{
            const accessToken = generateAccessToken(req.body);
            res.header('authorization', accessToken).json({
                message: 'User authenticated',
                accessToken: accessToken,
                userType: result[0].accountType
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
            res.status(500).send('Problema buscando informaci??n del usuario')
        }else{
            res.send(result);
        }
    })
});

app.post('/api/user-info-pyme', validateToken, (req,res)=>{
    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());;
    const sqlGetUser = "SELECT * FROM user_pyme u WHERE u.email ="+mysql.escape(userLogged.userName);
    db.query(sqlGetUser,(err,result) =>{
        if(err){
            res.status(500).send('Problema buscando informaci??n del usuario')
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
    twitter = (dataToUpdate[4].value === undefined || dataToUpdate[4].value === null) ? "" : dataToUpdate[4].value;
    cell = (dataToUpdate[5].value === undefined || dataToUpdate[5].value === null) ? "" : dataToUpdate[5].value;
    colorInput = (dataToUpdate[6].value === undefined || dataToUpdate[6].value === null) ? "" : dataToUpdate[6].value;

    const sqlUpdate1 = "UPDATE user_info SET cellphone="+mysql.escape(cell)+",webSite="+mysql.escape(website)
    +",instagramSite="+mysql.escape(instagram)+",facebookSite="+mysql.escape(facebook)+",twitterSite="+mysql.escape(twitter)
    +",userColor="+mysql.escape(colorInput)+"WHERE user_info.email="+mysql.escape(userLogged.userName);

    db.query(sqlUpdate1,(err,result) =>{
        if(err){
            res.status(500).send('Problema actualizando datos')
        }else{
            res.send(result);
        }
    })
});

app.put('/api/update-pyme', validateToken,(req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());

    const dataToUpdate  = req.body.newArrayValues

    website = (dataToUpdate[1].value === undefined || dataToUpdate[1].value === null) ? "" : dataToUpdate[1].value;
    instagram = (dataToUpdate[2].value === undefined || dataToUpdate[2].value === null) ? "" : dataToUpdate[2].value;
    facebook = (dataToUpdate[3].value === undefined || dataToUpdate[3].value === null) ? "" : dataToUpdate[3].value;
    twitter = (dataToUpdate[4].value === undefined || dataToUpdate[4].value === null) ? "" : dataToUpdate[4].value;
    cell = (dataToUpdate[5].value === undefined || dataToUpdate[5].value === null) ? "" : dataToUpdate[5].value;
    colorInput = (dataToUpdate[6].value === undefined || dataToUpdate[6].value === null) ? "" : dataToUpdate[6].value;

    const sqlUpdate1 = "UPDATE user_pyme SET cellphone="+mysql.escape(cell)+",webSite="+mysql.escape(website)
    +",instagramSite="+mysql.escape(instagram)+",facebookSite="+mysql.escape(facebook)+",twitterSite="+mysql.escape(twitter)
    +",userColor="+mysql.escape(colorInput)+"WHERE user_pyme.email="+mysql.escape(userLogged.userName);

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

app.put('/api/images-pyme',upload.single('formFile'),async (req,res)=>{
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const file = req.file
    const result = await uploadFile(file)
    await unlinkFile(file.path)
    const imgSrc = {imagePath: `/api/images/${result.Key}`}
    const sqlInsert1 = "UPDATE user_pyme SET userPhoto="+mysql.escape(result.Key)+"WHERE user_pyme.email="+mysql.escape(userLogged.userName);
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

app.delete('/api/delete-especiality:key',(req, res) => {
    const userLogged = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64').toString());
    const idespeciality = req.params.key
    const sqlDelete = "DELETE FROM workerEspeciality WHERE workerEspeciality.EmailWorkerEspeciality="+mysql.escape(userLogged.userName)+"AND workerEspeciality.idworkerEspeciality="+mysql.escape(idespeciality);
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
    const clientcell = body.phone
    const clientemail = body.email
    const workresume = body.workresume
    const originalname = file.originalname
    const username = userLogged.userName
    const workdate = body.date
    const filetype = file.mimetype
    const imageClient = fs.readFileSync(path.join(__dirname, './projects/uploads/' + file.filename))
    await unlinkFile(file.path)
    const sqlLimit = "SELECT * FROM projects_user WHERE projects_user.userName="+mysql.escape(userLogged.userName)
    const sqlInsert1 = "INSERT INTO projects_user(clientName,imageName,userName,workDate,imageClient,imageType,workResume,clientCell,clientEmail) VALUES(?,?,?,?,?,?,?,?,?)"
    db.query(sqlLimit,(err,result) =>{
        if(err){
            res.status(500).send('Problema subiendo Foto')
        }else{
            if(result.length <= 8){
                db.query(sqlInsert1,[name, originalname, username, workdate, imageClient , filetype, workresume,clientcell,clientemail],(err,result) =>{
                    if(err){
                        res.status(500).send('Problema subiendo Foto')
                    }else{
                        res.send(result);
                    }
                })
            }else{
                res.status(500).send('Error: El l??mite son 4 fotos por usuario')
            }

        }
    })
});

app.post('/api/rating-worker',uploadComment.array('formFileMultiple',10),async (req,res)=>{

    const date = new Date()
    const dateComment = date.toLocaleDateString()
    const body = JSON.parse(req.body.params)
    let arrayFiles = []
    const workerName = body[0]
    const workerLastName = body[1]
    const clientEmail = body[2]
    const workerComment = body[3]
    const workerEmail = body[4]
    const aptitudRating = body[5]

    for(let i = 0; i < (req.files).length; i++){
        let filesComment = {
            filename: fs.readFileSync(path.join(__dirname, './projects/commentsupload/' + (req.files[i]).filename)),
            originalname: req.files[i].originalname
        }
        arrayFiles.push(filesComment)
        await unlinkFile((req.files[i]).path)
    }
        
    if((req.files).length <= 4){
        const sqlRating = "INSERT INTO user_ratings(workerName,workerLastName,workerComment,evidencesComment,aptitudRating,workerEmail,clientEmail,dateComment) VALUES(?,?,?,?,?,?,?,?)"
        db.query(sqlRating,[workerName,workerLastName,workerComment,JSON.stringify(arrayFiles),JSON.stringify(aptitudRating),workerEmail,clientEmail,dateComment],(err,result) =>{
            if(err){
                res.status(500).send('Problema subiendo evaluaci??n')
            }else{
                res.send(result);
            }
        })
    }
});

app.post('/api/upload/speciality',uploadEspeciality.array('specialityFormFile',10),async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const arrayEspecialityDescript = JSON.parse(req.body.params)
    let arrayFilesEsp = []

    let filesEspeciality = {
        filename: fs.readFileSync(path.join(__dirname, './projects/especialityUpload/' + (req.files[0]).filename)),
        originalname: req.files[0].originalname
    }
    arrayFilesEsp.push(filesEspeciality)
    await unlinkFile((req.files[0]).path)

    const sqlEspeciality = "INSERT INTO workerEspeciality(especialityDescript,especialityDoc,EmailWorkerEspeciality,fileType) VALUES(?,?,?,?)"
    db.query(sqlEspeciality,[JSON.stringify(arrayEspecialityDescript),JSON.stringify(arrayFilesEsp),userLogged.userName,req.files[0].mimetype],(err,result) =>{
        if(err){
            res.status(500).send('Problema subiendo especialidad')
        }else{
            res.send(result);
        }
    })
});

app.get('/api/worker/evaluations/:key',(req, res) => {
    const userId = req.params.key
    const sqlGetEvaluations = "SELECT ur.workerName,ur.workerLastName,ur.workerComment,ur.evidencesComment,ur.aptitudRating,ur.workerEmail,ur.clientEmail, ur.dateComment FROM user_ratings ur, user_info ui WHERE ui.email=ur.workerEmail AND ui.id="+mysql.escape(userId);
    db.query(sqlGetEvaluations,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo evaluaciones')
        }else{
            result.map(image => {
                let comment = JSON.parse(image.evidencesComment)
                let commentToString = ""                    
                comment.forEach(element => {
                    commentToString = Buffer.from(element.filename)
                    fs.writeFileSync(path.join(__dirname, './projects/commentsdownload/' + element.originalname),commentToString)
                });
            })
            res.send(result)
        }
    })
})

app.get('/api/download/speciality/:key', (req, res) => {
    const userId = req.params.key
    const sqlGetEspecilities = "SELECT we.idworkerEspeciality, we.fileType, we.especialityDescript, we.especialityDoc FROM workerEspeciality we, user_info ui  WHERE ui.email=we.EmailWorkerEspeciality AND ui.id="+mysql.escape(userId);
    db.query(sqlGetEspecilities,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo especialidades')
        }else{
            result.map(image => {
                let comment = JSON.parse(image.especialityDoc)
                let commentToString = ""                    
                comment.forEach(element => {
                    commentToString = Buffer.from(element.filename)
                    fs.writeFileSync(path.join(__dirname, './projects/especialitydownload/' + element.originalname),commentToString)
                });
            })
            res.send(result)
        }
    })
})

app.get('/api/download/speciality-pyme/:key', (req, res) => {
    const userId = req.params.key
    const sqlGetEspecilities = "SELECT we.idworkerEspeciality, we.fileType, we.especialityDescript, we.especialityDoc FROM workerEspeciality we, user_pyme up  WHERE up.email=we.EmailWorkerEspeciality AND up.iduser_pyme="+mysql.escape(userId);
    db.query(sqlGetEspecilities,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo especialidades')
        }else{
            result.map(image => {
                let comment = JSON.parse(image.especialityDoc)
                let commentToString = ""                    
                comment.forEach(element => {
                    commentToString = Buffer.from(element.filename)
                    fs.writeFileSync(path.join(__dirname, './projects/especialitydownload/' + element.originalname),commentToString)
                });
            })
            res.send(result)
        }
    })
})

app.get('/api/worker/ratings/:key',(req, res) => {
    const userId = req.params.key
    const sqlGetRatings = "SELECT ur.aptitudRating FROM user_ratings ur, user_info ui WHERE ui.email=ur.workerEmail AND ui.id="+mysql.escape(userId);
    db.query(sqlGetRatings,(err,result) =>{
        if(err){
            res.status(500).send('Problema obteniendo evaluaciones')
        }else{
            res.send(result)
        }
    })
})

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

app.put('/api/user/request-confirm/',async (req,res)=>{
    const estado = req.body.estado;
    const idRequest = parseInt(req.body.idRequest,10);
    const startDate = req.body.startDate;

    const sqlUpdateRequest = "UPDATE work_requests SET estado="+mysql.escape(estado)+", startDate="+mysql.escape(startDate)+"WHERE work_requests.idRequest="+mysql.escape(idRequest);
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

    const sqlUpdateRequest = "UPDATE work_requests SET estado="+mysql.escape(estado)+"WHERE work_requests.idRequest="+mysql.escape(idRequest);
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

    const sqlUpdateRating = "UPDATE user_info SET ranking="+mysql.escape(rank)+"WHERE user_info.id="+mysql.escape(idWorker);
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
    const sqlUpdatePassword = "UPDATE user_credentials SET userPass="+mysql.escape(password)+"WHERE user_credentials.userName="+mysql.escape(user);
    db.query(sqlUpdatePassword,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(result);
        }
    })

})

app.post('/api/recover-password',async (req,res,next) =>{
    const userToRecover = req.body.mailValue
    const sqlGetUser = "SELECT u.userName, u.userPass,ui.id FROM user_credentials u, user_info ui WHERE u.userName ="+mysql.escape(userToRecover)+" AND ui.email = u.userName";
    db.query(sqlGetUser,(err,result) =>{
        if(err){
            res.status(500).send('Problema buscando informaci??n del usuario')
        }else{
            if(result.length < 1){
                res.status(204).send('Usuario no registrado')
            }else{
                const secret = process.env.SECRET + result[0].userPass
                const payload = {
                    email: result[0].userName,
                    id: result[0].id
                }
                const token = jwt.sign(payload,secret, { expiresIn: '15m' })
                const link = `http://d2tdlyl8u1ln8a.cloudfront.net/resetear-password/${result[0].id}/${token}`
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

app.get('/resetear-password/:id/:token',(req,res,next) =>{
    const { id, token } = req.params
    const sqlGetUser = "SELECT u.userName, u.userPass,ui.id FROM user_credentials u, user_info ui WHERE ui.id ="+mysql.escape(id)+" AND ui.email = u.userName";
    db.query(sqlGetUser,(err,result) =>{
        if(err){
            res.status(500).send('Problema buscando informaci??n del usuario')
        }else{
            if(result.length < 1){
                res.status(204).send('Id de usuario inv??lido')
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

app.listen(3001,()=>{
    console.log("escuchando en el puerto 3001");
});