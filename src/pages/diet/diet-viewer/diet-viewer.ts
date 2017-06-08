import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-diet-viewer',
    templateUrl: 'diet-viewer.html',
})
export class DietViewerPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad DietViewerPage');
    }

}
