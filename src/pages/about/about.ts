import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

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
            content: "Please wait...",
            duration: 3000
        });
        loader.present().then(() => {
            console.log (1);
        });
    }
}
