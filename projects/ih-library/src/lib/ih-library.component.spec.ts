import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IhLibraryComponent } from './ih-library.component';

describe('IhLibraryComponent', () => {
  let component: IhLibraryComponent;
  let fixture: ComponentFixture<IhLibraryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IhLibraryComponent]
    });
    fixture = TestBed.createComponent(IhLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
