import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqTextComponent } from './eq-text.component';

describe('EqTextComponent', () => {
  let component: EqTextComponent;
  let fixture: ComponentFixture<EqTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
