import { Injectable } from '@angular/core';
import { IDiet } from '../interfaces/diet';

@Injectable()
export class DietService {

    constructor() { }

    getDietDefaults(): IDiet {
        let defaultDiet: IDiet = {
            id: 0,
            name: '',
            startDate: new Date(),
            endDate: new Date(),
            startWeight: null,
            endWeight: null
        };

        return defaultDiet;
    }

    updateDiet(diet: IDiet): void {
        
    }

}