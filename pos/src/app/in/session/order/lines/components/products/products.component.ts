import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @Output() selectedtTab = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  onSelectedTab(event: any){
    this.selectedtTab.emit(event.tab.textLabel);
  }
}
