import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from 'sb-shared-lib';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  // all the data
  public data: any[] = [];
  //data sorted by sections
  public dataSorted: any[] = [];
  //sorted section names
  public nameArray: string[] = [];

  public settingRoute:string


  ngOnInit() {

    // Gets the right DATA for the right ROUTE PARAM
    this.route.params.subscribe(async params => {
      try {
        if (params.package == "general") {
          this.data = await this.api.collect('core\\Setting', ['package', '=', ' '], ['package', 'section', 'description', 'setting_values_ids.value', 'type', 'title', 'help', 'form', 'setting_choices_ids.value'], environment.lang);
          console.log(this.data);
          this.sortData();
          this.settingRoute =  'SETTINGS_LIST_GENERAL';
        } else if (params.package == "sale") {
          this.data = await this.api.collect('core\\Setting', ['package', '=', 'sale'], ['package', 'section', 'description', 'setting_values_ids.value', 'type', 'setting_choices_ids.value', 'title', 'help', 'form'], environment.lang);
          console.log(this.data);
          this.sortData();
          this.settingRoute =  'SETTINGS_LIST_SALE';
        } else {
          this.data = await this.api.collect('core\\Setting', ['package', '=', 'finance'], ['package', 'section', 'description', 'setting_values_ids.value', 'type', 'setting_choices_ids.value', 'title', 'help', 'form'], environment.lang);
          this.sortData();
          this.settingRoute =  'SETTINGS_LIST_FINANCE';
        }
      }
      catch (err) {
        console.log('erreur');
      }
      console.log(this.data);
    });


    // Allows us to switch the data (with initialize) when the route parameter changes
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        //resets the data array's
        this.initialize();
      }
    });
  }




  // Sorting the arrays by Section ex: "locale, security, ..." 
  public sortData() {
    // First we reset the array's
    this.dataSorted = [];
    this.nameArray = [];
    this.data.forEach(element => {
      if (!this.nameArray.includes(element.section)) {
        this.nameArray.push(element.section);
        let index = this.nameArray.indexOf(element.section);
        this.dataSorted[index] = [element];
      } else {
        let index = this.nameArray.indexOf(element.section);
        this.dataSorted[index].push(element);
      }
    });
  }



  // We check the new route
  public initialize() {

    this.route.params.subscribe(async params => {
      if (params.package == "general") {
        this.data = await this.api.collect('core\\Setting', ['package', '=', ' '], ['package', 'section', 'description', 'setting_values_ids.value', 'type', 'setting_choices_ids.value', 'title', 'help', 'form'], environment.lang);
        this.sortData();
        this.settingRoute =  'SETTINGS_LIST_GENERAL';

      } else if (params.package == "sale") {
        this.data = await this.api.collect('core\\Setting', ['package', '=', 'sale'], ['package', 'section', 'description', 'setting_values_ids.value', 'type', 'setting_choices_ids.value', 'title', 'help', 'form'], environment.lang);
        this.sortData();
        this.settingRoute =  'SETTINGS_LIST_SALE';
      } else {
        this.data = await this.api.collect('core\\Setting', ['package', '=', 'finance'], ['package', 'section', 'description', 'setting_values_ids.value', 'type', 'setting_choices_ids.value', 'title', 'help', 'form'], environment.lang);
        this.sortData();
        this.settingRoute =  'SETTINGS_LIST_FINANCE';
      }
    });
  }
}
