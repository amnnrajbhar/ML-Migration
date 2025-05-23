import { Component, OnInit, ViewEncapsulation } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
import * as _ from "lodash";
import { Router, ActivatedRoute } from '@angular/router';
import { Employee } from '../masters/employee/employee.model';
import { EmployeeAddress } from '../masters/employee/employee-address.model';
import { EmployeeOtherDetails } from '../masters/employee/employee-otherDetails.model';
import { UserMaster } from '../masters/employee/user-master.model';
import { Payroll } from '../masters/employee/employee-payroll.model';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
declare var $:any;

@Component({
  selector: 'app-gateentryoutward',
  templateUrl: './gateentryoutward.component.html',
  styleUrls: ['./gateentryoutward.component.css']
})
export class GateentryOutwardComponent implements OnInit {

  public tableWidget: any;
  today: Date = new Date();
  isPO: boolean = false;
  addressId: number = 0;
  competencyList: any[];
  person: any[]=[];
  entityList: any[];
  designationList: any[];
  selParentRole: any;
  selDepartment: any;
  selApprovalTemp: any;
  selProfile: any; selManager: any;selReportingManager: any;
  roleList: any[];
  departmentList: any[];
  AapprovalTempList: any[];
  profileList: any[]; managerList: any; reporting_managerList: any;
  projectList: any[];
  userDivisionList: any[];
  FilteredDivList: any[];
  divSelectedItem: any[];
  entitySelectedItem: any[];
  userEntityList: any[];
  entitySelected=[];
  userList:any[] = [] ;
  addressList: any[];
  empOtherDetailList: any[];
  employeePayrollList: any[];
  uid: number = 0;
  geItem: Employee = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true,0,0,0);
  addressItem: EmployeeAddress = new EmployeeAddress(0,0,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'', true,0);
  empOtherDetailsItem: EmployeeOtherDetails = new EmployeeOtherDetails(0, 0,	'',	0,	'',	true,	'',	'',	'',	'',	'',	'',	'',	0,	0,	'', '',	'',	'');
  userMasterItem: UserMaster  = new UserMaster(0, 0,	 '',	'',	'',	'',	0,'',	'',	'',	'',0,0,0,0,0,'');
  employeePayrollItem: Payroll  = new Payroll(0, '',0,0,0,'',0,'','',0,'',0,'',true);
  isLoading: boolean = false;
  errMsg: string = '';
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = '';
  errMsgPop1: string = '';
  isEdit: boolean = false;
  SelempDesignation: any;
  SelCompetency: any;
  SelempSBUList: any;
  SelProject: any;
  addressNtest: any;
  otherDetailNtest: any;
  payrollNtest: any;
  employeeId:string ="";
  formData: FormData = new FormData();
  file: File;successMsg: string = "";
  path:string = '';
  recCount: number;
  deletedPersonIds: any;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    
      let exampleId: any = jQuery('#userTable');
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
 
      this.getUserMasterList();
  
     
    }
    else 
      this.router.navigate(["/unauthorized"]);
  }
  
  ngAfterViewInit() {
    
    this.initDatatable();
   

  }
//   setpreviousAppraisalDate(startD: any) {
//     this.errMsgPop = '';
//     var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
//     if ((date_regex.test(startD))) 
//         this.employeePayrollItem.previousAppraisalDate = startD;
//     else if (startD == "") 
//         this.errMsgPop = 'Enter valid Start Date';
// }

// setappraisalDueDate(endD: any) {
//     this.errMsgPop = '';
//     var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
//     if ((date_regex.test(endD))) 
//         this.employeePayrollItem.appraisalDueDate = endD;
//     else if (endD == "") 
//         this.errMsgPop = 'Enter valid End Date';
// }
// setjoiningDate(endD: any) {
//     this.errMsgPop = '';
//     var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
//     if ((date_regex.test(endD)))
//        this.geItem.joiningDate = endD;
//     else if (endD == "") 
//         this.errMsgPop = 'Enter valid End Date';
// }

 
  getUserMasterList() {
      this.errMsg = "";
      this.isLoading = true;
      this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
          this.isLoading = false;
          if (data.length > 0) {
              this.userList = data;
              this.managerList = data;
              this.reporting_managerList = data;      
            this.reInitDatatable();
      this.isLoading = false;
          }
      }).catch(error => {
          this.isLoading = false;
          this.userList = [];
      });
  }


  onAddUser(isEdit: boolean, data: Employee) {
    
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
          this.geItem = data;
          this.SelempDesignation = this.designationList.find(s => s.id === this.geItem.fkDesignation);
          this.SelempSBUList = this.entityList.find(s => s.id === this.geItem.fkSbuId);
          this.selProfile = this.profileList.find(s => s.id == this.geItem.fkProfileId);
          this.selManager = this.managerList.find(s => s.id == this.geItem.fkManager);
          this.selReportingManager = this.reporting_managerList.find(s=> s.id == this.geItem.fkReportingManager);
          // this.selReportingManager = this.selManager;
          this.selParentRole = this.roleList.find(s=>s.id == this.geItem.fkRoleId);
          this.selDepartment = this.geItem.fkDepartment!=0?(this.departmentList.find(s => s.id === this.geItem.fkDepartment)):null;
          this.selApprovalTemp = this.geItem.fkApprovalTemplateId!=0?(this.AapprovalTempList.find(s => s.id === this.geItem.fkApprovalTemplateId)):null;
          this.SelCompetency = this.competencyList.find(s => s.id === this.geItem.fkCompetency);
          this.SelProject = this.projectList.find(s => s.id === this.geItem.fkProjectId);
          this.geItem.id = data.id;
          this.employeeId = this.geItem.employeeId;
          this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.geItem.fkAddressId).then((data: any) => {
            this.isLoading = false;
            if (data.id > 0) {
                this.addressItem = data;
            }
            }).catch(error => {
                this.isLoading = false;
                this.addressItem = null;
            });

            this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.geItem.fkOtherDetailsId).then((data: any) => {
              this.isLoading = false;
              if (data.id > 0) {
                  this.empOtherDetailsItem = data;
              }
              }).catch(error => {
                  this.isLoading = false;
                  this.empOtherDetailsItem = null;
              });
              this.httpService.getById(APIURLS.BR_MASTER_USERMASTER_API, this.geItem.id).then((data: any) => {
                this.isLoading = false;
                if (data.id > 0) {
                    this.userMasterItem = data;
                    // this.userMasterItem.id = data.id;
                    ////console.log(this.userMasterItem.password);
                }
                }).catch(error => {
                    this.isLoading = false;
                    this.userMasterItem = null;
                });
                this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEPAYROLL_API, this.geItem.fkPayroll).then((data: any) => {
                  this.isLoading = false;
                  if (data.id > 0) {
                      this.employeePayrollItem = data;
                      // this.userMasterItem.id = data.id;
                  }
                  }).catch(error => {
                      this.isLoading = false;
                      this.employeePayrollList = null;
                  });
      }else {
          this.geItem = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true,0,0,0);
          this.addressItem = new EmployeeAddress(0, 0,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	true,0);
          this.empOtherDetailsItem = new EmployeeOtherDetails(0, 0,	'',	0,	'',	true,	'',	'',	'',	'',	'',	'',	'',	0,	0,	'', '',	'',	'');
          this.userMasterItem = new UserMaster(0, 0, '',	'',	'',	'',	0,'',	'',	'',	'',0,0,0,0,0,'');
          this.employeePayrollItem = new Payroll(0, '',0,0,0,'',0,'','',0,'',0,'',true);
          this.selParentRole = null;
          this.selDepartment = null;
          this.selProfile = null;
          this.SelempSBUList = null;
          this.SelCompetency = null;
          this.selManager = null;
          this.selReportingManager = null;
      }
      jQuery("#myModal").modal('show');
  }

isValid: boolean = false;
validatedForm: boolean = true;

validateForm(){
// debugger;
this.validatedForm = true;
let validId = this.userList.some(s => s.employeeId == this.geItem.employeeId && s.id != this.geItem.id);
let validEmail = this.userList.some(s => s.email == this.geItem.email && s.id != this.geItem.id )
if(validId){
  this.isLoadingPop = false;
  this.validatedForm = false;
    this.errMsgPop = 'Employee id already exists..';
    this.getUserMasterList();
}

if(validEmail){
  this.isLoadingPop = false;
  this.validatedForm = false;
    this.errMsgPop = 'Email id entered already exists..';
    this.getUserMasterList();
}

// if(this.payrollNtest.empOtherDetailsItem.yearExp<this.payrollNtest.empOtherDetailsItem.relativeExp){
//   this.validatedForm = false;
//   this.errMsgPop = 'Years of experience';
// }
}
   
closeSaveModal() {
////console.log('testpop')
jQuery("#myModal").modal('hide');
this.getUserMasterList();
// window.location.reload();
}

initialRow(){
  var line_no = this.person.length;
  for(let i=0;i<2;i++){
    line_no = this.person.length;
    let genId: any = (line_no>0)?this.person[this.person.length - 1].id:0;
    let nextKraId = genId + 1;
    var nextY = {'id': genId, 'name': '', 'temp1': '', 'phone': '',  'email':''};
    this.person.push(nextY);
  }
}

addRows(){
// this.showTable = true;
var line_no = this.person.length;
this.recCount = line_no;
// console.log('line_no:'+this.recCount);
let genId: any = (line_no)?this.person[this.person.length - 1].id:0;
let nextKraId = genId + 1;
var person_temp = {'id': nextKraId, 'name': '', 'temp1': '', 'phone': '',  'email':''};
// var person_temp ={};
this.person.push(person_temp);
// console.log('New row added successfully', 'New Row');  
// console.log(this.person);
return true;  
}

removeRows(id: number, position: number){
  // console.log(id);
  if(this.person.length==0)
    // this.showTable = false;
  if(id!=0) this.deletedPersonIds.push(id);
  this.person.splice(position,1);
  // console.log(this.person.length);
  // this.getTotalWeightageNextYr();
}

onSaveUser(status: boolean) {
this.validateForm();
// debugger;
this.errMsg = "";
this.errMsgPop = "";
this.isLoadingPop = true;
this.geItem.fkSbuId = this.SelempSBUList.id;
this.geItem.fkProfileId = this.selProfile.id;
this.geItem.fkDepartment = this.selDepartment.id;
this.geItem.fkCompetency = this.SelCompetency.id;
this.geItem.fkDesignation = this.SelempDesignation.id;
this.geItem.fkProjectId = this.SelProject.id;
this.geItem.fkApprovalTemplateId = this.selApprovalTemp.id;
this.geItem.fkRoleId = this.selParentRole.id;
this.geItem.imgUrl = "../assets/dist/img/pp.jpg";

this.geItem.fkManager = (this.selManager.id==null)? 1: this.selManager.id;
//this.geItem.fkReportingManager = this.geItem.fkManager;
this.geItem.fkReportingManager = (this.selReportingManager.id==null)? 1: this.selReportingManager.id;
this.geItem.fkParentId = this.geItem.fkReportingManager; 
this.geItem.fkParentIdCount = 1;
this.geItem.interviwer = 1;
this.geItem.fkProfileId = this.selProfile.id;
this.geItem.fkRoleId = this.selParentRole.id;
this.geItem.designation = this.designationList.find(s => s.id === this.geItem.fkDesignation)['name'];
this.userMasterItem.fkCompanyId = 1;
let connection: any;
// debugger;
if(this.validatedForm){    
  if (!this.isEdit) {
  connection = this.httpService.post(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.addressItem);
  debugger;
  connection.then((dataaddress: any) => {
  if (dataaddress.id >0) {
    this.addressNtest = dataaddress;
    this.geItem.fkAddressId = this.addressNtest.id;
    this.addressId = this.addressNtest.id;  

    connection = this.httpService.post(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.empOtherDetailsItem);
    connection.then((dataother: any) => {
    if (dataother.id >0) {
      this.otherDetailNtest = dataother;
      this.geItem.fkOtherDetailsId = this.otherDetailNtest.id;
  
    connection = this.httpService.post(APIURLS.BR_MASTER_EMPLOYEEPAYROLL_API, this.employeePayrollItem);
    connection.then((datapayroll: any) => {
    if (datapayroll.id >0) {
      this.payrollNtest = datapayroll;
      this.geItem.fkPayroll = this.payrollNtest.id;
          
    connection = this.httpService.post(APIURLS.BR_EMPLOYEEMASTER_API, this.geItem);
    connection.then((data_emp: any) => {
    this.isLoadingPop = false;
    if (data_emp.id >0) {
      this.geItem = data_emp;
      this.userMasterItem.FkEmpId = this.geItem.id;
      this.employeeId = data_emp.employeeId;
      //   // ////console.log('user created');
        this.userMasterItem.email = this.geItem.email;
      this.userMasterItem.firstName = this.geItem.firstName;
      this.userMasterItem.FkEmpId = this.geItem.id;
      this.userMasterItem.employeeId = this.employeeId;
      this.userMasterItem.fullName = this.geItem.firstName+ ' '+this.geItem.lastName;
    
    connection = this.httpService.post(APIURLS.BR_MASTER_USERMASTER_API, this.userMasterItem);
    connection.then((data: any) => {
    this.isLoadingPop = false;

    if (data.id >0) {                
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = ' Employee data saved successfully!';
                  jQuery("#saveModal").modal('show');
                  this.getUserMasterList();
    } 
    // else {
    //     this.errMsgPop = data;
    // }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving user master data..';
    });

    // this.getUserMasterList();
        //// ////console.log(this.addressItem.permanentAddress + this.addressItem.fkEmpId);
    // jQuery("#myModal").modal('hide');
    }
      // else {
      //   this.errMsgPop = data_emp.message;
      // }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving user master data..';
    });

              
            }
            // else {
            //   this.errMsgPop = datapayroll.message;
            // }
          }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving payroll details data..';
          });
          
        
      }
            // else {
            //   this.errMsgPop = dataother.message;
            // }
          }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving user other details data..';
          });
          
        
      }
      // else {
      //   this.errMsgPop = dataaddress.message;
      // }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving user address data..';
    });
    //// ////console.log(this.empOtherDetailsItem);
  }
    else {
      // debugger;
      connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.geItem.fkAddressId, this.addressItem);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.geItem.fkOtherDetailsId, this.empOtherDetailsItem);
          connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200) {
              connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEPAYROLL_API, this.geItem.fkPayroll, this.employeePayrollItem);
              // ////console.log('Payroll test');
              // ////console.log(this.employeePayrollItem);
              connection.then((data: any) => {
                this.isLoadingPop = false;
                if (data == 200) { 
      connection = this.httpService.put(APIURLS.BR_EMPLOYEEMASTER_API, this.geItem.id, this.geItem);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          this.employeeId = data.employeeId;
          // jQuery("#myModal").modal('hide');
          // this.getUserMasterList();
            
      this.userMasterItem.email = this.geItem.email;
      //this.userMasterItem.phoneNumber = this.addressItem.phoneNumber;
        connection = this.httpService.put(APIURLS.BR_MASTER_USERMASTER_API, this.userMasterItem.id, this.userMasterItem);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' Employee data saved successfully!';
                  jQuery("#saveModal").modal('show');
                  this.getUserMasterList();
        }
        // else {
        //   this.errMsgPop = data;
        // }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving user master data..';
      });
        }
        // else {
        //   this.errMsgPop = data;
        // }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving user master data..';
      });
        }
        // else {
        //   this.errMsgPop = data;
        // }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving user data..';
      });
            }
            // else {
            //   this.errMsgPop = data;
            // }
          }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving user details data..';
          });
        }
        // else {
        //   this.errMsgPop = data;
        // }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving user master put data..';
      });
    
    }
  }else{
    this.isLoadingPop = false;
    this.errMsgPop = 'Employee id or email id entered already exists..';
    this.getUserMasterList();
}

}
  onImgFileChange(event: any) {
    this.errMsg = '';
    // debugger;
    this.formData = new FormData();
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        //let file: File = fileList[0];
        this.file = fileList[0];
        this.formData.append("File", this.file);
        // if (this.file.type.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') === -1) {
        //     this.errMsg = " Select xlsx File Type to Upload";
        // }
        // else {
        //     //let formData: FormData = new FormData();
        //     this.formData.append("File", this.file);
        // }
    }
    //window.location.reload();
}
uploadCustInv() { 
  // debugger;
 // this.sfields = { divid: this.divid, subdivid: this.sub_divid, formData: this.formData };
  let connection: any;
  //this.isLoading = true;
  // ////console.log('this.employeeId');
  // ////console.log(this.employeeId);
  connection = this.httpService.postforCustFileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, +this.employeeId, this.formData);
  connection.then((data: any) => {
   this.isLoading = false;
      if (data==200) {
        
      }
  }).catch(error => {
     
       this.errMsg = 'Error uploading file ..';
  });

}
}
