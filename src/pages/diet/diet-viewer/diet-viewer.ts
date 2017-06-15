import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, PopoverController, ModalController, AlertController, Events } from 'ionic-angular';
import { IDiet, IDietMeasurement } from '../../../shared/interfaces/diet';
import { ApplicationService } from '../../../shared/services/application.service';
import { DietEditorPage } from '../diet-editor/diet-editor';
import { MeasurementModal } from '../new-measurement/new-measurement';
import { DietService } from '../../../shared/services/diet.service';
import { SocialSharing } from '@ionic-native/social-sharing';

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
    private baseSerie: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        private applicationService: ApplicationService,
        private dietService: DietService,
        public popoverCtrl: PopoverController,
        public events: Events,
        public modalCtrl: ModalController) {

        // diet object is require
        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.popToRoot();
            return;
        }

        // set the static graph options (graph config)
        this.setGraphOptions();

        // update data to be displayed on the graph
        this.updateGraphData();

        // load and calculate diet summary that is display 
        // on the page (summary information)
        this.getDietData();

        // the way to update the graph from different page 
        // (e.g. diet editor) is to publish the event (graph:update 
        // is just a custom event here). Here we subscribe to the event.
        events.subscribe('graph:update', () => {
            // update graph
            this.updateGraphData();

            // update summary
            this.getDietData();
        });
    }

    /**
     * Function is being called whenever user enters the page
     * 
     * @returns void
     */
    ionViewWillEnter(): void {
        // when entering the page as default open summary tab
        this.mode = "graph";
    }

    /**
     * Function creates a graph and set the graph static options. 
     * 
     * @returns void
     */
    setGraphOptions(): void {
        this.graphOptions = {
            responsive: true,
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        callback: (label: number, index: number, labels: number[]) => {
                            return moment(label).format('D MMM, HH:mm');
                        },
                        maxRotation: 0
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        callback: (label: number, index: number, labels: number[]) => {
                            return label.toFixed(2);
                        },
                        max: Math.round(_.max([this.diet.startWeight, this.diet.endWeight])) + 3,
                        min: Math.round(_.min([this.diet.startWeight, this.diet.endWeight])) - 6
                    }
                }]
            },
            tooltips: {
                enabled: true,
                callbacks: {
                    label: (tooltipItem, data) => {
                        return moment(tooltipItem.xLabel).format('D MMM, HH:mm') + ': ' + parseFloat(tooltipItem.yLabel).toFixed(2) + ' kg';
                    }
                },
                opacity: .8
            },
            pan: {
                enabled: true,
                mode: 'x'
            },
            zoom: {
                enabled: true,
                mode: 'x',
                limits: {
                    max: 10,
                    min: 0.5
                }
            },
        };
    }

    /** 
     * Function returns first of the serie that is presented on the graph. 
     * the serie is static and just presents the target for the diet. We keep 
     * it in seperate funciton as this is calculated only once. 
     * 
     * @returns any
     */
    private prepareBaseSerie(): any {
        // base serie object
        let baseSerie: any = {
            label: "Base",
            data: [],
            fill: false,
            pointRadius: 0,
            borderColor: '#ff0000'
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
        this.baseSerie = this.prepareBaseSerie();

        let dataSerie: any = {
            label: "Weight",
            data: this.diet.measurements.map(measurement => {
                return {
                    x: moment(measurement.date).toDate(),
                    y: measurement.weight
                };
            }),
            fill: false,
            pointRadius: 2,
            borderColor: '#67a3ed',
            pointBorderColor: '#6d6d6d',
            backgroundColor: '#67a3ed'
        };

        this.graphData = [this.baseSerie, dataSerie];
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

            this.graphData[0].data.forEach(data => {
                if (moment(data.x).format('l') == today) {
                    allowedWeight = data.y;
                }
            });
            if (latestWeight && allowedWeight)
                allowedToEat = Math.round((allowedWeight - latestWeight) * 1000);

        }

        this.dietSummary = {
            currentDay,
            progress,
            allowedToEat,
            dietActive,
            allowedWeight
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


    addNewMeasurement() {
        let measurementModal = this.modalCtrl.create(MeasurementModal, {
            diet: this.diet,
            baseSerie: this.baseSerie
        });
        measurementModal.present();
    }
}

// popover menu on the diet iewer
@Component({
    template: `
        <ion-list>
            <button ion-item (click)="share()"><ion-icon name="share"></ion-icon>Share</button>
            <button ion-item (click)="edit()"><ion-icon name="create"></ion-icon>Edit diet</button>
        </ion-list>
   `,
    styles: [`
        ion-list {
            margin-top: 16px;
        }
        ion-icon {
            margin-right:10px;
        }
    `]
})
export class PopoverViewerMenuPage {
    private diet: IDiet;

    constructor(
        public navCtrl: NavController,
        private applicationService: ApplicationService,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        private sharingVar: SocialSharing) {

        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.popToRoot();
            return;
        }
    }

    share(): void {
        this.viewCtrl.dismiss();
        this.sharingVar.share(JSON.stringify(this.diet), `Export of ${this.diet.name}`, null, null);
    }
    edit(): void {
        this.navCtrl.push(DietEditorPage, {
            diet: this.diet
        }).then(() => {
            this.viewCtrl.dismiss();
        });
    }
}
