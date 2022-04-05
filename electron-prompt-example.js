const prompt = require('electron-prompt');

prompt({
    title: 'Prompt example',
    label: 'URL:',
    value: 'http://example.org',
    inputAttrs: {
        type: 'url'
    },
    type: 'input'
})
.then((r) => {
    if(r === null) {
        console.log('user cancelled');
    } else {
        console.log('result', r);
    }
})
.catch(console.error);