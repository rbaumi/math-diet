import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { DietPage } from '../diet/diet';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    constructor(public navCtrl: NavController) {

    }
    moveToDiets(): void {
        this.navCtrl.setRoot(DietPage);
    }
}
