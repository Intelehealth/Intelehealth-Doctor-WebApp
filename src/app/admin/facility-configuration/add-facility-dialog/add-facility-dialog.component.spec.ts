import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFacilityDialogComponent } from './add-facility-dialog.component';

describe('AddFacilityDialogComponent', () => {
  let component: AddFacilityDialogComponent;
  let fixture: ComponentFixture<AddFacilityDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFacilityDialogComponent]
    });
    fixture = TestBed.createComponent(AddFacilityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
