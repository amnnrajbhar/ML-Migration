import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Competency } from './competency.model';
import { AuthData } from '../../auth/auth.model';
import { HttpHeaders } from '@angular/common/http';
import { SBU } from '../sbu/sbu.model';
import { Employee } from '../employee/employee.model';
import { Router } from '@angular/router';
import { AppComponent } from './../../app.component';
import { NgForm } from '@angular/forms';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-competency',
  templateUrl: './competency.component.html',
  styleUrls: ['./competency.component.css']
})
export class CompetencyComponent implements OnInit {
  public tableWidget: any;
@ViewChild(NgForm, { static: false }) competencyForm: NgForm;

  parentList: any[];
  selParentRole: any;
  selCompetencyHead: any = [];
  selSbu: any;
  HeadList: any[];
  headName: "";
  competencyList: any[] = [[]];
  sbuList: any[] = [[]];
  empList: any[] = [[]];
  competencyItem: Competency = new Competency(0, '', 0, 0, '', '', 0, true, '', '');
  compItem: Competency = new Competency(0, '', 0, 0, '', '', 0, true, '', '');
  sbuItem: SBU = new SBU(0, '', '', '', 0, 0, '', true);
  empItem: Employee = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = "";
  empListCon = [];
  empListCon1 = [];
  LocationMasterList: any[] = [[]];
  notFirst: boolean = true;
  constructor(private appService: AppComponent, private router: Router, private httpService: HttpService) { }
  //constructor(private httpService: HttpService) { }
  // clearForm(){
  //   console.log('form reset');
  //   this.competencyForm.resetForm();
  //   this.getCompetencyMasterList();
  // }

  private initDatatable(): void {
    let exampleId: any = jQuery('#compTable');
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
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};

  onItemSelect(item: any) {
    // this.selCompetencyHead  = item;
    console.log(item);
    console.log(this.selCompetencyHead);
  }

  checkStatus() {
    console.log(this.selCompetencyHead.length + '<->' + this.notFirst);
    if (this.selCompetencyHead.length <= 0) this.notFirst = false;
  }

  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      ////console.log(chkaccess);
      //this.getLocationList();
      this.getCompetencyMasterList();
      //  this.getUserMasterList();
      this.getSbuMasterList();
      this.isLoading = false;

    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  getCompetencyMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_COMPETENCY).then((data: any) => {
      if (data.length > 0) {
        this.competencyList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.competencyList = [];
    });
  }

  getNameFor(empId: number) {
    let temp: any;
    temp = this.empList.find(item => item.id == empId);
    var name = (typeof temp != 'undefined') ? temp.firstName + ' ' + temp.lastName : '';
    return name;
  }

  getSBUName(sbuId: number) {
    let temp: any;
    temp = this.sbuList.find(item => item.id == sbuId);
    var name = (typeof temp != 'undefined') ? temp.name : '';
    return name;
  }

  getParentName(parentid) {
    let temp: any;
    temp = this.competencyList.find(item => item.id == parentid);
    var name = (typeof temp != 'undefined') ? temp.name : '';
    return name;
  }

  getSbuMasterList() {
    this.httpService.get(APIURLS.BR_MASTER_SBU_All).then((data: any) => {
      if (data.length > 0) {
        this.sbuList = data;
        // this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.sbuList = [];
    });
  }

  getLocationList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.LocationMasterList = data;
        // console.log(this.LocationMasterList);
      }
      this.reInitDatatable();
    }).catch(error => {
      this.LocationMasterList = [];
    });
  }
  getLocationName(id) {
    return this.LocationMasterList.find(s => s.id == id).name;
  }
  getUserMasterList() {
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
      if (data.length > 0) {
        this.empList = data;
        console.log(this.empList);
        // this.reInitDatatable();
        this.empList.forEach(element => {
          var t = { 'id': 0, 'name': '' };
          t.id = element.id;
          t.name = element.firstName + '-' + element.employeeId + '-' + element.designation;
          this.empListCon.push(t);
        })
        // this.empListCon1 = this.empListCon;
        console.log(this.empListCon);
        this.dropdownSettings = {
          singleSelection: true,
          idField: 'id',
          textField: 'name',
          allowSearchFilter: true
        };
      }
    }).catch(error => {
      this.isLoading = false;
      this.empList = [];
    });
  }


  onAddCompetency(isEdit: boolean, data: Competency) {
    // this.clearForm();
    this.competencyForm.form.markAsPristine();
    this.competencyForm.form.markAsUntouched();
    this.competencyForm.form.updateValueAndValidity();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.isLoading = true;
    this.empListCon1 = this.empListCon;
    this.notFirst = true;
    // debugger;
    if (this.isEdit) {
      // this.competencyItem = data;
      Object.assign( this.competencyItem,data);
      // this.parentList = this.competencyList.filter(s => s.isActive != false);
      // var compParentName = this.competencyItem.fkParentId + '';
      // var compHeadName = this.competencyItem.fkHeadEmpId + '';

      ////console.log('SBU ID:'+this.competencyItem.fkSbuId);
      // this.selParentRole = this.competencyList.find(s => s.id == +compParentName);
      // this.selCompetencyHead = this.empList.find(s => s.id == this.competencyItem.fkHeadEmpId );
      //   this.selCompetencyHead = this.empListCon1.filter(s=>s.id == this.competencyItem.fkHeadEmpId);
      this.selSbu = this.sbuList.find(s => s.id == this.competencyItem.fkSbuId);
    }
    else {
      // this.parentList = this.competencyList.filter(s => s.isActive != false);;
      this.competencyItem = new Competency(0, '', 0, 0, '', '', 0, true, '', '');
      this.sbuItem = this.sbuItem = new SBU(0, '', '', '', 0, 0, '', true);
      this.empItem = this.empItem = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);

      this.selParentRole = null;
      this.selCompetencyHead = [];
      this.selSbu = null;
      // this.selManagerName = null;
      // this.selTeamLead = null;
    }
    this.isLoadingPop = false;
    this.isLoading = false;
    jQuery("#myModal").modal('show');
  }

getHeader(): { headers: HttpHeaders } {
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

  onSaveCompetency() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;

    let connection: any;
    // let compNameFlag = false;
    // let compParentFlag = false;
    // let compHeadFlag = false;
    // let compSBUFlag = false;
    // // debugger;
    // if(this.competencyItem.name==null)
    //   compNameFlag = true;
    // else if(this.competencyItem.fkParentId==null)
    //   compParentFlag = true;
    // else if(this.competencyItem.fkHeadEmpId==null)
    //   compHeadFlag = true;
    // else if(this.competencyItem.fkSbuId==null)
    //   compSBUFlag = true;
    let blankName = (this.competencyItem.name.trim() == '' || this.competencyItem.name.trim() == null)
    if (blankName) {
      this.isLoadingPop = false;
      // this.validatedForm = false;
      this.errMsgPop = 'Competency name cannot be blank';
      // this.getSBUList();
    }
    else if (!this.competencyList.some(s => s.name.trim().toLowerCase() == this.competencyItem.name.trim().toLowerCase() && s.id != this.competencyItem.id)) {
      // if(!compNameFlag && !compParentFlag && !compHeadFlag && !compSBUFlag){
      // this.competencyItem.fkParentId = this.selParentRole.id;
      //this.competencyItem.fkHeadEmpId = this.selCompetencyHead[0].id;
      this.competencyItem.fkSbuId = this.selSbu.id;
      if (!this.isEdit)
        connection = this.httpService.post(APIURLS.BR_COMPETENCY_INSERT, this.competencyItem);
      else
        connection = this.httpService.put(APIURLS.BR_COMPETENCY_INSERT, this.competencyItem.id, this.competencyItem);
      connection.then((data: any) => {
        this.isLoadingPop = false;

        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');

          this.errMsgPop1 = 'Competency data saved successfully!';
          jQuery("#saveModal").modal('show');
          this.getCompetencyMasterList();
        }

      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving department data..';
      });
      // }
      // else{
      //   if(compNameFlag) this.errMsgPop = "Name cannot be blank.";
      //   if(compParentFlag) this.errMsgPop = "Parent Competency not selected.";
      //   if(compHeadFlag) this.errMsgPop = "Head of Competency not selected"; 
      //   if(compSBUFlag) this.errMsgPop = "SBU not selected.";
      // }
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Compentancy name already exists..';
    }
  }
}
