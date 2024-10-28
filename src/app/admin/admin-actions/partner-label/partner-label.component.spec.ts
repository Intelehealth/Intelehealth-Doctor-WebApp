import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerLabelComponent } from './partner-label.component';

describe('PartnerLabelComponent', () => {
  let component: PartnerLabelComponent;
  let fixture: ComponentFixture<PartnerLabelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerLabelComponent]
    });
    fixture = TestBed.createComponent(PartnerLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
