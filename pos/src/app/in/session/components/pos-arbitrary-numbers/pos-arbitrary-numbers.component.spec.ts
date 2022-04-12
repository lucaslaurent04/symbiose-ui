import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosArbitraryNumbersComponent } from './pos-arbitrary-numbers.component';

describe('PosArbitraryNumbersComponent', () => {
  let component: PosArbitraryNumbersComponent;
  let fixture: ComponentFixture<PosArbitraryNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosArbitraryNumbersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosArbitraryNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
