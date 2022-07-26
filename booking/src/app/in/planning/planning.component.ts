import { Component, Renderer2, ChangeDetectorRef, OnInit, AfterViewInit, NgZone, ViewChild, ElementRef, HostListener, Inject } from '@angular/core';

import { Subscription } from 'rxjs';

import { BookingDayClass } from 'src/app/model/booking.class';
import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { ApiService, AuthService, ContextService } from 'sb-shared-lib';
import { CalendarParamService } from './_services/calendar.param.service';
import { PlanningCalendarComponent } from './_components/planning.calendar/planning.calendar.component';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import * as screenfull from 'screenfull';

interface DateRange {
  from: Date,
  to: Date
}

@Component({
    selector: 'planning',
    templateUrl: './planning.component.html',
    styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit, AfterViewInit {    
    @ViewChild('planningBody') planningBody: ElementRef;
    @ViewChild('planningCalendar') planningCalendar: ElementRef;

    centers_ids: number[];

    date_range: DateRange = <DateRange>{};
    fullscreen: boolean = false;

    constructor(
        private api: ApiService,
        private auth:AuthService,
        private context: ContextService,
        private params: CalendarParamService,
        private cd: ChangeDetectorRef,
        private zone: NgZone,
        public dialog: MatDialog
    ) {

        this.centers_ids = [];
    }

    ngOnInit() {
        if (screenfull.isEnabled) {
            screenfull.on('change', () => {
                this.fullscreen = screenfull.isFullscreen;
            });
        }
    }

    /**
   * Set up callbacks when component DOM is ready.
   */
    public ngAfterViewInit() {

    }

    public async onFullScreen() {
        console.log('onHelpFullScreen');
        if (screenfull.isEnabled) {
            this.cd.detach();
            await screenfull.request(this.planningBody.nativeElement);
            this.cd.reattach();
        }
        else {
            console.log('screenfull not enabled');
        }
    }

    public onOpenDialog(){
        const dialogRef = this.dialog.open(DialogInfo, {
          });
    }

    public onShowBooking(booking: any) {
        let descriptor:any = {
            context_silent: true, // do not update sidebar            
            context: {
                entity: 'lodging\\sale\\booking\\Booking',
                type: 'form',
                name: 'default',
                domain: ['id', '=', booking.booking_id.id],
                mode: 'view',
                purpose: 'view',
                display_mode: 'popup',
                callback: (data:any) => {
                    // restart angular lifecycles
                    this.cd.reattach();
                }
            }
        };

        if(this.fullscreen) {
            descriptor.context['dom_container'] = '.planning-body';
        }
        // prevent angular lifecycles while a context is open
        this.cd.detach();
        this.context.change(descriptor);
    }


    public onShowRentalUnit(rental_unit: any) {
        let descriptor:any = {
            context_silent: true, // do not update sidebar            
            context: {
                entity: 'lodging\\realestate\\RentalUnit',
                type: 'form',
                name: 'default',
                domain: ['id', '=', rental_unit.id],
                mode: 'view',
                purpose: 'view',
                display_mode: 'popup',
                callback: (data:any) => {
                    // restart angular lifecycles
                    this.cd.reattach();
                }
            }
        };

        if(this.fullscreen) {
            descriptor.context['dom_container'] = '.planning-body';
        }
        // prevent angular lifecycles while a context is open
        this.cd.detach();
        this.context.change(descriptor);
    }
}









@Component({
    selector: 'dialog-info',
    template: `
    <h3 style="display: flex; justify-content: center; border-bottom: solid 1px lightgrey; margin-bottom: 0;" mat-dialog-title>Légende</h3>
    <div mat-dialog-content style=" margin: 6px;">
        <div style="display:grid; grid-template-columns: repeat(1, 200px 300px); row-gap: 10px; align-items: center;">
            <div class="dialog-info" style="
            background-color: #C80651;">
                <div style="display: flex; box-sizing: border-box;">
                    <div style="flex: 0 1 20%;">bloqué</div>
                    <div style="margin-left: auto">
                        <span class="material-icons" style="transform: scale(0.6); font-size: 20px;">block</span>
                    </div>
                </div>
            </div>

            <div>
                <span style="font-weight: bold; font-size: 15px;">Hors service</span>
                <br>
                <span style="font-weight: light; font-size: 14px;">(Unité bloquée manuellement)</span>
            </div>
            <div class="dialog-info" style="background-color: #0288d1;">
            <div style="display: flex; box-sizing: border-box;">
                    <div style="flex: 0 1 20%;">111111</div>
                    <div style="margin-left: auto">
                        <span class="material-icons" style="transform: scale(0.6); font-size: 20px;">question_mark</span>
                    </div>
                </div>
                <div>
                    <div style="flex: 0 1 20%; margin-top: -4px;"> Johnny Knoxville</div>
                </div>
            </div>
            <div>
                <span style="font-weight: bold; font-size: 15px;">En option</span>
                    <br>
                <span style="font-weight: light; font-size: 14px;">(Avec '?')</span>     
            </div>
            <div class="dialog-info" style="background-color: #ff9633;"> 
                <div style="display: flex; box-sizing: border-box;">
                    <div style="flex: 0 1 20%;">111111</div>
                    <div style="margin-left: auto">
                        <span class="material-icons" style="transform: scale(0.6); font-size: 20px;">check</span>
                    </div>
                </div>
                <div>
                    <div style="flex: 0 1 20%; margin-top: -4px;"> Johnny Knoxville</div>
                </div>        
            </div>
            <div>
                <span style="font-weight: bold; font-size: 15px;">Confirmée</span>
                    <br>
                <span style="font-weight: light; font-size: 14px;">(Paiement ok si '/$', paiement en attente si '$')</span>   
            </div>
            <div class="dialog-info" style="background-color: #0FA200;"> 
                <div style="display: flex; box-sizing: border-box;">
                    <div style="flex: 0 1 20%;">111111</div>
                    <div style="margin-left: auto">
                        <span class="material-icons" style="transform: scale(0.6); font-size: 20px;">check</span>
                    </div>
                </div>
                <div>
                    <div style="flex: 0 1 20%; margin-top: -4px;"> Johnny Knoxville</div>
                </div>
            </div>
            <div>
                <span style="font-weight: bold; font-size: 15px;">Validée</span>
                    <br>
                <span style="font-weight: light; font-size: 14px;">(Avec 'v')</span>  
            </div>
            <div class="dialog-info" style="background-color: #0fc4a7;"> 
                <div style="display: flex; box-sizing: border-box;">
                    <div style="flex: 0 1 20%;">111111</div>
                    <div style="margin-left: auto">
                        <span class="material-icons" style="transform: scale(0.6); font-size: 20px;">check</span>
                    </div>
                </div>
                <div>
                    <div style="flex: 0 1 20%; margin-top: -4px;"> Johnny Knoxville</div>
                </div>
            </div>
            <div>
                <span style="font-weight: bold; font-size: 15px;">En cours d'occupation</span>
            </div>
            <div class="dialog-info" style="background-color: #988a7d;"> 
                <div style="display: flex; box-sizing: border-box;">
                    <div style="flex: 0 1 20%;">111111</div>
                    <div style="margin-left: auto">
                        <span class="material-icons" style="transform: scale(0.6); font-size: 20px;">check</span>
                    </div>
                </div>
                <div>
                    <div style="flex: 0 1 20%; margin-top: -4px;"> Johnny Knoxville</div>
                </div>        
            </div>
            <div>
                <span style="font-weight: bold; font-size: 15px;">Terminée / Client parti</span>
            </div>
            <div class="dialog-info" style="background-color: #C80651; opacity: 0.5;"> 
                <div style="display: flex; box-sizing: border-box;">
                    <div style="flex: 0 1 20%;">111111</div>
                    <div style="margin-left: auto">
                        <span class="material-icons" style="transform: scale(0.6); font-size: 20px;">check</span>
                    </div>
                </div>
                <div>
                    <div style="flex: 0 1 20%; margin-top: -4px;"> Johnny Knoxville</div>
                </div>
            </div>
            <div>
                <span style="font-size: 15px;"><b>Couleur transparente</b> : Unité parente partiellement louée (non disponible entièrement)- Une ou plusieurs sous-unités sont louées</span>
            </div>
        </div>
    </div>
    <div mat-dialog-actions style="justify-content: flex-end; border-top: solid 1px lightgrey;">
    <button  mat-raised-button color="primary" style="float: right;" (click)="onNoClick()">Fermer</button>
    </div>
    `
  })
  export class DialogInfo {
    constructor(
      public dialogRef: MatDialogRef<DialogInfo>,
    //   @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  }

  /*

LEGEND :

    rouge : hors service (unité bloquée manuellement)
    bleu : en option (avec '?')
    orange : confirmée (paiement ok si '/$', paiement en attente si '$')
    vert : validée  (avec 'v')
    turquoise : en cours d'occupation
    gris : terminée / client parti
    couleur transparente : unité parente partiellement louée (non disponible entièrement) - une ou plusieurs sous-unités sont louées

    yellow: '#ff9633',
    turquoise: '#0fc4a7',
    green: '#0FA200',
    blue: '#0288d1',
    violet: '#9575cd',
    red: '#C80651',
    grey: '#988a7d',

    if(this.consumption.type == 'ooo') {
            return colors['red'];
        }
        if(this.consumption.booking_id?.status == 'option') {
            return colors['blue'];
        }
        if(this.consumption.booking_id?.status == 'confirmed') {
            return colors['yellow'];
        }
        if(this.consumption.booking_id?.status == 'validated') {
            return colors['green'];
        }
        if(this.consumption.booking_id?.status == 'checkedin') {
            return colors['turquoise'];
        }        
        return colors['grey'];

*/