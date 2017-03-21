/**
 * Created by lenovo on 18.01.2017.
 */
import express from 'express';
import child_process from 'child_process';
import path from 'path';
import request from 'request';
import AdmZip from 'adm-zip';
import fs from 'fs';

module.exports = () => {
    
    const app = express();
    const exec = child_process.exec;
    const execSync = child_process.execSync;
    const spawn = child_process.spawn;
    
    const PORT = 7777;
    const DOWNLOADS_FOLDER = `${__dirname}/../downloads`;

    let ANDROID_HOME = "";
    let currentExtractedProjectFolder = "picasso-master";

    
    let allowCrossDomainLocalhost = (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    };

    app.use(allowCrossDomainLocalhost);

    app.get('/', (req, res) => {
        res.json({status: 'success', data: "Harvester"});
    });


    /**
     * This method will get ANDROID_HOME env variable
     */
    app.get('/android_path', (req, res) => {
        ANDROID_HOME = process.env.ANDROID_HOME;
        
        if (!ANDROID_HOME) {
            res.json({status: 'error', data: 'ANDROID_PATH does not exist'})
            return;
        }        
        
        
        if (process.platform === "win32")
            ANDROID_HOME = resolveWindowsPath(ANDROID_HOME);
        else
            ANDROID_HOME = path.resolve(ANDROID_HOME);


        res.json({status: 'success', data: ANDROID_HOME});
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
                let id = element.slice(0, element.indexOf('  '));
                let description = element.slice(element.lastIndexOf('  ') + 2, element.length + 1);

                return {id: id, description: description};
            });


            res.json({status: 'success', data: filtered});
        })

    });

    /**
     * This method will download github project and unzip it to specific folder
     */
    app.get('/download', (req, res) => {
        let url = req.query.url;

        // There must be better URL tidying
        url = url.replace(/\"/g, "");

        // Getting github's repo's archive
        let zipUrl = `${url}/archive/master.zip`;
        
        console.log("Checking Folder");
        if (!fs.existsSync(DOWNLOADS_FOLDER)) {
            fs.mkdirSync(DOWNLOADS_FOLDER);
        }
        console.log("Checked Folder");
        
        let fileName = url.split('/').pop() + ".zip";
        let filePath = `${DOWNLOADS_FOLDER}/${fileName}`;
        let fileStream = fs.createWriteStream(filePath);

        console.log(`File Path ${filePath}`);

        console.log("Download Started");
        let download = request(zipUrl);
        download.on('error', function (err) {
            res.json({status: 'error', data: err.message});
            return;
        });
        download.on('response', (response) => {
            if (response.statusCode != 200) {
                res.json({status: 'error', data: 'error while downloading repo'});
            }
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
                        console.log(currentExtractedProjectFolder);

                        res.json({status: 'success', data: 'project is ready'})
                    });
                });
        });


    });


    /**
     * This method will try to build downloaded project. /download should be called before
     */
    app.get('/build', (req, res) => {
        if (currentExtractedProjectFolder.length == 0) {
            res.json({status: 'error', data: 'Project is not extracted'});
        }

        // Removing extra slash in extracted project folder
        if (currentExtractedProjectFolder[currentExtractedProjectFolder.length - 1] === "/")
            currentExtractedProjectFolder = currentExtractedProjectFolder.slice(0, -1);

        let command = "./gradlew";
        let params = ['assembleDebug', '--stacktrace'];
        // If our platform is Windows. We will run *.bat file
        if (process.platform === "win32")
            command = "gradlew.bat";
        else {
            // We execute chmod in order to have an access to executable bash script
            fs.chmodSync(`${currentExtractedProjectFolder}/gradlew`, '755');

            params.unshift(command);
            command = "sudo";
        }
            
        console.log(currentExtractedProjectFolder);
        let gradlew = spawn(command, params, {cwd: `${currentExtractedProjectFolder}`});

        gradlew.stdout.on('data', (data) => {
            console.log("stdout: " + data);
            res.write(JSON.stringify({status: 'loading', data: data.toString()}))
        });

        gradlew.stderr.on('data', (data) => {
            console.log('stderr: ' + data);
            res.write(JSON.stringify({status: 'error', data: data.toString()}))
        });


        gradlew.on('exit', (code) => {
            if (code == "0")
                res.end(JSON.stringify({status: 'success', data: 'Build is successful'}));
            else
                res.end(JSON.stringify({status: 'error', data: 'Project was not built'}));
        });

        gradlew.on('error', (error) => {
            console.log("ERROR: " + error);
            res.json({status: 'error', data: error.errno});
        });

    });


    /**
     * This method will launch built apk file. /build should be called before
     */
    app.get('/launch', (req, res) => {
        let deviceId = req.query.deviceId;

        if (ANDROID_HOME.length === 0) {
            res.json({status: 'error', data: 'ANDROID_HOME is not set'});
            return;
        }

        if (!deviceId) {
            res.json({status: 'error', data: 'device is not set'});
            return;
        }

        if (currentExtractedProjectFolder.length === 0) {
            res.json({status: 'error', data: 'project is not set'});
            return;
        }

        let apkPath = searchForApk(`${currentExtractedProjectFolder}`);

        if (apkPath.length === 0) {
            res.json({status: 'error', data: 'project is not built'});
            return;
        }


        let buildToolsFolder = fs.readdirSync(`${ANDROID_HOME}/build-tools`);
        if (buildToolsFolder.length === 0) {
            res.json({status: 'error', data: 'no build-tools'});
        }

        let buildTool = buildToolsFolder[0];

        let aaptCommand = `${path.normalize(ANDROID_HOME)}/build-tools/${buildTool}/aapt dump --values badging ${apkPath}`;
        if (process.platform === "win32") {
            apkPath = apkPath.replace(/\//g, "\\");
            aaptCommand = `"${path.normalize(ANDROID_HOME)}\\build-tools\\${buildTool}\\aapt" dump --values badging "${apkPath}"`;
        }

        exec(aaptCommand, (error, stdout, stderr) => {

            if (error) {
                res.json({status: 'error', data: error});
                return;
            }

            let aaptLines = stdout.split('\n');
            let packageLine = "";
            let launchableActivityLine = "";
            for (let i = 0; i < aaptLines.length; i++) {
                if (aaptLines[i].indexOf("package") !== -1) {
                    packageLine = aaptLines[i];
                } else if (aaptLines[i].indexOf("launchable-activity:") !== -1) {
                    launchableActivityLine = aaptLines[i];
                    break;
                }
            }

            let packageName = packageLine.substring(packageLine.indexOf("name=\'") + 6, packageLine.indexOf("\' versionCode"));

            let launchableActivity = launchableActivityLine.substring(
                launchableActivityLine.indexOf("name=\'") + 6,
                launchableActivityLine.indexOf("\'  label=\'"));
            console.log(aaptLines);
            console.log("ACTIVITY " + packageName + " " + launchableActivity);

            res.write(JSON.stringify({status: 'success', data: 'Package and activity found'}));

            let install = spawn("adb", ["-s", deviceId, "install", apkPath], {cwd: `${path.normalize(ANDROID_HOME)}/platform-tools`});

            install.stdout.on('data', (data) => {
                console.log("install stdout: " + data);
                res.write(JSON.stringify({status: 'loading', data: data.toString()}))
            });

            install.stderr.on('data', (data) => {
                console.log('install stderr: ' + data);
                res.write(JSON.stringify({status: 'error', data: data.toString()}))
            });


            install.on('exit', (code) => {
                if (code == "0") {
                    res.write(JSON.stringify({status: 'success', data: 'Install is successful'}));


                    res.write(JSON.stringify({status: 'success', data: 'Trying to launch'}));

                    let launch = spawn("adb",
                        ["-s", deviceId, "shell", "am", "start", "-n", `${packageName}/${launchableActivity}`],
                        {cwd: `${path.normalize(ANDROID_HOME)}/platform-tools`});

                    launch.stdout.on('data', (data) => {
                        console.log("launch stdout: " + data);
                        res.write(JSON.stringify({status: 'success', data: data.toString()}))
                    });

                    launch.stderr.on('data', (data) => {
                        console.log('launch stderr: ' + data);
                        res.write(JSON.stringify({status: 'error', data: data.toString()}))
                    });

                    launch.on('exit', (code) => {
                        if (code == "0")
                            res.end(JSON.stringify({status: 'success', data: 'Launched'}));
                        else
                            res.end(JSON.stringify({status: 'error', data: 'Launch failed'}));
                    });

                    launch.on('error', (error) => {
                        console.log("ERROR: " + error);
                        res.end(JSON.stringify({status: 'error', data: error}));
                    });
                }
                else
                    res.end(JSON.stringify({status: 'error', data: 'Install failed'}));
            });

            install.on('error', (error) => {
                console.log("ERROR: " + error);
                res.end(JSON.stringify({status: 'error', data: error}));
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

    function searchForApk(dir) {
        var result = "";
        var files = fs.readdirSync(dir);

        for (var i = 0; i < files.length; i++) {
            var element = files[i];
            if (element.indexOf(".") === -1 && fs.statSync(dir + "/" + element).isDirectory()) {
                result = searchForApk(dir + "/" + element);
                if (result.length > 0)
                    return result;

                // This comparison is not good. Needs regex in future versions    
            } else if (element.indexOf('.apk') > -1 && element.indexOf("-debug") > -1 && element.indexOf("unaligned") === -1){
                console.log("FOUND IT " + dir + "/"+ element);
                result = dir + "/" + element;
                return result;
            }
        }
        return result;
    }


    app.listen(PORT, () => {
        console.log(`Console is listening at: ${PORT}`)
    });
};

