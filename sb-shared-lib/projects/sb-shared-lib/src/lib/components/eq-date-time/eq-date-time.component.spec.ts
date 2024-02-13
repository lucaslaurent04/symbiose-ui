import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqDateTimeComponent } from './eq-date-time.component';

describe('EqDateTimeComponent', () => {
  let component: EqDateTimeComponent;
  let fixture: ComponentFixture<EqDateTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqDateTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
