import { Component } from '@angular/core';
import { NavController, ViewController, PopoverController, AlertController, Events } from 'ionic-angular';
import { ApplicationService } from '../../shared/services/application.service';
import { DietEditorPage } from './diet-editor/diet-editor';
import { DietService } from '../../shared/services/diet.service';
import { IDiet } from '../../shared/interfaces/diet';
import { LoadingController, App } from 'ionic-angular';
import { DietViewerPage } from './diet-viewer/diet-viewer';

@Component({
    selector: 'page-diet',
    templateUrl: 'diet.html'
})
export class DietPage {
    private viewerPage: any = DietViewerPage;

    constructor(
        public navCtrl: NavController,
        public popoverCtrl: PopoverController,
        private dietService: DietService,
        public loadingCtrl: LoadingController) {

        this.dietService.checkDietsOnDisk();
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
}

// popover menu on the diet list
@Component({
    template: `
        <ion-list>
            <button ion-item (click)="createNewDiet()"><ion-icon name="add"></ion-icon>Start new diet</button>
            <button ion-item (click)="deleteAll()"><ion-icon name="trash"></ion-icon>Delete all data</button>
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
export class PopoverMenuPage {
    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        private dietService: DietService,
        private applicationService: ApplicationService,
        public alertCtrl: AlertController,
        public appCtrl: App,
        public events: Events) { }

    createNewDiet() {
        this.appCtrl.getRootNav().push(DietEditorPage, {
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
}