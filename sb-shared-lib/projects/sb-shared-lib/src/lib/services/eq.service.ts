import { Injectable } from '@angular/core';

// `EventsListener.js` (from `equal.bundle.js`) is exported in webpack.config.js as 'eQ' var
declare global {
  interface Window { eQ: any }
}

@Injectable({
  providedIn: 'root'
})

export class EqualUIService {

    private eq: any;

    constructor() {
        this.eq = new window.eQ('eq-listener');
    }

    public async open(context: any) {
        // request context opening from an external service
        return await this.eq.open(context, true);
    }

    public async popup(context: any, domContainerSelector: string = 'body') {
        await this.eq.popup(context, domContainerSelector);
    }

    public async closeAll() {
        // request closing all contexts from an external service
        return await this.eq.closeAll(true);
    }

    public addSubscriber(events: string[], callback: (context:any) => void) {
        this.eq.addSubscriber(events, callback);
    }

    /**
     * Retrieve a JQuery object for action button (if any) from a given view
     * @param entity
     * @param view_id
     * @returns JQuery
     */
    public async getActionButton(entity: string, view_id: string, domain: any[]) {
        return await this.eq.getActionButton(entity, view_id, domain);
    }

    /**
     * Provide ApiService to allow sharing the Views and Translations cache.
     * @returns The instance of eQ ApiService.
     */
    public getApiService() {
        return this.eq.getApiService();
    }

    /**
     * Provide TranslationService to allow resolving view items translations.
     * @returns The instance of eQ TranslationService.
     */
    public getTranslationService() {
        return this.eq.getTranslationService();
    }
}