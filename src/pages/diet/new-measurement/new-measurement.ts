import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, Events } from 'ionic-angular';
import { IDiet, IDietMeasurement } from '../../../shared/interfaces/diet';
import { ApplicationService } from '../../../shared/services/application.service';
import { DietService } from '../../../shared/services/diet.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';

// operations on collections
import * as _ from 'lodash';

@Component({
    templateUrl: 'new-measurement.html',
})
export class MeasurementModal {
    private diet: IDiet;
    private measurementForm: FormGroup;
    private baseSerie: any;
    private allowedWeight: number;

    constructor(
        navParams: NavParams,
        private applicationService: ApplicationService,
        public viewCtrl: ViewController,
        private formBuilder: FormBuilder,
        private dietService: DietService,
        public navCtrl: NavController,
        public events: Events) {

        // modal requires the diet obejct to be passed on. If not given 
        // then display a message and close the modal
        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.popToRoot();
            return;
        }

        // prepare the form
        this.createMeasurementForm();

        this.baseSerie = navParams.get('baseSerie');
        this.calculateTodaysMax();
    }

    /**
     * Function closes the modal
     * @returns void
     */
    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    /**
     * Function prepares form for inputing measurement data
     * 
     * @returns void
     */
    createMeasurementForm(): void {
        // default datetime is current time
        let measurementDate = moment(new Date());

        // form object
        this.measurementForm = this.formBuilder.group({
            measurementDate: [
                measurementDate.format('YYYY-MM-DDTHH:mm:00Z'),
                Validators.required
            ],
            weight: [
                '',
                Validators.required
            ],
        });
    }
    /**
     * Function finds todays maximum weight
     * 
     * @returns void
     */
    calculateTodaysMax(): void {
        let today: string = moment(new Date()).format('l');   // 6/9/2017
        this.baseSerie.data.forEach(data => {
            if (moment(data.x).format('l') == today) {
                this.allowedWeight = data.y;
            }
        });
    }

    /**
     * Function saves given measurement data to the diet object
     * 
     * @returns void
     */
    saveMeasurement(): void {

        // new measurement object
        let measurement: IDietMeasurement = {
            id: this.dietService.generateUniqueUUID(),
            date: new Date(this.measurementForm.controls['measurementDate'].value),
            weight: this.measurementForm.controls['weight'].value
        };
        this.diet.measurements.push(measurement);

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
                        this.applicationService.message('success', 'Measurement has been added correctly');
                        this.events.publish('graph:update');
                    },
                    error => { },
                    () => {
                        this.applicationService.hideLoading().then(
                            () => {
                                this.viewCtrl.dismiss();
                            }
                        );
                    }
                );
            }
        );
    }
}