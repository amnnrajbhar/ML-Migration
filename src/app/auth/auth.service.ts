import { HttpClient } from '@angular/common/http';
import { APIURLS } from './../shared/api-url';
import { HttpService } from './../shared/http-service';
import { AuthData } from './auth.model';
import { Injectable } from '@angular/core';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

//import { Http } from '@angular/http';
@Injectable()
export class AuthService {
    authData: AuthData = new AuthData(false, 0, '', '', '', '','', [], '', false, 0, 0, true,'','',0, 0,'','','',false,0,0,'',0,0,'','','','',0,0, []);
    myStorage = window.localStorage;
    constructor(private httpService: HttpService,private http:HttpClient) { }

  login(username, password, tenantid, ip) {
    let postParams = {
      username: username,
      password: password,
      tenantid: tenantid,
      ip:ip
    }
    const promise = new Promise((resolve, reject) => {
      this.httpService.postLogin(postParams).then(data => {
        ////console.log('data');
        ////console.log(data.status);
        resolve(data);
      }).catch(error => {
        reject(error.status);
        
      });
    });
    return promise;
  }

  logout() {
    // debugger;
      var user=JSON.parse(localStorage.getItem('currentUser'));
      localStorage.removeItem('currentUser');
      window.localStorage.removeItem('formUrlList');
      ////console.log("logout");
      localStorage.clear();
      // console.log(localStorage.getItem('formUrlList')); // retrieve the item
      if(user !=null)
      {
     //   this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{
      //console.log(data);
      //this.ipAddress=res.ip;
      var filterModel:any={};
      filterModel.employeeId=user.employeeId;
      filterModel.application='UNNATI';
      filterModel.activity='LOGIN';
   //   filterModel.ipAddress=res.ip;

      this.httpService.post(APIURLS.BR_UPDATE_USER_LOG,filterModel).then((data)=>{
        if(data.length>0)
        {

        }
      }).catch((error)=>{

      });
   //   });
      }
     
      this.authData = new AuthData(false, 0, '', '', '', '','', [], '', false, 0, 0, true, '','',0, 0,'','','',false,0,0,'',0,0,'','','','',0,0, []);
  }

  
  isAuthenticated() {
    if (this.authData.isAuth) {
      return true;
    }
    else {
      return false
    }

  }
 
  
}
