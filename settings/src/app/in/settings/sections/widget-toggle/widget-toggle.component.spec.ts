import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetToggleComponent } from './widget-toggle.component';

describe('WidgetToggleComponent', () => {
  let component: WidgetToggleComponent;
  let fixture: ComponentFixture<WidgetToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WidgetToggleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
