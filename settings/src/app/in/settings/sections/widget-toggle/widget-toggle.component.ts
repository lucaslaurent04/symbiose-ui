import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SettingService } from 'src/app/settingService';
@Component({
  selector: 'app-widget-toggle',
  templateUrl: './widget-toggle.component.html',
  styleUrls: ['./widget-toggle.component.scss']
})
export class WidgetToggleComponent implements OnInit {

  constructor(private service : SettingService) { }

  
  @Input() setting : any;
  public settingValue:any;
  
  ngOnInit(): void {

   if(this.setting.setting_values_ids[0].value == 0){
    this.settingValue = false;
   }else{
    this.settingValue = true;
   }
    console.log(this.settingValue);
  }
  
  public async valueChange(event:MatSlideToggleChange){ 
    // if(!this.settingValue){
    //   event.source.checked = false;
    //   console.log(event.source.checked);
    // }
    console.log('value', this.settingValue);
    this.service.fillQueue(this.setting.id, {newValue: event.checked, oldValue: this.settingValue}).subscribe((r)=>{
      if(this.settingValue == r){
        event.source.checked =this.settingValue;
      }
      this.settingValue=r;
    
    });
     console.log(this.settingValue);
  }  
}
