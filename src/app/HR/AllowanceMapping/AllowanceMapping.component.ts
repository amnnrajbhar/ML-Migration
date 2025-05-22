import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { AllowanceMapping } from './AllowanceMapping.model';
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
  selector: 'app-AllowanceMapping',
  templateUrl: './AllowanceMapping.component.html',
  styleUrls: ['./AllowanceMapping.component.css']
})
export class AllowanceMappingComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) desigForm: NgForm;
  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  AllowanceMappingList: any[];
  AllowanceMappingList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  AllowanceMappingItem: AllowanceMapping = new AllowanceMapping();
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
  oldAllowanceMappingItem: AllowanceMapping = new AllowanceMapping();// For aduit log
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
      //this.getAllowanceMappingMasterList();
      this.getEmployeeCatList();
    //  this.getPlantList();
    //  this.getPayGroupList();
    //  this.getAllowanceList();
    //  this.getDesigList();
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
  EmployeeList:any[]=[];
  PayGroupList:any[]=[];
  PlantList:any[]=[];
  empCategoryList:any[]=[];

  
  getEmployeeCatList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.empCategoryList = data;
        this.getAllowanceList();
      }
    //  this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.empCategoryList = [];
    });
  }

  AllowanceList:any[]=[];
  getAllowanceList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.BR_GET_ALLOWANCE_LIST).then((data: any) => {
      if (data.length > 0) {
        this.AllowanceList = data;
        this.getDesigList();
      }
    //  this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.AllowanceList = [];
    });
  }

  DesigList:any[]=[];
  getDesigList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.DesigList = data;
        this.getPayGroupList();
      }
    //  this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.DesigList = [];
    });
  }
  getPayGroupList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.PayGroupList = data;
        this.getPlantList();
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
        this.getAllowanceMappingMasterList();
      }
    //  this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.PlantList = [];
    });
  }

  getempid(id)
  {
    let temp=this.DesigList.find(x=>x.id==id);
    return temp? temp.name:'';

  }
  getAllType(id)
  {
    let temp=this.AllowanceList.find(x=>x.id==id);
    return temp? temp.allowanceType:'';

  }
  getplant(id)
  {
    let temp=this.PlantList.find(x=>x.id==id);
    return temp? temp.code:'';

  }
  getpaygroup(id)
  {
    let temp=this.PayGroupList.find(x=>x.id==id);
    return temp? temp.short_desc:'';

  }
  getcat(id)
  {
    let temp=this.empCategoryList.find(x=>x.id==id);
    return temp? temp.catltxt:'';

  }
  AllowanceList1:any[]=[];
  onMetroSelected(value)
  {
    if(value=='Y')
    {
      this.AllowanceList1=this.AllowanceList.filter(x=>x.metro=='X');
    }
    else{
      this.AllowanceList1=this.AllowanceList.filter(x=>x.metro !='X');
    }

  }

  getAllowanceMappingMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.HRget(APIURLS.BR_GET_ALLOWANCE_MAPPING_LIST).then((data: any) => {
      if (data.length > 0) {
        this.AllowanceMappingList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.AllowanceMappingList = [];
    });
  }

  onAddAllowanceMapping(isEdit: boolean, data: AllowanceMapping) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.AllowanceMappingItem = new AllowanceMapping();
    this.aduitpurpose='';
    this.oldAllowanceMappingItem=new AllowanceMapping();
    if (this.isEdit) {
      Object.assign(this.oldAllowanceMappingItem, data);
      this.AllowanceMappingItem = Object.assign({}, data);
    }
    else {
      this.AllowanceMappingItem = new AllowanceMapping();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSaveAllowanceMapping() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    if (!this.AllowanceMappingList.some(s => s.plantId == this.AllowanceMappingItem.plantId && s.payGroupId == this.AllowanceMappingItem.payGroupId
      && s.employeeCategoryId == this.AllowanceMappingItem.employeeCategoryId &&  s.designationId == this.AllowanceMappingItem.designationId  && 
      s.allowanceTypeId== this.AllowanceMappingItem.allowanceTypeId)) {
      if (!this.isEdit) {
        this.auditType="Create";
        this.AllowanceMappingItem.createdBy= this.currentUser.employeeId;

       // this.AllowanceMappingItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.HRpost(APIURLS.BR_INSERT_ALLOWANCE_MAPPING, this.AllowanceMappingItem);
      }
      else {
        this.auditType="Update";
        this.AllowanceMappingItem.modifiedBy = this.currentUser.employeeId;
       // this.AllowanceMappingItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.HRput(APIURLS.BR_INSERT_ALLOWANCE_MAPPING, this.AllowanceMappingItem.id, this.AllowanceMappingItem);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' Mapping data saved successfully!';
          jQuery("#saveModal").modal('show');
          // let Id=!this.isEdit?data.id:this.AllowanceMappingItem.id;
          // this.insertAuditLog(this.oldAllowanceMappingItem,this.AllowanceMappingItem,Id);
          this.getAllowanceMappingMasterList();
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
  
}
