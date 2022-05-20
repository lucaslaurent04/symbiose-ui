export class BookingLineGroup {
    // index signature
    [key: string]: any;
    // model entity
    public get entity():string { return 'lodging\\sale\\booking\\BookingLineGroup'};
    // constructor with public properties
    constructor(
        public id: number = 0,
        public name: string = '',
        public created: Date = new Date(),
        public total: number = 0,
        public price: number = 0,
        public booking_id: number = 0,
        public order: number = 0,
        public has_pack: boolean = false,
        public is_locked: boolean = false,
        public is_autosale: boolean = false,
        public is_extra: boolean = false,
        public date_from: Date = new Date(),
        public date_to: Date = new Date(),
        public nb_pers: number = 0,
        public nb_nights: number = 0,
        public is_sojourn: boolean = false,        
        public pack_id: any = {},
        public sojourn_type_id: number = 0,
        public rate_class_id: any = {},        
        public accomodations_ids: any[] = [],
        public booking_lines_ids: any[] = []
    ) {}
}