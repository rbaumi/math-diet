import { Component } from '@angular/core';
import { NavController, ViewController, PopoverController } from 'ionic-angular';
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
            <button ion-item disabled>Export</button>
            <button ion-item disabled>Import</button>
        </ion-list>
   `,
    styles: [`
        ion-list {
            margin-top: 16px;
        }
    `]
})
export class PopoverMenuPage {
    constructor(public navCtrl: NavController, public viewCtrl: ViewController) { }

    createNewDiet() {
        this.navCtrl.push(DietEditorPage, {
            diet: null
        }).then(() => {
            this.viewCtrl.dismiss();
        });
    }
}