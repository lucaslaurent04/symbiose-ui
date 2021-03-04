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
   

    /**
     * Helper method for resolution from a `transaltion` object (as provided by the ApiService)
     * 
     * @param translation   object holding the translations valies
     * @param type          kind of terms we want to perform ('model' or 'view')
     * @param id            the identifier of the item we want to translate
     * @param value         the default value, if any, to fall back to in case translation fails 
     * @param section       the translation section we're looking for, for the considered value ('label', 'help', ...)
     * 
     * @returns The translated value or the original value if translation fails.
     */ 
    public resolve(translation:any, type:string, id: string, value: string = '', section:string = 'label') {
        let result = value.charAt(0).toUpperCase() + value.replace('_', ' ').slice(1);
        console.log('_TranslationService::resolve', translation);
        if(translation.hasOwnProperty(type)) {
            if(translation[type].hasOwnProperty(id)) {
                if(translation[type][id].hasOwnProperty(section)) {
                    result = translation[type][id][section];
                }
            }
        }
        return result;
    }
    
}



export default _TranslationService;