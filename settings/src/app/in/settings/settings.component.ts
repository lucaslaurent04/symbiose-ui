import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'sb-shared-lib';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router'
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import { Route } from '@angular/compiler/src/core';
import { FormGroup, FormBuilder } from '@angular/forms';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  editForm:FormGroup;
  formBuilder: FormBuilder;
  constructor( 
    private api: ApiService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    
   ) { }
  public value : "";
  public arrayEmpty = [];
  public data : any[]= [];
  public dataSorted : any[] = [];
  public nameArray : string[] = [];
  public queue :any[]=[];


  ngOnInit() {
    this.route.params.subscribe(async params=>{
      if(params.package == "general"){
        this.data = await this.api.collect('core\\Setting', ['package','=',' '], ['package', 'section', 'description', 'setting_values_ids.value', 'type', 'title', 'setting_choices_ids.value']);
        console.log(this.data);
        this.sortData();
       
      }else if(params.package == "sale"){
        this.data = await this.api.collect('core\\Setting', ['package','=','sale'], ['package', 'section', 'description', 'setting_values_ids.value', 'type','setting_choices_ids.value', 'title']);
        console.log(this.data);
        this.sortData(); 
      }else{
        this.data = await this.api.collect('core\\Setting', ['package','=','finance'], ['package', 'section', 'description', 'setting_values_ids.value', 'type','setting_choices_ids.value', 'title']);
        this.sortData();
      }
    });
    this.router.events.subscribe((val) => {
      if(val instanceof NavigationEnd){
        console.log('ok');
        this.initialize();
      }
    });
    // Sorting the arrays by Section
  

   
  }


  public sortData(){
    this.dataSorted = [];
    this.nameArray = [];
    this.data.forEach(element => {
      if(!this.nameArray.includes(element.section)){
        this.nameArray.push(element.section);
        let index = this.nameArray.indexOf(element.section);
        this.dataSorted[index] = [element];
      }else{
        let index = this.nameArray.indexOf(element.section);
        this.dataSorted[index].push(element);
      }
    });
    
  }


  //Fin INIT

  public initialize(){ 
    
    this.route.params.subscribe(async params=>{
      if(params.package == "general"){
        console.log('there');
       
        this.data = await this.api.collect('core\\Setting', ['package','=',' '], ['package', 'section', 'description', 'setting_values_ids.value', 'type','setting_choices_ids.value', 'title']);
        
       
       this.sortData();
       
      }else if(params.package == "sale"){
        this.data = await this.api.collect('core\\Setting', ['package','=','sale'], ['package', 'section', 'description', 'setting_values_ids.value', 'type','setting_choices_ids.value', 'title']);
        this.sortData();
        
      }else{
       
        this.data = await this.api.collect('core\\Setting', ['package','=','finance'], ['package', 'section', 'description', 'setting_values_ids.value', 'type','setting_choices_ids.value', 'title']);
        this.sortData();
      }  
    });
    }

  openSnackBar(message: string, ide: number, value:any, element:any) {
    let snackBarRef = this._snackBar.open(message+' changes confirmed ?', 'Undo', {
      duration: 3000,
      verticalPosition: 'bottom', // 'top' | 'bottom'
      horizontalPosition: 'start',
    });
    this.queue.push({id:ide, value:'true', element:element});
    console.log(this.queue);
    snackBarRef.onAction().subscribe(()=>{
      console.log(this.queue[0].element);
      this.queue.pop();
      console.log(element.value);
      console.log('the action went through'); 
    })
    snackBarRef.afterDismissed().subscribe(()=>{
        this.queue.forEach(element => {
          console.log(element.id);
          this.api.update('core\\SettingValue',[element.id], { value: element.value }, true);
        });   
    });
  } 
 //verifier



 public change(){
 
 }
}
