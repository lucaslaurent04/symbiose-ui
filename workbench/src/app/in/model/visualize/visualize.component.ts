import { Component, AfterContentInit, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, EnvService, AuthService, ContextService } from 'sb-shared-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';
import { UserClass } from 'sb-shared-lib/lib/classes/user.class';
import { debounceTime, filter } from 'rxjs/operators';


@Component({
  selector: 'model-visualize',
  templateUrl: 'visualize.component.html',
  styleUrls: ['visualize.component.scss']
})
export class ModelVisualizeComponent implements OnInit, AfterContentInit {

    public loading = true;

    constructor(
        private dialog: MatDialog,
        private api: ApiService,
        private auth: AuthService,
        private env: EnvService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private context:ContextService,
        private snack: MatSnackBar,
        private zone: NgZone) {

    }

    /**
     * Set up callbacks when component DOM is ready.
     */
    public ngAfterContentInit() {
        this.loading = false;
    }


    public ngOnInit() {

    }

    public onUpdate() {

    }
    
}