const S3 = require('aws-sdk/clients/s3')
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'})
const fs = require('fs');
const sharp = require('sharp');

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

//uploads a file to s3
async function uploadFile(file) {
  const buffer = await sharp(file.path).resize({height:600, width: 400, fit:"contain"}).toBuffer()
    const fileStream = fs.createReadStream(file.path)
  
    const uploadParams = {
      Bucket: bucketName,
      Body: buffer,
      Key: file.filename
    }
  
    return s3.upload(uploadParams).promise()
  }

exports.uploadFile = uploadFile

//downloads a file from s3
function getFileStream(fileKey) {
    const downloadParams = {
      Key: fileKey,
      Bucket: bucketName
    }
  
    return s3.getObject(downloadParams).createReadStream()
  }

exports.getFileStream = getFileStream

//delete a file from s3
function deleteFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName
  }

  return s3.deleteObject(downloadParams);
}

exports.deleteFileStream = deleteFileStream