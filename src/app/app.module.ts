import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { DietPage, PopoverMenuPage } from '../pages/diet/diet';
import { DietEditorPage } from '../pages/diet/diet-editor/diet-editor';
import { DietService } from '../shared/services/diet.service';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
    declarations: [
        MyApp,
        AboutPage,
        DietPage,
        HomePage,
        TabsPage,
        PopoverMenuPage,
        DietEditorPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        AboutPage,
        DietPage,
        HomePage,
        TabsPage,
        PopoverMenuPage,
        DietEditorPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        DietService,
        { provide: ErrorHandler, useClass: IonicErrorHandler }
    ]
})
export class AppModule { }
