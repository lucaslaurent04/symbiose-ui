import {
	Component,
	Input,
	ViewChild,
	ComponentRef,
	OnDestroy,
	AfterViewInit,
	Renderer2,
	ElementRef
} from '@angular/core';
import {DynamicHostDirective} from '../../_directives/dynamic-host.directive';
import {Showcase} from '../../_types/showcaseType';

@Component({
	selector: 'app-component-presenter',
	templateUrl: './component-presenter.component.html',
	styleUrls: ['./component-presenter.component.scss'],
})
export class ComponentPresenterComponent implements AfterViewInit, OnDestroy {
	@Input() public showcase: Showcase;

	@ViewChild(DynamicHostDirective, {static: true}) dynamicHost?: DynamicHostDirective;

	public isOverlayVisible = false;
	private componentRefs: ComponentRef<any>[] = [];

	constructor(
		private renderer: Renderer2,
		private el: ElementRef,
	) {
	}

	ngAfterViewInit(): void {
		this.loadComponents();
	}

	ngOnDestroy(): void {
		this.componentRefs.forEach(ref => ref.destroy());
	}

	toggleOverlay(): void {
		this.isOverlayVisible = !this.isOverlayVisible;
	}

	private loadComponents(): void {
		const viewContainerRef = this.dynamicHost?.viewContainerRef;

		if (viewContainerRef) {
			viewContainerRef.clear();
			this.componentRefs = this.showcase.components.map(({label, properties}) => {
				// Create a container div using Renderer2
				const containerDiv = this.renderer.createElement('div');
				containerDiv.classList.add('card');

				// Create a span and set its content to the label using Renderer2
				const labelSpan = this.renderer.createElement('span');
				labelSpan.classList.add('label');

				const text = this.renderer.createText(label ?? '');
				this.renderer.appendChild(labelSpan, text);

				// Append the span to the div using Renderer2
				this.renderer.appendChild(containerDiv, labelSpan);

				// Create the component
				const componentRef = viewContainerRef.createComponent(this.showcase.componentSelector as any);
				// tslint:disable-next-line:no-non-null-assertion
				Object.assign(componentRef.instance!, properties);

				// Move the component's root element into the container div using Renderer2
				this.renderer.appendChild(containerDiv, componentRef.location.nativeElement);

				// Append the container div to the ViewContainerRef's host element
				const componentsDiv = this.el.nativeElement.querySelector('.components');
				this.renderer.appendChild(componentsDiv, containerDiv);

				return componentRef;
			});
		}
	}


	public onOverlayVisibilityChange(isOpen: boolean): void {
		this.isOverlayVisible = isOpen;
	}
}
