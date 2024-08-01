import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationOverlayComponent } from './documentation-overlay.component';

describe('DocumentationOverlayComponent', () => {
    let component: DocumentationOverlayComponent;
    let fixture: ComponentFixture<DocumentationOverlayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DocumentationOverlayComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentationOverlayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
