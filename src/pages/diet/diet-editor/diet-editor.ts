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
        let endDate = moment(this.diet.endDate);

        this.dietForm = this.formBuilder.group({
            name: [this.diet.name, Validators.required],
            startDate: [startDate.format('YYYY-MM-DD'), Validators.required],
            duration: [endDate.diff(startDate, 'days') , Validators.required],
            startWeight: [this.diet.startWeight, Validators.required],
            endWeight: [this.diet.endWeight, Validators.required],
        });
    }

    updateDiet() {
        this.dietService.updateDiet(this.diet);
    }
}
