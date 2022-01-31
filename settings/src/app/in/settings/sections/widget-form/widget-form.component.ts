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
  @Input() setting: any;
  public settingValue: any;
  public previousValue: string;
  public control = new FormControl();
  public btn: string;
  public btnStyle = 'btn1';
  public focusState:any;
  constructor(public service: SettingService) { }

  ngOnInit(): void {
    this.settingValue = this.setting.setting_values_ids[0].value;

    this.control.valueChanges.pipe(
      startWith(this.settingValue),
      pairwise()
    ).subscribe(
      ([old, value]) => {
        this.settingValue = value;
        this.previousValue = old;
      }
    )
    // preset the value of control
    this.control.setValue(this.settingValue);
  }
  public reset() {
    // clear the input field
    this.control.reset();
    this.btn = 'reset';
  }
  public submit() {
    //change de style to make the button visible
    this.btnStyle = 'btnStyle';
    this.btn = 'submit';
  }


  public change(event: any) {
    console.log('ok');
    if (this.btn != 'reset') {
      this.service.toQueue(this.setting.id, { newValue: this.settingValue, oldValue: this.previousValue }).subscribe((r) => {
        if (this.settingValue == r) {
          this.control.setValue(r);
        }
        this.settingValue = r
        console.log('ok');
      });
      this.btnStyle = "btn1";
    }
  }
}
