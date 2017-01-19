/**
 * Created by lenovo on 18.01.2017.
 */
import express from 'express';
import child_process from 'child_process';
import path from 'path';
import request from 'request';
import AdmZip from 'adm-zip';
import fs from 'fs';

const app = express();
const exec = child_process.exec;

const PORT = 3000;
const DOWNLOADS_FOLDER = `${__dirname}/../downloads`; 

let ANDROID_HOME = "";
let currentExtractedProjectFolder = "";


app.get('/', (req, res) => {
    res.send('HARVESTER');
});


/**
 * This method will get ANDROID_HOME env variable
 */
app.get('/android_path', (req, res) => {
    ANDROID_HOME = process.env.ANDROID_HOME;
    
    let status = (ANDROID_HOME) ? "success" : "error";
    
    if (process.platform === "win32")
        ANDROID_HOME = resolveWindowsPath(ANDROID_HOME);
    else
        ANDROID_HOME = path.resolve(ANDROID_HOME);
    
    
    res.json({status: status, data: ANDROID_HOME});
});


/**
 * This method will get an array of connected devices.
 * android_path should be called before this method
 */
app.get('/android_devices', (req, res) => {
    let devicesCommand = `${path.normalize(ANDROID_HOME)}/platform-tools/adb devices -l`; 
   
    if (process.platform === "win32")
        devicesCommand = `"${path.normalize(ANDROID_HOME)}\\platform-tools\\adb" devices -l`;
    
    
   exec(devicesCommand, (error, stdout, stderr) => {
        
        if (error) {
            res.json({status: 'error', data: error});
            return;
        }
        
       
       let arr = stdout.trim().split("\n");

       let filtered = arr.filter((element, index) => {
           if (index > 0 && element.indexOf('*') == -1) {
               return element;
           }
       }).map((element) => {
           let parts = element.split('               ');
           return {id: parts[0], description: parts[1]};
       });
            
       
       res.json({status: 'success', data: filtered});
   })
   
});


app.get('/download', (req, res) => {
    let url = req.query.url;
    
    // There must be better URL tidying
    url = url.replace(/\"/g, "");
    
    let zipUrl = `${url}/archive/master.zip`;
    
    if (!fs.existsSync(DOWNLOADS_FOLDER)) {
        fs.mkdirSync(DOWNLOADS_FOLDER);
    }

    let fileName = url.split('/').pop() + ".zip";
    let filePath = `${DOWNLOADS_FOLDER}/${fileName}`;
    let fileStream = fs.createWriteStream(filePath);


    let download = request(zipUrl);
    download.on('error', function (err) {
        res.json({status: 'error', data: err.message});
        return;
    });
    download.on('response', (response) => {
        if (response.statusCode != 200)
            res.json({status: 'error', data: 'error while downloading repo'});
        else
            download.pipe(fileStream).on('close', () => {
                fileStream.close();

                let zip = AdmZip(filePath);
                zip.extractAllToAsync(DOWNLOADS_FOLDER, true, (error) => {
                   if (error) {
                       res.json({status: 'error', data: error.message});
                       return;
                   } 

                   // There must be additional checks this code is just for now
                   currentExtractedProjectFolder = `${DOWNLOADS_FOLDER}/${zip.getEntries()[0].entryName}`;

                   res.json({status: 'success', data: 'project is ready'})
                });
            });
    });


});


function resolveWindowsPath (str) {
    var isExtendedLengthPath = /^\\\\\?\\/.test(str);
    var hasNonAscii = /[^\x00-\x80]+/.test(str);

    if (isExtendedLengthPath || hasNonAscii) {
        return str;
    }

    return str.replace(/\\/g, '/');
}


app.listen(PORT, () => {
    console.log(`Console is listening at: ${PORT}`)
});