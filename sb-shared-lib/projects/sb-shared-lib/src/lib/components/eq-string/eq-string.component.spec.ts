import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqStringComponent } from './eq-string.component';

describe('EqStringComponent', () => {
  let component: EqStringComponent;
  let fixture: ComponentFixture<EqStringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqStringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
