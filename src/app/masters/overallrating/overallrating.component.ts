import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { User } from '../user/user.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { Overallrating } from './overallrating.model';
import { HttpClientModule } from '@angular/common/http';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
import { Calendar } from '../calendar/calendar.model';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-overallrating',
  templateUrl: './overallrating.component.html',
  styleUrls: ['./overallrating.component.css']
})
export class OverallRatingComponent implements OnInit {
    
    public tableWidget: any;
    overallRatingList: any[];
    parentList: any[];
    selCalYr: any;
    calendarList: any[] = [[]];
    calendarItem: Calendar= this.calendarItem = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
    overallRatingItem: Overallrating = this.overallRatingItem = new Overallrating(0, 0,0,0,'', '',true);
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    calenderId: string = '';
    path: string = '';
    constructor(private appService: AppComponent, private httpService: HttpService, private http:Http, private router: Router) { }

    private initDatatable(): void {
      let exampleId: any = jQuery('#ratingTable');
        this.tableWidget = exampleId.DataTable();
    }

    private reInitDatatable(): void {
        if (this.tableWidget) {
            this.tableWidget.destroy()
            this.tableWidget = null
        }
        setTimeout(() => this.initDatatable(), 0)
    }

    ngOnInit() {
      this.path = this.router.url;
      var chkaccess = this.appService.validateUrlBasedAccess(this.path);
      if(chkaccess == true){
        ////console.log(chkaccess);
        this.getCalendarList();
      this.getRatingList();
      }
      else 
        this.router.navigate(["/unauthorized"]);
    }
    ngAfterViewInit() {
        this.initDatatable()
    }

    closeSaveModal() {
      ////console.log('testpop')
      jQuery("#myModal").modal('hide');
      
      // window.location.reload();
    }
    getCalendarList(){
      this.httpService.get(APIURLS.BR_MASTER_CALENDAR_API).then((data: any) => {
        if (data.length > 0) {
          this.calendarList = data;
        }
      });
    }

    getCalName(id: number){
      var temp: any;
      temp = this.calendarList.find(s => s.id == id);
      var fiscalname = (typeof temp != 'undefined')? temp.fiscalYear : '';
      return fiscalname;
    }

    onAddRating(isEdit: boolean, data: Overallrating) {
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
        this.overallRatingItem = data;
        this.calenderId = this.overallRatingItem.fkCalenderId+'';
        // this.parentList = this.calendarList.filter(s => s.isActive != false);
        ////console.log(this.calenderId);
        this.selCalYr = this.calendarList.find(s => s.id == this.calenderId);
      }
      else {
        // this.parentList = this.calendarList.filter(s => s.isActive != false);
        this.calendarItem = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
        this.overallRatingItem = new Overallrating(0, 0,0,0,'', '',true);
        this.selCalYr = null;
      }
      jQuery("#myModal").modal('show');
    }
    getHeader(): any { 
      var headers = new Headers();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');
      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
      headers.append("Authorization", "Bearer " + authData.token);
      let options = new RequestOptions({ headers: headers });
      return options;
    }
  
    getRatingList() {
      // debugger;
      this.httpService.get(APIURLS.BR_MASTER_OVERALLRATING_DATA_API).then((data: any) => {
        this.isLoading = false;
        if (data.length >0) {
          this.overallRatingList = data;
          // debugger;     
          
          // for(let des of this.overallRatingList) {
          //   this.httpService.getById(APIURLS.BR_MASTER_CALENDAR_INSERT_API, des.fkCalenderId).then((datam:any) => {
          //   this.calendarItem = datam;
          //   var ratingsWithSameCalanderId = this.overallRatingList.filter(s => s.fkCalenderId == this.calendarItem.id);
          //   ratingsWithSameCalanderId.forEach(element => {
          //     element['fkCalenderId']= this.calendarItem.fiscalYear;
          //   });
          //  });  
          // }
          ////console.log('this.overallRatingLis');
          ////console.log(this.overallRatingList);
          this.reInitDatatable();
        }
      }).catch(error => {
        this.isLoading = false;
        this.overallRatingList = [];
      });
    }

    onSaveOverallRating() {
      // debugger;
      this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = true;
      this.overallRatingItem.fkCalenderId = this.selCalYr.id; 
      let connection: any;
      // debugger;
      if(!this.overallRatingList.some(s => s.rating == this.overallRatingItem.rating && s.fkCalenderId == this.overallRatingItem.fkCalenderId && s.id != this.overallRatingItem.id)){
        if (!this.isEdit)
         connection = this.httpService.post(APIURLS.BR_MASTER_OVERALLRATING_API, this.overallRatingItem);
        else
         connection = this.httpService.put(APIURLS.BR_MASTER_OVERALLRATING_API, this.overallRatingItem.id, this.overallRatingItem);
        
        connection.then((data: any) => {
         this.isLoadingPop = false;
         if (data == 200 || data.id > 0) {
           jQuery("#myModal").modal('hide');
           
 this.errMsgPop1 = ' Overall Rating data saved successfully!';
 jQuery("#saveModal").modal('show');
           this.getRatingList();
         }
        }).catch(error => {
         this.isLoadingPop = false;
         this.errMsgPop = 'Error saving Rating data..';
        });
      }else{
        this.isLoadingPop = false;
        this.errMsgPop = 'Rating already exists..';
        this.getRatingList();
      }
    }
}
