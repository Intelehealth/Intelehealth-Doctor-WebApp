export const notifications = {
    ADMIN_UNREAD_COUNT:'adminUnreadCount',
    GET_ADMIN_UNREAD_COUNT:'getAdminUnreadCount',
    DOCTOR_UNREAD_COUNT:'drUnreadCount',
    GET_DOCTOR_UNREAD_COUNT:'getDrUnreadCount',
    SUPPORT_MESSAGE:'supportMessage',
    ISREAD_SUPPORT:'isreadSupport',
    UPDATE_MESSAGE:'updateMessage',
}

export const languages ={
    SELECTED_LANGUAGE:'selectedLanguage',
}

export const visitTypes = {
    VISIT_NOTE_PROVIDER:'visitNoteProvider',
    PATIENT_VISIT_PROVIDER:'patientVisitProvider',
    ENDED_VISIT:'Ended Visit',
    COMPLETED_VISIT:'Completed Visit',
    IN_PROGRESS_VISIT:'In-progress Visit',
    PRIORITY_VISIT:'Priority Visit',
    AWAITING_VISIT:'Awaiting Visit',
    PATIENT_INTERACTION:'Patient Interaction',
    HW_INTERACTION:'HW Interaction',
    GENERAL_PHYSICIAN:'General Physician',
    ADULTINITIAL:'ADULTINITIAL',
    ASSOCIATED_SYMPTOMS:'Associated symptoms',
    CURRENT_COMPLAINT:'CURRENT COMPLAINT',
    PATIENT_EXIT_SURVEY:'Patient Exit Survey',
    VISIT_COMPLETE:'Visit Complete',
    FLAGGED:'Flagged',
    VITALS:'Vitals',
    VISIT_NOTE:'Visit Note',
    MEDICAL_HISTORY:'MEDICAL HISTORY',
    FAMILY_HISTORY:'FAMILY HISTORY',
}

export const doctorDetails = {
    TELEPHONE_NUMBER:'Telephone Number',
    SPECIALIZATION:'specialization',
    PROVIDER:'provider',
    USER:'user',
    DOCTOR_NAME:'doctorName',
    PASSWORD:'password',
    PHONE_NUMBER:'phoneNumber',
    WHATS_APP:'whatsapp',
    BIRTHDATE:'birthdate',
    ADDRESS:'address',
    CONSULTATION_LANGUAGE:'consultationLanguage',
    COUNTRY_CODE:'countryCode',
    EMAIL_ID:'emailId',
    FONT_OF_SIGN:'fontOfSign',
    QUALIFICATION:'qualification',
    REGISTRATION_NUMBER:'registrationNumber',
    RESEARCH_EXPERIENCE:'researchExperience',
    SIGNATURE:'signature',
    SIGNATURE_TYPE:'signatureType',
    TEXT_OF_SIGN:'textOfSign',
    TYPE_OF_PROFESSION:'typeOfProfession',
    WORK_EXPERIENCE:'workExperience',
    WORK_EXPERIENCE_DETAILS:'workExperienceDetails',
    WHATS_APP_NUMBER:'whatsAppNumber',
    ROLE: 'user_role',
    USER_NAME: 'username'
}

export const facility = {
  facilities :[
    { id : 1 , name : 'HSC'},
    { id : 2 , name : 'PHC'},
    { id : 3 , name : 'CHC'},
    { id : 4 , name : 'SDH'},
    { id : 5 , name : 'DH'},
    { id : 6 , name : 'TH'},
    { id : 7 , name : 'GH'},
    { id : 8 , name : 'Private Hospital'},
  ]
};

export const specialization = {
  specializations :[
    {
        id: 1,
        name: 'General Physician'
    },
    {
        id: 2,
        name: 'Dermatologist'
    },
    {
        id: 3,
        name: 'Gynecologist'
    },
    {
        id: 4,
        name: 'Pediatrician'
    }
  ]
};

export const refer_specialization = {
  refer_specializations :[
    { id: 1, name : 'CHO'},
    { id: 2, name : 'MO'},
    { id: 3, name : 'General Physician'},
    { id: 4, name : 'Obstetrician & Gynecologist'},
    { id: 5, name : 'Pediatrician'},
    { id: 6, name : 'General Surgeon'},
    { id: 7, name : 'Dermatologist'},
    { id: 8, name : 'ENT Specialist'},
    { id: 9, name : 'Eye Specialist'},
    { id: 10, name : 'Dental Surgeon'},
  ]
};

export const refer_prioritie = {
  refer_priorities :[
    {id: 1, name: 'Elective'},
    {id: 1, name: 'Urgent'}
  ]
}

export const strength = {
  strengthList :[
    {
      id: 1,
      name: '5 Mg'
    },
    {
      id: 2,
      name: '10 Mg'
    },
    {
      id: 3,
      name: '50 Mg'
    },
    {
      id: 4,
      name: '75 Mg'
    },
    {
      id: 5,
      name: '100 Mg'
    },
    {
      id: 6,
      name: '500 Mg'
    },
    {
      id: 7,
      name: '1000 Mg'
    }
  ]
};

export const days = {
  daysList :[
    {
      id: 1,
      name: '7'
    },
    {
      id: 2,
      name: '14'
    },
    {
      id: 3,
      name: '20'
    },
    {
      id: 4,
      name: '25'
    },
    {
      id: 5,
      name: '30'
    }
  ]
};

export const timing = {
  timingList :[
    {
      id: 1,
      name: '1 - 0 - 0'
    },
    {
      id: 2,
      name: '0 - 1 - 0'
    },
    {
      id: 3,
      name: '0 - 0 - 1'
    },
    {
      id: 4,
      name: '1 - 1 - 0'
    },
    {
      id: 5,
      name: '1 - 0 - 1'
    },
    {
      id: 6,
      name: '0 - 1 - 1'
    },
    {
      id: 7,
      name: '1 - 1 - 1'
    }
  ]
};

export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

export const conceptIds = {
  conceptAdditionlDocument : '07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba',
  conceptPhysicalExamination : '200b7a45-77bc-4986-b879-cc727f5f7d5b',
  conceptDiagnosis : '537bb20d-d09d-4f88-930b-cc45c7d662df',
  conceptNote : '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  conceptMed : 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca',
  conceptAdvice : '67a050c1-35e5-451c-a4ab-fff9d57b0db1',
  conceptTest : '23601d71-50e6-483f-968d-aeef3031346d',
  conceptReferral : '605b6f15-8f7a-4c45-b06d-14165f6974be',
  conceptFollow : 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86',
  conceptDDx : 'bc48889e-b461-4e5e-98d1-31eb9dd6160e',
  conceptDiagnosisClass : '8d4918b0-c2cc-11de-8d13-0010c6dffd0f'
}

export const WEBRTC = {
  CHAT_TEXT_LIMIT: 1000
}