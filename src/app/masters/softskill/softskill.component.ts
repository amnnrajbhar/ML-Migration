import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { User } from '../user/user.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { SoftSkill } from './softskill.model';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
import { Role } from '../../profile/add-role/add-role.model';
import { Assessment } from '../assesment/assessment.model';
import { Calendar } from '../calendar/calendar.model';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-softskill',
  templateUrl: './softskill.component.html',
  styleUrls: ['./softskill.component.css']
})
export class SoftSkillComponent implements OnInit {
    
    public tableWidget: any;
    softskillList!: any[];
    parentList!: any[];
    profileList!: any[];
    assessmentList!: any[];
    calendarList: any[]=[[]];
    selParentRole: any;
    selAssessment: any;
    selCalendar: any;
    usrid!: number;
    roleid:number;
    path: string = '';
    softskillItem: SoftSkill = new SoftSkill(0, '','', 0, 0, 0,true);;
    profileItem: Role = new Role(0,'','',0,'','',true);
    assessmentItem: Assessment = new Assessment(0, '', '', 0,0,'',true, true, true, true, true, true,true, true, true,'',true , '');
    calendarItem: Calendar = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    constructor(private appService: AppComponent, private httpService: HttpService, private http:HttpClient, private router: Router) { }

    private initDatatable(): void {
      let exampleId: any = jQuery('#softskill');
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
      //let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.usrid = authData.uid;
      this.roleid = authData.roleId;
        this.getSoftSkillList();
        this.getProfileList();
        //  this.getAssessmentList();
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
    getProfileList(){
      this.httpService.get(APIURLS.BR_MASTER_ROLE_API).then((data: any) => {
        if (data.length >0) {
          this.profileList = data;
        }
      });
    }

    // getAssessmentList(){
    //   this.httpService.get(APIURLS.BR_MASTER_ASSESMENT_DATA_API).then((data: any) => {
    //     if (data.length >0) {
    //       this.assessmentList = data;
    //     }
    //   });
    // }

    getCalendarList(){
      this.httpService.get(APIURLS.BR_MASTER_CALENDAR_API).then((data: any) => {
        if (data.length >0) {
          this.calendarList = data;
        }
      });
    }

    onAddSoftSkill(isEdit: boolean, data: SoftSkill) {
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
        this.softskillItem = data;

        // this.parentList = this.softskillList.filter((s:any) => s.isActive != false);
        this.profileList = this.profileList.filter((s:any) => s.isActive != false);
        // this.assessmentList = this.assessmentList.filter((s:any) => s.isActive != false);
        this.calendarList = this.calendarList.filter((s:any) => s.isActive != false);
        ////console.log(this.softskillItem.fkRoleId);
        this.selParentRole = this.profileList.find((s:any) => s.role === this.softskillItem.fkRoleId);
        // this.selAssessment = this.assessmentList.find((s:any) => s.name === this.softskillItem.fkAssesmentId);
        this.selCalendar = this.calendarList.find((s:any) => s.id === this.softskillItem.fkCalendarId);
      }
      else {
        // this.parentList = this.softskillList.filter((s:any) => s.isActive != false);
        this.profileList = this.profileList.filter((s:any) => s.isActive != false);
        // this.assessmentList = this.assessmentList.filter((s:any) => s.isActive != false);
        this.calendarList = this.calendarList.filter((s:any) => s.isActive != false);

        this.softskillItem = new SoftSkill(0, '','', 0, 0, 0,true);;
        this.selParentRole = null;
        // this.selAssessment = null;
        this.selCalendar = null;
      }
      jQuery("#myModal").modal('show');
    }
   getHeader(): { headers: HttpHeaders } {
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}
  
    getSoftSkillList() {
    //  debugger;
    this.isLoading = true;
      this.httpService.get(APIURLS.BR_MASTER_SOFTSKILL_DATA_API).then((data: any) => {
        this.isLoading = false;
        
        if (data.length >0) {
          this.softskillList = data;

          for(let des of this.softskillList) {
            this.httpService.getById(APIURLS.BR_MASTER_ROLE_API_BYID,des.fkRoleId).then((datam:any) => {
            this.profileItem = datam;
            this.softskillList.find((s:any) => s.fkRoleId == this.profileItem.id)['fkRoleId'] = this.profileItem.role;
           });  
          }
          //  for(let des of this.softskillList) {
          //   this.httpService.getById(APIURLS.BR_MASTER_ASSESMENT_API,des.fkAssesmentId).then((datam:any) => {
          //   this.assessmentItem = datam;
          //   this.softskillList.find((s:any) => s.fkAssesmentId === this.assessmentItem.id)['fkAssesmentId'] = this.assessmentItem.name;
          //  });  
          // }
          //  for(let des of this.softskillList) {
          //   this.httpService.getById(APIURLS.BR_MASTER_CALENDAR_INSERT_API,des.fkCalendarId).then((datam:any) => {
          //   this.calendarItem = datam;
          //   this.softskillList.find((s:any) => s.fkCalendarId === this.calendarItem.id)['fkCalendarId'] = this.calendarItem.fiscalYear;
          //  });  
          // }
          this.reInitDatatable();
        }
      }).catch((error)=> {
        this.isLoading = false;
        this.softskillList = [];
      });
    }

    getCalName(id: number){
      var temp: any;
      temp = this.calendarList.find((s:any) => s.id == id);
      var fiscalname = (typeof temp != 'undefined')? temp.fiscalYear : '';
      return fiscalname;
    }
    
    onSaveSoftSkill() {
      // debugger;
      this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = true;
      this.softskillItem.fkRoleId = this.selParentRole.id;
      this.softskillItem.fkAssesmentId = null;
      this.softskillItem.fkCalendarId = this.selCalendar.id;
      let connection: any;
      // debugger;
      if(!this.softskillList.some((s:any) => s.skills== this.softskillItem.skills && s.fkCalenderId == this.softskillItem.fkCalendarId && s.id != this.softskillItem.id)){
      if (!this.isEdit)
         connection = this.httpService.post(APIURLS.BR_MASTER_SOFTSKILL_API, this.softskillItem);
        else
         connection = this.httpService.put(APIURLS.BR_MASTER_SOFTSKILL_API, this.softskillItem.id, this.softskillItem);
         
            connection.then((data: any) => {
         this.isLoadingPop = false;
         if (data == 200 || data.id > 0) {
           jQuery("#myModal").modal('hide');
           
 this.errMsgPop1 = ' Softskill Master data saved successfully!';
 jQuery("#saveModal").modal('show');
           this.getSoftSkillList();
         }
         else {
           this.errMsgPop = 'Error saving Softskill data..';
         }
        }).catch((error)=> {
         this.isLoadingPop = false;
         this.errMsgPop = 'Error saving Softskill data..';
        });
      }
      else{
        this.isLoadingPop = false;
        this.errMsgPop = 'Softskill already exists..';
      }
    }
}
