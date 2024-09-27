import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, ReplaySubject } from 'rxjs';
import { catchError } from "rxjs/operators";

import { UserClass } from '../classes/user.class';
import { EnvService} from './env.service';

@Injectable({
    providedIn: 'root'
})

/**
 * This service offers a getObservable() method allowing to access an Observable that any component can subscribe to.
 * Subscribers will always receive the latest emitted value as a User object.
 *
 * Only methods authenticate() and signout() update the observable. In the latter case, User object will have its id set to 0,
 * in the former, the User object will be populated with values received from the server.
 */
export class AuthService {
    readonly MAX_RETRIES = 2;

    // current User
    private _user: UserClass = new UserClass();

    // internal counter for preventing infinite-loop in case of server error
    private retries = 0;

    // timestamp of last auth
    public last_auth_time: number;

    private observable: ReplaySubject<any>;


    /**
     * #todo - make this private
     */
    public get user(): any {
        return this._user;
    }

    private set user(user: UserClass) {
        this._user = {...this._user, ...user};
        // notify subscribers
        this.observable.next(this._user);
    }

    public getObservable(): ReplaySubject<any> {
        return this.observable;
    }
    /**
     * As retrieving user is asynchronous, the getObservable method should be preferred.
     * @deprecated
     */
    public getUser(): UserClass {
        return this._user;
    }


    constructor(private http: HttpClient, private env:EnvService) {
        this.observable = new ReplaySubject<any>(1);
        this.last_auth_time = -1;
    }


    /**
     * Upon success, this method updates the `user` member of the class accordingly to the object received.
     * Otherwise, it throws an error holding the httpResponse.
     *
     * @throws HttpErrorResponse  In case an error is returned, the response object is relayed as an Exception.
     */
    public async authenticate() {
        console.debug('AuthService::authenticate');

        // attempt to log the user in
        try {
            // make sure Environment has been fetched
            const environment = await this.env.getEnv();
            // #memo - /userinfo route can be adapted in back-end config (to steer to wanted controller)
            const data = await this.http.get<any>(environment.rest_api_url + 'userinfo').toPromise();

            this.last_auth_time = new Date().getTime();

            // update local user object and notify subscribers
            this.user = <UserClass> data;
            if(this._user.hasOwnProperty('language')) {
                this.env.setEnv('locale', this._user.language);
            }
        }
        catch(httpErrorResponse:any) {
            let response = <HttpErrorResponse> httpErrorResponse;

            if(response.hasOwnProperty('status') && response.status == 401) {
                let body = response.error;
                let error_code = Object.keys(body.errors)[0];
                let error_id = body.errors[error_code];
                if(error_id == 'auth_expired_token') {
                    // redirect to signin page
                }
            }

            throw response;
        }

    }

    /**
     * Assert a user is member of a given group
     */
    public hasGroup(group: string): boolean {
        let result = false;
        const target_group = group.replace('*', '');
        // get list of groups current user is assigned to
        if(this.user.groups) {
            for(let group_name of this.user.groups) {
                // check if given group is part of the array
                if(group_name.indexOf(target_group) === 0) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }

    public async signOut() {
        // update local user object and notify subscribers
        this.user = new UserClass();
        const environment:any = await this.env.getEnv();
        // send a request to revoke access_token and remove the HTTP cookie
        return this.http.get<any>(environment.backend_url + '?do=user_signout').toPromise();
    }

    /**
     * Upon success, the response from the server should contain httpOnly cookies holding access_token.
     *
     * @param login     Email address of the user to log in.
     * @param password  Untouched string of password given by user.
     *
     * @returns Promise
     * @throws HttpErrorResponse  HTTP error that occurred during user login
     */
    public async signIn(login: string, password: string) {
        try {
            const environment:any = await this.env.getEnv();
            const data = await this.http.get<any>(environment.backend_url+'?do=user_signin', {
                params: {
                    login: login,
                    password: password
                }
            })
            .pipe(
                catchError((response: HttpErrorResponse, caught: Observable<any>) => {
                    throw response;
                })
            )
            .toPromise();

            // authentication will trigger router navigation within running controller
            await this.authenticate();
        }
        catch(response) {
            throw response;
        }
    }

    /**
     * Sends a request for new User account creation.
     * Upon success, the response from the server should have a 201 status. No body is expected.
     *
     * @param login     Email address of the user to log in.
     * @param password  Untouched string of password given by user.
     * @param resend    Message identifier previously received and requested to be re-sent. Defaults to 0 for first request.
     *
     * @returns Promise
     * @throws HttpErrorResponse  HTTP error that occurred during user login
     */
    public async signUp(username: string, email: string, password: string, resend: number = 0) {

        const environment:any = await this.env.getEnv();

        return this.http.get<any>(environment.backend_url+'?do=user_signup', {
            params: {
                username: username,
                email: email,
                password: password,
                resend: resend
            }
        }).toPromise();

    }


    /**
     * @param email string  email address related to the account to recover
     * @returns void
     * @throws HttpErrorResponse  HTTP error that occurred during user login
     */
    public async passRecover(email: string) {
        const environment:any = await this.env.getEnv();
        return this.http.get<any>(environment.backend_url+'?do=user_pass-recover', {
            params: {
                email: email
            }
        }).toPromise();
    }

}