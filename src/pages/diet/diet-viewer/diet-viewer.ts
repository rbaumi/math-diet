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
        private sharingVar: SocialSharing,
        public modalCtrl: ModalController) {

        // diet object is require
        this.diet = navParams.data;
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

        let startWeight: any = this.diet.startWeight;
        let endWeight: any = this.diet.endWeight;

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
                        max: Math.round(_.max([parseFloat(startWeight), parseFloat(endWeight)])) + 3,
                        min: Math.round(_.min([parseFloat(startWeight), parseFloat(endWeight)])) - 6
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
        popover.onWillDismiss(option => {
            switch (option) {
                case 'edit':
                    this.navCtrl.push(DietEditorPage, {
                        diet: this.diet
                    });
                    break;
                case 'share':
                    this.shareDietData();
                    break;
                case 'import':
                    this.importDietData();
                    break;
            }
        });
    }

    shareDietData(): void {
        this.applicationService.showLoading().then(
            () => {
                this.sharingVar.share(JSON.stringify(this.diet), `Export of ${this.diet.name}`, null, null)
                    .then(
                        () => this.applicationService.hideLoading()
                    )
                    .catch(
                        (err) => {
                            this.applicationService.hideLoading();
                            this.applicationService.message('error', `Error occured while trying to share data`);
                        }
                    );
            }
        );
    }

    importDietData(): void {
        // create prompt object
        let prompt = this.alertCtrl.create({
            title: 'Import',
            message: "Import whole diet exported data string in JSON format",
            inputs: [
                {
                    name: 'importData',
                    placeholder: 'Data'
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => { }
                },
                {
                    text: 'Import',
                    handler: data => {
                        let jsonString;

                        // make sure inputed sitring is a valid JSON string
                        try {
                            jsonString = JSON.parse(data.importData);
                        } catch (e) {
                            this.applicationService.message('warning', 'Given data is not a valid JSON');
                            return false;
                        }

                        // only if there are any measurements
                        if (!jsonString.measurements || !jsonString.measurements.length) {
                            this.applicationService.message('warning', 'No measurements in given data');
                            return false;
                        }

                        // need this to check if measurments are within the diet's dates
                        let startDate = moment(this.diet.startDate);
                        let endDate = moment(this.diet.endDate);

                        // counter of how many measurements were really imported
                        let measurementsAdded = 0, measurementsDuplicate = 0, measurementsOutside = 0;

                        // date of imported measurements
                        let mDate;

                        jsonString.measurements.forEach((measurement: IDietMeasurement) => {

                            // need for comparison
                            mDate = moment(measurement.date);

                            // validate measuremnet by date
                            if (this.dietService.getMeasurementByDate(this.diet, mDate)) {

                                // there is already measurement within given date (precision: minute)
                                measurementsDuplicate++;
                            } else if (mDate.isBefore(startDate, 'minute') || mDate.isAfter(endDate, 'minute')) {

                                // measurement was taken outside the diet's dates
                                measurementsOutside++;
                            } else {
                                // import only measurements within the diet start and end dates

                                // make sure the ID for imported measurement is unique
                                measurement.id = this.dietService.generateUniqueUUID();

                                // add measurement
                                this.diet.measurements.push(measurement);

                                // increment counter
                                measurementsAdded++;
                            }
                        });

                        let additionalInfo = `${measurementsDuplicate} duplicated and ${measurementsOutside} outside the diet's start and end date.`;

                        // no measurements were added
                        if (!measurementsAdded) {
                            this.applicationService.message('warning', `No measurements added. ${additionalInfo}`);
                            return false;
                        } else {
                            // sort measurement in descending order
                            // function lodash.sortBy sorts only ascending so after sort
                            // the array has to be reversed
                            this.diet.measurements = _.reverse(_.sortBy(_.map(this.diet.measurements, (m) => {
                                m.date = moment(m.date).toDate();
                                return m;
                            }), ['date']));

                            // save the diet object to the storage
                            this.applicationService.showLoading().then(
                                () => {
                                    this.dietService.saveDiet(this.diet).subscribe(
                                        response => {
                                            this.applicationService.message('success', `Imported ${measurementsAdded} measuremnets. ${additionalInfo}`);
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
                }
            ]
        });

        // display prompt. Normally it takes some time before prompt is displayed so
        // first we show loading and when prompt is shown than we hide loading
        this.applicationService.showLoading().then(
            () => {
                prompt.present().then(
                    () => this.applicationService.hideLoading()
                );
            }
        );
    }
    
    /**
     * Function removes given measurement from list of measurements in selected diet
     * 
     * @param  {IDietMeasurement} m
     * @returns void
     */
    removeMeasurement(m: IDietMeasurement): void {

        // create confirmation prompt
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

        // show confirmation prompt
        confirm.present();
    }

    /**
     * Function opens modal for adding new measurement. 
     * 
     * @returns void
     */
    addNewMeasurement(): void {
        // TODO: change it to normal page
        let measurementModal = this.modalCtrl.create(MeasurementModal, {
            diet: this.diet,
            baseSerie: this.baseSerie
        });

        // open modal
        measurementModal.present();
    }
}

// popover menu on the diet viewer
@Component({
    template: `
        <ion-list>
            <button ion-item (click)="select('share')"><ion-icon name="share"></ion-icon>Share</button>
            <button ion-item (click)="select('import')"><ion-icon name="cloud-download"></ion-icon>Import data</button>
            <button ion-item (click)="select('edit')"><ion-icon name="create"></ion-icon>Edit diet</button>
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
        private applicationService: ApplicationService,
        public navParams: NavParams,
        public viewCtrl: ViewController,) {

        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.viewCtrl.dismiss();
            return;
        }
    }

    select(option: string): void {
        this.viewCtrl.dismiss(option);
    }
}
