import { Component, OnInit } from '@angular/core';

import { AuthService } from 'sb-shared-lib';


@Component({
  selector: 'apps',
  templateUrl: 'apps.component.html',
  styleUrls: ['apps.component.scss']
})
export class AppsComponent implements OnInit {

  public user: any = {};
  public user_apps: string[];

  private colors = ['3F52B5', '653BB5', '29A1A1', 'FF9741', 'F9BD15', '83C33F', 'E95367'];

  public apps:any = {
    booking: {
      url: "/booking",
      name: "APPS_APP_BOOKING",
      icon: 'airline_seat_individual_suite',
      color: this.colors[0]
    },
    pos: {
      url: "/pos",
      name: "APPS_APP_POS",
      icon: 'point_of_sale',
      color: this.colors[6]
    },
    sales: {
      url: "/sale",
      name: "APPS_APP_SALES",
      icon: 'import_contacts',
      color: this.colors[4]
    },
    accounting: {
      url: "/accounting",
      name: "APPS_APP_ACCOUNTING",
      icon: 'monetization_on',
      color: this.colors[2]
    },
    config: {
      url: "/settings",
      name: "APPS_APP_SETTINGS",
      icon: 'settings',
      color: this.colors[3]
    },
    documents: {
      url: "/documents",
      name: "APPS_APP_DOCUMENTS",
      icon: 'insert_drive_file',
      color: this.colors[5]
    },
    stats: {
      url: "/stats",
      name: "APPS_APP_STATS",
      icon: 'filter_alt',
      color: this.colors[1]
    }    
  };

  constructor(
    private auth: AuthService) {
  }
  
  public async ngOnInit() {
    this.auth.getObservable().subscribe( (user:any) => {
      if(user.id > 0) {
        this.user = user;
        // this.user_apps = user.apps;
// #todo
        this.user_apps = ['booking', 'accounting', 'sales', 'pos', 'config', 'documents', 'stats'];
      }    
    });
  }

  public onSelect(app: any) {
    window.location.href = this.apps[app].url;
  }

  public async onDisconnect() {
    try {
      await this.auth.signOut();
      window.location.href = '/auth';
    }
    catch(err) {
      console.warn('unable to request signout');
    }    
  }

}