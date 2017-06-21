import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import * as _ from 'lodash';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class AboutPage {

    constructor(public navCtrl: NavController, public loadingCtrl: LoadingController) {
        this.presentLoading();
        location.href = "https://weightctrlblog.wordpress.com";
    }

    presentLoading() {
        let loader = this.loadingCtrl.create({
            content: "Please wait..."
        });
        loader.present();

        _.delay(() => {
            loader.dismiss();
            // go back to home page
            this.navCtrl.parent.select(0);
        }, 3000);
    }
}
