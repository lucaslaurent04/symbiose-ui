import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChild, ViewChildren  } from '@angular/core';
import { AuthService, ApiService } from 'sb-shared-lib';
import { Router } from '@angular/router';


import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

import { Observable, BehaviorSubject } from 'rxjs';
import { find, map, startWith, debounceTime } from 'rxjs/operators';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';




@Component({
  selector: 'accounting-chart-lines',
  templateUrl: 'AccountingChartLines.component.html',
  styleUrls: ['AccountingChartLines.component.scss']
})
export class AccountingChartLinesComponent implements OnInit, AfterViewInit  {



  public AccountingCharts : any[]= [];

  constructor(
              private auth: AuthService,
              private api: ApiService,
              private router: Router,
              private dialog: MatDialog
              ) {
  }




  public ngAfterViewInit() {

  }

  public async  ngOnInit() {
    this.AccountingCharts = await this.api.collect('finance\\accounting\\AccountChart', [], []);
    console.log(this.AccountingCharts);
  }

  public getChartLines(){
    this.router.navigateByUrl('/AccountingChartLines2');
  }
}