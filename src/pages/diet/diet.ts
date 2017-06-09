import { Component } from '@angular/core';
import { NavController, ViewController, PopoverController, AlertController, Events } from 'ionic-angular';
import { ApplicationService } from '../../shared/services/application.service';
import { DietEditorPage } from './diet-editor/diet-editor';
import { DietViewerPage } from './diet-viewer/diet-viewer';
import { DietService } from '../../shared/services/diet.service';
import { IDiet } from '../../shared/interfaces/diet';
import { LoadingController } from 'ionic-angular';

@Component({
    selector: 'page-diet',
    templateUrl: 'diet.html'
})
export class DietPage {
    constructor(
        public navCtrl: NavController, 
        public popoverCtrl: PopoverController, 
        private dietService: DietService, 
        public loadingCtrl: LoadingController) {

    }

    getDiets(): IDiet[] {
        return this.dietService.getDiets();
    }

    openNewDietDialog(myEvent): void {
        let popover = this.popoverCtrl.create(PopoverMenuPage);
        popover.present({
            ev: myEvent
        });
    }
    editDiet(diet) {
        this.navCtrl.push(DietEditorPage, {
            diet: diet
        });
    }
    viewDiet(diet) {
        this.navCtrl.push(DietViewerPage, {
            diet: diet
        });
    }
}

// popover menu on the diet list
@Component({
    template: `
        <ion-list>
            <button ion-item (click)="createNewDiet()">Start new diet</button>
            <button ion-item (click)="exportAll()">Export all</button>
            <button ion-item (click)="deleteAll()">Delete all data</button>
        </ion-list>
   `,
    styles: [`
        ion-list {
            margin-top: 16px;
        }
    `]
})
export class PopoverMenuPage {
    constructor(
        public navCtrl: NavController, 
        public viewCtrl: ViewController,
        private dietService: DietService, 
        private applicationService: ApplicationService,
        public alertCtrl: AlertController,
        public events: Events) { }

    createNewDiet() {
        this.navCtrl.push(DietEditorPage, {
            diet: null
        }).then(() => {
            this.viewCtrl.dismiss();
        });
    }

    deleteAll() {
        let confirm = this.alertCtrl.create({
            title: 'Delete all data?',
            message: `Are you sure you want to completly remove all diets and all measurements?`,
            buttons: [
                {
                    text: 'No',
                    handler: () => { }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        // save the diet object to the storage
                        this.applicationService.showLoading().then(
                            () => {
                                this.dietService.deleteAll().subscribe(
                                    response => {
                                        this.applicationService.message('success', 'All data have been removed correctly');
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
        this.viewCtrl.dismiss();
    }
    exportAll() {
        this.dietService.exportAll();
        this.applicationService.message('success', 'All data have printed to the console');
        this.viewCtrl.dismiss();
    }
}