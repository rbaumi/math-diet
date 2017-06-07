import { Component } from '@angular/core';
import { NavController, ViewController, PopoverController } from 'ionic-angular';

import { DietEditorPage } from './diet-editor/diet-editor';

@Component({
    selector: 'page-diet',
    templateUrl: 'diet.html'
})
export class DietPage {

    constructor(public navCtrl: NavController, public popoverCtrl: PopoverController) {

    }
    openNewDietDialog(myEvent): void {
        let popover = this.popoverCtrl.create(PopoverMenuPage);
        popover.present({
            ev: myEvent
        });
    }
    editDiet(diet) {
        this.navCtrl.push(DietEditorPage);
    }

}

// popover menu on the diet list
@Component({
    template: `
        <ion-list>
            <button ion-item (click)="createNewDiet()">Start new diet</button>
            <button ion-item (click)="" disabled>Export</button>
            <button ion-item (click)="" disabled>Import</button>
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
        this.viewCtrl.dismiss();
        this.navCtrl.push(DietEditorPage);
    }
}