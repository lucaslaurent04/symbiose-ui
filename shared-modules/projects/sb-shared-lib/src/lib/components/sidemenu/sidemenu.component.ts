import { Component, OnInit, Output, Input, EventEmitter, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ContextService } from '../../services/context.service';
import { environment } from '../../environment/environment';

import * as screenfull from 'screenfull';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})
export class AppSideMenuComponent implements OnInit {
  @ViewChild('helpfullscreen') helpFullScreen: ElementRef;

  public panes:any = [
    {
      id: "validity-check",
      icon: "check_circle_outline"
    },
    {
      id: "view-help",
      icon: "help_outline"
    },
    {
      id: "object-history",
      icon: "history"
    },
    {
      id: "user-settings",
      icon: "settings"
    }

  ];

  public selected_tab_id = 'object-routes';
  public user: any = {};
  
  public view_description: string = '';
  public object_routes_items:any = [];
  public object_checks_items: any = [];
  public latest_changes:any = [];
  public object_checks_result:any = {
    title:   '',    // string
    content: []     // array of objects
  };

  private view_id: string = '';
  private object_class: string = '';
  private object_id: number = 0;

  private object: any = {};

  constructor(
    private context:ContextService,
    private router: Router,
    private api:ApiService,
    private auth:AuthService,
    private zone:NgZone
  ) {}

  ngOnInit(): void {

    this.auth.getObservable().subscribe( (user:any) => {
      this.user = user;
    });


    this.context.getObservable()
    .pipe(
      // prevent slowing down main screen display by delaying the requests
      debounceTime(500)
    )
    .subscribe( async (descriptor: any) => {
      console.log('SideMenu::received descriptor from Context', descriptor);

      // reset local vars
      this.object_checks_result.title = "";
      this.object_checks_result.content = [];
      this.object_routes_items = [];
      this.object_checks_items = [];
      this.view_description = '';
      this.latest_changes = [];

      if(descriptor.hasOwnProperty('context')) {

        let view_type = (descriptor.context.hasOwnProperty('type'))?descriptor.context.type:'list';
        let view_name = (descriptor.context.hasOwnProperty('name'))?descriptor.context.name:'default';

        let view_id = view_type+'.'+view_name;

        if(descriptor.context.hasOwnProperty('view')) {
          view_id = descriptor.context.view;
          let parts = view_id.split('.');
          if(parts.length) view_type = <string>parts.shift();
          if(parts.length) view_name = <string>parts.shift();
        }

        // domain is expected to be single ID filter (ex. ['id', '=', 3])
        let object_id = (descriptor.context.domain)?descriptor.context.domain[2]:0;
        let object_class = descriptor.context.entity;


        if(descriptor.context.hasOwnProperty('target_entity')) {
          object_class = descriptor.context.target_entity;
        }

        // if(view_id != this.view_id || this.object_class != object_class || this.object_id != object_id) {
        if(object_id) {

          this.view_id = view_id;
          this.object_id = object_id;
          this.object_class = object_class;

          let object_fields = ['id', 'name', 'state', 'created', 'modified', 'status', 'order'];


          let view_routes = [];

          // load routes and look for references to object fields (to append those to the fields to load, `object_fields`)
          try {
            const view = await this.api.fetch('/?get=model_view&entity='+object_class+'&view_id=routes.default'+'&lang='+environment.lang);
            // load routes from view, if any
            if(view.hasOwnProperty('routes') && view.routes.length) {
              view_routes = view.routes;


              for(let route of view_routes) {

                if(route.hasOwnProperty('visible')) {
                  let domain = route.visible;

                  if (typeof domain == 'string') {
                    domain = JSON.parse(domain);
                  }

                  if(Array.isArray(domain) && domain.length) {
                    // #todo - improve
                    // get first part of domain as target field
                    let object_field = domain[0];

                    if(object_field.length && !object_fields.includes(object_field)) {
                      object_fields.push(object_field);
                    }

                  }
                }
                if(route.hasOwnProperty('route')) {
                  const parts = route.route.split('/');
                  for(let part of parts) {
                    let object_field = part.replace('object.', '');  
                    if(object_field.length && !object_fields.includes(object_field)) {
                      object_fields.push(object_field);
                    }  
                  }
                }
                if(route.hasOwnProperty('context') && route.context.hasOwnProperty('domain')) {
                  let domain = JSON.stringify(route.context.domain);
                  let regexp = /object\.([^"]+)/g;
                  let match = regexp.exec(domain);
                 
                  while(match) {
                    if(match.length) {
                      object_fields.push(match[1]);
                    }	  
                    match = regexp.exec(domain);
                  }
                }

              }
            }
          }
          catch(err) {
            console.warn(err);
          }

          // read basic field of targeted object
          const data = await this.api.read(object_class, [object_id], object_fields);
          this.object = data[0];

          // 'history' : read modifications history
          try {

            const collection = await this.api.collect('core\\Log', [
              ['object_id', '=', this.object_id],
              ['object_class', '=', this.object_class],
              ['user_id', '>', 0]
            ], ['action', 'user_id.name'], 'id', 'desc', 0, 10);

            this.latest_changes = collection;

          }
          catch(response) {
            console.warn(response);
          }


          // build routes, if any
          for(let route of view_routes) {
            if(route.hasOwnProperty('visible')) {
              let domain = route.visible;

              //  #todo - improve
              let res = false;

              let operand = domain[0];
              let operator = domain[1];
              let value = domain[2];

              if(!this.object || !this.object.hasOwnProperty(operand)) continue;

              operand = this.object[operand];

              // handle special cases
              if(operator == '=') {
                operator = '==';
              }
              else if(operator == '<>') {
                  operator = '!=';
              }

              if(Array.isArray(value)) {
                if(operator == 'in') {                              
                  res = (value.indexOf(operand) > -1);                
                }
                else if(operator == 'not in') {                
                  res = (value.indexOf(operand) == -1);
                }
              }
              else {
                let c_condition = "( '" + operand + "' "+operator+" '" + value + "')";
                res = <boolean>eval(c_condition);
              }

              if(!res) continue;
            }

            this.object_routes_items.push(route);
          }


          // 'checks' : read checks specific to object (verifications)
          try {              
            const view = await this.api.fetch('/?get=model_view&entity='+object_class+'&view_id=checks.default'+'&lang='+environment.lang);
            // load checks from view, if any
            if(view.hasOwnProperty('checks') && view.checks.length) {
              this.object_checks_items = view.checks;
            }
            else {
              this.object_checks_items = [];
            }

          }
          catch(err) {
            console.warn(err);
          }            

        }

        // 'help' : in all cases, request detailed documentation about the current view
        try {
          const helper = await this.api.fetch('/?get=model_view-help&entity='+descriptor.context.entity+'&view_id='+this.view_id+'&lang='+environment.lang);
          // #todo : use a cache here

          if(helper && helper.hasOwnProperty('result')) {
            this.view_description = helper.result;
          }

        }
        catch(err) {
          console.warn(err);
        }        
      }


    });

  }

  onHelpFullScreen() {
    console.log('onHelpFullScreen');
    if(screenfull.isEnabled) {
      screenfull.toggle(this.helpFullScreen.nativeElement);
    }
    else {
      console.log('screenfull not enabled');
    }
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

  public onUserSettings() {
    // this.router.navigate(['']);
    let descriptor = {
      context: {
        entity:     'lodging\\identity\\User',
        type:       'form',
        name:       'default',
        domain:     ['id', '=', this.user.id],
        mode:       'edit',
        purpose:    'view'
      }
    };

    this.router.navigate(['/']);
    this.context.change(descriptor);
  }

  public async onObjectCheck(item: any) {
    if(item.hasOwnProperty('controller')) {
      try {
        const data = await this.api.fetch('/?get='+item.controller, {id: this.object_id});
        console.log(data);
        // no error status : nothing went wrong
        this.object_checks_result.title = "Rien à signaler";
        this.object_checks_result.content = [];
      }
      catch(response: any) {
        console.log(response);
        if(response) {
          let msg = "";
          if(response.hasOwnProperty('status')) {
            if(response.status == 409) {
              this.object_checks_result.title = "Conflit(s) détecté(s)";
            }
          }

          if(response.hasOwnProperty('error')) {
            this.object_checks_result.content = response.error;
          }          
        }
      }      
    }
  }
  

  public onObjectCheckResult(line:any) {
    console.log(line);
    let context = {
      entity:     line.object_class,
      type:       'form',
      name:       'default',
      domain:     ['id', '=', line.object_id],
      mode:       'view',
      purpose:    'view'
    };

    this.context.change({context: context, route: "/"});
  }

  public onObjectRoute(item: any) {

    console.log('AppSideMenuComponent::onObjectRoute', item, this.object);
    let descriptor:any = {};

    if(item.hasOwnProperty('route')) {
      let route = item.route;
      for(let object_field of Object.keys(this.object)) {
        route = route.replace('object.'+object_field, this.object[object_field]);
      }
      descriptor.route = route;
    }

    if(item.hasOwnProperty('context')) {
      let context = item.context;
      if(context.hasOwnProperty('domain') && Array.isArray(context.domain)) {
        let domain = JSON.stringify(context.domain);
        for(let object_field of Object.keys(this.object)) {
          domain = domain.replace('object.'+object_field, this.object[object_field]);
        }        
        context.domain = JSON.parse(domain);
      }
      descriptor.context = context;
    }

    if(Object.keys(descriptor).length) {
      this.context.change(descriptor);
    }
    
  }

}
