export class BookingAccomodationAssignment {
    // index signature
    [key: string]: any;
    // model entity
    public get entity():string { return 'lodging\\sale\\booking\\BookingLineRentalUnitAssignement'};
    // constructor with public properties
    constructor(
        public id: number = 0,
        public rental_unit_id: any = {},
        public qty: number = 0,
        public booking_line_id: number = 0,
    ) {}
}