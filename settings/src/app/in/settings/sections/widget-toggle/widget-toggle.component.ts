import { Component, Input, OnInit } from '@angular/core';
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
  ngOnInit(): void {
   this.title = this.title.replace(/[,_]/g, ' ');
  }
  
  public test(){
    console.log(this.title);
  }

 
}
