import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileAppLanguagesComponent } from './mobile-app-languages.component';

describe('MobileAppLanguagesComponent', () => {
  let component: MobileAppLanguagesComponent;
  let fixture: ComponentFixture<MobileAppLanguagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MobileAppLanguagesComponent]
    });
    fixture = TestBed.createComponent(MobileAppLanguagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
