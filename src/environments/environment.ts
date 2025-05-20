// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  environmentName: 'Local',
apiUrl: 'http://localhost:52227/api/',
apiLoginUrl: 'https://unnati.microlabs.co.in/apilogin/api/',
 //apiUrl: 'https://unnatiapi.microlabs.co.in/api/api/',
// apiLoginUrl: 'http://192.168.1.136:90/api/api/',
// apiUrl: 'http://192.168.1.136:90/API/api/',
//apiUrl: 'https://unnati.microlabs.co.in/api/api/',
 // hrapiUrl: 'http://localhost:52227/api/',
//hrapiUrl: 'https://unnati.microlabs.co.in/hrapi/api/',
hrapiUrl: 'http://localhost:52217/api/',
 ITAMSUrl:'https://unnati.microlabs.co.in/amsapi/api/',
 WMTSUrl:'https://unnati.microlabs.co.in/WMTSUIAPI/api/',
 //WMTSUrl:'http://localhost:52220/api/',
//  WMTSUrl:'http://192.168.1.134:82/wmtsapi/api/',
 //DLSUrl:'http://192.168.1.134:82/dlsdev/api/',
 DLSUrl:'https://unnati.microlabs.co.in/dlsapi/api/',
 LAUrl:'https://unnati.microlabs.co.in/LAAPI/api/',
 HRUrl: 'http://192.168.1.134:86/api/api/'
};
 