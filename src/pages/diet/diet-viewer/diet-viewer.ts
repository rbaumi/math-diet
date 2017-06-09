import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, PopoverController, ModalController, AlertController, Events } from 'ionic-angular';
import { IDiet, IDietMeasurement } from '../../../shared/interfaces/diet';
import { ApplicationService } from '../../../shared/services/application.service';
import * as moment from 'moment';
import { DietEditorPage } from '../diet-editor/diet-editor';
import { MeasurementModal } from '../new-measurement/new-measurement';
import { DietService } from '../../../shared/services/diet.service';

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

        this.getDietData();
        this.setGraphOptions();
        this.updateGraphData();

        events.subscribe('graph:update', () => {
            this.updateGraphData();
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
                        unit: 'day',
                        min: this.diet.startDate,
                        max: this.diet.endDate
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        max: _.max([this.diet.startWeight, this.diet.endWeight]) + 10
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Weight (kg)'
                    }
                }]
            },
            tooltips: {
                enabled: false
            }
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

        while (currDate.add(1, 'days').diff(lastDate) < 0) {
            //console.log(currDate.toDate());
            baseSerie.data.push({
                x: currDate.clone().toDate(),
                y: startWeight
            });
            startWeight += weightPerDay;
        }

        return baseSerie;
    }

    updateGraphData(): void {
        let baseSerie: any = this.prepareBaseSerie();

        let dataSerie: any = {
            label: "Weight",
            data: this.diet.measurements.map(measurement => {
                return {
                    x: measurement.date,
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
                                        this.updateGraphData();
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
