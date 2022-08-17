import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'sb-shared-lib';

/*
This is the component that is bootstrapped by app.module.ts
*/


@Component({
    selector: 'app-root',
    templateUrl: './app.root.component.html',
    styleUrls: ['./app.root.component.scss']
})
export class AppRootComponent implements OnInit {

    public ready: boolean = false;

    constructor(private auth: AuthService, private router: Router) {}


    public async ngOnInit() {

        // listen to authentication events
        this.auth.getObservable().subscribe( (user:any) => {
            console.log('received user object', user);

            if(user.id > 0) {
                // user is already authenticated : go to root page (Apps)
                window.location.href = '/apps';
            }

        });

        // request authentication
        try {
            await this.auth.authenticate();
        }
        catch(err) {
            // user is not authenticated : hide loader and go to /signin (or received route)
            this.ready = true;
            try {
                let hash = window.location.hash;
                if(!hash.length) {
                    throw new Error('empty_hash');
                }
                const route = hash.substring(2);
                this.router.navigate([route]);
            }
            catch(err) {
                this.router.navigate(['/signin']);
            }
        }
    }
}