import { Injectable } from '@angular/core';
import { IDiet } from '../interfaces/diet';
import { Storage } from '@ionic/storage';
import * as uuid from 'uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

@Injectable()
export class DietService {
    private diets: IDiet[] = null;

    constructor(private storage: Storage) {
        storage.get('diets').then(diets => {
            this.diets = diets ? diets : [];
        });
    }

    getDietDefaults(): IDiet {
        let defaultDuration: number = 30;
        let endDate = moment(new Date()).add(defaultDuration, 'days');

        let defaultDiet: IDiet = {
            id: uuid(),
            name: 'ssss',
            startDate: new Date(),
            endDate: endDate.toDate(),
            duration: defaultDuration,
            startWeight: 90,
            endWeight: 85
        };

        return defaultDiet;
    }

    getDietById(id: string) {
        return this.diets.find(diet => diet.id === id);
    }

    saveDiet(d: IDiet): Observable<boolean> {
        let diet = this.getDietById(d.id);
        if (!diet) {
            this.insertDiet(d);
        }
        this.updateStorage();

        return Observable.of(true);
    }

    insertDiet(d: IDiet): void {
        this.diets.push(d);
    }

    updateStorage(): void {
        this.storage.set('diets', this.diets);
    }

    getDiets(): Observable<IDiet[]> {
        return Observable.of(this.diets);
    }
}