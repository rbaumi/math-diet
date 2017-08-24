import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    constructor(public navCtrl: NavController) {

    }
    moveToDiets(): void {
        let dietPageTabIndex: number = 1;
        this.navCtrl.parent.select(dietPageTabIndex);
    }
}
