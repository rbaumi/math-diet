import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, PopoverController, ModalController, AlertController, Events } from 'ionic-angular';
import { IDiet, IDietMeasurement } from '../../../shared/interfaces/diet';
import { ApplicationService } from '../../../shared/services/application.service';
import { DietEditorPage } from '../diet-editor/diet-editor';
import { MeasurementModal } from '../new-measurement/new-measurement';
import { DietService } from '../../../shared/services/diet.service';

// operations on collections
import * as _ from 'lodash';

// operations on time\
import * as moment from 'moment';

@Component({
    selector: 'page-diet-viewer',
    templateUrl: 'diet-viewer.html',
})
export class DietViewerPage {
    private diet: IDiet;
    private dietSummary: any;
    private mode: string;
    private graphOptions: any;
    private graphData: Array<any> = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        private applicationService: ApplicationService,
        private dietService: DietService,
        public popoverCtrl: PopoverController,
        public events: Events) {

        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.popToRoot();
            return;
        }

        this.setGraphOptions();
        this.updateGraphData();
        this.getDietData();

        events.subscribe('graph:update', () => {
            this.updateGraphData();
            this.getDietData();
        });
    }

    ionViewWillEnter() {
        // when entering the page as default open summary tab
        this.mode = "graph";
    }

    setGraphOptions(): void {
        this.graphOptions = {
            responsive: true,
            scales: {
                xAxes: [{
                    type: "time",
                    display: true,
                    time: {
                        tooltipFormat: 'dd MMMM y, HH:mm'
                        // min: this.diet.startDate,
                        // max: this.diet.endDate
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        max: Math.round(_.max([this.diet.startWeight, this.diet.endWeight])) + 3,
                        min: Math.round(_.min([this.diet.startWeight, this.diet.endWeight])) - 6
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Weight (kg)'
                    }
                }]
            },
            tooltips: {
                enabled: true
            },
            // zoom: {
            //     enabled: true,
            //     mode: 'xy',
            //     limits: {
            //         max: 2,
            //         min: 0.5
            //     }
            // },
        };
    }

    private prepareBaseSerie(): any {
        let baseSerie: any = {
            label: "Base",
            data: [],
            fill: false,
            pointRadius: 0
        };

        let currDate = moment(this.diet.startDate).clone().startOf('day');
        let lastDate = moment(this.diet.endDate).clone().startOf('day');
        let startWeight = this.diet.startWeight;
        let weightPerDay = (this.diet.endWeight - this.diet.startWeight) / this.diet.duration;

        do {
            baseSerie.data.push({
                x: currDate.clone().toDate(),
                y: startWeight
            });

            // startWeight += weightPerDay was treated as string
            startWeight -= (weightPerDay * (-1));
        } while (currDate.add(1, 'days').diff(lastDate) <= 0);

        return baseSerie;
    }

    updateGraphData(): void {
        let baseSerie: any = this.prepareBaseSerie();

        let dataSerie: any = {
            label: "Weight",
            data: this.diet.measurements.map(measurement => {
                return {
                    x: moment(measurement.date).toDate(),
                    y: measurement.weight
                };
            }),
            fill: false,
            pointRadius: 0
        };

        this.graphData = [baseSerie, dataSerie];
    }

    getDietData(): void {
        let currentDay, progress, now = new Date();

        if (now >= moment(this.diet.endDate).toDate()) {
            currentDay = this.diet.duration;
            progress = 100;
        } else if (now < moment(this.diet.startDate).toDate()) {
            currentDay = 0;
            progress = 0;
        } else {
            currentDay = moment(now).diff(moment(this.diet.startDate), 'days');
            progress = ((currentDay / this.diet.duration) * 100.0).toFixed(2);
        }

        // let's find the latest measurement today
        // measurements are ordered descending so first one from 
        // today will be the latest today
        let allowedToEat = null;
        let latestWeight = null;
        let allowedWeight = null;
        let dietActive: boolean = false;

        if (moment(this.diet.startDate).toDate() <= now && moment(this.diet.endDate).toDate() >= now) {
            dietActive = true;
        }

        if (dietActive) {
            let today: string = moment(new Date()).format('l');   // 6/9/2017
            this.diet.measurements.forEach(measurement => {
                if (latestWeight === null && moment(measurement.date).format('l') == today) {
                    latestWeight = measurement.weight;
                }
            });

            // there was some measurement today
            if (latestWeight !== null) {
                this.graphData[0].data.forEach(data => {
                    if (moment(data.x).format('l') == today) {
                        allowedWeight = data.y;
                    }
                });
                if (latestWeight && allowedWeight)
                    allowedToEat = Math.round((allowedWeight - latestWeight) * 1000);
            }
        }

        this.dietSummary = {
            currentDay,
            progress,
            allowedToEat,
            dietActive
        };
    }
    openMenuDialog(myEvent): void {
        let popover = this.popoverCtrl.create(PopoverViewerMenuPage, {
            diet: this.diet
        });
        popover.present({
            ev: myEvent
        });
    }

    removeMeasurement(m: IDietMeasurement): void {
        let confirm = this.alertCtrl.create({
            title: 'Remove measurement?',
            message: `Are you sure you want to remove this measurement?`,
            buttons: [
                {
                    text: 'No',
                    handler: () => { }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        // remove element with matching id
                        _.remove(this.diet.measurements, (measurement => {
                            return measurement.id === m.id;
                        }));
                        // save the diet object to the storage
                        this.applicationService.showLoading().then(
                            () => {
                                this.dietService.saveDiet(this.diet).subscribe(
                                    response => {
                                        this.applicationService.message('success', 'Measurement has been removed correctly');
                                        this.events.publish('graph:update');
                                    },
                                    error => { },
                                    () => {
                                        this.applicationService.hideLoading();
                                    }
                                );
                            }
                        );
                    }
                }
            ]
        });
        confirm.present();
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
