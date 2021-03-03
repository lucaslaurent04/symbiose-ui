import { $ } from "./jquery-lib";
import { environment } from "./environment";

/**
 * This service is in charge of loading the UI translations and provide getters to retrieve requested values
 */
export class _TranslationService {
        
    // promise object
    private translations: any;

    // remember if the file fetching has been done
    private resolved: any;

    constructor() {
        this.resolved = null;

        this.init();
    }

    private init() {
        this.translations = $.Deferred();
        this.resolved = false;

        fetch('./i18n/'+environment.lang)
        .then( (response:any) => {
            response.json() 
            .then( (json_data:any) => {
                // keep a copy for instant translation (we have no mean to detect if)
                this.resolved = json_data;
                this.translations.resolve(json_data);                
            })
            .catch( () => {
                this.translations.resolve({});
            });                
        })
        .catch( () => {
            this.translations.resolve({});
        });

    }

    public async translate(value:string) {
        let translation: string = '';
        try {
            const translations = await this.translations;
            if(translations.hasOwnProperty(value)) {
                translation = translations[value];
            }
        }
        catch {}
        return translation;
    }


    /**
     * Instant translation (non-blocking). If no value is found the given string is returned as result.
     * *
     * @param value 
     */
    public instant(value:string) {
        let translation: string = value;
        if(this.resolved) {
            if(this.resolved.hasOwnProperty(value)) {
                translation = this.resolved[value];
            }
        }
        return translation;
    }
   
    
}



export default _TranslationService;