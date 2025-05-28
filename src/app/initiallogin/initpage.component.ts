import { APIURLS } from './../shared/api-url';
import { Router } from '@angular/router';
import { HttpService } from './../shared/http-service';
import { AppComponent } from './../app.component';
import { Component, OnInit } from '@angular/core';
import * as _ from "lodash";
import { AuthData } from '../auth/auth.model';
declare var jQuery: any;

@Component({
  selector: 'app-initpage',
  templateUrl: './initpage.component.html',
  styleUrls: ['./initpage.component.css']
})
export class InitPageComponent implements OnInit {
  title = 'app';
  dshbrdRouteList!: any[];
  dshbrdV1!: any[];
  dshbrdV2!: any[];
  dshbrdV3!: any[];
  currentUser!: AuthData;

  constructor(private appService: AppComponent, private router: Router, private httpService: HttpService) { }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.title = 'Loading';
    this.routetoDashboard();
    //this.router.navigate(["/dashboard"]);
    //location.reload();

  }

  routetoDashboard() {

    //let type={id:1,type:"UserCreation"};
    let param: string = this.currentUser.profileIDs.join();

    this.httpService.getByParam(APIURLS.BR_MASTER_GETFORMSFROMPROFILES, param).then((data: any) => {
      ////console.log(data)
      if (data.length > 0) {
        // this.router.navigate(["/profile-page"]);
        this.router.navigate(["/vms-homepage"]);

        // if (data.length > 0) {
        //     this.router.navigate(["/profile-page"]);
        //     //location.reload();
        // }
        // else if (this.dshbrdV2.length > 0) {
        //     this.router.navigate(["/department"]);
        //     //location.reload();
        // }
        // else if (this.dshbrdV3.length > 0) {
        //     this.router.navigate(["/department"]);
        //     //location.reload();
        // }
      }
    }).catch((error)=> {
      //console.log(error);
      this.dshbrdRouteList = [];
    });
  }
  //ngAfterViewInit() {
  //    debugger;
  //   // this.router.navigate(["/dashboard"]);
  //}
  //onloadevent() {
  //   // debugger;
  //    //this.router.navigate(["/dashboard"]);
  //}

  //ngAfterViewChecked() {
  //   // debugger;
  //   // this.router.navigate(["/dashboard"]);
  //    // Component views have been checked
  //}

}
