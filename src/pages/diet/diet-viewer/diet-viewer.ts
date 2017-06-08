import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IDiet } from '../../../shared/interfaces/diet';
import { ApplicationService } from '../../../shared/services/application.service';
import * as moment from 'moment';

@Component({
    selector: 'page-diet-viewer',
    templateUrl: 'diet-viewer.html',
})
export class DietViewerPage {
    private diet: IDiet;
    private dietSummary: any;
    private mode: string;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private applicationService: ApplicationService) {

        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.pop();
            return;
        }
        this.getDietData();
    }

    ionViewWillEnter() {
        this.mode = "measurements";
    }

    getDietData(): void {
        let currentDay, progress, now = new Date();

        if (now >= this.diet.endDate) {
            currentDay = this.diet.duration;
            progress = 100;
        } else if (now < this.diet.startDate) {
            currentDay = 0;
            progress = 0;
        } else {
            currentDay = moment(now).diff(moment(this.diet.startDate), 'days');
            progress = ((currentDay / this.diet.duration) * 100.0).toFixed(2);
        }
        this.dietSummary = {
            currentDay,
            progress,
            measurements: []
        };
    }

}
