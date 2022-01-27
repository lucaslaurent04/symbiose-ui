import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleSettingsComponent } from './sale-settings.component';

describe('SaleSettingsComponent', () => {
  let component: SaleSettingsComponent;
  let fixture: ComponentFixture<SaleSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaleSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
