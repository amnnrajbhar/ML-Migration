import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
import * as _ from "lodash";
import { Role } from '../profile/add-role/add-role.model';
import { Router } from '@angular/router';
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
  selector: 'app-gateentrysearch',
  templateUrl: './gateentrysearch.component.html',
  styleUrls: ['./gateentrysearch.component.css']
})
export class GateentrysearchComponent implements OnInit {

  public tableWidget: any;
  addressId: number = 0;
  competencyList: any[];
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
  userItem: Employee = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true,0,0,0);
  addressItem: EmployeeAddress = new EmployeeAddress(0,	0,'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'', true,0);
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
 
/*
      $('#userTable tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" placeholder="Search '+title+'" class="form-control"/> ');
    } );
    // DataTable
    var table = $('#userTable').DataTable();
 
    // Apply the search
    table.columns().every( function () {
        var that = this;
 
        $( 'input', this ).on( 'keyup change', function () {
          if ( that.search() !== this.value ) {
              that
                  .search( this.value )
                  .draw();
          }
      } );
    } );*/

    // Setup - add a text input to each header cell
    // $('#userTable thead tr').clone(true).appendTo( '#userTable thead' );
    // $('#userTable thead tr:eq(1) th').each( function (i) {
    //     var title = $(this).text();
    //     $(this).html( '<input type="text" placeholder="Search '+title+'" class="form-control" id="usertable_search"/>' );
 
    //     $('input#usertable_search', this).on( 'keyup change', function () {
    //       // console.log(this);
    //         if ( table.column(i).search() !== this.value ) {
    //             table.column(i).search(this.value).draw();
    //         }
    //     } );
    // } );
 
    // var table = $('#userTable').DataTable( {
    //     orderCellsTop: true,
    //     fixedHeader: true,
       
    // } );
   
      ////console.log(chkaccess);
      this.getUserMasterList();
      // this.getRoleList();
      // this.getDepartList();
      // this.getProfileList();
      // this.getDesignationList();
      // this.getEntityList();
      // this.getDivisionList();
      // this.getProjectList();
      // this.getApprovalTem();
         // $(document).ready(function() {
      // Setup - add a text input to each footer cell
     
    }
    else 
      this.router.navigate(["/unauthorized"]);
  }
  
  ngAfterViewInit() {
    
    this.initDatatable();
   

  }
  setpreviousAppraisalDate(startD: any) {
    this.errMsgPop = '';
    var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
    if ((date_regex.test(startD))) 
        this.employeePayrollItem.previousAppraisalDate = startD;
    else if (startD == "") 
        this.errMsgPop = 'Enter valid Start Date';
}

setappraisalDueDate(endD: any) {
    this.errMsgPop = '';
    var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
    if ((date_regex.test(endD))) 
        this.employeePayrollItem.appraisalDueDate = endD;
    else if (endD == "") 
        this.errMsgPop = 'Enter valid End Date';
}
setjoiningDate(endD: any) {
    this.errMsgPop = '';
    var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
    if ((date_regex.test(endD)))
       this.userItem.joiningDate = endD;
    else if (endD == "") 
        this.errMsgPop = 'Enter valid End Date';
}

  // getProjectList(){
  //   this.errMsg = "";
  //   this.isLoading = true;
  //   this.httpService.get(APIURLS.BR_MASTER_PROJECTMASTER_API).then((data: any) => {
  //       this.isLoading = false;
  //       if (data.length > 0) {
  //           this.projectList = data;
  //       }
  //   }).catch(error => {
  //       this.isLoading = false;
  //       this.projectList = [];
  //   });
  // }

  // getDesignationList() {
  //   this.errMsg = "";
  //   this.isLoading = true;
  //   this.httpService.get(APIURLS.BR_DESIGNATION_API).then((data: any) => {
  //       this.isLoading = false;
  //       if (data.length > 0) {
  //           this.designationList = data;
  //       }
  //   }).catch(error => {
  //       this.isLoading = false;
  //       this.designationList = [];
  //   });
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
           
          }
      }).catch(error => {
          this.isLoading = false;
          this.userList = [];
      });
  }

  // getEntityList() {
  //   this.httpService.get(APIURLS.BR_MASTER_SBU_All).then((data: any) => {
  //     if (data.length>0) {
  //       this.entityList = data;
  //     }
  //   }).catch(error => {
  //     this.entityList = [];
  //   });
  // }
  // getDivisionList() {
  //   this.httpService.get(APIURLS.BR_COMPETENCY).then((data: any) => {
  //     if (data.length>0) {
  //       this.competencyList = data;
  //     }
  //   }).catch(error => {
  //       this.competencyList = [];
  //   });
  // }
  // getRoleList() {
  //   this.httpService.get(APIURLS.BR_MASTER_ROLE_API).then((data: any) => {
  //     if (data.length>0) {
  //       this.roleList = data;
  //     }
  //   }).catch(error => {
  //     this.roleList = [];
  //   });
  // }
  // getDepartList() {
  //   this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
  //    if (data.length>0)  {
  //       this.departmentList = data;
  //     }
  //   }).catch(error => {
  //     this.departmentList = [];
  //   });
  // }
  // getApprovalTem() {
  //   this.httpService.get(APIURLS.BR_APPROVALTEMPLATE_API).then((data: any) => {
  //    if (data.length>0)  {
  //       this.AapprovalTempList = data;
  //     }
  //   }).catch(error => {
  //     this.AapprovalTempList = [];
  //   });
  // }

  // getProfileList() {
  //   this.httpService.get(APIURLS.BR_MASTER_PROFILE_API).then((data: any) => {
  //   if (data.length>0)  {
  //       this.profileList = data;
  //    }
  //   }).catch(error => {
  //       this.profileList = [];
  //   });
  // }

  onAddUser(isEdit: boolean, data: Employee) {
    
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
          this.userItem = data;
          this.SelempDesignation = this.designationList.find(s => s.id === this.userItem.fkDesignation);
          this.SelempSBUList = this.entityList.find(s => s.id === this.userItem.fkSbuId);
          this.selProfile = this.profileList.find(s => s.id == this.userItem.fkProfileId);
          this.selManager = this.managerList.find(s => s.id == this.userItem.fkManager);
          this.selReportingManager = this.reporting_managerList.find(s=> s.id == this.userItem.fkReportingManager);
          // this.selReportingManager = this.selManager;
          this.selParentRole = this.roleList.find(s=>s.id == this.userItem.fkRoleId);
          this.selDepartment = this.userItem.fkDepartment!=0?(this.departmentList.find(s => s.id === this.userItem.fkDepartment)):null;
          this.selApprovalTemp = this.userItem.fkApprovalTemplateId!=0?(this.AapprovalTempList.find(s => s.id === this.userItem.fkApprovalTemplateId)):null;
          this.SelCompetency = this.competencyList.find(s => s.id === this.userItem.fkCompetency);
          this.SelProject = this.projectList.find(s => s.id === this.userItem.fkProjectId);
          this.userItem.id = data.id;
          this.employeeId = this.userItem.employeeId;
          this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.userItem.fkAddressId).then((data: any) => {
            this.isLoading = false;
            if (data.id > 0) {
                this.addressItem = data;
            }
            }).catch(error => {
                this.isLoading = false;
                this.addressItem = null;
            });

            this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.userItem.fkOtherDetailsId).then((data: any) => {
              this.isLoading = false;
              if (data.id > 0) {
                  this.empOtherDetailsItem = data;
              }
              }).catch(error => {
                  this.isLoading = false;
                  this.empOtherDetailsItem = null;
              });
              this.httpService.getById(APIURLS.BR_MASTER_USERMASTER_API, this.userItem.id).then((data: any) => {
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
                this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEPAYROLL_API, this.userItem.fkPayroll).then((data: any) => {
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
          this.userItem = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true,0,0,0);
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
let validId = this.userList.some(s => s.employeeId == this.userItem.employeeId && s.id != this.userItem.id);
let validEmail = this.userList.some(s => s.email == this.userItem.email && s.id != this.userItem.id )
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

onSaveUser(status: boolean) {
this.validateForm();
// debugger;
this.errMsg = "";
this.errMsgPop = "";
this.isLoadingPop = true;
this.userItem.fkSbuId = this.SelempSBUList.id;
this.userItem.fkProfileId = this.selProfile.id;
this.userItem.fkDepartment = this.selDepartment.id;
this.userItem.fkCompetency = this.SelCompetency.id;
this.userItem.fkDesignation = this.SelempDesignation.id;
this.userItem.fkProjectId = this.SelProject.id;
this.userItem.fkApprovalTemplateId = this.selApprovalTemp.id;
this.userItem.fkRoleId = this.selParentRole.id;
this.userItem.imgUrl = "../assets/dist/img/pp.jpg";

this.userItem.fkManager = (this.selManager.id==null)? 1: this.selManager.id;
//this.userItem.fkReportingManager = this.userItem.fkManager;
this.userItem.fkReportingManager = (this.selReportingManager.id==null)? 1: this.selReportingManager.id;
this.userItem.fkParentId = this.userItem.fkReportingManager; 
this.userItem.fkParentIdCount = 1;
this.userItem.interviwer = 1;
this.userItem.fkProfileId = this.selProfile.id;
this.userItem.fkRoleId = this.selParentRole.id;
this.userItem.designation = this.designationList.find(s => s.id === this.userItem.fkDesignation)['name'];
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
    this.userItem.fkAddressId = this.addressNtest.id;
    this.addressId = this.addressNtest.id;  

    connection = this.httpService.post(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.empOtherDetailsItem);
    connection.then((dataother: any) => {
    if (dataother.id >0) {
      this.otherDetailNtest = dataother;
      this.userItem.fkOtherDetailsId = this.otherDetailNtest.id;
  
    connection = this.httpService.post(APIURLS.BR_MASTER_EMPLOYEEPAYROLL_API, this.employeePayrollItem);
    connection.then((datapayroll: any) => {
    if (datapayroll.id >0) {
      this.payrollNtest = datapayroll;
      this.userItem.fkPayroll = this.payrollNtest.id;
          
    connection = this.httpService.post(APIURLS.BR_EMPLOYEEMASTER_API, this.userItem);
    connection.then((data_emp: any) => {
    this.isLoadingPop = false;
    if (data_emp.id >0) {
      this.userItem = data_emp;
      this.userMasterItem.FkEmpId = this.userItem.id;
      this.employeeId = data_emp.employeeId;
      //   // ////console.log('user created');
        this.userMasterItem.email = this.userItem.email;
      this.userMasterItem.firstName = this.userItem.firstName;
      this.userMasterItem.FkEmpId = this.userItem.id;
      this.userMasterItem.employeeId = this.employeeId;
      this.userMasterItem.fullName = this.userItem.firstName+ ' '+this.userItem.lastName;
    
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
      connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.userItem.fkAddressId, this.addressItem);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.userItem.fkOtherDetailsId, this.empOtherDetailsItem);
          connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200) {
              connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEPAYROLL_API, this.userItem.fkPayroll, this.employeePayrollItem);
              // ////console.log('Payroll test');
              // ////console.log(this.employeePayrollItem);
              connection.then((data: any) => {
                this.isLoadingPop = false;
                if (data == 200) { 
      connection = this.httpService.put(APIURLS.BR_EMPLOYEEMASTER_API, this.userItem.id, this.userItem);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          this.employeeId = data.employeeId;
          // jQuery("#myModal").modal('hide');
          // this.getUserMasterList();
            
      this.userMasterItem.email = this.userItem.email;
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
