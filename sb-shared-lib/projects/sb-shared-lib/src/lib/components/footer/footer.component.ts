import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService} from '../../services/env.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

    public app_name: string = '';
    public version: string  = '';
    public license: string  = '';
    public license_url: string  = '';
    public company_name: string = '';
    public company_url: string  = '';

    constructor(
        private router: Router,
        private env:EnvService) {
    }

    ngOnInit(): void {

        this.env.getEnv().then( (environment:any) => {
            this.app_name = (environment.app_name)?environment.app_name:'';
            this.version  = (environment.version)?environment.version:'';
            this.license  = (environment.license)?environment.license:'';
            this.license_url  = (environment.license_url)?environment.license_url:'';
            this.company_name = (environment.company_name)?environment.company_name:'';
            this.company_url  = (environment.company_url)?environment.company_url:'';
        });
    }

}
