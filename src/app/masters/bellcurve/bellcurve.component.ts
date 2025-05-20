import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { User } from '../user/user.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { Bellcurve } from './bellcurve.model';
import { HttpClientModule } from '@angular/common/http';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
import { Calendar } from '../calendar/calendar.model';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-bellcurve',
  templateUrl: './bellcurve.component.html',
  styleUrls: ['./bellcurve.component.css']
})
export class BellcurveComponent implements OnInit {
    
    public tableWidget: any;
    indexI: number = 0;
    bellcurveList: any[];
    empList: any;
    calendarList: any[] = [[]];
    selCalYr: any;
    dispErrTable: boolean = false;
    empMList: any[];
    successMsg: string = "";
    parentList: any[];
    employeeList: any[];
    selParentRole: any;
    selHeadEmpId: any;
    bellcurveItem: Bellcurve = this.bellcurveItem = new Bellcurve(0,0,'','',0,0,'', 0,'',true);
    calendarItem: Calendar = this.calendarItem = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    formData: FormData = new FormData();
    file: File;
    path: string = '';
    constructor(private appService: AppComponent, private httpService: HttpService, private http:Http, private router: Router) { }

    private initDatatable(): void {
      let exampleId: any = jQuery('#department');
        this.tableWidget = exampleId.DataTable();
    }

    private reInitDatatable(): void {
        if (this.tableWidget) {
            this.tableWidget.destroy();
            this.tableWidget = null;
        }
        setTimeout(() => this.initDatatable(), 0);
    }

    ngOnInit() {
      this.path = this.router.url;
      var chkaccess = this.appService.validateUrlBasedAccess(this.path);
      if(chkaccess == true){
        ////console.log(chkaccess);
        this.getBellCurveList();
        this.getCalendarList();
      }
      else 
        this.router.navigate(["/unauthorized"]);
    }
    ngAfterViewInit() {
        this.initDatatable();
    }
    
closeSaveModal() {
  ////console.log('testpop')
  jQuery("#myModal").modal('hide');
  
  // window.location.reload();
}
    getCalendarList(){
      this.httpService.get(APIURLS.BR_MASTER_CALENDAR_API).then((data: any) => {
        if (data.length >0) {
          this.calendarList = data;
        }
      });
    }
    onAddSaveBellCurve(isEdit: boolean, data: Bellcurve) {
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
        
        this.bellcurveItem =data;
        this.selCalYr = this.calendarList.find(s => s.id === this.bellcurveItem.fkCalanderId);
        // this.bellcurveList = this.bellcurveList.filter(s => s.isActive != false);
     
      }
      else {
        this.selCalYr = null;
        //this.bellcurveItem =data;
        // this.bellcurveList = this.bellcurveList.filter(s => s.isActive != false);
      }

      jQuery("#myModal").modal('show');
    }
    getHeader(): any { 
      var headers = new Headers();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');
      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      headers.append("Authorization", "Bearer " + authData.token);
      let options = new RequestOptions({ headers: headers });
      return options;
    }
  
    getBellcurveName(id: number){
      let temp: any;
      temp = this.calendarList.find(s => s.id == id);
      var name = (typeof temp != 'undefined')? temp.fiscalYear : '';
      return name;
    }

    getBellCurveList() {
      this.httpService.get(APIURLS.BR_MASTER_BELLCURVE_MASTER_DATA_API_ID).then((data: any) => {
        this.isLoading = false;
        if (data.length > 0) {
          this.bellcurveList = data;
          for(let des of this.bellcurveList) {
            this.httpService.getById(APIURLS.BR_MASTER_CALENDAR_INSERT_API,des.fkCalanderId).then((datam:any) => {
              // ////console.log('datam');
              // ////console.log(datam);
            this.calendarItem = datam;
            // this.bellcurveList.find(s => s.fkCalanderId === this.calendarItem.id)['fkCalanderId'] = this.calendarItem.fiscalYear;
           });  
          }
         
        this.reInitDatatable();
      }
      }).catch(error => {
        this.isLoading = false;
        this.bellcurveList = [];
      });
    }
    onSaveBellCurve() {

      this.errMsg = '';
      this.errMsgPop = '';
      this.isLoadingPop = true;
      this.bellcurveItem.fkCalanderId = this.selCalYr.id;
      let connection: any;

        if (!this.isEdit) {
          connection = this.httpService.post(APIURLS.BR_MASTER_BELLCURVE_MASTER_API_ID, this.bellcurveItem);
          
        }
        else {
         connection = this.httpService.put(APIURLS.BR_MASTER_BELLCURVE_MASTER_API_ID, this.bellcurveItem.id, this.bellcurveItem);
        }
        connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data > 0) {
          ////console.log(data);
          jQuery('#myModal').modal('hide');
          this.errMsgPop1 = ' Bell Curve data saved successfully!';
                    jQuery("#saveModal").modal('show');
        
          this.getBellCurveList();
          // this.reInitDatatable();
        }
        else {
           this.errMsgPop = 'Error saving sbu data..';
        }
        }).catch(error => {
         this.isLoadingPop = false;
         this.errMsgPop = 'Error saving sbu data..';
        });
      }

}
