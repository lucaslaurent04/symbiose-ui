import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqDateComponent } from './eq-date.component';

describe('EqDateComponent', () => {
  let component: EqDateComponent;
  let fixture: ComponentFixture<EqDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
