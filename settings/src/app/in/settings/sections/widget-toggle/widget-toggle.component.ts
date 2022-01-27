import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-widget-toggle',
  templateUrl: './widget-toggle.component.html',
  styleUrls: ['./widget-toggle.component.scss']
})
export class WidgetToggleComponent implements OnInit {

  constructor() { }

  public Override : any;
  @Input() title:string;
  @Input() choices: string;
  @Input() description:any;
  @Input() setting : any;
  @Input() label : any;
  public value:any;
  ngOnInit(): void {
  //  this.title = this.title.replace(/[,_]/g, ' ');
  console.log(this.setting);
    this.value = this.label;
  }
  public test(){
    console.log(this.title);
  }

  public getFucked(){
    this.value = !this.label;
  }

  ngOnChanges(changes:SimpleChanges){
    console.log('Jean',changes);
  }
}
