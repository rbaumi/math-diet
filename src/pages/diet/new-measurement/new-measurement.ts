import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { IDiet, IDietMeasurement } from '../../../shared/interfaces/diet';
import { ApplicationService } from '../../../shared/services/application.service';
import { DietService } from '../../../shared/services/diet.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';

// generation of RFC4122 UUIDS
import * as uuid from 'uuid';

@Component({
    templateUrl: 'new-measurement.html',
})
export class MeasurementModal {
    private diet: IDiet;
    private measurementForm: FormGroup;

    constructor(
        navParams: NavParams,
        private applicationService: ApplicationService,
        public viewCtrl: ViewController,
        private formBuilder: FormBuilder,
        private dietService: DietService,
        public navCtrl: NavController) {

        this.diet = navParams.get('diet');
        if (!this.diet) {
            this.applicationService.message('error', 'Incorrect diet');
            this.navCtrl.popToRoot();
            return;
        }
        this.createMeasurementForm();
    }

    createMeasurementForm() {
        let measurementDate = moment(new Date());
        this.measurementForm = this.formBuilder.group({
            measurementDate: [
                measurementDate.format('YYYY-MM-DDTHH:mm'),
                Validators.required
            ],
            weight: [
                '',
                Validators.required
            ],
        });
    }
    
    dismiss() {
        this.viewCtrl.dismiss();
    }

    saveMeasurement() {
        // generate new unique id for the diet object and make sure this id 
        // is not in use. If so generate it again.
        let newId;
        do {
            newId = uuid();
        } while (this.dietService.getMeasurementById(newId) !== null);
        
        let measurement: IDietMeasurement = {
            id: newId,
            date: moment(this.measurementForm.controls['measurementDate'].value).toDate(),
            weight: this.measurementForm.controls['weight'].value
        };
        this.diet.measurements.push(measurement);
        console.log (measurement);
        this.applicationService.showLoading().then(
            () => {
                this.dietService.saveDiet(this.diet).subscribe(
                    response => {
                        this.applicationService.message('success', 'Measurement has been added correctly');
                    },
                    error => { },
                    () => {
                        this.applicationService.hideLoading().then(
                            () => this.viewCtrl.dismiss()
                        );
                    }
                );
            }
        );
    }
}