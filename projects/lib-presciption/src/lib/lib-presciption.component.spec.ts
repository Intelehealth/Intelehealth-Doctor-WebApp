import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibPresciptionComponent } from './lib-presciption.component';

describe('LibPresciptionComponent', () => {
  let component: LibPresciptionComponent;
  let fixture: ComponentFixture<LibPresciptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LibPresciptionComponent]
    });
    fixture = TestBed.createComponent(LibPresciptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
