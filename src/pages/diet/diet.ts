import { Component } from '@angular/core';
import { NavController, ViewController, PopoverController } from 'ionic-angular';
import { DietEditorPage } from './diet-editor/diet-editor';
import { DietService } from '../../shared/services/diet.service';
import { IDiet } from '../../shared/interfaces/diet';
import { LoadingController } from 'ionic-angular';

@Component({
    selector: 'page-diet',
    templateUrl: 'diet.html'
})
export class DietPage {
    diets: IDiet[];

    constructor(
        public navCtrl: NavController, 
        public popoverCtrl: PopoverController, 
        private dietService: DietService, 
        public loadingCtrl: LoadingController) {

    }

    ionViewWillEnter() {
        this.diets = [];
    }

    ionViewDidEnter() {
        this.loadDiets();
    }

    loadDiets() {
        let loader = this.loadingCtrl.create({
            content: "Please wait..."
        });
        loader.present();
        this.dietService.getDiets().subscribe(
            diets => {
                this.diets = diets;
            },
            error => {

            },
            () => {
                loader.dismiss();
            }
        );
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