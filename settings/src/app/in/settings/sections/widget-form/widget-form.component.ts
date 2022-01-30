import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { pairwise, startWith } from 'rxjs/operators';
import { SettingService } from 'src/app/settingService';

@Component({
  selector: 'app-widget-form',
  templateUrl: './widget-form.component.html',
  styleUrls: ['./widget-form.component.scss']
})
export class WidgetFormComponent implements OnInit {
  @Input() setting : any;
  public settingValue: any;
  public control=new FormControl();
  constructor(public service : SettingService) { }

  ngOnInit(): void {


    this.control.valueChanges.pipe(
      startWith(this.settingValue),
      pairwise()
    ).subscribe(
      ([old,value])=>{

        this.settingValue = value;
      }
    )
  }

  public change(event:any){
    
    this.service.fillQueue(this.setting.id, {newValue: this.settingValue, oldValue: ""}).subscribe((r)=>{
      if(this.settingValue == r){
        event.source.value = this.settingValue;
      }
      this.settingValue=r});
  }
}
