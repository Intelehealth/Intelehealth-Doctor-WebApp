import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringSheetComponent } from './monitoring-sheet.component';

describe('MonitoringSheetComponent', () => {
  let component: MonitoringSheetComponent;
  let fixture: ComponentFixture<MonitoringSheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonitoringSheetComponent]
    });
    fixture = TestBed.createComponent(MonitoringSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
