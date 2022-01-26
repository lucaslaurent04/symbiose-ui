import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'sb-shared-lib';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor( 
    private api: ApiService,
    private _snackBar: MatSnackBar
   ) { }

  public data : any[]= [];
  public dataSorted : any[] = [];
  public nameArray : string[] = [];
  async ngOnInit() {
    this.data = await this.api.collect('core\\Setting', ['package','=',' '], ['package', 'section', 'description', 'setting_values_ids.value', 'type']);
    
    // Sorting the arrays by Section
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


  openSnackBar(message: string, action: string) {
    let snackBarRef = this._snackBar.open(message+' changes confirmed ?', 'Undo', {
      duration: 3000,
      verticalPosition: 'bottom', // 'top' | 'bottom'
      horizontalPosition: 'start',
    });
    snackBarRef.afterDismissed().subscribe(()=>{
      console.log('Snackbar is down');
    })
  }
  
 //verifier

}
