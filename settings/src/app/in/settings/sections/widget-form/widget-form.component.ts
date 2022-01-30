import { Component, Input, OnInit } from '@angular/core';
import { SettingService } from 'src/app/settingService';

@Component({
  selector: 'app-widget-form',
  templateUrl: './widget-form.component.html',
  styleUrls: ['./widget-form.component.scss']
})
export class WidgetFormComponent implements OnInit {
  @Input() setting : any;
  public settingValue: any;
  constructor(public service : SettingService) { }

  ngOnInit(): void {
  }

  public change(event:any){
    console.log(event);
    this.service.fillQueue(this.setting.id, {newValue: "", oldValue: this.settingValue}).subscribe((r)=>{
      if(this.settingValue == r){
        // eventValue.source.value = this.settingValue;
      }
      this.settingValue=r});
  }
}
