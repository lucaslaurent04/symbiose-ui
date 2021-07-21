import { $ } from "./jquery-lib";
import { environment } from "./environment";
import { i18n } from "./i18n";

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

        if(i18n.hasOwnProperty(environment.lang)) {
            this.resolved = (<any>i18n)[environment.lang];
            this.translations.resolve((<any>i18n)[environment.lang]);
        }
        else {
            this.translations.resolve({});
        }

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
     * Helper method for resolution from a `translation` object (as provided by the ApiService)
     * 
     * @param translation   Object holding the translations values (as returned by `ApiService::getTranslation()`)
     * @param type          Kind of terms we want to perform ('model','view','error')
     * @param id            The identifier of the item we want to translate
     * @param value         The default value, if any, to fall back to in case translation fails 
     * @param section       The translation section we're looking for, for the considered value ('label', 'help', ...)
     * 
     * @returns The translated value, or the original value if translation fails.
     */ 
    public resolve(translation:any, type:string, id: string, value: string = '', section:string = 'label') {
        let result = value.charAt(0).toUpperCase() + value.replace(/_/g, ' ').slice(1);

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