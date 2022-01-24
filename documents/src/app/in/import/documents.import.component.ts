// import { Component, OnInit, AfterViewInit  } from '@angular/core';
// import { AuthService, ApiService } from 'sb-shared-lib';
import { Component, AfterContentInit, OnInit, NgZone, Inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ApiService, ContextService, AuthService } from 'sb-shared-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'documents-import',
  templateUrl: './documents.import.component.html',
  styleUrls: ['./documents.import.component.scss']
})
export class DocumentsImportComponent implements OnInit, AfterContentInit {


  @ViewChild(MatPaginator) paginator = MatPaginator;


  public files: any[] = [];
  public rejectedFiles: any[] = [];
  public loading = false;
  public name: string = '';

  public showSbContainer: boolean = false;
  public selectedTabIndex: number = 0;
  // public loading = true;
  public sessionDate: any;
  public DocumentsDate: string;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private zone: NgZone,
    public auth: AuthService,
  ) {
  }
  // private data: DataService

  /**
   * Set up callbacks when component DOM is ready.
   */
  public ngAfterContentInit() {
    this.loading = false;

    // _open and _close event are relayed by eqListener on the DOM node given as target when a context is requested
    // #sb-booking-container is defined in booking.edit.component.html
    $('#sb-composition-container').on('_close', (event, data) => {
      this.zone.run(() => {
        this.showSbContainer = false;
        this.selectedTabIndex = 0;
      });
    });

    $('#sb-composition-container').on('_open', (event, data) => {
      this.zone.run(() => {
        this.showSbContainer = true;
      });
    });
  }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.sessionDate = ~~(+new Date() / 1000);
  }



  public async onSelect(event: any) {

    //Display of the rejected files
    this.rejectedFiles = event.rejectedFiles;

    let files = event.addedFiles;
    this.loading = true;

    for (var i = 0; i < files.length; i++) {

      const data = await this.readFile(files[i]);
      console.log(data);
      try {
        const response = await this.api.create("documents\\Document", {
          name: files[i].name,
          type: files[i].type,
          data: data,
        });
        files[i].id = response.id;

        this.files.push(files[i]);
        // this.onRemove(file[i]);
        this.load();
      }
      catch (err) {
        console.log(err);
      }
    }
    this.loading = false;
  }

  // async onRemove(file: any) {
  //   this.files.splice(this.files.indexOf(file), 1);
  //   try {
  //     console.log(file);
  //     this.files = await this.api.remove('documents\\Document', [file.id], true);
  //     this.load();
  //   }
  //   catch (err) {
  //     console.log("err fetch", err);
  //   }
  // }

  async load() {
    try {
      this.files = await this.api.collect('documents\\Document', ['created', '>', this.sessionDate], ['id', 'name', 'hash', 'created', 'size', 'type', 'link', 'data', 'readable_size', 'preview_image']);
      console.log("fetch response", this.files);
    }
    catch (err) {
      console.log("err fetch", err);
    }
  }

  async onDelete(file: any) {
    // permanent deletion
    const dialogDelete = this.dialog.open(DialogDeleteConfirmation, {
      data: file
    });

    dialogDelete.afterClosed().subscribe(
      res => {
        console.log('solution', res);
        try {

          let index = this.files.findIndex((f: any) => f.id == res.data.id);
          this.files.splice(index, 1);

          this.load();
        }
        catch (err) {
          console.log("err delete", err);
        }
      }
    )
  }

  onDisplay(file: any) {
    window.open(`/document/hash=${file}`, '_blank')
  }



  private readFile(file: any) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();

      console.log(reader);
      let blob = new Blob([file], { type: file.type });
      reader.onload = () => {
        resolve(reader.result);
      }
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }


  // addInput(file: any) {
  //     this.chosenRow = file;
  // }

  async onRename(file: any) {
    // Only with dblclick
    const dialogRef = this.dialog.open(DialogDocumentRename, {
      data: file
    });
    dialogRef.afterClosed().subscribe(
      res => {
        this.load();
      }
    )
  }

}









//Component to Delete the document

@Component({
  selector: 'dialog-document-rename',
  template: `
  <h2 mat-dialog-title>Document</h2>

  <div mat-dialog-content>
  <p> {{ 'DOCS_DIALOG_CONTENT_RENAME' | translate }} </p>
  <input style="width: 100%; margin-bottom:1rem;" placeholder="{{this.data.name}}" name="name" [(ngModel)]="name"  (keypress)="$event.keyCode == 13 ? onRename(name) : null">
  </div>

  <div mat-dialog-actions>
    <button mat-button cdkFocusInitial (click)="onRename(name)">{{ 'DOCS_DIALOG_ACTION_BUTTON_RENAME' | translate }}</button>
    <button mat-button (click)="closeDialog()" >{{ 'DOCS_DIALOG_ACTION_BUTTON_CANCEL' | translate }}</button>
  </div>
  `
})
export class DialogDocumentRename {
  constructor(
    private api: ApiService,
    public dialogRef: MatDialogRef<DialogDocumentRename>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public name: string = '';

  public closeDialog() {
    this.dialogRef.close({
      data: this.name
    })

  }
  async onRename(file: any) {
    try {
      const response = await this.api.update("documents\\Document", [this.data.id], { name: this.name }, true);
    }
    catch (err) {
      console.log("err update", err);
    }
    this.dialogRef.close({
      data: this.name
    })
  }
}









//Dialog to Delete the document

@Component({
  selector: 'dialog-document-rename',
  template: `
  <h2 mat-dialog-title>Document</h2>

  <div mat-dialog-content>
  <input type="checkbox" id="dialogDelete" name="dialogDelete" [(ngModel)]="deleteConfirmation"
  checked>
  <label for="dialogDelete"> {{ 'DOCS_DIALOG_CONTENT_DELETE' | translate }}</label>

  </div>

  <div mat-dialog-actions>
    <button mat-button cdkFocusInitial (click)="deleteConfirmation == false? closeDialog() : onDeleteConfirmation()">{{ 'DOCS_DIALOG_ACTION_BUTTON_VALIDATE' | translate }}</button>
    <button mat-button (click)="closeDialog()" >{{ 'DOCS_DIALOG_ACTION_BUTTON_CANCEL' | translate }}</button>
  </div>
  `
})
export class DialogDeleteConfirmation {
  constructor(
    private api: ApiService,
    public dialogDelete: MatDialogRef<DialogDeleteConfirmation>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  public deleteConfirmation = false;

  public closeDialog() {
    this.dialogDelete.close({
    })
  }
  public async onDeleteConfirmation() {
    try {
      this.api.remove("documents\\Document", [this.data.id], true);
    }
    catch (err) {
      console.log('error', err)
    }
    this.dialogDelete.close({
      data: this.data
    });
  }
}

