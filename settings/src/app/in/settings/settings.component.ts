import { Component, OnInit } from '@angular/core';
import { ApiService } from 'sb-shared-lib';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';


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

  public settingRoute:string
  private package: string = 'core';

  // data sorted by sections
  public sections: Array<any> = new Array();

  public sectionsMap: any = {};

  public sectionsDescriptions: any = {
    'locale': 'Paramètres régioniaux',
    'main': 'Paramètres généraux et de formats',
    'security': 'Paramètres de sécurité',
    'units': 'Unités de mesures et systèmes d\'unités'
  };

  ngOnInit() {
    // Gets the right DATA for the right ROUTE PARAM
    this.route.params.subscribe(async params => {
      this.package = params.package;
      this.settingRoute =  'SETTINGS_LIST_' + this.package.toUpperCase();
      this.reset();
    });

    // Allow to switch the data (with initialize) when the route parameter changes
    this.router.events.subscribe( async (val) => {
      if (val instanceof NavigationEnd) {
        this.reset().then( () => '' );
      }
    });
  }

  /**
   * Initialise the payload based on current route
   * 
   */  
  public async reset() {
    try {
      const data: any[] = await this.api.collect(
        'core\\Setting', 
        ['package', '=', this.package], 
        ['package', 'section', 'description', 'setting_values_ids.value', 'type', 'setting_choices_ids.value', 'title', 'help', 'form'], 
        'id', 'asc', 0, 100
      );

      // reset the array
      this.sections = [];
      this.sectionsMap = {};
      data.forEach(element => {
        if(!this.sectionsMap.hasOwnProperty(element.section)) {
          this.sectionsMap[element.section] = [];
          this.sections.push(element.section);
        }
        this.sectionsMap[element.section].push(element);
      });
    }
    catch(error) {
      console.log('something went wrong');
    }
  }
}