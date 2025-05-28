import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { User } from '../user/user.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Project } from './project.model';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
import { Employee } from '../approval/employee.model';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var jQuery: any;

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
    
    public tableWidget: any;
@ViewChild(NgForm, { static: false }) prjForm!: NgForm;

    prjList: any[]=[];
    empList: any[]=[];
    codeList!: any[];
    flag: any;
    parentList!: any[];
    employeeList!: any[];
    selParentRole: any;
    selManagerName: any;
    selTeamLead: any;
    prjItem: Project = new Project(0, '','', '', 0, 0, '', 0,'','',true);
    prj1Item: Project =  new Project(0, '','', '', 0, 0, '', 0,'','',true);
    empItem: Employee = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true);
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    path:string = '';
    empListCon: any=[];
    empListCon1: any=[];
    empListCon2: any=[];
    notFirst=true;
    notFirstMgr=true;
    constructor(private appService: AppComponent, private httpService: HttpService, private http:HttpClient, private router: Router) { }

    // clearForm(){
    //   console.log('form reset');
    //   this.prjForm.resetForm();
    //   this.getProjectList();
    // }

    private initDatatable(): void {
      let exampleId: any = jQuery('#project');
        this.tableWidget = exampleId.DataTable({
          "order": []
        });
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
        this.getProjectList();
        this.getEmpList();
      }
      else 
        this.router.navigate(["/unauthorized"]);
    }
    ngAfterViewInit() {
        this.initDatatable();
    }

    onItemSelect(item: any) {
      // this.selCompetencyHead  = item;
      console.log(item);
      console.log(this.selManagerName );
    }

    onItemSelectT(item: any) {
      // this.selCompetencyHead  = item;
      console.log(item);
      console.log(this.selTeamLead );
    }

    checkStatus(){
      console.log(this.selManagerName.length+'<->'+this.notFirst);
      if(this.selManagerName.length<=0) this.notFirst=false;
    }

    checkMgrStatus(){
      console.log(this.selTeamLead.length+'<->'+this.notFirst);
      if(this.selTeamLead.length<=0) this.notFirstMgr=false;
    }

    onAddProject(isEdit: boolean, data: Project) {
      // this.clearForm();
      this.prjForm.form.markAsPristine();
      this.prjForm.form.markAsUntouched();
      this.prjForm.form.updateValueAndValidity();

      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = true;
      this.empListCon1 = this.empListCon;
      this.empListCon2 = this.empListCon;
      this.notFirst=true;
      this.notFirstMgr=true;
      // debugger;
      if (this.isEdit) {
        this.prjItem = data;
        this.parentList = this.prjList.filter((s:any) => s.isActive != false);
        this.employeeList = this.empList.filter((s:any) => s.isActive != false);
        this.selParentRole = this.prjList.find((s:any) => s.fkParentId === this.prjItem.fkParentId);
        // this.selManagerName = this.empList.find((s:any) => s.firstName === this.prjItem.fkProjectManager);
        this.selManagerName = this.empListCon1.filter((s:any) => s.id === this.prjItem.fkProjectManager);
        // this.selTeamLead = this.empList.find((s:any) => s.fkTeamLead === this.prjItem.fkTeamLead);
        this.selTeamLead = this.empListCon2.filter((s:any) => s.id === this.prjItem.fkTeamLead);
      }
      else {
        this.parentList = this.prjList.filter((s:any) => s.isActive != false);;
        this.prjItem = new Project(0, '','', '', 0, 0, '', 0,'','',true);
        this.empItem = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true);
        this.selParentRole = null;
        this.selManagerName = [];
        this.selTeamLead = [];
      }
      this.isLoadingPop = false;
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
    selectedItems = [];
    dropdownSettings  = {};

    
  isEmpty(str){
    if(str.length==0) return true;
    else return false;
  }

    getEmpList(){
      this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
        if (data.length > 0) {
          this.empList = data;
          this.employeeList = data;
          console.log(this.empList);
          this.empList.forEach(element=>{
            var t = {'id':0,'name':''};
            t.id = element.id;
            let lastName = this.isEmpty(element.lastName.trim())?'-':'-'+element.lastName+'-';
            t.name = element.firstName+lastName+element.employeeId+'-'+element.designation;
            this.empListCon.push(t);
          })
          // this.empListCon1 = this.empListCon;
          // console.log(this.empListCon);
          this.dropdownSettings = {
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            allowSearchFilter: true
          };
        }
      }).catch((error)=> {
        // this.isLoading = false;
        this.empList = [];
        this.employeeList = [];
      });
    }
    // getEmployeeList(){
    //   this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
    //     if (data.length >0) {
    //       this.empList = data;
    //       // this.selManagerName =data;
    //       this.employeeList =data;
    //       this.reInitDatatable();
    //     }
    //   });
    // }

    getEmployeeName(id){
      let temp: any;
      temp = this.empList.find((s:any) => s.id == id);
      var name = temp? temp.firstName + ' ' + temp.lastName: '';
      return name;
    }

    getParentPrj(id){
      let temp: any;
      temp = this.prjList.find((s:any) => s.id == id);
      var name = temp? temp.name : '';
      return name;
    }

    getProjectList() {
      this.isLoading = true;
      this.httpService.get(APIURLS.BR_MASTER_PROJECT_DATA_API).then((data: any) => {
        if (data.length >0) {
          this.prjList = data;
          console.log(this.prjList);
          this.reInitDatatable();
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.prjList = [];
      });
    }

    closeSaveModal() {
      ////console.log('testpop')
      jQuery("#myModal").modal('hide');
      
      // window.location.reload();
    }
    
validatedForm: boolean = true;

validateForm(){
  // debugger;
  this.validatedForm = true;
  let blankName = this.prjItem.name.trim()==null || this.prjItem.name.trim()=='';
  let blankCode = this.prjItem.code.trim()==null || this.prjItem.code.trim()=='';
  let validName = this.prjList.some((s:any) => s.name.trim().toLowerCase() == this.prjItem.name.trim().toLowerCase() && s.id != this.prjItem.id);
  let validCode = this.prjList.some((s:any) => s.code.trim().toLowerCase() == this.prjItem.code.trim().toLowerCase() && s.id != this.prjItem.id);
  if(blankName){
    this.isLoadingPop = false;
    this.validatedForm = false;
      this.errMsgPop = 'Project name cannot be blank';
      // this.getProjectList();
      // throw Error();
  }
  else if(blankCode){
    this.isLoadingPop = false;
    this.validatedForm = false;
      this.errMsgPop = 'Project code cannot be blank';
      // this.getProjectList();
      // throw Error();
  }
  else if(validName){
    this.isLoadingPop = false;
    this.validatedForm = false;
      this.errMsgPop = 'Project name already exists..';
      // this.getProjectList();
      // throw Error();
  }

  if(validCode){
    this.isLoadingPop = false;
    this.validatedForm = false;
      this.errMsgPop = 'Project code entered already exists..';
      // this.getProjectList();
      // throw Error();
  }
}
    onSaveProject() {
      // debugger;
      this.validateForm();
      this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = true;
      this.prjItem.fkParentId = this.selParentRole.id;
      this.prjItem.fkProjectManager = this.selManagerName[0].id;
      this.prjItem.fkTeamLead = this.selTeamLead[0].id;
      let connection: any;
      // debugger;
      if(this.validatedForm){    
        if (!this.isEdit)
         connection = this.httpService.post(APIURLS.BR_MASTER_PROJECT_API, this.prjItem);
        else
         connection = this.httpService.put(APIURLS.BR_MASTER_PROJECT_API, this.prjItem.id, this.prjItem);
        
         connection.then((data: any) => {
         this.isLoadingPop = false;
         if (data == 200 || data.id > 0) {
           jQuery("#myModal").modal('hide');
           this.errMsgPop1 = ' Project data saved successfully!';
           jQuery("#saveModal").modal('show');
           this.getProjectList();
         }
        }).catch((error)=> {
         this.isLoadingPop = false;
         this.errMsgPop = 'Error saving department data..';
        });
      }
      else{
        this.isLoadingPop = false;
        this.errMsgPop = 'Project code already exists..';
      }
    }
  

}
