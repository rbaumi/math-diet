import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { DietPage } from '../diet/diet';
import { HomePage } from '../home/home';

@Component({
    templateUrl: 'tabs.html'
})
export class TabsPage {

    homeRoot = HomePage;
    aboutRoot = AboutPage;
    dietRoot = DietPage;

    constructor() {

    }
}
