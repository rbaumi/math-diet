import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class ApplicationService {
    constructor(private toastCtrl: ToastController) {

    }
    /**
     * Function displays a message on the screen
     * 
     * @param  {string} type type of the message (succes / info / warning / error)
     * @param  {string} message text to display
     * @returns void
     */
    message(type: string, message: string): void {
        // TODO: move duration and position to some global definition file
        let toast = this.toastCtrl.create({
            message,
            duration: 2000,
            position: 'bottom'
        });
        toast.present();
    }
    
}