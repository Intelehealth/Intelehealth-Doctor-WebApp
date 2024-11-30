import { visitTypes } from "src/config/constant";
import * as moment from 'moment';

export function getCacheData(parse: boolean, key: string) {
  if (parse) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      return null
    }
  } else {
    return localStorage.getItem(key);
  }
}

export function setCacheData(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function deleteCacheData(key: string) {
  localStorage.removeItem(key);
}

export function isJsonString(str) {
  try {
    const json = JSON.parse(str);
    return (typeof json === 'object');
  } catch (e) {
    return false;
  }
}

export function getEncounterProviderUUID() {
  return getCacheData(true, visitTypes.VISIT_NOTE_PROVIDER).encounterProviders[0].provider.uuid;
}

export function getEncounterUUID() {
  return getCacheData(true, visitTypes.VISIT_NOTE_PROVIDER).uuid;
}

/**
  * Check how old the date is from now
  * @param {string} data - Date in string format
  * @return {string} - Returns how old the date is from now
  */
export function checkIfDateOldThanOneDay(data: string) {
  let hours = moment(data).diff(moment(), 'hours');
  let minutes = moment(data).diff(moment(), 'minutes');
  minutes = minutes - (hours * 60);
  let resString = "";
  if (hours >= 24) {
    resString = moment(data).format('DD MMM, YYYY hh:mm A');
  } else {
    if (hours > 1) {
      resString += hours + " Hours";
    } else if(hours === 1) {
      resString += hours + " Hour";
    }
    if (minutes < 0) {
      resString = `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`;
    } else if (minutes === 1){
      resString += " " + minutes + " Minute"
    } else {
      resString += " " + minutes + " Minutes"
    }
  }
  return resString.trim();
}
/**
  * Compare data for sorting
  * @param {number|string} a
  * @param {number|string} b
  * @param {boolean} isAsc
  * @return {number} - Returns order as 1 or -1
  */
export function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}