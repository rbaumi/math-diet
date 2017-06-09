import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, PopoverController, ModalController } from 'ionic-angular';
import { IDiet } from '../../../shared/interfaces/diet';
import { ApplicationService } from '../../../shared/services/application.service';
import * as moment from 'moment';
import { DietEditorPage } from '../diet-editor/diet-editor';
import { MeasurementModal } from '../new-measurement/new-measurement';

// operations on collections
import * as _ from 'lodash';

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
        private applicationService: ApplicationService,
        public popoverCtrl: PopoverController) {

        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.popToRoot();
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
            progress
        };
    }
    openMenuDialog(myEvent): void {
        let popover = this.popoverCtrl.create(PopoverViewerMenuPage, { diet: this.diet });
        popover.present({
            ev: myEvent
        });
    }
}

// popover menu on the diet iewer
@Component({
    template: `
        <ion-list>
            <button ion-item (click)="addNewMeasurement()">Add new measurement</button>
            <button ion-item (click)="editDiet(diet)">Edit diet</button>
        </ion-list>
   `,
    styles: [`
        ion-list {
            margin-top: 16px;
        }
    `]
})
export class PopoverViewerMenuPage {
    private diet: IDiet;

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        private applicationService: ApplicationService,
        public navParams: NavParams,
        public modalCtrl: ModalController) {

        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.popToRoot();
            return;
        }
    }

    addNewMeasurement() {
        this.viewCtrl.dismiss();
        let measurementModal = this.modalCtrl.create(MeasurementModal, { 
            diet: this.diet 
        });
        measurementModal.present();
    }
    editDiet(d: IDiet) {
        this.navCtrl.push(DietEditorPage, {
            diet: d
        }).then(() => {
            this.viewCtrl.dismiss();
        });
    }
}
