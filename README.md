
# Deliverable 2.1

This branch contains the modules directory for the OpenMRS Build for the Intelehealth application that is FHIR compliant, i.e. this modules directory contains v1.8 of the FHIR2 module, running on Core 2.4.3 Build 0ff0ed.  

## Activity 2.1.1: Defining the business cases, use cases and FHIR architecture aligned to OpenHIE

Documentation:

1. [Use Case Matrix](https://docs.google.com/spreadsheets/d/1zx0Ux3CAhX43dPW4-OEB0p-m492SkU0QR7kPFRSN4QA/edit?usp=sharing)
2. System Architecture  
![System Architecture](https://i.imgur.com/FvraejH.jpg)

## Activity 2.1.2: Porting of current IH solution to FHIR 

### Objective and desired outcome:
Ensure that the current release of the Intelehealth application can run on the desired instance of OpenMRS, i.e. Core 2.4.3 Build 0ff0ed running the FHIR2 module.

### Repository Links

Mobile App:
Repo - https://github.com/Intelehealth/intelehealth-fhw-mobileapp  
Branch - `fhir_development_master`

Web App Frontend:
Repo - https://github.com/Intelehealth/intelehealth-doctor-webapp  
Branch - `fhir_development_master`

Web App Backend:
Repo - https://github.com/Intelehealth/intelehealth-protocol-service  
Branch - `fhir_development_master`

### Plan of Attack and Testing Approach

- Lock development versions of all OpenMRS modules and supporting platform tools and databases. Please find the sheet [here](https://docs.google.com/spreadsheets/d/1hyu_fDsWyerPpa4FVG-xT4lBcfvWbqkpGDcxsBD-SRE/edit?usp=sharing)  
- Update dev instance of the Intelehealth application running on the mPower server, on a fresh database instance.  
- Ensure all mandatory modules of the OpenMRS Core required for Intelehealth are operational with v2.4.3, running on Intelehealth's database instance.  
- Identify dependencies/version issues for additional modules not compatible with v2.4.3. We have ensured that there are no such modules that are non-operational.  
- Following successful upgrade of the entire backend, i.e. OpenMRS Core, conduct end-to-end testing of both the doctor's portal and the mobile application. The test cases cover the basic business processes for both web and mobile:  
1. Patient registration from mobile app  
2. Record vitals and chief complaints from mobile app  
3. Send patient details to doctor's portal from mobile app  
4. View patient records on the doctor's portal  
5. Book patient appointment from mobile app  
6. Start a patient visit from the doctor's portal  
7. Share prescription with patient  

### FHIR2 Module Build on Intelehealth OpenMRS

1. Screenshot of OpenMRS Core 2.4.3 running FHIR2 Module v1.8.0 

![OpenMRS Build](https://i.imgur.com/FMmhbXh.png)

2. Example screenshot of FHIR resource endpoints(On the left), along with the corresponding response from OpenMRS. Screenshot shows a successful response against a patient registration (Shown by Status: 201 Created)

![FHIR2 Postman Collection](https://i.imgur.com/8MtYX62.png)  

### FHIR2 Implementation

A major component of this deliverable is the upgradation of OpenMRS Core within the Intelehealth backend to be FHIR compatible. This has been successfully achieved with OpenMRSCore 2.4.3 Build 0ff0ed.

The following FHIR resource endpoints have been tested:  

1. Fetch patient: **GET**
2. Fetch encounter: **GET**
3. Fetch observation: **GET**
4. Save patient: **POST**
5. Save encounter: **POST**
6. Save observation: **POST**
7. Update patient: **PUT**


Additionally, the FHIR resources and endpoints that have been tested, along with the response payloads are provided:  

1. **[GET]** FHIR Patient
URL
```
https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Person?_id=fec558a3-0ef4-41e2-8e69-cd9669d5a1b5
```

Response Payload
```
{
    "resourceType": "Bundle",
    "id": "e4d22ab4-ba17-4e1d-a7ab-9b85a4669808",
    "meta": {
        "lastUpdated": "2024-06-11T15:54:52.840+06:00"
    },
    "type": "searchset",
    "total": 1,
    "link": [
        {
            "relation": "self",
            "url": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Person?_id=fec558a3-0ef4-41e2-8e69-cd9669d5a1b5"
        }
    ],
    "entry": [
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Person/fec558a3-0ef4-41e2-8e69-cd9669d5a1b5",
            "resource": {
                "resourceType": "Person",
                "id": "fec558a3-0ef4-41e2-8e69-cd9669d5a1b5",
                "meta": {
                    "lastUpdated": "2019-07-22T08:56:31.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>fec558a3-0ef4-41e2-8e69-cd9669d5a1b5</td></tr><tr><td>Name:</td><td> Low Test <b>A1 </b></td></tr><tr><td>Gender:</td><td>MALE</td></tr><tr><td>Birth Date:</td><td>22/07/2019</td></tr><tr><td>Address:</td><td><span>Karwar </span><span>Odisha </span><span>India </span></td></tr><tr><td>Telecom:</td><td/></tr><tr><td>Active:</td><td>true</td></tr></tbody></table></div>"
                },
                "name": [
                    {
                        "id": "03adf3c5-79d5-4f2e-9f1d-1c7c0a16048b",
                        "family": "A1",
                        "given": [
                            "Low",
                            "Test"
                        ]
                    }
                ],
                "gender": "male",
                "birthDate": "2019-07-22",
                "address": [
                    {
                        "id": "e30850c3-1469-425c-9512-aeac01aa31d7",
                        "extension": [
                            {
                                "url": "http://fhir.openmrs.org/ext/address",
                                "extension": [
                                    {
                                        "url": "http://fhir.openmrs.org/ext/address#address1",
                                        "valueString": "A1"
                                    },
                                    {
                                        "url": "http://fhir.openmrs.org/ext/address#address2",
                                        "valueString": "À2"
                                    }
                                ]
                            }
                        ],
                        "use": "home",
                        "city": "Karwar",
                        "state": "Odisha",
                        "postalCode": "421004",
                        "country": "India"
                    }
                ],
                "active": true
            }
        }
    ]
}
```
2. **[GET]** FHIR Observation:
 URL
```
https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation?patient=87b98039-3b27-440c-9530-bba5abe65ced
```

Response Payload
```
{
    "resourceType": "Bundle",
    "id": "7dc27f43-49fd-4ed2-949a-f35c9370c470",
    "meta": {
        "lastUpdated": "2024-06-11T15:56:44.063+06:00"
    },
    "type": "searchset",
    "total": 8,
    "link": [
        {
            "relation": "self",
            "url": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation?patient=87b98039-3b27-440c-9530-bba5abe65ced"
        }
    ],
    "entry": [
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation/63cc217e-eaeb-4a58-a648-fde9c7428e74",
            "resource": {
                "resourceType": "Observation",
                "id": "63cc217e-eaeb-4a58-a648-fde9c7428e74",
                "meta": {
                    "lastUpdated": "2024-02-19T13:05:19.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>63cc217e-eaeb-4a58-a648-fde9c7428e74</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td>SYSTOLIC BLOOD PRESSURE</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c77dc008-91b8-4db7-8081-43344aa49e15\">Encounter/c77dc008-91b8-4db7-8081-43344aa49e15</a></td></tr><tr><td>Effective:</td><td> 19 February 2024 13:05:14 </td></tr><tr><td>Issued:</td><td>19/02/2024 01:05:19 PM</td></tr><tr><td>Value:</td><td>100.0 mmHg </td></tr><tr><td>Reference Ranges:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>"
                },
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "exam",
                                "display": "Exam"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "code": "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "display": "SYSTOLIC BLOOD PRESSURE"
                        },
                        {
                            "system": "https://openconceptlab.org/orgs/CIEL/sources/CIEL",
                            "code": "5085",
                            "display": "SYSTOLIC BLOOD PRESSURE"
                        },
                        {
                            "system": "http://loinc.org",
                            "code": "53665-6",
                            "display": "SYSTOLIC BLOOD PRESSURE"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "271649006",
                            "display": "SYSTOLIC BLOOD PRESSURE"
                        }
                    ],
                    "text": "SYSTOLIC BLOOD PRESSURE"
                },
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "encounter": {
                    "reference": "Encounter/c77dc008-91b8-4db7-8081-43344aa49e15",
                    "type": "Encounter"
                },
                "effectiveDateTime": "2024-02-19T13:05:14+06:00",
                "issued": "2024-02-19T13:05:19.000+06:00",
                "valueQuantity": {
                    "value": 100.0,
                    "unit": "mmHg",
                    "system": "http://unitsofmeasure.org",
                    "code": "mmHg"
                },
                "referenceRange": [
                    {
                        "low": {
                            "value": 0.0
                        },
                        "high": {
                            "value": 250.0
                        },
                        "type": {
                            "coding": [
                                {
                                    "system": "http://fhir.openmrs.org/ext/obs/reference-range",
                                    "code": "absolute"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation/a8ecf1b2-c523-481e-9940-79e013371903",
            "resource": {
                "resourceType": "Observation",
                "id": "a8ecf1b2-c523-481e-9940-79e013371903",
                "meta": {
                    "lastUpdated": "2024-02-19T13:05:19.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>a8ecf1b2-c523-481e-9940-79e013371903</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td>Weight (kg)</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c77dc008-91b8-4db7-8081-43344aa49e15\">Encounter/c77dc008-91b8-4db7-8081-43344aa49e15</a></td></tr><tr><td>Effective:</td><td> 19 February 2024 13:05:14 </td></tr><tr><td>Issued:</td><td>19/02/2024 01:05:19 PM</td></tr><tr><td>Value:</td><td>12.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>"
                },
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "exam",
                                "display": "Exam"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "code": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "display": "Weight (kg)"
                        },
                        {
                            "system": "https://openconceptlab.org/orgs/CIEL/sources/CIEL",
                            "code": "5089",
                            "display": "Weight (kg)"
                        },
                        {
                            "system": "http://loinc.org",
                            "code": "3141-9",
                            "display": "Weight (kg)"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "27113001",
                            "display": "Weight (kg)"
                        }
                    ],
                    "text": "Weight (kg)"
                },
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "encounter": {
                    "reference": "Encounter/c77dc008-91b8-4db7-8081-43344aa49e15",
                    "type": "Encounter"
                },
                "effectiveDateTime": "2024-02-19T13:05:14+06:00",
                "issued": "2024-02-19T13:05:19.000+06:00",
                "valueQuantity": {
                    "value": 12.0,
                    "unit": "kg",
                    "system": "http://unitsofmeasure.org",
                    "code": "kg"
                },
                "referenceRange": [
                    {
                        "low": {
                            "value": 0.0
                        },
                        "high": {
                            "value": 250.0
                        },
                        "type": {
                            "coding": [
                                {
                                    "system": "http://fhir.openmrs.org/ext/obs/reference-range",
                                    "code": "absolute"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation/b0a1a943-b316-4988-a0a6-4fa064b00124",
            "resource": {
                "resourceType": "Observation",
                "id": "b0a1a943-b316-4988-a0a6-4fa064b00124",
                "meta": {
                    "lastUpdated": "2024-02-19T13:05:19.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>b0a1a943-b316-4988-a0a6-4fa064b00124</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td>Height (cm)</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c77dc008-91b8-4db7-8081-43344aa49e15\">Encounter/c77dc008-91b8-4db7-8081-43344aa49e15</a></td></tr><tr><td>Effective:</td><td> 19 February 2024 13:05:14 </td></tr><tr><td>Issued:</td><td>19/02/2024 01:05:19 PM</td></tr><tr><td>Value:</td><td>12.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>"
                },
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "exam",
                                "display": "Exam"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "code": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "display": "Height (cm)"
                        },
                        {
                            "system": "https://openconceptlab.org/orgs/CIEL/sources/CIEL",
                            "code": "5090",
                            "display": "Height (cm)"
                        },
                        {
                            "system": "http://loinc.org",
                            "code": "8302-2",
                            "display": "Height (cm)"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "50373000",
                            "display": "Height (cm)"
                        }
                    ],
                    "text": "Height (cm)"
                },
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "encounter": {
                    "reference": "Encounter/c77dc008-91b8-4db7-8081-43344aa49e15",
                    "type": "Encounter"
                },
                "effectiveDateTime": "2024-02-19T13:05:14+06:00",
                "issued": "2024-02-19T13:05:19.000+06:00",
                "valueQuantity": {
                    "value": 12.0,
                    "unit": "cm",
                    "system": "http://unitsofmeasure.org",
                    "code": "cm"
                },
                "referenceRange": [
                    {
                        "low": {
                            "value": 10.0
                        },
                        "high": {
                            "value": 272.0
                        },
                        "type": {
                            "coding": [
                                {
                                    "system": "http://fhir.openmrs.org/ext/obs/reference-range",
                                    "code": "absolute"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation/c2c3542a-3268-4c35-9beb-40873d52e740",
            "resource": {
                "resourceType": "Observation",
                "id": "c2c3542a-3268-4c35-9beb-40873d52e740",
                "meta": {
                    "lastUpdated": "2024-02-19T13:05:19.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>c2c3542a-3268-4c35-9beb-40873d52e740</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td>Diastolic</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c77dc008-91b8-4db7-8081-43344aa49e15\">Encounter/c77dc008-91b8-4db7-8081-43344aa49e15</a></td></tr><tr><td>Effective:</td><td> 19 February 2024 13:05:14 </td></tr><tr><td>Issued:</td><td>19/02/2024 01:05:19 PM</td></tr><tr><td>Value:</td><td>100.0 mmHg </td></tr><tr><td>Reference Ranges:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>150.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>"
                },
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "exam",
                                "display": "Exam"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "code": "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "display": "Diastolic"
                        },
                        {
                            "system": "https://openconceptlab.org/orgs/CIEL/sources/CIEL",
                            "code": "5086",
                            "display": "Diastolic"
                        },
                        {
                            "system": "http://loinc.org",
                            "code": "35094-2",
                            "display": "Diastolic"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "271650006",
                            "display": "Diastolic"
                        }
                    ],
                    "text": "Diastolic"
                },
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "encounter": {
                    "reference": "Encounter/c77dc008-91b8-4db7-8081-43344aa49e15",
                    "type": "Encounter"
                },
                "effectiveDateTime": "2024-02-19T13:05:14+06:00",
                "issued": "2024-02-19T13:05:19.000+06:00",
                "valueQuantity": {
                    "value": 100.0,
                    "unit": "mmHg",
                    "system": "http://unitsofmeasure.org",
                    "code": "mmHg"
                },
                "referenceRange": [
                    {
                        "low": {
                            "value": 0.0
                        },
                        "high": {
                            "value": 150.0
                        },
                        "type": {
                            "coding": [
                                {
                                    "system": "http://fhir.openmrs.org/ext/obs/reference-range",
                                    "code": "absolute"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation/f8cc1049-a219-4c2d-a1b5-8b18b768fb95",
            "resource": {
                "resourceType": "Observation",
                "id": "f8cc1049-a219-4c2d-a1b5-8b18b768fb95",
                "meta": {
                    "lastUpdated": "2024-02-19T13:05:19.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>f8cc1049-a219-4c2d-a1b5-8b18b768fb95</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>BLOOD OXYGEN SATURATION</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c77dc008-91b8-4db7-8081-43344aa49e15\">Encounter/c77dc008-91b8-4db7-8081-43344aa49e15</a></td></tr><tr><td>Effective:</td><td> 19 February 2024 13:05:14 </td></tr><tr><td>Issued:</td><td>19/02/2024 01:05:19 PM</td></tr><tr><td>Value:</td><td>54.0 % </td></tr><tr><td>Reference Ranges:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>100.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>"
                },
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "laboratory",
                                "display": "Laboratory"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "code": "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "display": "BLOOD OXYGEN SATURATION"
                        },
                        {
                            "system": "https://openconceptlab.org/orgs/CIEL/sources/CIEL",
                            "code": "5092",
                            "display": "BLOOD OXYGEN SATURATION"
                        },
                        {
                            "system": "http://loinc.org",
                            "code": "59408-5",
                            "display": "BLOOD OXYGEN SATURATION"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "431314004",
                            "display": "BLOOD OXYGEN SATURATION"
                        }
                    ],
                    "text": "BLOOD OXYGEN SATURATION"
                },
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "encounter": {
                    "reference": "Encounter/c77dc008-91b8-4db7-8081-43344aa49e15",
                    "type": "Encounter"
                },
                "effectiveDateTime": "2024-02-19T13:05:14+06:00",
                "issued": "2024-02-19T13:05:19.000+06:00",
                "valueQuantity": {
                    "value": 54.0,
                    "unit": "%",
                    "system": "http://unitsofmeasure.org",
                    "code": "%"
                },
                "referenceRange": [
                    {
                        "low": {
                            "value": 0.0
                        },
                        "high": {
                            "value": 100.0
                        },
                        "type": {
                            "coding": [
                                {
                                    "system": "http://fhir.openmrs.org/ext/obs/reference-range",
                                    "code": "absolute"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation/dd254605-6a44-41e9-949c-479742bd1d8b",
            "resource": {
                "resourceType": "Observation",
                "id": "dd254605-6a44-41e9-949c-479742bd1d8b",
                "meta": {
                    "lastUpdated": "2024-02-19T13:14:57.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>dd254605-6a44-41e9-949c-479742bd1d8b</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Code:</td><td>PHYSICAL EXAMINATION</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31\">Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31</a></td></tr><tr><td>Effective:</td><td> 19 February 2024 13:05:36 </td></tr><tr><td>Issued:</td><td>19/02/2024 01:14:57 PM</td></tr><tr><td>Value:</td><td>&lt;b&gt;General exams: &lt;/b&gt;&lt;br/&gt;• This is a tele-consultation. Hence no physical exams done. . &lt;br/&gt;• Eyes: Jaundice-no jaundice seen. &lt;br/&gt;• Eyes: Pallor-normal pallor. &lt;br/&gt;• Arm-Pinch skin* - pinch test normal. &lt;br/&gt;• Nail abnormality-nails normal. &lt;br/&gt;• Nail anemia-Nails are normal. &lt;br/&gt;• Ankle-no pedal oedema. &lt;br/&gt;&lt;b&gt;Abdomen: &lt;/b&gt;&lt;br/&gt;• no distension. &lt;br/&gt;• no scarring. &lt;br/&gt;• no tenderness. &lt;br/&gt;• Lumps-no lumps.</td></tr></tbody></table></div>"
                },
                "status": "final",
                "code": {
                    "coding": [
                        {
                            "code": "e1761e85-9b50-48ae-8c4d-e6b7eeeba084",
                            "display": "PHYSICAL EXAMINATION"
                        }
                    ],
                    "text": "PHYSICAL EXAMINATION"
                },
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "encounter": {
                    "reference": "Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31",
                    "type": "Encounter"
                },
                "effectiveDateTime": "2024-02-19T13:05:36+06:00",
                "issued": "2024-02-19T13:14:57.000+06:00",
                "valueString": "<b>General exams: </b><br/>•  This is a tele-consultation.  Hence no physical exams done. . <br/>• Eyes: Jaundice-no jaundice seen. <br/>• Eyes: Pallor-normal pallor. <br/>• Arm-Pinch skin* - pinch test normal. <br/>• Nail abnormality-nails normal. <br/>• Nail anemia-Nails are normal. <br/>• Ankle-no pedal oedema. <br/><b>Abdomen: </b><br/>•  no distension. <br/>•  no scarring. <br/>•  no tenderness. <br/>• Lumps-no lumps."
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation/0663d687-6674-421a-8b28-a41239ea883d",
            "resource": {
                "resourceType": "Observation",
                "id": "0663d687-6674-421a-8b28-a41239ea883d",
                "meta": {
                    "lastUpdated": "2024-02-19T13:14:57.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>0663d687-6674-421a-8b28-a41239ea883d</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Code:</td><td>MEDICAL HISTORY</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31\">Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31</a></td></tr><tr><td>Effective:</td><td> 19 February 2024 13:05:36 </td></tr><tr><td>Issued:</td><td>19/02/2024 01:14:57 PM</td></tr><tr><td>Value:</td><td>• Current Vaccinations status - Incomplete.&lt;br/&gt;• Pregnancy status - Not pregnant.&lt;br/&gt;• Medical History - Accident&lt;br/&gt;• Drug history - No recent medication.&lt;br/&gt;• Allergies - Question not answered, No known allergies.&lt;br/&gt;• Chewing tobacco status - Do not Chew/denied answer.&lt;br/&gt;• Smoking history - Patient denied/has no h/o smoking.&lt;br/&gt;</td></tr></tbody></table></div>"
                },
                "status": "final",
                "code": {
                    "coding": [
                        {
                            "code": "62bff84b-795a-45ad-aae1-80e7f5163a82",
                            "display": "MEDICAL HISTORY"
                        }
                    ],
                    "text": "MEDICAL HISTORY"
                },
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "encounter": {
                    "reference": "Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31",
                    "type": "Encounter"
                },
                "effectiveDateTime": "2024-02-19T13:05:36+06:00",
                "issued": "2024-02-19T13:14:57.000+06:00",
                "valueString": "• Current Vaccinations status - Incomplete.<br/>• Pregnancy status - Not pregnant.<br/>• Medical History - Accident<br/>• Drug history - No recent medication.<br/>• Allergies - Question not answered, No known allergies.<br/>• Chewing tobacco status - Do not Chew/denied answer.<br/>• Smoking history - Patient denied/has no h/o smoking.<br/>"
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation/474ae752-d48b-45af-a222-76ab21b3ff7e",
            "resource": {
                "resourceType": "Observation",
                "id": "474ae752-d48b-45af-a222-76ab21b3ff7e",
                "meta": {
                    "lastUpdated": "2024-02-19T13:14:57.000+06:00"
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>474ae752-d48b-45af-a222-76ab21b3ff7e</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Code:</td><td>CURRENT COMPLAINT</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31\">Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31</a></td></tr><tr><td>Effective:</td><td> 19 February 2024 13:05:36 </td></tr><tr><td>Issued:</td><td>19/02/2024 01:14:57 PM</td></tr><tr><td>Value:</td><td>►&lt;b&gt;Abdominal Pain&lt;/b&gt;: &lt;br/&gt;• Site - Upper (R) - Right Hypochondrium, Upper (C) - Epigastric.&lt;br/&gt;• Pain does not radiate.&lt;br/&gt;• 2 Hours.&lt;br/&gt;• Onset - Gradual.&lt;br/&gt;• Timing - Morning.&lt;br/&gt;• Character of the pain* - Constant.&lt;br/&gt;• Severity - Mild, 1-3.&lt;br/&gt;• Exacerbating Factors - Hunger.&lt;br/&gt;• Relieving Factors - gh.&lt;br/&gt;• Prior treatment sought - None.&lt;br/&gt;• Additional information - gh.&lt;br/&gt; ►&lt;b&gt;Associated symptoms&lt;/b&gt;: &lt;br/&gt;• Patient reports -&lt;br/&gt; Nausea, Anorexia, Abdominal distention/Bloating&lt;br/&gt; </td></tr></tbody></table></div>"
                },
                "status": "final",
                "code": {
                    "coding": [
                        {
                            "code": "3edb0e09-9135-481e-b8f0-07a26fa9a5ce",
                            "display": "CURRENT COMPLAINT"
                        }
                    ],
                    "text": "CURRENT COMPLAINT"
                },
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "encounter": {
                    "reference": "Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31",
                    "type": "Encounter"
                },
                "effectiveDateTime": "2024-02-19T13:05:36+06:00",
                "issued": "2024-02-19T13:14:57.000+06:00",
                "valueString": "►<b>Abdominal Pain</b>: <br/>• Site - Upper (R) - Right Hypochondrium, Upper (C) - Epigastric.<br/>• Pain does not radiate.<br/>• 2 Hours.<br/>• Onset - Gradual.<br/>• Timing - Morning.<br/>• Character of the pain* - Constant.<br/>• Severity - Mild, 1-3.<br/>• Exacerbating Factors - Hunger.<br/>• Relieving Factors - gh.<br/>• Prior treatment sought - None.<br/>• Additional information - gh.<br/> ►<b>Associated symptoms</b>: <br/>• Patient reports -<br/> Nausea,  Anorexia,  Abdominal distention/Bloating<br/> "
            }
        }
    ]
}
```
3. **[GET]** FHIR Encounter:
URL
```
https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Encounter?patient=87b98039-3b27-440c-9530-bba5abe65ced
```
Response Payload:
```
{
    "resourceType": "Bundle",
    "id": "f5fe035c-1d2a-4923-8807-cca14bb98f0f",
    "meta": {
        "lastUpdated": "2024-06-11T15:57:22.721+06:00"
    },
    "type": "searchset",
    "total": 3,
    "link": [
        {
            "relation": "self",
            "url": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Encounter?patient=87b98039-3b27-440c-9530-bba5abe65ced"
        }
    ],
    "entry": [
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Encounter/af20a890-0d9b-42b6-a3f3-1cf190b36cc3",
            "resource": {
                "resourceType": "Encounter",
                "id": "af20a890-0d9b-42b6-a3f3-1cf190b36cc3",
                "meta": {
                    "tag": [
                        {
                            "system": "http://fhir.openmrs.org/ext/encounter-tag",
                            "code": "visit",
                            "display": "Visit"
                        }
                    ]
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>af20a890-0d9b-42b6-a3f3-1cf190b36cc3</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> Telemedicine </td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Period:</td><td>2024-02-19 13:05:14.0 - ?</td></tr><tr><td>Location:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Location/ad172ddc-1f2e-4078-820d-2bb10a1c262e\">Telemedicine Clinic 2</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>"
                },
                "status": "unknown",
                "class": {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    "code": "AMB"
                },
                "type": [
                    {
                        "coding": [
                            {
                                "system": "http://fhir.openmrs.org/code-system/visit-type",
                                "code": "a86ac96e-2e07-47a7-8e72-8216a1a75bfd",
                                "display": "Telemedicine"
                            }
                        ]
                    }
                ],
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "period": {
                    "start": "2024-02-19T13:05:14+06:00"
                },
                "location": [
                    {
                        "location": {
                            "reference": "Location/ad172ddc-1f2e-4078-820d-2bb10a1c262e",
                            "type": "Location",
                            "display": "Telemedicine Clinic 2"
                        }
                    }
                ]
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Encounter/c77dc008-91b8-4db7-8081-43344aa49e15",
            "resource": {
                "resourceType": "Encounter",
                "id": "c77dc008-91b8-4db7-8081-43344aa49e15",
                "meta": {
                    "lastUpdated": "2024-02-19T13:05:19.000+06:00",
                    "tag": [
                        {
                            "system": "http://fhir.openmrs.org/ext/encounter-tag",
                            "code": "encounter",
                            "display": "Encounter"
                        }
                    ]
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>c77dc008-91b8-4db7-8081-43344aa49e15</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> Vitals </td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Participants:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/612322d6-8b80-4027-af3a-c2805bd32007\">Jane Test Smith (Identifier: nurse)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2024-02-19 13:05:14.0 - ?</td></tr><tr><td>Location:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Location/ad172ddc-1f2e-4078-820d-2bb10a1c262e\">Telemedicine Clinic 2</a></td><td/><td/><td/></tr></tbody></table></td></tr><tr><td>Part Of:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/af20a890-0d9b-42b6-a3f3-1cf190b36cc3\">Encounter/af20a890-0d9b-42b6-a3f3-1cf190b36cc3</a></td></tr></tbody></table></div>"
                },
                "status": "unknown",
                "class": {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    "code": "AMB"
                },
                "type": [
                    {
                        "coding": [
                            {
                                "system": "http://fhir.openmrs.org/code-system/encounter-type",
                                "code": "67a71486-1a54-468f-ac3e-7091a9a79584",
                                "display": "Vitals"
                            }
                        ]
                    }
                ],
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "participant": [
                    {
                        "individual": {
                            "reference": "Practitioner/612322d6-8b80-4027-af3a-c2805bd32007",
                            "type": "Practitioner",
                            "identifier": {
                                "value": "nurse"
                            },
                            "display": "Jane Test Smith (Identifier: nurse)"
                        }
                    }
                ],
                "period": {
                    "start": "2024-02-19T13:05:14+06:00"
                },
                "location": [
                    {
                        "location": {
                            "reference": "Location/ad172ddc-1f2e-4078-820d-2bb10a1c262e",
                            "type": "Location",
                            "display": "Telemedicine Clinic 2"
                        }
                    }
                ],
                "partOf": {
                    "reference": "Encounter/af20a890-0d9b-42b6-a3f3-1cf190b36cc3",
                    "type": "Encounter"
                }
            }
        },
        {
            "fullUrl": "https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Encounter/9c120aa8-ce90-40e7-83ee-135ffc590c31",
            "resource": {
                "resourceType": "Encounter",
                "id": "9c120aa8-ce90-40e7-83ee-135ffc590c31",
                "meta": {
                    "lastUpdated": "2024-02-19T13:14:57.000+06:00",
                    "tag": [
                        {
                            "system": "http://fhir.openmrs.org/ext/encounter-tag",
                            "code": "encounter",
                            "display": "Encounter"
                        }
                    ]
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>9c120aa8-ce90-40e7-83ee-135ffc590c31</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> ADULTINITIAL </td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/87b98039-3b27-440c-9530-bba5abe65ced\">Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)</a></td></tr><tr><td>Participants:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/612322d6-8b80-4027-af3a-c2805bd32007\">Jane Test Smith (Identifier: nurse)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2024-02-19 13:05:36.0 - ?</td></tr><tr><td>Location:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Location/ad172ddc-1f2e-4078-820d-2bb10a1c262e\">Telemedicine Clinic 2</a></td><td/><td/><td/></tr></tbody></table></td></tr><tr><td>Part Of:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/af20a890-0d9b-42b6-a3f3-1cf190b36cc3\">Encounter/af20a890-0d9b-42b6-a3f3-1cf190b36cc3</a></td></tr></tbody></table></div>"
                },
                "status": "unknown",
                "class": {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    "code": "AMB"
                },
                "type": [
                    {
                        "coding": [
                            {
                                "system": "http://fhir.openmrs.org/code-system/encounter-type",
                                "code": "8d5b27bc-c2cc-11de-8d13-0010c6dffd0f",
                                "display": "ADULTINITIAL"
                            }
                        ]
                    }
                ],
                "subject": {
                    "reference": "Patient/87b98039-3b27-440c-9530-bba5abe65ced",
                    "type": "Patient",
                    "display": "Pro Kumar Sarker (OpenMRS ID: 13WVJ-5)"
                },
                "participant": [
                    {
                        "individual": {
                            "reference": "Practitioner/612322d6-8b80-4027-af3a-c2805bd32007",
                            "type": "Practitioner",
                            "identifier": {
                                "value": "nurse"
                            },
                            "display": "Jane Test Smith (Identifier: nurse)"
                        }
                    }
                ],
                "period": {
                    "start": "2024-02-19T13:05:36+06:00"
                },
                "location": [
                    {
                        "location": {
                            "reference": "Location/ad172ddc-1f2e-4078-820d-2bb10a1c262e",
                            "type": "Location",
                            "display": "Telemedicine Clinic 2"
                        }
                    }
                ],
                "partOf": {
                    "reference": "Encounter/af20a890-0d9b-42b6-a3f3-1cf190b36cc3",
                    "type": "Encounter"
                }
            }
        }
    ]
}
```
4. **[POST]** FHIR Patient:
URL
```
https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Patient
```
Request Body
```
{
  "resourceType": "Patient",
  "identifier": {
    "extension": [{
      "url": "http://fhir.openmrs.org/ext/patient/identifier#location",
      "valueReference": {
        "reference": "Location/8d6c993e-c2cc-11de-8d13-0010c6dffd0f",
        "type": "Location"
      }
    }],
    "use": "official",
    "type": {
      "text": "Test"
    },
    "value": "4444-10"
  },
  "name": [
    {
      "given": [
        "Jahan"
      ],
      "family": "Doe"
    }
  ],
  "gender": "male",
  "birthDate": "2004-08-12",
  "address": [
    {
      "state": "Mukono",
      "city": "Kampala",
      "country": "Uganda"
    }
  ]
}
```
Response Payload
```
{
    "resourceType": "Patient",
    "id": "c7ae0726-b6a0-4209-8604-8f7e4ead9c76",
    "meta": {
        "lastUpdated": "2024-06-11T16:05:31.000+06:00"
    },
    "text": {
        "status": "generated",
        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>c7ae0726-b6a0-4209-8604-8f7e4ead9c76</td></tr><tr><td>Identifier:</td><td><div>4444-10</div></td></tr><tr><td>Active:</td><td>true</td></tr><tr><td>Name:</td><td> Jahan <b>DOE </b></td></tr><tr><td>Gender:</td><td>MALE</td></tr><tr><td>Birth Date:</td><td>12/08/2004</td></tr><tr><td>Deceased:</td><td>false</td></tr><tr><td>Address:</td><td><span>Kampala </span><span>Mukono </span><span>Uganda </span></td></tr></tbody></table></div>"
    },
    "identifier": [
        {
            "id": "3a48058f-50f3-4ef3-8272-fe332e92aa83",
            "extension": [
                {
                    "url": "http://fhir.openmrs.org/ext/patient/identifier#location",
                    "valueReference": {
                        "reference": "Location/8d6c993e-c2cc-11de-8d13-0010c6dffd0f",
                        "type": "Location",
                        "display": "Unknown Location"
                    }
                }
            ],
            "use": "official",
            "type": {
                "coding": [
                    {
                        "code": "1504618d-6996-4f88-aaf3-36fd86c05b50"
                    }
                ],
                "text": "Test"
            },
            "value": "4444-10"
        }
    ],
    "active": true,
    "name": [
        {
            "id": "dfdfb94d-0353-43b6-ba5f-9eabf1fc7d60",
            "family": "Doe",
            "given": [
                "Jahan"
            ]
        }
    ],
    "gender": "male",
    "birthDate": "2004-08-12",
    "deceasedBoolean": false,
    "address": [
        {
            "id": "ad210e5e-4921-40cc-b84c-c4dbaadf9bad",
            "use": "old",
            "city": "Kampala",
            "state": "Mukono",
            "country": "Uganda"
        }
    ]
}
```
5. **[POST]** FHIR Encounter
URL
```
https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Encounter
```
Request Body
```
{
  "resourceType" : "Encounter",
 
  "meta" : {
    "profile" : [
      "http://fhir.openmrs.org/core/StructureDefinition/omrs-encounter"
    ]
  },
 
  "status" : "unknown",
  "class" : {
    "system" : "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code" : "AMB"
  },
  "type" : [
    {
      "coding" : [
        {
          "system" : "http://fhir.openmrs.org/code-system/encounter-type",
          "code" : "67a71486-1a54-468f-ac3e-7091a9a79584",
          "display" : "Vitals"
        }
      ]
    }
  ],
  "subject" : {
    "reference" : "Patient/e776abcd-020a-44a4-ad6e-019298ff5777",
    "type" : "Patient"
  },
  "period" : {
    "start" : "2022-06-22",
    "end" : "2022-06-22"
  },
  "location" : [
    {
      "location" : {
        "reference" : "Location/f0af1a76-e038-4d14-8021-3ac188492672"
      }
    }
  ]
}
```
Response Payload
```
{
    "resourceType": "Encounter",
    "id": "3211d169-7c99-48b4-a2ad-5bc1f6f19b37",
    "meta": {
        "lastUpdated": "2024-06-11T16:02:59.000+06:00",
        "tag": [
            {
                "system": "http://fhir.openmrs.org/ext/encounter-tag",
                "code": "encounter",
                "display": "Encounter"
            }
        ]
    },
    "text": {
        "status": "generated",
        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>3211d169-7c99-48b4-a2ad-5bc1f6f19b37</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> Vitals </td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/e776abcd-020a-44a4-ad6e-019298ff5777\">Sangana Test New (OpenMRS ID: 13WVV-9)</a></td></tr><tr><td>Period:</td><td>Wed Jun 22 00:00:00 BDT 2022 - ?</td></tr><tr><td>Location:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Location/f0af1a76-e038-4d14-8021-3ac188492672\">mahitilocation</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>"
    },
    "status": "unknown",
    "class": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "AMB"
    },
    "type": [
        {
            "coding": [
                {
                    "system": "http://fhir.openmrs.org/code-system/encounter-type",
                    "code": "67a71486-1a54-468f-ac3e-7091a9a79584",
                    "display": "Vitals"
                }
            ]
        }
    ],
    "subject": {
        "reference": "Patient/e776abcd-020a-44a4-ad6e-019298ff5777",
        "type": "Patient",
        "display": "Sangana Test New (OpenMRS ID: 13WVV-9)"
    },
    "period": {
        "start": "2022-06-22T00:00:00+06:00"
    },
    "location": [
        {
            "location": {
                "reference": "Location/f0af1a76-e038-4d14-8021-3ac188492672",
                "type": "Location",
                "display": "mahitilocation"
            }
        }
    ]
}
```
6. **[POST]** FHIR Observation:
URL
```
https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Observation
```
Request Body
```
{
  "resourceType": "Observation",
  "status": "preliminary",
  "code": {
    "coding": [
      {
        "code": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
      }
    ]
  },
  "subject": {
    "reference": "Patient/e776abcd-020a-44a4-ad6e-019298ff5777"
  },
  "encounter": {
    "reference": "Encounter/a140d6a0-34ca-42f1-9f89-e7b3a3159e95"
  },
  "effectiveDateTime": "2014-11-25T22:17:00+11:00",
  "valueQuantity": {
    "value": 156,
    "unit": "cm"
  }
}
```
Response Payload
```
{
    "resourceType": "Observation",
    "id": "433536e8-77d1-4f23-90c9-68eb2c7f49cb",
    "meta": {
        "lastUpdated": "2024-06-11T16:01:26.000+06:00"
    },
    "text": {
        "status": "generated",
        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>433536e8-77d1-4f23-90c9-68eb2c7f49cb</td></tr><tr><td>Status:</td><td>PRELIMINARY</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td>Height (cm)</td></tr><tr><td>Subject:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Patient/e776abcd-020a-44a4-ad6e-019298ff5777\">Sangana Test New (OpenMRS ID: 13WVV-9)</a></td></tr><tr><td>Encounter:</td><td><a href=\"http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/a140d6a0-34ca-42f1-9f89-e7b3a3159e95\">Encounter/a140d6a0-34ca-42f1-9f89-e7b3a3159e95</a></td></tr><tr><td>Effective:</td><td> 25 November 2014 17:17:00 </td></tr><tr><td>Issued:</td><td>11/06/2024 04:01:26 PM</td></tr><tr><td>Value:</td><td>156.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class=\"subPropertyTable\"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>"
    },
    "status": "preliminary",
    "category": [
        {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    "code": "exam",
                    "display": "Exam"
                }
            ]
        }
    ],
    "code": {
        "coding": [
            {
                "code": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                "display": "Height (cm)"
            },
            {
                "system": "https://openconceptlab.org/orgs/CIEL/sources/CIEL",
                "code": "5090",
                "display": "Height (cm)"
            },
            {
                "system": "http://loinc.org",
                "code": "8302-2",
                "display": "Height (cm)"
            },
            {
                "system": "http://snomed.info/sct",
                "code": "50373000",
                "display": "Height (cm)"
            }
        ],
        "text": "Height (cm)"
    },
    "subject": {
        "reference": "Patient/e776abcd-020a-44a4-ad6e-019298ff5777",
        "type": "Patient",
        "display": "Sangana Test New (OpenMRS ID: 13WVV-9)"
    },
    "encounter": {
        "reference": "Encounter/a140d6a0-34ca-42f1-9f89-e7b3a3159e95",
        "type": "Encounter"
    },
    "effectiveDateTime": "2014-11-25T17:17:00+06:00",
    "issued": "2024-06-11T16:01:26.000+06:00",
    "valueQuantity": {
        "value": 156.0,
        "unit": "cm",
        "system": "http://unitsofmeasure.org",
        "code": "cm"
    },
    "referenceRange": [
        {
            "low": {
                "value": 10.0
            },
            "high": {
                "value": 272.0
            },
            "type": {
                "coding": [
                    {
                        "system": "http://fhir.openmrs.org/ext/obs/reference-range",
                        "code": "absolute"
                    }
                ]
            }
        }
    ]
}
```
7. **[PUT]** FHIR Patient
URL
```
https://intelehealth.mpower-social.com/openmrs/ws/fhir2/R4/Patient/331d75ce-396f-4f84-946f-d753bef3e459
```
Request Body
```
{
  "resourceType": "Patient",
  "id": "331d75ce-396f-4f84-946f-d753bef3e459",
 
  "name": [
    {
      "given": [
        "Adama"
      ],
      "family": "Johna"
    }
  ],
  "gender": "female",
  "birthDate": "2004-08-12",
  "address": [
    {
      "state": "Mukonoa",
      "city": "Kampalaa",
      "country": "Ugandaa"
    }
  ]
}
```
Response Payload
```
{
    "resourceType": "Patient",
    "id": "331d75ce-396f-4f84-946f-d753bef3e459",
    "meta": {
        "lastUpdated": "2024-06-11T15:02:59.000+06:00"
    },
    "text": {
        "status": "generated",
        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Id:</td><td>331d75ce-396f-4f84-946f-d753bef3e459</td></tr><tr><td>Identifier:</td><td><div>4444-9</div></td></tr><tr><td>Active:</td><td>true</td></tr><tr><td>Name:</td><td> Adam <b>JOHN </b> , Adama <b>JOHNA </b></td></tr><tr><td>Gender:</td><td>FEMALE</td></tr><tr><td>Birth Date:</td><td>12/08/2004</td></tr><tr><td>Deceased:</td><td>false</td></tr><tr><td>Address:</td><td><span>Kampala </span><span>Mukono </span><span>Uganda </span></td></tr></tbody></table></div>"
    },
    "identifier": [
        {
            "id": "f5b596d3-1b1e-493a-a017-a4f144ab6b53",
            "extension": [
                {
                    "url": "http://fhir.openmrs.org/ext/patient/identifier#location",
                    "valueReference": {
                        "reference": "Location/8d6c993e-c2cc-11de-8d13-0010c6dffd0f",
                        "type": "Location",
                        "display": "Unknown Location"
                    }
                }
            ],
            "use": "official",
            "type": {
                "coding": [
                    {
                        "code": "1504618d-6996-4f88-aaf3-36fd86c05b50"
                    }
                ],
                "text": "Test"
            },
            "value": "4444-9"
        }
    ],
    "active": true,
    "name": [
        {
            "id": "a4b05690-f16d-4f60-aa8e-27962dfb7cac",
            "family": "John",
            "given": [
                "Adam"
            ]
        },
        {
            "id": "acc91914-9740-473f-a140-50b4b61dd7dc",
            "family": "Johna",
            "given": [
                "Adama"
            ]
        }
    ],
    "gender": "female",
    "birthDate": "2004-08-12",
    "deceasedBoolean": false,
    "address": [
        {
            "id": "c0f80b2f-05c6-4a9a-9c4d-58993dd5f22c",
            "use": "old",
            "city": "Kampala",
            "state": "Mukono",
            "country": "Uganda"
        },
        {
            "id": "c36f9950-1c93-4768-b914-563f906b35ec",
            "use": "old",
            "city": "Kampala",
            "state": "Mukono",
            "country": "Uganda"
        },
        {
            "id": "f9feb56a-bdfe-4e2b-89ef-71330ef6002c",
            "use": "old",
            "city": "Kampalaa",
            "state": "Mukonoa",
            "country": "Ugandaa"
        },
        {
            "id": "906eed60-61c6-4da1-8545-0da8b1719831",
            "use": "old",
            "city": "Kampalaa",
            "state": "Mukonoa",
            "country": "Ugandaa"
        },
        {
            "id": "5ef4fbb5-47fe-4920-92cc-ea387fcf19ac",
            "use": "old",
            "city": "Kampalaa",
            "state": "Mukonoa",
            "country": "Ugandaa"
        }
    ]
}
```
