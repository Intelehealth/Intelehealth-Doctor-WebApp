/// <reference types="jasmine" />

import { mockWebrtcResponse } from "mocks/data/webrtc";
import { of } from "rxjs";
import { ConfigService } from "src/app/services/config.service";


const configService = jasmine.createSpyObj<ConfigService>('configService', [
    'updateFeatureEnabledStatus',
    'updateWebrtcEnabledStatus',
    'getWebrtcs',
    'getFeatures',
    'publishConfig'
]);

configService.publishConfig.and.returnValue(of({}));

configService.getWebrtcs.and.returnValue(of(mockWebrtcResponse))

export { configService };