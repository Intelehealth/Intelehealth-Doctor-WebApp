export const environment = {
  production: true,
  base: `${window.location.protocol}//${window.location.host}`,
  baseURL: `${window.location.protocol}//${window.location.host}/openmrs/ws/rest/v1`,
  baseURLCoreApp: `${window.location.protocol}//${window.location.host}/openmrs/coreapps/diagnoses`,
  baseURLLegacy: `${window.location.protocol}//${window.location.host}/openmrs`,
  mindmapURL: `${window.location.protocol}//${window.location.hostname}:3004/api`,
  notificationURL: `${window.location.protocol}//${window.location.hostname}:3004/notification`,
  socketURL: `${window.location.protocol}//${window.location.hostname}:3004`,
  captchaSiteKey: "6LdlqHUnAAAAACqzNZV6ucCuLkrRo-cKF1jCkeoc",
  firebase: {
    /* apiKey: "AIzaSyC5cRqdDtLWwJpz7WY1Ekpx7rbawbG1CA8",
    authDomain: "intelehealth-3-0.firebaseapp.com",
    databaseURL: "https://intelehealth-3-0-default-rtdb.firebaseio.com",
    projectId: "intelehealth-3-0",
    storageBucket: "intelehealth-3-0.appspot.com",
    messagingSenderId: "781318396284",
    appId: "1:781318396284:web:69d37af4daa956a3df6cf9",
    measurementId: "G-68HCCL881X",*/
    apiKey: "AIzaSyDkU15rxve37d9hu_4y0lUNOfrUX6iSpUI",
    authDomain: "intelehealth-webapp.firebaseapp.com",
    projectId: "intelehealth-webapp",
    storageBucket: "intelehealth-webapp.appspot.com",
    messagingSenderId: "246647122371",
    appId: "1:246647122371:web:c45944219d1f37bf30b576",
  },
  webrtcSdkServerUrl: `${window.location.protocol}//${window.location.hostname}:9090`,
  webrtcTokenServerUrl: `${window.location.protocol}//${window.location.hostname}:3000/`,
  siteKey: "6LdlqHUnAAAAACqzNZV6ucCuLkrRo-cKF1jCkeoc",
  externalPrescriptionCred: 'c3lzbnVyc2U6TnVyc2UxMjM==',
  vapidPublicKey: "BANxSWzoJW3mjQn49eDQRKjtnXCt6F98Df9XrxfDsT71KYKE8LpcW67-OIt1v4lAlm4GWZwjS1OvQBjyJ6r8Z7A",
  authGatwayURL: `${window.location.protocol}//${window.location.hostname}:3030/v2/`,
  showCaptcha: false,
  recordsPerPage: 1000
};
