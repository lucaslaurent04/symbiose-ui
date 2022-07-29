import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';


@Component({
    selector: 'session-close-verification-dialog',
    templateUrl: './verification.component.html',
    styleUrls: ['./verification.component.scss']
})
export class SessionCloseVerificationDialog implements OnInit {

constructor(
    public dialogDelete: MatDialogRef<SessionCloseVerificationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // public auth : AuthService,
    // public api : ApiService, 
    // private router: Router,
    private dialog: MatDialog
  ) { }
  public deleteConfirmation = false;
  public displayTablet = false;
  public index: number;
  public total: number = 0;
  public actionType: any = "";
  public newSession: any;
  public center_id: number;
  public user: any;
  public disabled_key = [',', '+']
  public coins = [
    {
      value: 0.01, number: ""
    },
    {
      value: 0.02, number: ""
    },
    {
      value: 0.05, number: ""
    },
    {
      value: 0.1, number: ""
    },
    {
      value: 0.2, number: ""
    },
    {
      value: 0.5, number: ""
    },
    {
      value: 1, number: ""
    },
    {
      value: 2, number: ""
    },
    {
      value: 5, number: ""
    },
    {
      value: 10, number: ""
    },
    {
      value: 20, number: ""
    },
    {
      value: 50, number: ""
    },
    {
      value: 100, number: ""
    },
    {
      value: 200, number: ""
    },
    {
      value: 500, number: ""
    }
  ]


  ngOnInit(): void {
  }

  onKeyboardNumberPressed(event : any){
    // check if backspace, otherwise add number
    if(event.inputType == "deleteContentBackward") {
      let test = this.coins[this.index].number.slice(0, -1);
      this.coins[this.index].number = test;
      this.onGetTotal();
    }else{
      this.coins[this.index].number += event.target.value[event.target.value.length - 1];
      this.onGetTotal();
    }
  }
  onCheckNumberPassed(value: any) {
    console.log('pressed')
    if (value != 'backspace' && value != ',' && value != '+/-') {
      this.coins[this.index].number += value;
      this.onGetTotal();
    }


    if (value == 'backspace') {
      let test = this.coins[this.index].number.slice(0, -1);
      this.coins[this.index].number = test;
      this.onGetTotal();
    }
  }

  onGetTotal() {
    this.total = 0;
    this.coins.forEach((element) => {
      if (element.number != "") {
        this.total += element.value * parseFloat(element.number);
      }
    })
  }

  onGetFocusedInput(input: any) {
    this.index = input;
  }

  public closeDialog() {
    this.dialogDelete.close({
      cash: this.coins,
      total: this.total
    })

  }

  onBackSpace(element: any) {
    this.onCheckNumberPassed('backspace');
  }

  checkActionType(event: any) {
    this.actionType = event;
    if (this.coins[this.index].number == "") {
      this.coins[this.index].number = (parseFloat(event)).toString();

    } else {
      this.coins[this.index].number = (parseFloat(this.coins[this.index].number) + parseFloat(event)).toString();
    }
    this.onGetTotal();
  }    
}