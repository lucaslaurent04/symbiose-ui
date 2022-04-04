import { Injectable } from '@angular/core';


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

  public open(context: any) {
    this.eq.open(context);
  }

  public popup(context: any) {
    this.eq.popup(context);
  }

  public closeAll() {
    this.eq.closeAll();
  }

  public addSubscriber(events: string[], callback: (context:any) => void) {
    this.eq.addSubscriber(events, callback);
  }

  /**
   * Provide ApiService to allow sharing the Views and Translations cache.
   * @returns The instance of eQ ApiService.
   */
  public getApiService() {
    return this.eq.getApiService();
  }

  /**
   * Provide TranslationService to allow resolving view items transaltions.
   * @returns The instance of eQ TranslationService.
   */
   public getTranslationService() {
    return this.eq.getTranslationService();
  }
}