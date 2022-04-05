const { app, BrowserWindow, globalShortcut, Menu } = require('electron');
const path = require('path');

// Print current operating system platform
console.log(`This platform is ${process.platform}`);

// Block the system from entering low-power (sleep) mode
const { powerSaveBlocker } = require('electron');
const id = powerSaveBlocker.start('prevent-display-sleep');
console.log("powerSaveBlocker.isStarted: " + powerSaveBlocker.isStarted(id));
// powerSaveBlocker.stop(id);

// Path to resources directory (works only in builded app)
// ${process.resourcesPath}

// Path to the project's root folder
// ${__dirname}

// Path to the directory for storing your app's configuration files
// On macOS: ~/Library/Application Support/AppName
console.log("Path to userData: " + app.getPath('userData'));

// Running in development or production mode?
var productionMode = true;
// If launched with --dev flag switch do development mode
// Flag is set in start script in package.json
if (process.argv[2] == '--dev') {
  console.log("Running in development mode");
  productionMode = false;
  // When running in development mode on macOS copy mac binaries into binaries folder
  // This ensures that the path to the binaries folder is working when running in development mode
  if (process.platform == 'darwin') {
    const { exec } = require("child_process");
    exec('echo "pwd: " && pwd; echo "Copy mac binaries to binaries"; cp -r binaries/mac/* binaries', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }
}
var rootFolder = "path to root folder";
if (productionMode == true) {
  rootFolder = process.resourcesPath;
} else {
  rootFolder = __dirname;
}

let mainWindow;
let outputWindow;
const dialogKeyword = `#dialog!:-)`;
let canQuit = false;

// About Panel Options (macOS only)
app.setAboutPanelOptions({
  // applicationName: "Name", 
  // applicationVersion: "App Version",
  // version: "Version",
  // copyright: "Copyright",
  credits: "YO! Fabian Lüscher :-)",
});

function createWindow() {
  // Create the browser window.
  // const mainWindow = new BrowserWindow({
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: `${rootFolder}/icon.png`,
    // autoHideMenuBar: true,
    // title: "", // Remove title in title bar
    // frame: false,
    // titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Stop Caddy before closing window  
  mainWindow.on('close', async function (e) {
    if (canQuit == false) {
      canQuit = true;
      e.preventDefault();
      console.log("You want to quit the app");
      mainWindow.loadURL(`file://${__dirname}/loading.html`);
      StopCaddy(undefined);
      // Quit the app StopCaddy function
    }
    // displayDialog('I will stop Caddy before closing');
  });

  // Hide menu bar if entering fullscreen
  mainWindow.on('enter-full-screen', function (e) {
    console.log("Entering full screen, hide menu bar");
    mainWindow.setMenuBarVisibility(false);
  });

  // Show menu bar if leaving fullscreen
  mainWindow.on('leave-full-screen', function (e) {
    console.log("Leaving full screen, show menu bar");
    mainWindow.setMenuBarVisibility(true);
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file:///${rootFolder}/content/index.html`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  Startup();

  // Show menu bar at startup
  mainWindow.setMenuBarVisibility(true);
  // Register shortcut to toggle menu bar on Linux and Windows
  if (process.platform != "darwin") {
    const ret = globalShortcut.register('Alt+M', () => {
      console.log('Toggle menu bar');
      mainWindow.setMenuBarVisibility(!mainWindow.isMenuBarVisible());
    })
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/////////////////////////////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////////////////////////////

// Change rootFolder at the top of this script with productionMode boolean

// async prototype function
async function asyncPrototype() {

  let promise = new Promise((resolve, reject) => {
    // Mac and Linux /////////////////////////////
    if (process.platform != "win32") {
      resolve('Resolved on Mac or Linux')
    }
    // Windows ///////////////////////////////////
    else {
      resolve('Resolved on Windows')
    }
  });

  let result = await promise; // wait until the promise resolves (*)
  console.log(result);
  // Do stuff after resolved
}

async function Startup() {
  let menu = Menu.buildFromTemplate(require('./menu'));
  Menu.setApplicationMenu(menu);
  readSettings(); // read settings json file
  // writeSettings(); // write settings json file
  await StartCaddy();
  await showLocalhost();
  // Git action at startup
  console.log("gitActionOnStartup: " + settings.gitActionOnStartup);
  if (settings.gitActionOnStartup == true) {
    await GitAction();
  }
}

// SETTINGS
/////////////////////////////////////////////////////////////////////

let settings

// Read settings json function
function readSettings() {
  const fs = require('fs');
  const path = require('path');

  let rawdata = fs.readFileSync(path.resolve(rootFolder, 'settings.json'));
  // let settings = JSON.parse(rawdata);
  settings = JSON.parse(rawdata);
  console.log('Settings: ', settings);
}

// Write settings json function
function writeSettings() {
  const fs = require('fs');
  const path = require('path');

  let settings = {
    caddy_port: 2015,
    git_repo: 'https://github.com/user/repository.git',
    git_repo_branch: 'main',
    gitActionOnStartup: false,
  };

  fs.writeFileSync(path.resolve(rootFolder, 'settings.json'), JSON.stringify(settings));
}

// Write new settings json function
function writeNewSettings(setting1 = settings.caddy_port, setting2 = settings.git_repo, setting3 = settings.git_repo_branch, setting4 = settings.gitActionOnStartup) {
  // Read Json settings
  console.log('Settings before change: ');
  readSettings();
  // Write new Json settings
  const fs = require('fs');
  const path = require('path');

  let newSettings = {
    caddy_port: setting1,
    git_repo: setting2,
    git_repo_branch: setting3,
    gitActionOnStartup: setting4,
  };

  fs.writeFileSync(path.resolve(rootFolder, 'settings.json'), JSON.stringify(newSettings));
  // Read Json settings
  console.log('Settings after change: ');
  readSettings();
}

// Show dialog with current settings
function showDialogWithSettings() {
  readSettings();
  displayDialog('caddy_port: ' + settings.caddy_port + '\ngit_repo: ' + settings.git_repo + '\ngit_repo_branch: ' + settings.git_repo_branch + '\ngitActionOnStartup: ' + settings.gitActionOnStartup);
}

// CADDY SERVER
/////////////////////////////////////////////////////////////////////

// Start Caddy function
async function StartCaddy() {
  console.log("Start of StartCaddy function");

  let promise = new Promise((resolve, reject) => {
    // Mac and Linux /////////////////////////////
    if (process.platform != "win32") {
      const caddyAction = require("child_process").execFile(`${rootFolder}/binaries/caddy-start`, [settings.caddy_port]);
      // caddyAction.stdout.pipe(process.stdout)
      // caddyAction.stderr.pipe(process.stderr)
      caddyAction.stderr.on('data', (data) => {
        data = data.toString();
        console.log(data);
        const substring = `Caddy 2 serving static files on :${settings.caddy_port}`;
        if (data.includes(substring)) {
          resolve('Hooray the server is running on Mac or Linux');
        }
      });
    }
    // Windows ///////////////////////////////////
    else {
      const { spawn } = require('child_process');
      const bat = spawn('cmd.exe', ['/c', `${rootFolder}\\binaries\\caddy-start.bat`, settings.caddy_port]);

      bat.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      bat.stderr.on('data', (data) => {
        console.error(data.toString());
        const substring = `Caddy 2 serving static files on :${settings.caddy_port}`;
        if (data.includes(substring)) {
          resolve('Hooray the server is running on Windows');
        }
      });

      bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
      });
    }
  });

  let result = await promise; // wait until the promise resolves (*)
  console.log(result);
}

// Stop Caddy function
async function StopCaddy(port = settings.caddy_port) {
  console.log("Start of StopCaddy function");

  let promise = new Promise((resolve, reject) => {
    // Mac and Linux /////////////////////////////
    if (process.platform != "win32") {
      const caddyKillAction = require("child_process").execFile(`${rootFolder}/binaries/caddy-stop`, [port]);
      caddyKillAction.stdout.pipe(process.stdout)
      caddyKillAction.stderr.pipe(process.stderr)
      caddyKillAction.on("exit", () => resolve('Stopped Caddy on Mac or Linux'))
    }
    // Windows ///////////////////////////////////
    else {
      const { spawn } = require('child_process');
      const bat = spawn('cmd.exe', ['/c', `${rootFolder}\\binaries\\caddy-stop.bat`, port]);

      bat.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      bat.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
        resolve('Stopped Caddy on Windows')
      });
    }
  });

  let result = await promise; // wait until the promise resolves (*)
  console.log(result);
  // Quit if stopped on window close
  if (canQuit) {
    app.quit();
  }
}

// Set Caddy Server Port function
async function setCaddyPort() {
  const prompt = require('electron-prompt');

  prompt({
    title: 'Set Caddy Server Port',
    label: 'Caddy Server Port: (2015+)',
    value: settings.caddy_port,
    inputAttrs: {
      type: 'number'
    },
    type: 'input'
  })
    .then(async (r) => {
      if (r === null) {
        console.log('user cancelled');
      } else {
        console.log('result', r);
        // Read Json settings
        readSettings();
        var currentCaddyPort = settings.caddy_port;
        if (r < 2015) {
          displayDialog("Caddy Server Port must be 2015 or greater!")
        }
        else {
          // Write new Json settings
          writeNewSettings(r, undefined, undefined, undefined);
        }
        if (currentCaddyPort != settings.caddy_port) {
          console.log('Caddy port has changed');
          await StopCaddy(currentCaddyPort);
          await StartCaddy();

        } else {
          console.log('Caddy port has not changed');
        }
      }
    })
    .catch(console.error);
}

// GIT
/////////////////////////////////////////////////////////////////////

// Git action function
async function GitAction() {
  console.log("Start GitAction function");
  // Loading screen, load localhost in forceReloadWindow()
  mainWindow.loadURL(`file://${__dirname}/loading.html`);

  let promise = new Promise((resolve, reject) => {
    // Mac and Linux /////////////////////////////
    if (process.platform != "win32") {
      const gitAction = require("child_process").execFile(`${rootFolder}/binaries/git-action`, [settings.git_repo, settings.git_repo_branch]);
      gitAction.stdout.pipe(process.stdout)
      // gitAction.stderr.pipe(process.stderr)
      gitAction.stderr.on('data', (data) => {
        checkForCustomErrors(data);
      });
      gitAction.on("exit", (code) => {
        console.log("git-action exit code: " + code);
        resolve("Git action finished with exit code " + code)
      });
    }
    // Windows ///////////////////////////////////
    else {
      const { spawn } = require('child_process');
      const bat = spawn('cmd.exe', ['/c', `${rootFolder}\\binaries\\git-action.bat`, settings.git_repo, settings.git_repo_branch]);

      bat.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      bat.stderr.on('data', (data) => {
        console.error(data.toString());
        checkForCustomErrors(data);
      });

      bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
        resolve("Git action finished with exit code " + code)
      });
    }
  });

  let result = await promise; // wait until the promise resolves (*)
  console.log(result);
  forceReloadWindow();
}

// Remove git function
async function removeGit() {
  console.log("Start removeGit function");
  // Loading screen, load localhost in forceReloadWindow()
  mainWindow.loadURL(`file://${__dirname}/loading.html`);

  let promise = new Promise((resolve, reject) => {
    // Mac and Linux /////////////////////////////
    if (process.platform != "win32") {
      const removeGitAction = require("child_process").exec(`${rootFolder}/binaries/remove-git`);
      removeGitAction.stdout.pipe(process.stdout)
      removeGitAction.stderr.pipe(process.stderr)
      removeGitAction.on("exit", () => resolve("Removed git on Mac or Linux"))
    }
    // Windows ///////////////////////////////////
    else {
      const { spawn } = require('child_process');
      const bat = spawn('cmd.exe', ['/c', `${rootFolder}\\binaries\\remove-git.bat`]);

      bat.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      bat.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
        resolve("Removed git on Windows")
      });
    }
  });

  let result = await promise; // wait until the promise resolves (*)
  console.log(result);
  forceReloadWindow();
}

// Set Git Repository function
async function setGitRepository() {
  const prompt = require('electron-prompt');

  let r;
  try {
    r = await prompt({
      title: 'Set Git Repository URL',
      label: 'Git Repository URL:',
      value: settings.git_repo,
      inputAttrs: {
        type: 'text'
      },
      type: 'input'
    })
    if (r === null) {
      console.log('user cancelled');
    } else {
      console.log('result', r);
      // Read Json settings
      readSettings();
      var currentGitRepo = settings.git_repo;
      // Write new Json settings
      writeNewSettings(undefined, r, undefined, undefined);
      if (currentGitRepo != settings.git_repo) {
        console.log('Git repo has changed');
        await setGitRepositoryBranch();
        await removeGit();
        await GitAction();
      } else {
        console.log('Git repo has not changed');
      }
    }
  } catch (error) {
    console.error(error);
    return;
  }
}

// Set Git Repository Branch function
async function setGitRepositoryBranch() {
  const prompt = require('electron-prompt');

  let r;
  try {
    r = await prompt({
      title: 'Set Git Repository Branch',
      label: 'Git Repository Branch:',
      value: settings.git_repo_branch,
      inputAttrs: {
        type: 'text'
      },
      type: 'input'
    })
    if (r === null) {
      console.log('user cancelled');
    } else {
      console.log('result', r);
      // Read Json settings
      readSettings();
      var currentGitRepoBranch = settings.git_repo_branch;
      // Write new Json settings
      writeNewSettings(undefined, undefined, r, undefined);
      if (currentGitRepoBranch != settings.git_repo_branch) {
        console.log('Git repo branch has changed');
        await GitAction();
      } else {
        console.log('Git repo branch has not changed');
      }
    }
  } catch (error) {
    console.error(error);
    return;
  }
}

// Set Git Action On Startup function
function setGitActionOnStartup() {
  const prompt = require('electron-prompt');

  prompt({
    title: 'Set Git Action On Startup',
    label: 'Git Action On Startup:',
    value: settings.gitActionOnStartup.toString(),
    inputAttrs: {
      type: 'text'
    },
    type: 'input'
  })
    .then((r) => {
      if (r === null) {
        console.log('user cancelled');
      } else {
        console.log('result', r);
        // Read Json settings
        readSettings();
        // Write new Json settings
        writeNewSettings(undefined, undefined, undefined, r === "true");
      }
    })
    .catch(console.error);
}

// LOAD LOCAL CONTENT
/////////////////////////////////////////////////////////////////////

// Show dialog to select folder function
function showDialogToSelectFolder() {
  const { dialog } = require('electron')
  var folderPath = dialog.showOpenDialogSync(mainWindow, {
    properties: ['openDirectory']
  })
  console.log(folderPath);
  if (folderPath == undefined) {
    console.log("No folder was selected");
  } else {
    loadFolderContent(folderPath);
  }
}

// Load folder content function
async function loadFolderContent(folderPath) {

  let promise = new Promise((resolve, reject) => {
    // Mac and Linux /////////////////////////////
    if (process.platform != "win32") {
      const loadLocalContent = require("child_process").execFile(`${rootFolder}/binaries/load-local-content`, [folderPath]);
      loadLocalContent.stdout.pipe(process.stdout)
      loadLocalContent.stderr.pipe(process.stderr)
      loadLocalContent.on("exit", (code) => {
        if (code == 0) {
          resolve("Loaded folder content")
        }
        if (code == 1) {
          console.log("There was an error while loading local content");
        }
      });
    }
    // Windows ///////////////////////////////////
    else {
      const { spawn } = require('child_process');
      const bat = spawn('cmd.exe', ['/c', `${rootFolder}\\binaries\\load-local-content.bat`, folderPath]);

      bat.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      bat.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
        if (code == 0) {
          resolve("Loaded folder content")
        }
        if (code == 1) {
          console.log("There was an error while loading local content");
        }
      });
    }
  });

  let result = await promise; // wait until the promise resolves (*)
  console.log(result);

  forceReloadWindow();
  // Set gitActionOnStartup to false
  writeNewSettings(undefined, undefined, undefined, false);
}

// VARIOUS
/////////////////////////////////////////////////////////////////////

// Toggle menu bar function
function toggleMenuBar() {
  if (mainWindow.isMenuBarVisible()) {
    mainWindow.setMenuBarVisibility(false);
  }
}

// Show localhost function
async function showLocalhost() {
  console.log("Show localhost");
  mainWindow.loadURL(`http://127.0.0.1:${settings.caddy_port}/`);
}

// Sleep function
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Check for custom errors function
function checkForCustomErrors(data) {
  if (data.includes(dialogKeyword)) {
    console.log("Includes " + dialogKeyword);
    data = data.toString().replaceAll(dialogKeyword, '');
    console.log(data);
    displayDialog(data);
  }
}

// Display simple dialog function
function displayDialog(messageText) {
  const choice = require('electron').dialog.showMessageBoxSync(mainWindow, {
    buttons: ['OK'],
    message: messageText
  });
}

// Force reload window function
function forceReloadWindow() {
  mainWindow.reload();
  mainWindow.webContents.reloadIgnoringCache();
  mainWindow.loadURL(`http://127.0.0.1:${settings.caddy_port}/`);
  console.log("Reloaded window");
}

// Disable sleep Windows function
function disableSleepWin() {
  // On Windows Only...
  const { spawn } = require('child_process');
  const bat = spawn('cmd.exe', ['/c', `${rootFolder}\\binaries\\disable-sleep.bat`]);

  bat.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  bat.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  bat.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
    console.log("Disabled sleep completely")
  });
}

// ZIP action function
function ZipAction() {
  const zipAction = require("child_process").exec(`${rootFolder}/binaries/zip-action`);
  zipAction.stdout.pipe(process.stdout)
  zipAction.stderr.pipe(process.stderr)
  zipAction.on("exit", () => console.log("ZIP action finished"))
}

// ZIP action Windows function
function ZipActionWin() {
  // On Windows Only...
  const { spawn } = require('child_process');
  const bat = spawn('cmd.exe', ['/c', `${rootFolder}\\binaries\\zip-action.bat`]);

  bat.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  bat.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  bat.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
  });
}

// localStorage get my cat function
var myCat;

function localStorageGetMyCat() {
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("myCat");', true)
    .then(result => {
      console.log(result);
      myCat = result;
      displayDialog('myCat is called: ' + myCat);
    });
}

// OUTPUT WINDOW
/////////////////////////////////////////////////////////////////////

// Open output window like this:
// createOutputWindow();
// And send data to it like this:
// outputWindow.webContents.send('ping', 'whoooooooh!')

// Send all console messages to output window
// const originalConsoleLog = console.log.bind(console)
// console.log = (...args) => {
//   outputWindow.webContents.send('ping', args)
//   originalConsoleLog(...args);
// }

function createOutputWindow() {
  console.log("Open Output Window");
  outputWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  })
  outputWindow.loadURL(`file://${__dirname}/output.html`);
}

exports.showDialogWithSettings = showDialogWithSettings;
exports.StartCaddy = StartCaddy;
exports.setCaddyPort = setCaddyPort;
exports.GitAction = GitAction;
exports.setGitRepository = setGitRepository;
exports.setGitRepositoryBranch = setGitRepositoryBranch;
exports.setGitActionOnStartup = setGitActionOnStartup;
exports.showDialogToSelectFolder = showDialogToSelectFolder;
exports.disableSleepWin = disableSleepWin;
exports.toggleMenuBar = toggleMenuBar;
