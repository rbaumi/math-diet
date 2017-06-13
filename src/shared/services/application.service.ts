import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

@Injectable()
export class ApplicationService {
    private loader;

    constructor(
        public loadingCtrl: LoadingController,
        private toastCtrl: ToastController) {
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

    /**
     * Funciton shows the loading overlay
     * 
     * @returns Promise<any>
     */
    showLoading(): Promise<any> {
        // loader object is being created every time as when loader
        // is dismissed it is rbeing removed from the view
        this.loader = this.loadingCtrl.create({
            content: "Please wait..."
        });
        return this.loader.present();
    }

    /**
     * Funciton hides the loading overlay
     * 
     * @returns Promise<any>
     */
    hideLoading() : Promise<any> {
        return this.loader.dismiss();
    }

}