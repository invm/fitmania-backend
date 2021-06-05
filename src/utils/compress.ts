const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

let pathNameRegex = /(?<=media\/).*/;

const compress = async (userId: string, file: Express.Multer.File) => {
  let compressedImagePath = path.join(
    __dirname,
    '../',
    'media',
    `${userId}`,
    new Date().toISOString() + file.originalname
  );

  sharp(file.path)
    .resize(1000)
    .jpeg({
      quality: 80,
      chromaSubsampling: '4:4:4',
    })
    .toFile(compressedImagePath, (err: any, info: any) => {
      if (info) console.log(info);
      if (err) console.log(err);
      fs.unlink(file.path, (err: Error) => {
        if (err) throw err;
      });
    });

  return pathNameRegex.exec(compressedImagePath)[0];
};

export default compress;
