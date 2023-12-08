import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class EnvService {

    private environment: any = null;
    private promise: any = null;

    private default: any = {
        "production":                   true,
        "parent_domain":                "equal.local",
        "backend_url":                  "http://equal.local",
        "rest_api_url":                 "http://equal.local/",
        "lang":                         "en",
        "locale":                       "en",
        "company_name":                 "eQual Framework",
        "company_url":                  "https://equal.run",
        "app_name":                     "eQual.run",
        "app_logo_url":                 "/assets/img/logo.svg",
        "app_settings_root_package":    "core",
        "version":                      "1.0",
        "license":                      "AGPL",
        "license_url":                  "https://www.gnu.org/licenses/agpl-3.0.en.html"
    };

    constructor() {}

    /**
     *
     * @returns Promise
     */
    public getEnv() {
        if(!this.promise) {
            this.promise = new Promise( async (resolve, reject) => {
                try {
                    const response:Response = await fetch('/assets/env/config.json');
                    const env = await response.json();
                    this.assignEnv({...this.default, ...env});
                    resolve(this.environment);
                }
                catch(response) {
                    this.assignEnv({...this.default});
                    resolve(this.environment);
                }
            });
        }
        return this.promise;
    }

    /**
     * Assign and adapter to support older version of the URL syntax
     */
    private assignEnv(environment: any) {
        if(environment.hasOwnProperty('backend_url')) {
            if(environment.backend_url.replace('://','').indexOf('/') == -1) {
                environment.backend_url += '/';
            }
        }
        this.environment = {...environment};
    }

    public setEnv(property: string, value: any) {
        if(this.environment) {
            this.environment[property] = value;
        }
    }

}