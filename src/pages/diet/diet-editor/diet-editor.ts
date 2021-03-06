
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { IDiet } from '../../../shared/interfaces/diet';
import { DietService } from '../../../shared/services/diet.service';
import { ApplicationService } from '../../../shared/services/application.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { DietPage } from '../diet';
import * as moment from 'moment';

@Component({
    selector: 'page-diet-editor',
    templateUrl: 'diet-editor.html',
})
export class DietEditorPage {
    private diet: IDiet;
    private dietForm: FormGroup;
    
    constructor(
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        public navParams: NavParams,
        private formBuilder: FormBuilder,
        private dietService: DietService,
        private applicationService: ApplicationService) {

        this.diet = navParams.get('diet');
        if (!this.diet)
            this.diet = this.dietService.getDietDefaults();

        this.createEditorForm();
    }

    createEditorForm() {
        let startDate = moment(this.diet.startDate);
        this.dietForm = this.formBuilder.group({
            name: [
                this.diet.name,
                Validators.required
            ],
            startDate: [
                startDate.format('YYYY-MM-DD'),
                Validators.required
            ],
            duration: [
                this.diet.duration,
                Validators.required
            ],
            startWeight: [
                this.diet.startWeight,
                Validators.required
            ],
            endWeight: [
                this.diet.endWeight,
                Validators.required
            ],
        });
    }

    updateDiet() {
        this.diet.name = this.dietForm.controls['name'].value;
        this.diet.duration = parseInt(this.dietForm.controls['duration'].value);
        this.diet.startDate = moment(this.dietForm.controls['startDate'].value).toDate();
        this.diet.endDate = moment(this.diet.startDate).clone().add(this.diet.duration, 'day').toDate();
        this.diet.startWeight = this.dietForm.controls['startWeight'].value;
        this.diet.endWeight = this.dietForm.controls['endWeight'].value;
        
        this.applicationService.showLoading().then(
            () => {
                this.dietService.saveDiet(this.diet).subscribe(
                    response => {
                        this.applicationService.message('success', 'Diet has been saved correctly');
                    },
                    error => { },
                    () => {
                        this.applicationService.hideLoading().then(
                            () => this.navCtrl.pop()
                        );
                    }
                );
            }
        );
    }

    removeDiet() {
        if (this.dietService.getDietById(this.diet.id)) {
            // if this diet exists
            let confirm = this.alertCtrl.create({
                title: 'Remove diet?',
                message: `Are you sure you want to remove diet <i>${this.diet.name}</i> and all it's measurements?`,
                buttons: [
                    {
                        text: 'No',
                        handler: () => { }
                    },
                    {
                        text: 'Yes',
                        handler: () => {
                            this.applicationService.showLoading().then(
                                () => {
                                    this.dietService.removeDiet(this.diet).subscribe(
                                        response => {
                                            this.applicationService.message('success', 'Diet has been removed correctly');
                                        },
                                        error => { },
                                        () => {
                                            this.applicationService.hideLoading().then(
                                                () => this.navCtrl.popToRoot()
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    }
                ]
            });
            confirm.present();
        } else {
            // if this is new created diet
            this.navCtrl.pop();
        }
    }
}
