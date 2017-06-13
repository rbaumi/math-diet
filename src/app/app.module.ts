import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { DietPage, PopoverMenuPage } from '../pages/diet/diet';
import { DietEditorPage } from '../pages/diet/diet-editor/diet-editor';
import { DietViewerPage, PopoverViewerMenuPage } from '../pages/diet/diet-viewer/diet-viewer';
import { MeasurementModal } from '../pages/diet/new-measurement/new-measurement';
import { DietService } from '../shared/services/diet.service';
import { ApplicationService } from '../shared/services/application.service';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { ChartsModule } from 'ng2-charts';

import { SocialSharing } from '@ionic-native/social-sharing';

import 'hammerjs';
// import 'chartjs-plugin-zoom';

@NgModule({
    declarations: [
        MyApp,
        AboutPage,
        DietPage,
        HomePage,
        TabsPage,
        PopoverMenuPage,
        DietEditorPage,
        DietViewerPage,
        MeasurementModal,
        PopoverViewerMenuPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot(),
        ChartsModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        AboutPage,
        DietPage,
        HomePage,
        TabsPage,
        PopoverMenuPage,
        DietEditorPage,
        DietViewerPage,
        MeasurementModal,
        PopoverViewerMenuPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        DietService,
        ApplicationService,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        SocialSharing
    ]
})
export class AppModule { }
