import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router'
import { APIURLS } from './api-url';
import { HttpService } from './http-service';
declare var $: any;

const CHECK_INTERVAL = 20000 // in ms
const STORE_KEY = 'lastAction';
@Injectable(
  {
    providedIn: 'root'
  }
)
export class AutologoutService {
  
  MINUTES_UNITL_AUTO_LOGOUT = 20 // in mins
  public getLastAction() {
    return parseInt(localStorage.getItem(STORE_KEY));
  }
  public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }
  

  constructor(private router: Router,private http:HttpClient,private httpService: HttpService) {
    this.check();
    this.initListener();
    this.initInterval();
    //localStorage.setItem(STORE_KEY,Date.now().toString());
  }

  

  initListener() {
    document.body.addEventListener('click', () => this.reset());
    document.body.addEventListener('mouseover', () => this.reset());
    document.body.addEventListener('mouseout', () => this.reset());
    document.body.addEventListener('keydown', () => this.reset());
    document.body.addEventListener('keyup', () => this.reset());
    document.body.addEventListener('keypress', () => this.reset());
  }

  reset() {
    this.setLastAction(Date.now());
  }

  initInterval() {
    setInterval(() => {
      this.check();
    }, CHECK_INTERVAL);
  }

  check() {
  //  this.httpService.get(APIURLS.BR_SESSION_TIMEOUT_MASTER).then((data:any)=>{
  //    if(data)
  //    {
      //  this.MINUTES_UNITL_AUTO_LOGOUT=data[0].sessionTime;
        const now = Date.now();
        const timeleft = this.getLastAction() + this.MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
        const diff = timeleft - now;
        const isTimeout = diff < 0;
    
        if (isTimeout) {
        //  this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{
          var filterModel:any={};
          // var user=JSON.parse(localStorage.getItem('currentUser'));
          // filterModel.employeeId=user.employeeId;
          // filterModel.application='UNNATI';
          // filterModel.activity='LOGOUT';
      //    filterModel.ipAddress=res.ip;
    
          // this.httpService.post(APIURLS.BR_UPDATE_USER_LOG,filterModel).then((data)=>{
          //   if(data.length>0)
          //   {
    
          //   }
          
            localStorage.clear();
            $('.modal').modal('hide');
            //$(".modal-backdrop").remove();
            this.router.navigate(['/login']);
         // });
      //  });
          }
        
  //    }
  //  }).
  //  catch((error)=>
  //  {

  //  });
  
    
    
  }
}
