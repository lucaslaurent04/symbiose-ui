import { Component, Input, NgZone, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { pairwise, startWith } from 'rxjs/operators';
import { SettingService } from 'src/app/settingService';

@Component({
  selector: 'app-widget-select',
  templateUrl: './widget-select.component.html',
  styleUrls: ['./widget-select.component.scss']
})
export class WidgetSelectComponent implements OnInit {

  constructor(public service : SettingService, private zone:NgZone) { }
  @Input() choices: any[];
  @Input() setting : any;
  public settingValue: any;
  public previousSettingValue: any;
  public control=new FormControl();
  ngOnInit(): void {
    
    this.settingValue =this.setting.setting_values_ids[0].value;
    // this.title = this.title.replace(/[,_.]/g, ' '); 

    

    this.control.valueChanges.pipe(
      startWith(this.settingValue),
      pairwise()
    ).subscribe(
      ([old,value])=>{

        this.previousSettingValue = old;
      }
    )

  }
  public onChange(eventValue:any){
       
      this.service.fillQueue(this.setting.id, {newValue: eventValue.value, oldValue: this.settingValue}).subscribe((r)=>{
        if(this.settingValue == r){
          eventValue.source.value = this.settingValue;
        }
        this.settingValue=r});
  }
}
