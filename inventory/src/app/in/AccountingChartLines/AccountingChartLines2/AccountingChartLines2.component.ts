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
  selector: 'accounting-chart-lines2',
  templateUrl: 'AccountingChartLines2.component.html'
})
export class AccountingChartLines2Component implements OnInit, AfterViewInit  {



  public AccountingChartsLines : any[]= [];

  public TempAccountingChartsLines: any[]=[];
  public AccountingChartsLinesParents : any[]= [];



  constructor(
              private auth: AuthService,
              private api: ApiService,
              private router: Router,
              private dialog: MatDialog
              ) {
  }




  public ngAfterViewInit() {

  }

  public substring(elem:any){
    
    let $newElem = elem.substring(0,2);

    return $newElem;
    
  }
  public async  ngOnInit() {
    this.AccountingChartsLines = await this.api.collect('finance\\accounting\\AccountChartLine', [], ['code','type','nature']);
    console.log(this.AccountingChartsLines);
    this.TempAccountingChartsLines = this.AccountingChartsLines;


    for (var i=0; i < 10; i++) {
      let results= this.AccountingChartsLines.filter(x => x.code[0] == i);
      results.sort(function(a, b){return a-b});
      this.AccountingChartsLinesParents.push(results);
  }
  console.log(this.AccountingChartsLinesParents);
  }


  public onChange(event:any){
    this.TempAccountingChartsLines= this.AccountingChartsLines.filter(x => x.code.substring(0,2)== event.value);
   
  }

  // public getForm(){

  // }
}