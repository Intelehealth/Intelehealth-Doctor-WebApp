import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SevikaLogComponent } from './sevika-log.component';

describe('SevikaLogComponent', () => {
  let component: SevikaLogComponent;
  let fixture: ComponentFixture<SevikaLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SevikaLogComponent]
    });
    fixture = TestBed.createComponent(SevikaLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
