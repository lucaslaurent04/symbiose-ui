export class BookingAccomodationAssignement {
    // index signature
    [key: string]: any;
    // model entity
    public get entity():string { return 'lodging\\sale\\booking\\BookingLineRentalUnitAssignement'};
    // constructor with public properties
    constructor(
        public id: number = 0,    
        public rental_unit_id: any = {},
        public qty: number = 0
    ) {}
}