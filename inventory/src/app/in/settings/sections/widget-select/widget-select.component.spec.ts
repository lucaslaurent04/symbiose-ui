import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSelectComponent } from './widget-select.component';

describe('WidgetSelectComponent', () => {
  let component: WidgetSelectComponent;
  let fixture: ComponentFixture<WidgetSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WidgetSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
