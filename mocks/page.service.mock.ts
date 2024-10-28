/// <reference types="jasmine" />

import { PageTitleService } from "src/app/core/page-title/page-title.service";

const pageTitleService = jasmine.createSpyObj<PageTitleService>('pageTitleService', ['setTitle']);

export const mockPageTitleService = {
    setTitle: pageTitleService.setTitle.and.returnValue(),
}