import { Component, Input, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { pairwise, startWith } from 'rxjs/operators';
import { SettingService } from 'src/app/settingService';

@Component({
  selector: 'app-widget-select',
  templateUrl: './widget-select.component.html',
  styleUrls: ['./widget-select.component.scss']
})
export class WidgetSelectComponent implements OnInit {

  constructor(public service : SettingService) { }
  @Input() choices: any[];
  @Input() setting : any;
  public settingValue: any;
  public control=new FormControl();
  ngOnInit(): void {
    
    this.settingValue =this.setting.setting_values_ids[0].value;
    this.control.valueChanges.pipe(
      startWith(this.settingValue),
      pairwise()
    ).subscribe(
      ([old,value])=>{
      }
    )
    this.control.setValue(this.settingValue);

  }
  public onChange(eventValue:any){
       //use the service to add the elements
      this.service.toQueue(this.setting.id, {newValue: eventValue.value, oldValue: this.settingValue}).subscribe((r)=>{
        if(this.settingValue == r){
          this.control.setValue(r);
        }
        this.settingValue=r});
  }
}
