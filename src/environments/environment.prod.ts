export const environment = {
  production: true,
  base: `${window.location.protocol}//${window.location.host}`,
  baseURL: `${window.location.protocol}//${window.location.host}/openmrs/ws/rest/v1`,
  baseURLCoreApp: `${window.location.protocol}//${window.location.host}/openmrs/coreapps/diagnoses`,
  baseURLLegacy: `${window.location.protocol}//${window.location.host}/openmrs`,
  mindmapURL: `${window.location.protocol}//${window.location.hostname}:3004/api`,
  notificationURL: `${window.location.protocol}//${window.location.hostname}:3004/notification`,
  socketURL: `${window.location.protocol}//${window.location.hostname}:3004`,
  captchaSiteKey: "6LdUIXgjAAAAAJyQHOTzABeaNV0_LhKHtWULv63t",
  siteKey: "6LdUIXgjAAAAAJyQHOTzABeaNV0_LhKHtWULv63t",
  externalPrescriptionCred: 'c3lzbnVyc2U6TnVyc2UxMjM=='
};
