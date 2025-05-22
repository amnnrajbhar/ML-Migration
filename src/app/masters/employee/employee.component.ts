import { AuthData } from '../../auth/auth.model'
import { Employee } from './employee.model';
import { EmployeeAddress } from './employee-address.model';
import { EmployeeOtherDetails } from './employee-otherDetails.model';
import { UserMaster } from './user-master.model';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Payroll } from './employee-payroll.model';
import { Role } from '../../profile/add-role/add-role.model';
import { Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { Location } from './location.model';
import { MatAutocompleteTrigger } from '@angular/material';
import { AuditLog } from '../auditlog.model';
import { AuditLogChange } from '../auditlogchange.model';
import swal from 'sweetalert';

export class actionItemModel {
  employeeId: string;
  firstName: string;
  middleName: string
  lastName: string;
  email: string;
  baseLocation: string;
  department: string;
  profile: string;
  designation: string;
  employee_type: string;
  role: string;
  manager: string;
  permanent_Address: string;
  phone_Number: string;
  current_Address: string;
  emergency_Contact_Name: string;
  emergency_Contact_Number: string;
  isActive: boolean;

  

}

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;
  searchTermBaseLoc = new FormControl();
  public filteredItemsBaseLoc = [];
  searchTermMgr = new FormControl();
  public filteredItemsMgr = [];
  searchTermRMgr = new FormControl();
  public filteredItemsRMgr = [];
  public tableWidget: any;
  addressId: number = 0;
  competencyList: any[] = [];
  entityList: any[] = [];
  designationList: any[] = [];
  selParentRole: any;
  selDepartment: any;
  selApprovalTemp: any;
  selProfile: any; selManager = []; selReportingManager = [];
  roleList: any[] = [];
  departmentList: any[] = [];
  AapprovalTempList: any[] = [];
  profileList: any[] = []; managerList: any; reporting_managerList: any;
  projectList: any[] = [];
  userDivisionList: any[] = [];
  FilteredDivList: any[] = [];
  divSelectedItem: any[];
  entitySelectedItem: any[];
  userEntityList: any[];
  entitySelected = [];
  userList: Employee[];
  empListCon = [];
  empListCon1 = [];
  locListCon = [];
  locListCon1 = [];
  addressList: any[];
  empOtherDetailList: any[];
  employeePayrollList: any[];
  uid: number = 0;
  userItem: Employee = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);
  addressItem: EmployeeAddress = new EmployeeAddress(0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', true,0);
  empOtherDetailsItem: EmployeeOtherDetails = new EmployeeOtherDetails(0, 0, '', 0, '', true, '', '', '', '', '', '', '', 0, 0, '', '', '', '');
  userMasterItem: UserMaster = new UserMaster(0, 0, '', '', '', '', 0, '', '', '', '', 0, 0, 0, 0, 0,'');
  employeePayrollItem: Payroll = new Payroll(0, '', 0, 0, 0, '', 0, '', '', 0, '', 0, '', true);
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  SelempDesignation: any;
  SelCompetency: any;
  SelempSBUList: any;
  SelProject: any;
  addressNtest: any;
  otherDetailNtest: any;
  payrollNtest: any;
  employeeId: string = "";
  formData: FormData = new FormData();
  file: File; successMsg: string = "";
  path: string = '';
  locationList: any[] = [[]];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;
  selectedManager: any = '';
  from_date:any;


  selectedRepManager = [];
  olduserItem: Employee = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);// For aduit log
  oldaddressItem: EmployeeAddress = new EmployeeAddress(0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', true,0);
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
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

  getDesignation(id) {
    // console.log(id);
    return this.designationList.find(s => s.id === id).name;
  }
  dropdownSettings1 = {
    singleSelection: true,
    idField: 'id',
    textField: 'name1',
    allowSearchFilter: true
  };
  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        this.locationList.sort((a,b)=>{return collator.compare(a.code,b.code)});
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a,b)=>{return collator.compare(a.code,b.code)});
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  onSelectAll() {
  
  }
  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true
  };

  onItemSelectM(item: any) {
  }
  onItemSelectB(item: any) {
  }
  onItemSelectRM(item: any) {
  }
  notFirst = true;
  rmnotFirst = true;
  checkStatus() {
    // console.log(this.selManager.length+'<->'+this.notFirst);
    if (this.selManager.length <= 0) this.notFirst = false;
  }
  checkStatusRep() {
    // console.log(this.selManager.length+'<->'+this.rmnotFirst);
    if (this.selManager.length <= 0) this.rmnotFirst = false;
  }
  checkStatusBL() {
    // console.log(this.selManager.length+'<->'+this.baseLocationnotfirst);
    if (this.selManager.length <= 0) this.baseLocationnotfirst = false;
  }
  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }
  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.baseLocation = this.currentUser.baselocation;
    this.from_date=new Date();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getLocationMaster();
      this.getUserMasterList();
      this.getRoleList();
      this.getDepartList();
      this.getProfileList();
      this.getDesignationList();
      this.getDivisionList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  getProjectList() {
    this.errMsg = "";
    this.httpService.get(APIURLS.BR_MASTER_PROJECTMASTER_API).then((data: any) => {
      if (data.length > 0) {
        this.projectList = data;
      }
      // this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.projectList = [];
    });
  }

  getDesignationList() {
    this.errMsg = "";
    this.httpService.get(APIURLS.BR_DESIGNATION_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.filter(x => x.isActive).sort((a,b)=>{
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.designationList = [];
    });
  }
  getUserMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
      if (data.length > 0) {
        this.userList = data;
        this.empListCon = data.map((i) => { i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation; return i; });
        this.userList = this.userList.filter(x => +x.baseLocation == this.baseLocation);
        this.reInitDatatable();
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoading = false;
      this.userList = [];
    });
  }

  getEntityList() {
    this.httpService.get(APIURLS.BR_MASTER_SBU_All).then((data: any) => {
      if (data.length > 0) {
        this.entityList = data;
      }
    }).catch(error => {
      this.entityList = [];
      this.isLoading = false;

    });
  }
  getDivisionList() {
    this.httpService.get(APIURLS.BR_COMPETENCY).then((data: any) => {
      if (data.length > 0) {
        this.competencyList = data.sort((a,b)=>{
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.competencyList = [];
      this.isLoading = false;

    });
  }
  getRoleList() {
    this.httpService.get(APIURLS.BR_MASTER_ROLE_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a,b)=>{
          if(a.role > b.role) return 1;
          if(a.role < b.role) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.roleList = [];
      this.isLoading = false;

    });
  }
  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter(x => x.isActive).sort((a,b)=>{
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.departmentList = [];
      this.isLoading = false;

    });
  }

  getProfileList() {
    this.httpService.get(APIURLS.BR_MASTER_PROFILE_API).then((data: any) => {
      if (data.length > 0) {
        this.profileList = data.sort((a,b)=>{
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.profileList = [];
    });
  }
  managerWarning: boolean = false;
  lastManager: string;
  onAddUser(isEdit: boolean, data: Employee) {
    this.isLoadingPop = true;
    this.userForm.form.markAsPristine();
    this.userForm.form.markAsUntouched();
    this.userForm.form.updateValueAndValidity();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.aduitpurpose = '';
    this.selManager = [];
    this.selReportingManager = [];
    this.selectedBaseLocation = [];
    this.notFirst = true;
    this.rmnotFirst = true;
    this.baseLocationnotfirst = true;
    this.isLoadingPop = true;
    this.managerWarning = false;
    this.empListCon1 = this.empListCon.filter(x => x.isActive);
    this.locListCon1 = this.locListCon.filter(x => x.isActive);
    $('#myTab a[href="#tab-sumTot"]').tab('show');
    if (this.isEdit) {
      this.olduserItem = Object.assign({}, data);
      this.userItem = Object.assign({}, data);
      this.SelempDesignation = this.designationList.find(s => s.id === this.userItem.fkDesignation);
      this.selProfile = this.profileList.find(s => s.id == this.userItem.fkProfileId);
      this.selManager = this.empListCon1.filter(s => s.id == this.userItem.fkManager);
      if (this.selManager.length == 0) {
        this.managerWarning = true;
        let managerData = this.empListCon.filter(s => s.id == this.userItem.fkManager);
        if(managerData.length !=0)
        {
          this.lastManager = managerData[0].name;
        }        
      }
      this.selReportingManager = this.empListCon1.filter(s => s.id == this.userItem.fkReportingManager);
      this.selectedBaseLocation = this.locListCon1.filter(s => s.id == this.userItem.baseLocation);
      this.selParentRole = this.roleList.find(s => s.id == this.userItem.fkRoleId);
      this.selDepartment = this.userItem.fkDepartment != 0 ? (this.departmentList.find(s => s.id === this.userItem.fkDepartment)) : null;
      this.selApprovalTemp = this.userItem.fkApprovalTemplateId != 0 ? (this.AapprovalTempList.find(s => s.id === this.userItem.fkApprovalTemplateId)) : null;
      this.SelCompetency = this.competencyList.find(s => s.id === this.userItem.fkCompetency);
      this.userItem.id = data.id;
      if(this.userItem.joiningDate !=null)
      {
        this.from_date=new Date(this.userItem.joiningDate);
      }      
      this.employeeId = this.userItem.employeeId;
      this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.userItem.fkAddressId).then((data: any) => {
        this.isLoading = false;
        if (data.id > 0) {
          this.addressItem = data;
          this.oldaddressItem = Object.assign({}, data);
        }
      }).catch(error => {
        this.isLoading = false;
        this.addressItem = null;
      });
      this.httpService.getById(APIURLS.BR_MASTER_USERMASTER_API, this.userItem.id).then((data: any) => {
        this.isLoading = false;
        if (data.id > 0) {
          this.userMasterItem = data;
        }
      }).catch(error => {
        this.isLoading = false;
        this.userMasterItem = null;
      });

    }
    else {
      this.olduserItem = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);
      this.userItem = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);
      this.addressItem = new EmployeeAddress(0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', true,0);
      this.oldaddressItem = new EmployeeAddress(0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', true,0);
      this.empOtherDetailsItem = new EmployeeOtherDetails(0, 0, '', 0, '', true, '', '', '', '', '', '', '', 0, 0, '', '', '', '');
      this.userMasterItem = new UserMaster(0, 0, '', '', '', '', 0, '', '', '', '', 0, 0, 0, 0, 0,'');
      this.employeePayrollItem = new Payroll(0, '', 0, 0, 0, '', 0, '', '', 0, '', 0, '', true);
      this.selParentRole = null;
      this.selDepartment = null;
      this.selProfile = null;
      this.SelempDesignation = null;
      this.SelCompetency = null;
      this.selManager = [];
      this.selReportingManager = [];
      this.selectedBaseLocation = [];
    }
    this.isLoading = false;
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  isValid: boolean = false;
  validatedForm: boolean = true;

  validateForm() {
    this.validatedForm = true;
    let validId = this.userList.some(s => s.employeeId == this.userItem.employeeId && s.id != this.userItem.id);
    if (validId) {
      this.isLoadingPop = false;
      this.validatedForm = false;
      this.errMsgPop = 'Employee id already exists..';
      this.getUserMasterList();
    }
  }
  onSaveUser(status: boolean) {
    this.validateForm();
    let employees = this.userList.filter(s => s.fkManager == this.userItem.id);
    let noAdmins = false;
    if (!this.userItem.isActive && this.selProfile.id == 1 && this.isEdit) {
      let admincount = this.userList.filter(s => s.fkProfileId == 1 && s.isActive && s.employeeId != this.userItem.employeeId).length;
      noAdmins = admincount > 0 ? false : true;
    }

    if (noAdmins) {
      swal("", "Please nominate another user for this role.Before getting inactive", "warning");
    }
    else if (employees.length > 0 && !this.userItem.isActive) {
      var employeeList='';
      employees.forEach(x => {
        employeeList+='\n'+x.firstName+' '+x.lastName+'('+x.employeeId+')';
      });
      swal({
        title: "Are you sure to inactive this employee?",
        text:"Below the list of employees are assigned that " + this.userItem.firstName + '' + this.userItem.lastName + " as a manager"+employeeList,
        icon: "warning",
        dangerMode: true,
        buttons: [true, true],
      }).then((save) => {
        if (save) {
          this.saveEmployee(status);
        }
      });

    }
    else {
      this.saveEmployee(status);
    }
  }
  getFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  saveEmployee(status: boolean) {
    // debugger;
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    //this.userItem.fkSbuId = this.SelempSBUList.id;
    this.userItem.fkProfileId = this.selProfile.id;
    this.userItem.fkDepartment = this.selDepartment.id;
    this.userItem.fkCompetency = this.SelCompetency.id;
    this.userItem.fkDesignation = this.SelempDesignation.id;
    this.userItem.fkRoleId = this.selParentRole.id;
    this.userItem.baseLocation = this.selectedBaseLocation[0].id;
    this.userItem.fkManager = this.selManager[0].id;
    this.userItem.fkReportingManager = this.userItem.fkManager;
    this.userItem.fkParentId = this.userItem.fkReportingManager;
    this.userItem.fkProfileId = this.selProfile.id;
    this.userItem.fkRoleId = this.selParentRole.id;
    this.userItem.designation = this.designationList.find(s => s.id === this.userItem.fkDesignation)['name'];
    //following columns are dummy columns. We are setting to value 1.
    this.userMasterItem.fkCompanyId = 1;
    this.userItem.fkParentIdCount = 1;
    // this.userItem.interviwer = 1;
    this.userItem.fkProjectId = 1;
    this.userItem.joiningDate=this.getFormatedDateTime(this.from_date);
    this.userItem.fkSbuId = 1;
    this.userItem.fkApprovalTemplateId = 1;
    this.userItem.imgUrl = "../assets/dist/img/pp.jpg";
    let connection: any;
    if (this.validatedForm) {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.addressItem.module_enableId=0;
        connection = this.httpService.post(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.addressItem);
        connection.then((dataaddress: any) => {
          if (dataaddress.id > 0) {
            this.addressNtest = dataaddress;
            this.userItem.fkAddressId = this.addressNtest.id;
            this.addressId = this.addressNtest.id;
            connection = this.httpService.post(APIURLS.BR_EMPLOYEEMASTER_API, this.userItem);
            connection.then((data_emp: any) => {
              this.isLoadingPop = false;
              if (data_emp.id > 0) {
                this.userItem = data_emp;
                this.employeeId = data_emp.employeeId;
                this.addressItem.fkEmpId = this.userItem.id;
                this.addressItem.employeeId = this.employeeId;
                this.userMasterItem.email = this.userItem.email;
                this.userMasterItem.firstName = this.userItem.firstName;
                this.userMasterItem.middleName = this.userItem.middleName;
                this.userMasterItem.lastName = this.userItem.lastName;
                this.userMasterItem.FkEmpId = this.userItem.id;
                this.userMasterItem.employeeId = this.employeeId;
                this.userMasterItem.fullName = this.userItem.firstName + ' ' + this.userItem.lastName;
                this.userMasterItem.fkDesignationId = this.userItem.fkDesignation;
                this.userMasterItem.fkDepartmentId = this.userItem.fkDepartment;
                this.userMasterItem.fkRoleId = this.userItem.fkRoleId;
                this.userMasterItem.fkProfileId = this.userItem.fkProfileId;
                this.userMasterItem.fkSubroleId = this.userItem.fkRoleId;
                connection = this.httpService.post(APIURLS.BR_MASTER_USERMASTER_API, this.userMasterItem);
                connection.then((data: any) => {
                  this.isLoadingPop = false;
                  if (data.id > 0) {
                    jQuery("#myModal").modal('hide');
                    this.errMsgPop1 = ' Employee data saved successfully!';
                    jQuery("#saveModal").modal('show');
                    this.insertAuditLog(this.olduserItem, this.userItem, data.id);
                    this.getUserMasterList();
                  }
                }).catch(error => {
                  this.isLoadingPop = false;
                  this.errMsgPop = 'Error saving user master data..';
                });
              }
            }).catch(error => {
              this.isLoadingPop = false;
              this.errMsgPop = 'Error saving user master data..';
            });

          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error saving user address data..';
        });
      }
      else {
        // debugger;
        this.auditType = "Update";
        connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.userItem.fkAddressId, this.addressItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200) {
            connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.userItem.fkOtherDetailsId, this.empOtherDetailsItem);
            connection.then((data: any) => {
              this.isLoadingPop = false;
              if (data == 200) {
                connection = this.httpService.put(APIURLS.BR_EMPLOYEEMASTER_API, this.userItem.id, this.userItem);
                connection.then((data: any) => {
                  this.isLoadingPop = false;
                  if (data == 200) {
                    this.employeeId = data.employeeId;
                    this.userMasterItem.email = this.userItem.email;
                    connection = this.httpService.put(APIURLS.BR_MASTER_USERMASTER_API, this.userMasterItem.id, this.userMasterItem);
                    connection.then((data: any) => {
                      this.isLoadingPop = false;
                      if (data == 200) {
                        jQuery("#myModal").modal('hide');
                        this.errMsgPop1 = ' Employee data saved successfully!';
                        jQuery("#saveModal").modal('show');
                        this.insertAuditLog(this.olduserItem, this.userItem, this.userItem.id);
                        this.getUserMasterList();
                      }
                    }).catch(error => {
                      this.isLoadingPop = false;
                      this.errMsgPop = 'Error saving user master data..';
                    });
                  }
                }).catch(error => {
                  this.isLoadingPop = false;
                  this.errMsgPop = 'Error saving user master data..';
                });
              }
            }).catch(error => {
              this.isLoadingPop = false;
              this.errMsgPop = 'Error saving user details data..';
            });
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error saving user master put data..';
        });

      }
    } else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Employee id or email id entered already exists..';
      this.getUserMasterList();
    }
  }

  baseLocation: number;
  onSelect(locId) {
    this.baseLocation = locId;
    this.getUserMasterList();
  }
  //AuditLogging
  masterName: string = 'Employee Master'; // Change MasterName
  insertAuditLog(oldObj: Employee, newObj: Employee, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.employeeId = oldObj.employeeId;
    oldObject.firstName = oldObj.firstName;
    oldObject.middleName = oldObj.middleName;
    oldObject.lastName = oldObj.lastName;
    oldObject.email = oldObj.email;
    oldObject.baseLocation = oldObj.baseLocation ? this.getLocationName(oldObj.baseLocation) : null;
    oldObject.department = oldObj.fkDepartment ? this.departmentList.find(s => s.id === oldObj.fkDepartment).name : null;
    oldObject.designation = oldObj.fkDesignation ? this.designationList.find(s => s.id === oldObj.fkDesignation).name : null;
    oldObject.profile = oldObj.fkProfileId ? this.profileList.find(s => s.id === oldObj.fkProfileId).name : null;
    oldObject.employee_type = oldObj.fkCompetency ? this.competencyList.find(s => s.id === oldObj.fkCompetency).name : null;
    oldObject.role = oldObj.fkRoleId ? this.roleList.find(e => e.id == oldObj.fkRoleId).role : null;
    oldObject.manager = oldObj.fkManager ? this.empListCon1.find(e => e.id == oldObj.fkManager).name : null;
    oldObject.isActive = oldObj.isActive;
    oldObject.permanent_Address = this.oldaddressItem ? this.oldaddressItem.permanentAddress : null;
    oldObject.current_Address = this.oldaddressItem ? this.oldaddressItem.currentAddress : null;
    oldObject.emergency_Contact_Name = this.oldaddressItem ? this.oldaddressItem.emgContactName : null;
    oldObject.emergency_Contact_Number = this.oldaddressItem ? this.oldaddressItem.emgContactNumber : null;
    oldObject.phone_Number = this.oldaddressItem ? this.oldaddressItem.phoneNumber : null;

    newObject.employeeId = newObj.employeeId;
    newObject.firstName = newObj.firstName;
    newObject.middleName = newObj.middleName;
    newObject.lastName = newObj.lastName;
    newObject.email = newObj.email;
    newObject.baseLocation = newObj.baseLocation ? this.getLocationName(newObj.baseLocation) : null;
    newObject.department = newObj.fkDepartment ? this.departmentList.find(s => s.id === newObj.fkDepartment).name : null;
    newObject.designation = newObj.fkDesignation ? this.designationList.find(s => s.id === newObj.fkDesignation).name : null;
    newObject.profile = newObj.fkProfileId ? this.profileList.find(s => s.id === newObj.fkProfileId).name : null;
    newObject.employee_type = newObj.fkCompetency ? this.competencyList.find(s => s.id === newObj.fkCompetency).name : null;
    newObject.role = newObj.fkRoleId ? this.roleList.find(e => e.id == newObj.fkRoleId).role : null;
    newObject.manager = newObj.fkManager ? this.empListCon1.find(e => e.id == newObj.fkManager).name : null;
    newObject.isActive = newObj.isActive;
    newObject.permanent_Address = this.addressItem ? this.addressItem.permanentAddress : null;
    newObject.current_Address = this.addressItem ? this.addressItem.currentAddress : null;
    newObject.emergency_Contact_Name = this.addressItem ? this.addressItem.emgContactName : null;
    newObject.emergency_Contact_Number = this.addressItem ? this.addressItem.emgContactNumber : null;
    newObject.phone_Number = this.addressItem ? this.addressItem.phoneNumber : null;

    let beforekey = Object.keys(oldObject);
    let aftrekey = Object.keys(newObject);
    var biggestKey = 0;
    if (beforekey.length > 0)
      var biggestKey = beforekey.length;
    else
      var biggestKey = aftrekey.length;
    let auditlogchangeList: AuditLogChange[] = [];
    for (var i = 0; i < biggestKey; i++) {
      if (this.auditType == "Update") {
        if (_.isEqual(beforekey[i], aftrekey[i]) && !_.isEqual(oldObject[beforekey[i]], newObject[aftrekey[i]])) {
          let auditlog: AuditLogChange = new AuditLogChange();
          auditlog.fieldname = beforekey[i];
          auditlog.oldvalue = oldObject[beforekey[i]];
          auditlog.newvalue = newObject[aftrekey[i]];
          auditlogchangeList.push(auditlog);
        }
      }
      else if (this.auditType == "Create") {
        let auditlog: AuditLogChange = new AuditLogChange();
        auditlog.fieldname = aftrekey[i];
        auditlog.oldvalue = oldObject[beforekey[i]];
        auditlog.newvalue = newObject[aftrekey[i]];
        auditlogchangeList.push(auditlog);
      }
    }
    let connection: any;
    let auditlog: AuditLog = new AuditLog();
    auditlog.auditDateTime = new Date().toLocaleString();
    auditlog.aduitUser = this.currentUser.fullName;
    auditlog.auditType = this.auditType;
    auditlog.masterName = this.masterName;
    auditlog.tableId = id;
    auditlog.keyValue = newObj.employeeId ? newObj.employeeId + '-' + newObj.firstName + newObj.lastName : oldObj.employeeId + '-' + oldObj.firstName + oldObj.lastName;
    auditlog.changes = JSON.stringify(auditlogchangeList);
    auditlog.oldValues = JSON.stringify(oldObj);
    auditlog.newValues = JSON.stringify(newObj);
    auditlog.purpose = this.aduitpurpose;
    connection = this.httpService.post(APIURLS.BR_AUDITLOG_API, auditlog);
    connection.then((data: any) => {
      this.isLoadingPop = false;
    }).catch(() => {
      this.isLoadingPop = false;
    });
  }
  auditLogList: AuditLog[] = [];
  openAuditLogs(id) {
    jQuery("#auditModal").modal('show');
    let stringparms = this.masterName + ',' + id;
    this.httpService.getByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
      if (data) {
        this.auditLogList = data;
        this.auditLogList.reverse();
      }
      this.reinitPOUPDatatable();
    }).catch(() => {
    });

  }
  objParser(val) {
    return JSON.parse(val);
  }
  public audittableWidget: any;
  private initPOUPDatatable(): void {
    let exampleId: any = jQuery('#auditTable');
    this.audittableWidget = exampleId.DataTable({
      "order": [[0, "desc"]],
      "lengthChange": false,
      "pageLength": 5,
      "searching": false,
      "columnDefs": [
        {
          render: function (data, type, full, meta) {
            return "<div style='word-break: break-all;height:7em;overflow-x:hidden;'>" + data + "</div>";
          },
          targets: 5
        }
      ]
    });
    this.isLoading = false;

  }
  private reinitPOUPDatatable(): void {
    if (this.audittableWidget) {
      this.audittableWidget.destroy();
      this.audittableWidget = null;
    }
    setTimeout(() => this.initPOUPDatatable(), 0);
  }
}
