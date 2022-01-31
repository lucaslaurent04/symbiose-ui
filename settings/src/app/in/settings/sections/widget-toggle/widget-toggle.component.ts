import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SettingService } from 'src/app/settingService';
import { FormControl } from '@angular/forms';
import { pairwise, startWith } from 'rxjs/operators';
@Component({
  selector: 'app-widget-toggle',
  templateUrl: './widget-toggle.component.html',
  styleUrls: ['./widget-toggle.component.scss']
})
export class WidgetToggleComponent implements OnInit {

  constructor(private service : SettingService) { }

  
  @Input() setting : any;
  public settingValue:any;
  public control=new FormControl();
  ngOnInit(): void {

   if(this.setting.setting_values_ids[0].value == 0){
    this.settingValue = false;
   }else{
    this.settingValue = true;
   }

   this.control.valueChanges.pipe(
    startWith(this.settingValue),
    pairwise()
  ).subscribe(
    ([old,value])=>{
    }
  )
  this.control.setValue(this.settingValue);
  }
  
  public async valueChange(event:MatSlideToggleChange){ 
  
    this.service.toQueue(this.setting.id, {newValue: event.checked, oldValue: this.settingValue}).subscribe((r)=>{
      if(this.settingValue == r){
        this.control.setValue(r);
      }
      this.settingValue=r;
  
    });
     
  }  
}
