const { app, Menu } = require('electron')
const isMac = process.platform === 'darwin'
const isWin = process.platform === 'win32'
const main = require('./main.js')

module.exports = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            {
                label: 'Show Current Settings', click() {
                    main.showDialogWithSettings();
                }
            },
            { type: 'separator' },
            {
                label: 'Restart Caddy Server', click() {
                    main.StartCaddy();
                }
            },
            {
                label: 'Set Caddy Server Port ...', click() {
                    main.setCaddyPort();
                }
            },
            { type: 'separator' },
            {
                label: 'Update Git Content', click() {
                    main.GitAction();
                }
            },
            {
                label: 'Set Git Repository URL ...', click() {
                    main.setGitRepository();
                }
            },
            {
                label: 'Set Git Repository Branch ...', click() {
                    main.setGitRepositoryBranch();
                }
            },
            {
                label: 'Set Git Action On Startup ...', click() {
                    main.setGitActionOnStartup();
                }
            },
            { type: 'separator' },
            {
                label: 'Load Local Content ...', click() {
                    main.showDialogToSelectFolder();
                }
            },
            // Menu item to completely disable sleep on Windows
            ...(isWin) ? [
                { type: 'separator' },
                {
                    label: 'Disable Sleep',
                    click() {
                        main.disableSleepWin();
                    },
                    accelerator: ''
                }] : [],
            // {
            //   label: 'ZIP Action', click() {
            //     if (process.platform != "win32") {
            //       console.log("ZIP Action on Mac or Linux");
            //       ZipAction();
            //     }
            //     if (process.platform == "win32") {
            //       console.log("ZIP Action on Windows");
            //       ZipActionWin();
            //     }
            //   }
            // },
            // {
            //   label: 'Get myCat', click() {
            //     localStorageGetMyCat();
            //   }
            // },
            { type: 'separator' },
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            ...(isMac ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                        { role: 'startSpeaking' },
                        { role: 'stopSpeaking' }
                    ]
                }
            ] : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ])
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
            // Menu item to hide menu bar on Linux and Windows
            ...(!isMac) ? [{
                label: 'Toggle Menu Bar',
                click() {
                    main.toggleMenuBar();
                },
                accelerator: 'Alt+M'
            }] : []
        ]
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ] : [
                { role: 'close' }
            ])
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://github.com/aronsommer/eddy-g')
                }
            }
        ]
    }
]

  // Example how to add menu item to menu template
  // if (isMac) {
  //   template[0]["submenu"].push({
  //     label: 'Menu Item',
  //     click() {
  //       console.log("Clicked Menu Item")
  //     },
  //     accelerator: 'Ctrl+Q'
  //   })
  // }