import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { HomePage } from '../home/home';
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
            this.navCtrl.setRoot(HomePage);
        }, 3000);
    }
}
