// How outsource menu
// Export menu in menu.js like this

const { app } = require('electron')
const isMac = process.platform === 'darwin'
const isWin = process.platform === 'win32'

module.exports = [
    // Menu here
]

// In main.js import menu like this

let menu = Menu.buildFromTemplate(require('./menu'))
Menu.setApplicationMenu(menu)

/////////////////////////////////////////////////////////

// How export function in main.js
exports.showDialogWithSettings = showDialogWithSettings;
// How import function in menu.js
const functions = require('./main.js')
// How use imported function
functions.showDialogWithSettings();

/////////////////////////////////////////////////////////

// How export function in main.js
module.exports = { showDialogWithSettings };
// How import function in menu.js
const { showDialogWithSettings } = require('./main.js')
// How use imported function
showDialogWithSettings();
