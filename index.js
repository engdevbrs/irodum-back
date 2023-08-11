const express = require('express')
const bcrypt = require("bcryptjs")
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
app.use(express.static(path.join(__dirname,'./projects/especialitydownload')))
app.use(express.static(path.join(__dirname,'./projects/especialityupload')))
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
    const bornDate = (req.body.bornDate === undefined || req.body.bornDate === null) ? "" : req.body.bornDate;
    const phone = req.body.phone;
    const email = req.body.email;
    const region = req.body.region;
    const city = req.body.city;
    const comunne = req.body.comunne;
    const area = (req.body.area === undefined || req.body.area === null) ? "" : req.body.area;
    const role = (req.body.role === undefined || req.body.role === null) ? "" : req.body.role;
    const yearsExperience = req.body.yearsExperience;
    const resume = (req.body.resume === undefined || req.body.resume === null) ? "" : req.body.resume;
    const pass = (req.body.pass === undefined || req.body.pass === null) ? "" : req.body.pass;
    const economicActivity = (req.body.economicActivity === undefined || req.body.economicActivity === null) ? "" : (req.body.economicActivity).charAt(0).toUpperCase() + (req.body.economicActivity).slice(1).toLowerCase();
    const agreeconditions = true;
    const type = parseInt(req.body.type,10);

    const sqlInsertNewEmployed = "CALL SP_INSERT_EMPLOYED(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@p_return_code)";
    bcrypt.hash(pass, rondasDeSal, (err, palabraSecretaEncriptada) => {
        if (err) {
            res.status(500).send({ error: 'Error hasheando' });
        } else {
            db.query(sqlInsertNewEmployed,[rut,email,phone,region,city,comunne,yearsExperience,resume,agreeconditions,dateRegister,name,lastname,bornDate,role,area,economicActivity,palabraSecretaEncriptada,type === 0 ? 'independiente' : 'pyme',type],(err,result)=>{
                let statusCode = null;
                if(result.serverStatus === 2 && result.serverStatus !== undefined){
                    res.send(result);
                }else if(result.length > 0){
                    statusCode = result[0][0]
                    if(statusCode.RETURNED_SQLSTATE === '23000'){
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
    const sqlGetUserCredentials = "SELECT EC.userName, EC.userPass, E.employedClass FROM EmployedCredentials EC, Employed E WHERE E.idEmployed = EC.idEmployedCredentials AND EC.userName = "+mysql.escape(user);
    db.query(sqlGetUserCredentials, async (err,result) =>{
        if(result.length === 0){
            res.status(403).send({ error: 'Error o contraseñas incorrectos' });
        }else{
            const passHashed = result[0].userPass;
            const palabraSecretaValida = await bcrypt.compare(pass, passHashed);
            if(palabraSecretaValida){
                const accessToken = generateAccessToken(req.body);
                res.header('authorization', accessToken).json({
                    message: 'User authenticated',
                    accessToken: accessToken,
                    userType: result[0].employedClass
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
    const sqlGetUser = "SELECT * FROM Employed E, Independent I WHERE I.idEmployedIndp = E.idEmployed AND E.emailEmployed ="+mysql.escape(userLogged.userName);
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
    colorInput = (dataToUpdate[6].value === undefined || dataToUpdate[6].value === null) ? "" : dataToUpdate[6].value;

    const sqlUpdate1 = "UPDATE Employed SET cellphone="+mysql.escape(cell)+",webSite="+mysql.escape(website)
    +",instagramSite="+mysql.escape(instagram)+",facebookSite="+mysql.escape(facebook)+",colorEmployed="+mysql.escape(colorInput)
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
    const result = await uploadFile(file)
    await unlinkFile(file.path)
    const imgSrc = {imagePath: `/api/images/${result.Key}`}
    const sqlInsert1 = "UPDATE Employed SET photoEmployed="+mysql.escape(result.Key)+"WHERE Employed.emailEmployed="+mysql.escape(userLogged.userName);
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
    sharp(file.path)
        .resize({height: 300})
        .toFile('/projects/uploads/' + ref)

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

app.post('/api/rating-worker',uploadComment.array('formFileMultiple',10),async (req,res)=>{

    const date = new Date()
    const dateComment = date.toLocaleDateString()
    const body = JSON.parse(req.body.params)
    let arrayFiles = []
    const clientName = body[0]
    const clientLastName = body[1]
    const clientmail = body[2]
    const clientComment = body[3]
    const aptitudRating = body[5]
    const idEmployed = parseInt(body[6].employed,10)
    const sumaRating = (aptitudRating.cuidadoso + aptitudRating.honestidad + aptitudRating.precio + aptitudRating.puntualidad + aptitudRating.responsabilidad) / 5;

    for(let i = 0; i < (req.files).length; i++){
        const { originalname } = req.files[i];
        const ref = `${Date.now()}-${originalname}`;
        sharp(req.files[i].path)
            .resize({width: 400})
            .toFile('/projects/commentsupload/' + ref)
        let filesComment = {
            filename: fs.readFileSync(path.join(__dirname, '/projects/commentsupload/' + ref)),
            originalname: req.files[i].originalname
        }
        arrayFiles.push(filesComment)
        await unlinkFile((req.files[i]).path)
    }
        
    if((req.files).length <= 4){
        const sqlRating = "CALL SP_SEND_RATINGEMPLOYED(?,?,?,?,?,?,?,?,?,@p_return_code)"
        db.query(sqlRating,[idEmployed,clientName,clientLastName,clientComment,JSON.stringify(arrayFiles),JSON.stringify(aptitudRating),clientmail,dateComment,sumaRating],(err,result) =>{
            if(err){
                res.status(500).send('Problema subiendo evaluación')
            }else{
                res.send(result);
            }
        })
    }
});

app.post('/api/upload/speciality/:key',uploadEspeciality.array('specialityFormFile',10),async (req,res)=>{

    const userLogged = JSON.parse(Buffer.from(req.body.authorization.split('.')[1], 'base64').toString());
    const arrayEspecialityDescript = JSON.parse(req.body.params)
    const idWorker = parseInt(req.params.key)
    let arrayFilesEsp = []

    let filesEspeciality = {
        filename: fs.readFileSync(path.join(__dirname, '/projects/especialityUpload/' + (req.files[0]).filename)),
        originalname: req.files[0].originalname
    }
    arrayFilesEsp.push(filesEspeciality)
    await unlinkFile((req.files[0]).path)

    const sqlEspeciality = "INSERT INTO EmployedEspeciality(especialityDescript,especialityDoc,EmailWorkerEspeciality,fileType,idEmployedEspeciality) VALUES(?,?,?,?,?)"
    db.query(sqlEspeciality,[JSON.stringify(arrayEspecialityDescript),JSON.stringify(arrayFilesEsp),userLogged.userName,req.files[0].mimetype,idWorker],(err,result) =>{
        if(err){
            res.status(500).send('Problema subiendo especialidad')
        }else{
            res.send(result);
        }
    })
});


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

    let calle = null;
    let pasaje = null;
    let NumeroCasa = null;

    let dptoDirec = null;
    let NumeroPiso = null;
    let NumeroDepto = null;

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
    const estado = 'acordar'
    const id = parseInt(req.body[16],10)

    const sqlInsertRequest = "CALL SP_SEND_WORKREQUESTS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@p_return_code)";

    db.query(sqlInsertRequest,[id,nombre,apellidos,rut,email,celular,calle,pasaje,NumeroCasa,dptoDirec,NumeroPiso,NumeroDepto,comuna,descripcionTrabajo,estado],(err,result)=>{
        if(err){
            res.status(500).send({ error: 'No se pudo enviar la solicitud!' });
        }else{
            res.send(result);
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
    const sqlUpdatePassword = "UPDATE EmployedCredentials SET userPass="+mysql.escape(password)+"WHERE EmployedCredentials.userName="+mysql.escape(user);
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
                const link = `http://localhost:3000/resetear-password/${result[0].iduser_credentials}/${token}`
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

app.listen(3001,()=>{
    console.log("escuchando en el puerto 3001");
});