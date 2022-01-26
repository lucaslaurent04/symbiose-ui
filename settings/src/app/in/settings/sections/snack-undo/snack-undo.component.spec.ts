import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackUndoComponent } from './snack-undo.component';

describe('SnackUndoComponent', () => {
  let component: SnackUndoComponent;
  let fixture: ComponentFixture<SnackUndoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnackUndoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackUndoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
