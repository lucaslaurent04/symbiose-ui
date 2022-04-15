import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    @Output() toggleMenu = new EventEmitter();
    @Output() toggleBar = new EventEmitter();
    @Input() section: string;
    @Input() items: any[];
    @Input() i18n: any;
    @Output() select = new EventEmitter<any>();

    date: Date = new Date();
    constructor(private router: Router) { }

    ngOnInit(): void {
    }

    public toggleSideMenu() {
        this.toggleMenu.emit();
    }

    public toggleSideBar() {
        this.toggleBar.emit();
    }


    public onSelectItem(item:any) {
        console.log('onclick', item);

        this.select.emit(item);
        /*
        if(item && item.route) {
            this.router.navigate([item.route]);
        }
        */
    }
}
