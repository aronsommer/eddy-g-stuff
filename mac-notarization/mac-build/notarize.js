require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.aronsommer.electronwebview',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: 'apple-id-developer',
    appleIdPassword: 'app-specific-password',
  });
};