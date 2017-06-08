import { Injectable } from '@angular/core';

// storage management
import { Storage } from '@ionic/storage';

// asynchronous poerations
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

// operations on time
import * as moment from 'moment';

// operations on arrays
import * as _ from 'lodash';

// generation of RFC4122 UUIDS
import * as uuid from 'uuid';

// diet object interface
import { IDiet } from '../interfaces/diet';

/**
 * All operations on diet object includig storage operations
 */
@Injectable()
export class DietService {
    private diets: IDiet[] = null;

    constructor(private storage: Storage) {
        this.loadDietsFromStorage().subscribe(diets => {
            this.diets = diets ? diets : [];
        });
    }
    /**
     * Function loads list of diets from storage.
     * 
     * @returns Observable<IDiet[]>
     */
    loadDietsFromStorage(): Observable<IDiet[]> {
        return Observable.fromPromise(this.storage.get('diets')).share();
    }
    /**
     * Function retrives list of extising diets
     * 
     * @returns IDiet[]
     */
    getDiets(): IDiet[] {
        return this.diets;
    }
    
    /**
     * Function delivers empty diet object with some default data. 
     * When creating / updating diet object we would like to use same 
     * functionality and do not care if diet exists or not. So we always
     * deliver an object. Here we can play with default object data. 
     * 
     * @returns IDiet
     */
    getDietDefaults(): IDiet {
        // TODO: move default values to some other global definition file
        let defaultDuration: number = 30;
        let endDate = moment(new Date()).add(defaultDuration, 'days');

        // generate new unique id for the diet object and make sure this id 
        // is not in use. If so generate it again.
        let newId;
        do {
            newId = uuid();
        } while (this.getDietById(newId) !== null);

        // new diet object
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

    /**
     * Function return diets with given id. If not found than null 
     * 
     * @param  {string} id 
     * @returns IDiet
     */
    getDietById(id: string): IDiet | null {
        if (this.diets === null)
            return null;

        // we do not return directly the result of find function
        // as if not found it return undefined and we want null.
        let result = this.diets.find(diet => diet.id === id);
        return result ? result : null;
    }

    /**
     * Function saves diet object into storage. First it checks if object 
     * already exists. If so it updates it, if not it insert it to the array
     * and updates the storage.
     * 
     * @param  {IDiet} d object to save
     * @returns Observable
     */
    saveDiet(d: IDiet): Observable<boolean> {
        // check if diet exists
        let diet = this.getDietById(d.id);
        if (!diet) {
            // if not exists than add it to the array
            this.diets.push(d);
        }

        // update array of diets in storage
        return Observable.fromPromise(this.storage.set('diets', this.diets)).map(diets => true);
    }

    /**
     * Function removes given diet object from diet array and updates the storage
     * 
     * @param  {IDiet} d object to remove
     * @returns Observable
     */
    removeDiet(d: IDiet): Observable<boolean> {
        // remove element with matching id
        this.diets = _.remove(this.diets, (diet => diet.id === d.id));

        // update array of diets in storage
        return Observable.fromPromise(this.storage.set('diets', this.diets)).map(diets => true);
    }
}