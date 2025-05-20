
import { HttpService } from '../../shared/http-service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class DataStorageService {
  
    dataStore: Map<string, any>;

  constructor(private httpService: HttpService, private router: Router) { 
    this.dataStore = new Map<string, any>();
  }

  SetData(key: string, value: any){      
    this.dataStore.set(key, value);
  }

  
  GetData(key: string){
    if(this.dataStore.has(key)){
      return this.dataStore.get(key);
    }
    return null;
}

}