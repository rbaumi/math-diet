import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IDiet } from '../../../shared/interfaces/diet';
import { DietService } from '../../../shared/services/diet.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import * as moment from 'moment';

@Component({
    selector: 'page-diet-editor',
    templateUrl: 'diet-editor.html',
})
export class DietEditorPage {
    private diet: IDiet;
    private dietForm: FormGroup;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private dietService: DietService) {
        this.diet = navParams.get('diet');
        if (!this.diet)
            this.diet = this.dietService.getDietDefaults();

        let startDate = moment(this.diet.startDate);

        this.dietForm = this.formBuilder.group({
            name: [this.diet.name, Validators.required],
            startDate: [startDate.format('YYYY-MM-DD'), Validators.required],
            duration: [this.diet.duration , Validators.required],
            startWeight: [this.diet.startWeight, Validators.required],
            endWeight: [this.diet.endWeight, Validators.required],
        });
    }

    updateDiet() {
        this.diet.name = this.dietForm.controls['name'].value;
        this.diet.startDate = this.dietForm.controls['startDate'].value;
        this.diet.duration = this.dietForm.controls['duration'].value;
        this.diet.startWeight = this.dietForm.controls['startWeight'].value;
        this.diet.endWeight = this.dietForm.controls['endWeight'].value;

        this.dietService.saveDiet(this.diet).subscribe(
            response => {
                this.navCtrl.pop();
            }
        );
    }
}
