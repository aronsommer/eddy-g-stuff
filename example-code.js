// Execute bash script
const exec = require("child_process").exec;
exec("/Users/aronsommer/Documents/Xcode-Projects/CocoaWebView/Resources/caddy-start", shellCallback);

// Execute bash script and than do something if finished
const child = require("child_process").exec(`${process.resourcesPath}/Bin/test`, shellCallback);
child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.on("exit", () => console.log("guguuus fertig"))
child.stdout.on('data', (data) => {
  // Here is the output
  data = data.toString();
  console.log(data);
});

// Callback
function shellCallback(error, stdout, stderr) {
  //console.log(error, stdout)
  console.log("error: " + error)
  console.log("stdout: " + stdout)
  console.log("stderr: " + stderr)
}

// Executing a Windows program

// https://ourcodeworld.com/articles/read/154/how-to-execute-an-exe-file-system-application-using-electron-framework

// Note that the filepath uses double slash (\\) as the slash is inverted we use double slash to escape a single slash (\) used in Windows platforms.

var child = require('child_process').execFile;
var executablePath = "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe";

child(executablePath, function(err, data) {
    if(err){
       console.error(err);
       return;
    }
 
    console.log(data.toString());
});

// Executing a Windows program with parameters

var child = require('child_process').execFile;
var executablePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
var parameters = ["--incognito"];

child(executablePath, parameters, function(err, data) {
     console.log(err)
     console.log(data.toString());
});