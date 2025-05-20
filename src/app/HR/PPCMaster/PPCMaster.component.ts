import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { PPCMaster } from './PPCMaster.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import * as _ from "lodash";
declare var jQuery: any;
export class actionItemModel {
  name: string;
  description: string;
}
@Component({
  selector: 'app-PPCMaster',
  templateUrl: './PPCMaster.component.html',
  styleUrls: ['./PPCMaster.component.css']
})
export class PPCMasterComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) desigForm: NgForm;
  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  PPCMasterList: any[];
  PPCMasterList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  PPCMasterItem: PPCMaster = new PPCMaster();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  notFirst = true;
  currentUser = {} as AuthData;
  oldPPCMasterItem: PPCMaster = new PPCMaster();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#desigTable');
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
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getPPCMasterMasterList();
      this.getEmployeeCatList();
      this.getEmployeeList();
      this.getPlantList();
      this.getPayGroupList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
  EmployeeList: any[] = [];
  PayGroupList: any[] = [];
  PlantList: any[] = [];
  empCategoryList: any[] = [];

  getEmployeeList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.EMP_PPC_EMP_MASTER_INSERT).then((data: any) => {
      if (data.length > 0) {
        this.EmployeeList = data;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.EmployeeList = [];
    });
  }
  getEmployeeCatList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.empCategoryList = data;
      }
      //  this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.empCategoryList = [];
    });
  }

  getPayGroupList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.PayGroupList = data;
      }
      //  this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.PayGroupList = [];
    });
  }
  getPlantList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.PlantList = data;
      }
      //  this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.PlantList = [];
    });
  }

  getempid(id) {
    let temp = this.EmployeeList.find(x => x.id == id);
    return temp ? temp.employeeId + ' - ' + temp.firstName + ' ' + temp.middleName + ' ' + temp.lastName : '';

  }
  getplant(id) {
    let temp = this.PlantList.find(x => x.id == id);
    return temp ? temp.code : '';

  }
  getpaygroup(id) {
    let temp = this.PayGroupList.find(x => x.id == id);
    return temp ? temp.short_desc : '';

  }
  getcat(id) {
    let temp = this.empCategoryList.find(x => x.id == id);
    return temp ? temp.catltxt : '';

  }
  getPPCMasterMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.EMP_PPC_MASTER_ALL_LIST).then((data: any) => {
      if (data.length > 0) {
        this.PPCMasterList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.PPCMasterList = [];
    });
  }

  onAddPPCMaster(isEdit: boolean, data: PPCMaster) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.PPCMasterItem = new PPCMaster();
    this.aduitpurpose = '';
    this.oldPPCMasterItem = new PPCMaster();
    if (this.isEdit) {
      Object.assign(this.oldPPCMasterItem, data);
      this.PPCMasterItem = Object.assign({}, data);
    }
    else {
      this.PPCMasterItem = new PPCMaster();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSavePPCMaster() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    if (!this.PPCMasterList.some(s => s.plantId == this.PPCMasterItem.plantId && s.payGroupId == this.PPCMasterItem.payGroupId
      && s.employeeCategoryId == this.PPCMasterItem.employeeCategoryId && s.employeeId == this.PPCMasterItem.employeeId)) {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.PPCMasterItem.createdById = this.currentUser.uid;
        this.PPCMasterItem.modifiedById = this.currentUser.uid;

        // this.PPCMasterItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.HRpost(APIURLS.EMP_PPC_MASTER_INSERT, this.PPCMasterItem);
      }
      else {
        this.auditType = "Update";
        this.PPCMasterItem.modifiedById = this.currentUser.uid;
        // this.PPCMasterItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.HRput(APIURLS.EMP_PPC_MASTER_INSERT, this.PPCMasterItem.employeePPCMappingId, this.PPCMasterItem);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' Mapping data saved successfully!';
          jQuery("#saveModal").modal('show');
          // let Id=!this.isEdit?data.id:this.PPCMasterItem.id;
          // this.insertAuditLog(this.oldPPCMasterItem,this.PPCMasterItem,Id);
          this.getPPCMasterMasterList();
        }
        else
          this.errMsgPop = data;

      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving mapping..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Mapping aleady exists';
    }
  }

  performTask(data) {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    this.PPCMasterItem = Object.assign({}, data);
    this.PPCMasterItem.modifiedById = this.currentUser.uid;
    // this.PPCMasterItem.modifiedDate = new Date().toLocaleString();
    connection = this.httpService.HRpost(APIURLS.EMP_PPC_MASTER_DELETE, this.PPCMasterItem);


    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.length == null) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = ' Mapping data deleted successfully!';
        jQuery("#saveModal").modal('show');
        // let Id=!this.isEdit?data.id:this.PPCMasterItem.id;
        // this.insertAuditLog(this.oldPPCMasterItem,this.PPCMasterItem,Id);
        this.getPPCMasterMasterList();
      }
      else
        this.errMsgPop = data;

    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving mapping..';
    });
  }
   
  
  // deleteDesignation(data: Designation): void {
  //   this.PPCMasterItem = new Designation();
  //   this.aduitpurpose='';
  //   this.oldPPCMasterItem=new Designation();
  //   swal({
  //     title: "Are you sure to delete?",
  //     icon: "warning",
  //     dangerMode: true,
  //     buttons: [true, true],
  //   }).then((willdelete) => {
  //     if (willdelete) {
  //       Object.assign(this.PPCMasterItem, data);
  //       let connection: any;
  //       this.auditType="Delete";
  //       this.PPCMasterItem.isActive = false;
  //       this.PPCMasterItem.modifiedBy = this.currentUser.uid;
  //       this.PPCMasterItem.modifiedDate = new Date().toLocaleString();
  //       connection = this.httpService.HRput(APIURLS.BR_DESIGNATION_INSERT_API, this.PPCMasterItem.id, this.PPCMasterItem);
  //       connection.then((data: any) => {
  //         this.isLoadingPop = false;
  //         if (data == 200 || data.id > 0) {
  //           this.errMsgPop1 = ' Deleted successfully!';
  //           jQuery("#saveModal").modal('show');
  //          // this.insertAuditLog(this.PPCMasterItem,this.oldPPCMasterItem,this.PPCMasterItem.id);
  //           this.getDesignationMasterList();
  //         }
  //       }).catch(() => {
  //         this.isLoadingPop = false;
  //         this.errMsgPop = 'Error deleting Designation..';
  //       });
  //     }
  //   });
  // }
  
}
