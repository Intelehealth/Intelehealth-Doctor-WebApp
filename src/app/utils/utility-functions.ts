import { languages, visitTypes } from "src/config/constant";
import * as moment from 'moment';
import { ProviderAttributeModel } from "../model/model";
import { DecimalPipe } from "@angular/common";

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

/**
* Get speciality
* @param {ProviderAttributeModel[]} attr - Array of provider attributes
* @return {string} - Speciality
*/
export function getSpecialization(attr: ProviderAttributeModel[] = []): string {
  let specialization = '';
  for (const a of attr) {
    if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
      specialization = a.value;
      break;
    }
  }
  return specialization;
}

/**
* Retrieve the appropriate language value from an element.
* @param {any} element - An object containing `lang` and `name`.
* @return {string} - The value in the selected language or the first available one.
* Defaults to `element.name` if no language value is found.
*/
interface ElementLang {
  [key: string]: string; // Represents language code to string mappings
}

interface Element {
  lang: ElementLang;
  name: string;
}

export function getFieldValueByLanguage(element: Element | null | undefined): string {
  const selectedLanguage = getCacheData(false, languages.SELECTED_LANGUAGE) as string;

  // Check if selected language exists in the lang object and is not empty
  if (element?.lang?.[selectedLanguage]?.trim()) {
    return element.lang[selectedLanguage].trim();
  }

  // Return the first non-empty language value
  for (const langValue of Object.values(element?.lang || {})) {
    if (langValue.trim()) {
      return langValue.trim();
    }
  }

  // Fallback to element.name if no valid language value found or element is invalid
  return element?.name || "";
}

export function calculateBMI(vitals: any, vitalObs: any, _locale: string = 'en') {
  const heightUUID = vitals?.find((v: any) => v.key === 'height_cm')?.uuid;
  const weightUUID = vitals?.find((v: any) => v.key === 'weight_kg')?.uuid;
  let height = null, weight = null;
  if(heightUUID && weightUUID) {
    height = vitalObs.find((e: { concept: { uuid: any; }; }) => e.concept.uuid === heightUUID)?.value;
    weight = vitalObs.find((e: { concept: { uuid: any; }; }) => e.concept.uuid === weightUUID)?.value;
  }
  if(height && weight) {
    const decimalPipe = new DecimalPipe(_locale)
    return decimalPipe.transform(weight / ((height/100) * (height/100)), "1.2-2")
  }  
  return null;
}