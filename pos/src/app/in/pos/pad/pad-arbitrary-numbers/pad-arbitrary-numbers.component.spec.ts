import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PadArbitraryNumbersComponent } from './pad-arbitrary-numbers.component';

describe('PadArbitraryNumbersComponent', () => {
  let component: PadArbitraryNumbersComponent;
  let fixture: ComponentFixture<PadArbitraryNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PadArbitraryNumbersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PadArbitraryNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
