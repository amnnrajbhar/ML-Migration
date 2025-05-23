import { Component, OnInit } from '@angular/core';
import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { User } from '../user/user.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Rating } from './rating.model';
import { Calendar } from '../calendar/calendar.model';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit {
    
    public tableWidget: any;
    ratingList: any[];
    calendarList:any[]=[[]];
    parentList: any[];
    selParentRole: any;
    // ratingItem: Rating = this.ratingItem = new Rating(0, '','', '', 0, 0,'',true);;
    // calendarItem: Calendar = this.calendarItem = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
    ratingItem: Rating = new Rating(0, '','', '', 0, 0,'',true);
    calendarItem: Calendar = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    path: string = '';
    constructor(private appService: AppComponent, private httpService: HttpService, private http:HttpClient,
 private router: Router) { }

    private initDatatable(): void {
      let exampleId: any = jQuery('#rating');
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
        this.getRatingList();
      this.getCalendarList();
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
    onAddRating(isEdit: boolean, data: Rating) {
      // debugger;
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
        this.ratingItem = data;
        this.parentList = this.calendarList.filter(s => s.isActive != false);
        this.selParentRole = this.calendarList.find(s => s.id == this.ratingItem.fkCalendarId);
      }
      else {
        this.parentList = this.calendarList.filter(s => s.isActive != false);;
        this.ratingItem = new Rating(0, '','', '', 0,0,'', true);
        this.selParentRole = null;
      }
      jQuery("#myModal").modal('show');
    }
    getHeader(): any { 
      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      const headers = new HttpHeaders({
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + authData.token
      });
      return { headers: headers };
    }

    getCalendarList(){
      this.httpService.get(APIURLS.BR_MASTER_CALENDAR_API).then((data: any) => {
        if (data.length >0) {
          this.calendarList = data;
        }
      });
    }

    getRatingList() {
      this.httpService.get(APIURLS.BR_MASTER_RATING_DATA_API).then((data: any) => {
        this.isLoading = false;
        if (data.length >0) {
          this.ratingList = data;

          // for(let des of this.ratingList) {
          //   this.httpService.getById(APIURLS.BR_MASTER_CALENDAR_INSERT_API,des.fkCalendarId).then((datam:any) => {
          //   this.calendarItem = datam;
          //   this.ratingList.find(s => s.fkCalendarId === this.calendarItem.id)['fkCalendarId'] = this.calendarItem.fiscalYear;
          //  });  
          // }
          ////console.log('this.ratingList');
          ////console.log(this.ratingList);
          this.reInitDatatable();
        }
      }).catch(error => {
        this.isLoading = false;
        this.ratingList = [];
      });
    }

    getCalNames(id: number){
      var temp: any;
      temp = this.calendarList.find(s => s.id == id);
      var fiscalname = (typeof temp != 'undefined')? temp.fiscalYear : '';
      return fiscalname;
    }
    onSaveRating() {
      // debugger;
      this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = true;
      this.ratingItem.fkCalendarId = this.selParentRole.id;
      let connection: any;
      // debugger;
        if(!this.ratingList.some(s => s.scale == this.ratingItem.scale && s.fkCalendarId == this.ratingItem.fkCalendarId && s.id != this.ratingItem.id)){
        if (!this.isEdit)
         connection = this.httpService.post(APIURLS.BR_MASTER_RATING_API, this.ratingItem);
        else
         connection = this.httpService.put(APIURLS.BR_MASTER_RATING_API, this.ratingItem.id, this.ratingItem);
        
         connection.then((data: any) => {
         this.isLoadingPop = false;
         if (data == 200 || data.id > 0) {
           jQuery("#myModal").modal('hide');
           
 this.errMsgPop1 = ' Rating data saved successfully!';
 jQuery("#saveModal").modal('show');
           this.getRatingList();
         }
        }).catch(error => {
         this.isLoadingPop = false;
         this.errMsgPop = 'Error saving Rating data..';
        });
      }else{
        this.isLoadingPop = false;
        this.errMsgPop = 'Rating scale already exists..';
        this.getRatingList();
      }
    }
  }
  



