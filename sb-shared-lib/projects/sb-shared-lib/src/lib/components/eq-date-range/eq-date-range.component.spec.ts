import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqDateRangeComponent } from './eq-date-range.component';

describe('EqDateRangeComponent', () => {
  let component: EqDateRangeComponent;
  let fixture: ComponentFixture<EqDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqDateRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
