import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentPresenterComponent } from './component-presenter.component';

describe('ComponentPresenterComponent', () => {
    let component: ComponentPresenterComponent;
    let fixture: ComponentFixture<ComponentPresenterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ComponentPresenterComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ComponentPresenterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
