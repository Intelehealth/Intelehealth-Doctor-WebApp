import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableGridComponent } from './table-grid.component';

describe('TableGridComponent', () => {
  let component: TableGridComponent;
  let fixture: ComponentFixture<TableGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableGridComponent]
    });
    fixture = TestBed.createComponent(TableGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
