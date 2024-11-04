export const VISIT_SECTIONS = {
    "additional_documents": {
        logo: "assets/svgs/additional-documents.svg",
        key: "additional_documents"
    },
    "additional_notes": {
        logo: "assets/svgs/note-icon-green.svg",
        key: "additional_notes"
    },
    "check_up_reason": {
        logo: "assets/svgs/check-up-reason.svg",
        key: "check_up_reason"
    },
    "consultation_details": {
        logo: "assets/svgs/consultation-details.svg",
        key: "consultation_details"
    },
    "medical_history": {
        logo: "assets/svgs/medical-history.svg",
        key: "medical_history"
    },
    "physical_examination": {
        logo: "assets/svgs/physical-examination.svg",
        key: "physical_examination"
    },
    "refer_to_specialist": {
        logo: "assets/svgs/refer-specialist.svg",
        key: "refer_to_specialist"
    },
    "vitals": {
        logo: "assets/svgs/vitals.svg",
        key: "vitals"
    }
}

export const checkIsEnabled = (
    key: string,
    is_enabled = false,
    otherFields: any = {}
) => {
    // Set default expanded value
    let expanded = true;

    // Destructure frequently used fields from otherFields
    const { visitEnded, visitCompleted, visitNotePresent, hasVitalsEnabled, notes_section, attachment_section } = otherFields;

    switch (key) {
        case VISIT_SECTIONS['refer_to_specialist'].key:
            is_enabled = is_enabled && !visitEnded && !visitCompleted && !visitNotePresent;
            expanded = !!visitNotePresent;
            break;

        case VISIT_SECTIONS['vitals'].key:
            is_enabled = is_enabled && !!hasVitalsEnabled;
            break;

        case VISIT_SECTIONS['additional_notes'].key:
            is_enabled = is_enabled && !!notes_section;
            break;

        case VISIT_SECTIONS['additional_documents'].key:
            is_enabled = is_enabled && !!attachment_section;
            break;

        case VISIT_SECTIONS['consultation_details'].key:
            is_enabled = is_enabled;
            break;
        
        case VISIT_SECTIONS['check_up_reason'].key:
            is_enabled = is_enabled;
            break;

        case VISIT_SECTIONS['medical_history'].key:
            is_enabled = is_enabled;
            break;

        case VISIT_SECTIONS['physical_examination'].key:
            is_enabled = is_enabled;
            break;
    

        default:
            // For other sections, return the initial is_enabled and expanded
            break;
    }

    return { is_enabled, expanded };
};