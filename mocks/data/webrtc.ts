import { FeatureModel, WebrtcDataModel } from "src/app/model/model";

export const mockWebrtcResponse: { webrtc: WebrtcDataModel } = {
    webrtc: {
        webrtc_section: {
            id: 1,
            name: 'webrtc_section',
            is_enabled: true
        },
        webrtc: [{
            id: 1,
            is_enabled: true,
            name: 'Chat',
            key: 'chat'
        }, {
            id: 2,
            is_enabled: true,
            name: 'Video Call',
            key: 'video_call'
        }]
    }
}

export const mockFeatureResponse: FeatureModel[] = [{
    id: 1,
    name: 'WebRTC',
    key: "webrtc_section",
    is_enabled: true
}, {
    id: 2,
    name: 'Patient Vitals',
    key: "patient_vitals_section",
    is_enabled: true
}, {
    id: 3,
    name: 'Abha Id',
    key: "abha_section",
    is_enabled: true
}]