// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base: "https://demoai.intelehealth.org",
  baseURL: "https://demoai.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://demoai.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://demoai.intelehealth.org/openmrs",
  mindmapURL: "https://demoai.intelehealth.org:3004/api",
  notificationURL: "https://demoai.intelehealth.org:3004/notification",
  socketURL: "https://demoai.intelehealth.org:3004",
  captchaSiteKey: "6LdowFQmAAAAADsQdI3gtUM88w4u5wV5uQLkvoSo",
  webrtcSdkServerUrl: "wss://demoai.intelehealth.org:9090",
  webrtcTokenServerUrl: "https://demoai.intelehealth.org:3000/",
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
  siteKey: "6LdowFQmAAAAADsQdI3gtUM88w4u5wV5uQLkvoSo",
  externalPrescriptionCred: 'c3lzbnVyc2U6TnVyc2UxMjM==',
  vapidPublicKey: "BANxSWzoJW3mjQn49eDQRKjtnXCt6F98Df9XrxfDsT71KYKE8LpcW67-OIt1v4lAlm4GWZwjS1OvQBjyJ6r8Z7A"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
