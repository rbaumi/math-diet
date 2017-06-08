import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { IDiet } from '../../../shared/interfaces/diet';
import { ApplicationService } from '../../../shared/services/application.service';

@Component({
    templateUrl: 'new-measurement.html',
})
export class MeasurementModal {
    private diet: IDiet;

    constructor(
        navParams: NavParams,
        private applicationService: ApplicationService,
        public viewCtrl: ViewController,
        public navCtrl: NavController) {

        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.popToRoot();
            return;
        }
        console.log('diet', navParams.get('diet'));
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}