/// <reference types="jasmine" />

import { EventEmitter } from "@angular/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { of } from "rxjs";

const translateService = jasmine.createSpyObj<TranslateService>('translateService', ['use','instant', 'get']);
export const mockTranslateService = {
    currentLang: 'de',
    onLangChange: new EventEmitter<LangChangeEvent>(),
    use: translateService.get,
    get: translateService.get.and.returnValue(of('')),
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter()
};

