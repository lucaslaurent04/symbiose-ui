import { Component, OnInit } from '@angular/core';
import { ApiService } from 'sb-shared-lib';

@Component({
  selector: 'app-sale-settings',
  templateUrl: './sale-settings.component.html',
  styleUrls: ['./sale-settings.component.scss']
})
export class SaleSettingsComponent implements OnInit {

  constructor(private api: ApiService,) { }
  public data : any[] = [];
  async ngOnInit() {
    this.data = await this.api.collect('core\\Setting', ['package','=','sale'], ['package', 'section', 'description', 'setting_values_ids.value', 'type']);    
  }
}
