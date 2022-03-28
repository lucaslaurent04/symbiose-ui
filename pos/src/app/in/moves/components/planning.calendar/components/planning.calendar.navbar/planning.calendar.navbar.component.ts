import { Component, Input, Output, EventEmitter, OnInit, NgZone } from '@angular/core';

import { HeaderDays } from 'src/app/model/headerdays';
import { SelectReservationArg } from 'src/app/model/selectreservationarg';
import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { ApiService, AuthService } from 'sb-shared-lib';

@Component({
  selector: 'planning-calendar-navbar',
  templateUrl: './planning.calendar.navbar.component.html',
  styleUrls: ['./planning.calendar.navbar.component.scss']
})
export class PlanningCalendarNavbarComponent implements OnInit {
  @Input() day: number;
  @Input() month: number;
  @Input() year: number;
  @Output() changedays = new EventEmitter<ChangeReservationArg>();

  currymd: Date;
  datpicker: Date;
  cbrooms: any[];
  
  type: string;
  capacity = '0';
  center_id: number = 0;

  hd: HeaderDays;

  view_range: number = 15;

  centers: any[] = [];
  

  constructor(private api: ApiService, private auth: AuthService, private zone: NgZone) { 

  }

  ngOnInit() {
    this.type = 'month';
    const capacity = +this.capacity;
    this.currymd = new Date(this.year, this.month - 1, 1);
    this.datpicker = new Date(this.currymd);
    this.hd = this.createHeaderDays();
    const args = new ChangeReservationArg(this.type, 'init', capacity, this.hd);
    this.changedays.emit(args);

    // by default set the first center of current user
    this.auth.getObservable().subscribe( async (user:any) => {
      if(user.hasOwnProperty('centers_ids') && user.centers_ids.length) {
        try {
          const centers = await this.api.collect('lodging\\identity\\Center', 
            ['id', 'in', user.centers_ids], 
            ['id', 'name', 'code'],
            'name','asc',0,50
          );
          if(centers.length) {
            this.zone.run( () => {
              this.centers = centers;
              this.center_id = centers[0].id;
              this.changeDays(this.type, 'refresh');
            })
          }
        }
        catch(err) {
         console.warn(err) ;
        }
        
      }
  
    });

  }

  public onCapacityChange(data: any) {
    this.capacity = data.value;
    this.changeDays(this.type, 'refresh');
  }

  public onCenterChange(data: any) {
    this.center_id = data.value;
    this.changeDays(this.type, 'refresh');
  }

  public onViewChange() {
    this.changeDays(this.type, 'refresh');
  }
  
  public onToday() {
    this.type = 'month';
    let date = new Date();
    date.setDate(1);
    this.currymd = new Date(date);
    this.changeDays(this.type, 'refresh');
  }

  onPrev() {
    this.currymd = ( (d: Date): Date => {
      let x = new Date(d);
      x.setDate(1);
      x.setMonth(x.getMonth()-1);
      return x;
    })(this.currymd);

    this.changeDays(this.type, 'prev');
  }

  onNext() {
    this.currymd = ( (d: Date): Date => {
      let x = new Date(d);
      x.setDate(1);
      x.setMonth(x.getMonth()+1);
      return x;
    })(this.currymd);

    this.changeDays(this.type, 'next');
  }

  onPickerChange(e:any) {
    console.log(e);
    this.type = 'month';
    const date = new Date(e.value);
    date.setDate(1);
    this.currymd = new Date(date);
    this.changeDays(this.type, 'refresh');
  }


  private changeDays(type: string, operation: string) {
    console.log('relaying changes');
    this.datpicker = new Date(this.currymd);
    this.hd = this.createHeaderDays();
    const args = new ChangeReservationArg(type, operation, +this.capacity, this.hd, this.hd.date_from, this.hd.date_to, this.center_id);
    this.changedays.emit(args);
  }

  private createHeaderDays(): HeaderDays {
    const h = new HeaderDays();
    let currdate = new Date(this.currymd);
    const dd = currdate.getDate();

    let $days_in_month = ( (d: Date):number => {
      let x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return x.getDate();
    })(currdate);

    // change the max days displayed here        
    let days = (dd === 1) ? $days_in_month : 31;
    // days = Math.min(this.view_range, days);

    for (let i = 0; i < days; i++) {
      if (i > 0) {
        currdate = ( (d: Date):Date => {
          let x = new Date(d);
          x.setDate(x.getDate() + 1);
          return x;
        })(currdate);
      }
      h.headDaysAll.push(currdate);
    }
    h.date_from = h.headDaysAll[0];
    h.date_to = h.headDaysAll[h.headDaysAll.length - 1];
    const firstmonth = h.headDaysAll[0].getMonth();
    for (const dayhead of h.headDaysAll) {
      if (dayhead.getMonth() === firstmonth) {
        h.headDays1.push(dayhead);
      } else {
        h.headDays2.push(dayhead);
      }
    }
    if (h.headDays1.length > 0) {
      h.months.push({
        date: h.headDays1[0],
        days: h.headDays1.length
      });
    }
    if (h.headDays2.length > 0) {
      h.months.push({
          date: h.headDays2[0],
          days: h.headDays2.length
        }
      );
    }
    return h;
  }

}
