import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { Profile } from './profile.model';
import { AuthData } from '../auth/auth.model';
import { APIURLS } from '../shared/api-url';
import { Router } from '@angular/router';
declare var jQuery: any;
import * as _ from "lodash";

import { Employee } from '../masters/employee/employee.model';
import { EmployeeAddress } from '../masters/employee/employee-address.model';
import { EmployeeOtherDetails } from '../masters/employee/employee-otherDetails.model';
import { UserMaster } from '../masters/employee/user-master.model';


@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {

  disableButtons: boolean = false;
  mismatch: boolean = false;
  public tableWidget: any;
  public profileList: any[] = [[]];
  errMsg: string = "";
  isLoadingPop: boolean = false;
  newPassword: string = "";
  confirmPassword: string = "";
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop2: string = "";
  isEdit: boolean = false;
  isLoading: boolean = false;
  isLoading1: boolean = false;
  isLoading2: boolean = false;
  public itemList: any[];
  roleid: number;
  usrid: number;
  joining1: Date = new Date;
  path: string = '';
  profileItem: Profile =
    new Profile(' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ');
  // profileItem: any;        
  userList: any;
  addressId: number = 0;
  competencyList: any[] = [[]];
  entityList: any[] = [[]];
  designationList: any[] = [[]];
  selParentRole: any;
  selDepartment: any;
  selApprovalTemp: any;
  selProfile: any; selManager: any; selReportingManager: any;
  roleList: any[] = [[]];
  departmentList: any[] = [[]];
  AapprovalTempList: any[] = [[]];
  managerList: any[] = [[]];
  reporting_managerList: any[] = [[]];
  projectList: any[] = [[]];
  userDivisionList: any[] = [[]];
  FilteredDivList: any[] = [[]];
  divSelectedItem: any[] = [[]];
  entitySelectedItem: any[] = [[]];
  userEntityList: any[] = [[]];
  entitySelected = [];

  addressList: any[];
  empOtherDetailList: any[];
  // employeePayrollList: any[] ;
  uid: number = 0;
  userItem: Employee = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);
  // userItem: any = null;
  // addressItem: any = null;
  // empOtherDetailsItem: any = null;
  // userMasterItem: any = null;
  addressItem = {} as  EmployeeAddress;
  empOtherDetailsItem: EmployeeOtherDetails = new EmployeeOtherDetails(0, 0, '', 0, '', true, '', '', '', '', '', '', '', 0, 0, '', '', '', '');
  userMasterItem: UserMaster = new UserMaster(0, 0, '', '', '', '', 0, '', '', '', '', 0, 0, 0, 0, 0,'');
  errMsgPop1: string = "";
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
  authData:AuthData;

  moduledisplay:any;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }
  disableAllButtons() {
    this.disableButtons = true;
    this.isLoading = true;
  }
  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      //console.log(chkaccess);
      this.authData = JSON.parse(localStorage.getItem('currentUser'));
      //console.log(this.authData);
      this.usrid = this.authData.uid;
      this.roleid = this.authData.roleId;
      // this.disableButtons = true;
      this.isLoading2 = true;
      this.isLoading = true;
      
      this.getEmployeeMasterList();
      this.getLocationName();
      // this.getManagerList();
      // this.getRoleList();
      // this.getDepartList();
      // this.getProfileList();
      // this.getDesignationList();
      // this.getEntityList();
      // this.getDivisionList();
      // this.getProjectList();
      // this.getApprovalTem();
      this.getUserMasterList();
      this.disableButtons = false;
      this.isLoading = false;
      this.isLoading2 = false;
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  keyPressNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  baselocation:string;
  getLocationName() {
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API,this.authData.baselocation).then((data: any) => {
      if (data) {
       // console.log(data);
        this.baselocation=data.code+' - '+data.name;
      }
    }).catch(error => {
      this.baselocation=null;
    });
  }
  onUpdateUser() {
    // this.getUserMasterList();
    this.isLoadingPop = true;
    this.errMsgPop = "";
    this.isLoading = true;
    this.isLoading1 = true;
    this.disableButtons = true;
    jQuery("#updateModal").modal('show');
    this.isEdit = true;
    if (this.isEdit) {
      //     this.userItem = data;
      // var temp = 
      //console.log('............................................herer in editi'+this.userItem.fkManager);
      this.SelempDesignation = this.authData.designation;//this.designationList.find(s => s.id === this.userItem.fkDesignation);
      // this.SelempSBUList = this.entityList.find(s => s.id === this.userItem.fkSbuId);
      // this.selProfile = this.profileList.find(s => s.id === this.userItem.fkProfileId);
      // this.selManager = this.managerList.find(s => s.id === this.userItem.fkManager);
      //     this.selReportingManager = this.reporting_managerList.find(s=> s.id == this.userItem.fkReportingManager);
      //     this.selReportingManager = this.selManager;
      this.selParentRole = this.roleList.find(s => s.id === this.userItem.fkRoleId);
      this.selDepartment = this.authData.department;//this.departmentList.find(s => s.id === this.userItem.fkDepartment);
      // this.selApprovalTemp = this.AapprovalTempList.find(s => s.id === this.userItem.fkApprovalTemplateId);
      // this.SelCompetency = this.competencyList.find(s => s.id === this.userItem.fkCompetency);
      // this.SelProject = this.projectList.find(s => s.id === this.userItem.fkProjectId);
      //     this.userItem.id = data.id;
      //     this.employeeId = this.userItem.employeeId;
      //console.log(this.userItem.fkAddressId+ ', '+this.userItem.fkOtherDetailsId );
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



    } else {
      this.userItem = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);
      // this.userItem = null;
      // this.addressItem = null;
      // this.empOtherDetailsItem = null;
      this.addressItem = new EmployeeAddress(0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', true,0);
      this.empOtherDetailsItem = new EmployeeOtherDetails(0, 0, '', 0, '', true, '', '', '', '', '', '', '', 0, 0, '', '', '', '');
      this.userMasterItem = new UserMaster(0, 0, '', '', '', '', 0, '', '', '', '', 0, 0, 0, 0, 0,'');
      // //     this.employeePayrollItem = new Payroll(0, '',0,0,0,'',0,'','',0,'',0,'',true);
      this.selParentRole = null;
      this.selDepartment = null;
      this.selProfile = null;
      this.SelempSBUList = null;
      this.SelCompetency = null;
      this.selManager = null;
      //     this.selReportingManager = null;
    }
    this.isLoading = false;
    this.disableButtons = false;
    this.isLoading1 = false;
    this.isLoadingPop = false;

  }
  getDesignationList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_DESIGNATION_API).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.designationList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.designationList = [[]];
    });
  }

  getProjectList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_PROJECTMASTER_API).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.projectList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.projectList = [];
    });
  }

  getUserMasterList() {
    this.errMsg = "";
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, this.usrid).then((dataem: any) => {
      this.isLoading = false;
      if (dataem.id > 0) {
        this.userItem = dataem;

        this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.userItem.fkAddressId).then((data: any) => {
          this.isLoading = false;
          if (data.id > 0) {
            this.addressItem = data;
          }
        }).catch(error => {
          this.isLoading = false;
          this.addressItem = null;
        });

      }
    }).catch(error => {
      this.isLoading = false;
      this.userItem = null;
    });
  }
  getManagerList() {
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((dataem: any) => {
      this.isLoading = false;
      if (dataem.length > 0) {
        //     this.userItem = dataem;
        this.managerList = dataem;
        //     this.reporting_managerList = dataem;

      }
    }).catch(error => {
      this.isLoading = false;
      this.managerList = [[]];
    });
  }
  getEntityList() {
    this.httpService.get(APIURLS.BR_MASTER_SBU_All).then((data: any) => {
      if (data.length > 0) {
        this.entityList = data;
      }
    }).catch(error => {
      this.entityList = [];
    });
  }
  getDivisionList() {
    this.httpService.get(APIURLS.BR_COMPETENCY).then((data: any) => {
      if (data.length > 0) {
        this.competencyList = data;
      }
    }).catch(error => {
      this.competencyList = [];
    });
  }
  getRoleList() {
    this.httpService.get(APIURLS.BR_MASTER_ROLE_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data;
      }
    }).catch(error => {
      this.roleList = [];
    });
  }
  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data;
      }
    }).catch(error => {
      this.departmentList = [[]];
    });
  }
  getApprovalTem() {
    this.httpService.get(APIURLS.BR_APPROVALTEMPLATE_API).then((data: any) => {
      if (data.length > 0) {
        this.AapprovalTempList = data;
      }
    }).catch(error => {
      this.AapprovalTempList = [];
    });
  }

  getProfileList() {
    this.httpService.get(APIURLS.BR_MASTER_PROFILE_API).then((data: any) => {
      if (data.length > 0) {
        this.profileList = data;
      }
    }).catch(error => {
      this.profileList = [];
    });
  }
  getEmployeeMasterList() {
    this.errMsg = "";
    this.isLoading2 = true;
    this.disableButtons = true;
    this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEVIEWDASHBOARD_API, this.usrid).then((data: any) => {
      //console.log('here.....................................');
      this.isLoading = false;
      //console.log(data);
      //console.log(data['eGridDatas']['0']['eGridEmpData'])
      //console.log(data['eGridDatas']['0']['eGridEmpData']['1']);
      if (data['eGridDatas']['0']['eGridEmpData'].length > 0) {
        let dateString = data['eGridDatas']['0']['eGridEmpData']['13'];
        this.joining1 = new Date(dateString);
        this.profileItem.empId = data['eGridDatas']['0']['eGridEmpData']['0'];
        this.profileItem.joining = data['eGridDatas']['0']['eGridEmpData']['13'].split(" ")[0];
        this.profileItem.employeeId = data['eGridDatas']['0']['eGridEmpData']['1'];
        this.profileItem.name = this.authData.fullName;//data['eGridDatas']['0']['eGridEmpData']['2'];
        this.profileItem.designation = data['eGridDatas']['0']['eGridEmpData']['3'];
        this.profileItem.email = data['eGridDatas']['0']['eGridEmpData']['4'];
        // this.profileItem.pcpname = data['eGridDatas']['0']['eGridEmpData']['5'];
        // this.profileItem.overallrating = data['eGridDatas']['0']['eGridEmpData']['6'];
        // this.profileItem.fiscalyear = data['eGridDatas']['0']['eGridEmpData']['7'];
        // this.profileItem.pcpstatus = data['eGridDatas']['0']['eGridEmpData']['8'];
        // this.profileItem.jobdescription = data['eGridDatas']['0']['eGridEmpData']['9'];
        // this.profileItem.comments = data['eGridDatas']['0']['eGridEmpData']['10'];
        // this.profileItem.employeeInitiated = data['eGridDatas']['0']['eGridEmpData']['11'];
        // this.profileItem.employeesubmittedpcp = data['eGridDatas']['0']['eGridEmpData']['12'];

        this.profileItem.baselocation =  this.baselocation;//data['eGridDatas']['0']['eGridEmpData']['14'];
        this.profileItem.permanentaddress = data['eGridDatas']['0']['eGridEmpData']['15'];
        this.profileItem.currentaddress = data['eGridDatas']['0']['eGridEmpData']['16'];
        this.profileItem.personalemail = data['eGridDatas']['0']['eGridEmpData']['17'];
        this.profileItem.personalphonenumber = data['eGridDatas']['0']['eGridEmpData']['18'];
        this.profileItem.emgcontactname = data['eGridDatas']['0']['eGridEmpData']['19'];
        this.profileItem.emgcontactnumber = data['eGridDatas']['0']['eGridEmpData']['20'];
        // this.profileItem.gaurdianname = data['eGridDatas']['0']['eGridEmpData']['21'];
        // this.profileItem.guardianrelation = data['eGridDatas']['0']['eGridEmpData']['22'];
        // this.profileItem.yearofexp = data['eGridDatas']['0']['eGridEmpData']['23'];
        // this.profileItem.relativeyearofexp = data['eGridDatas']['0']['eGridEmpData']['24'];
        // this.profileItem.pannuber = data['eGridDatas']['0']['eGridEmpData']['25'];
        // this.profileItem.visanumber = data['eGridDatas']['0']['eGridEmpData']['26'];
        // this.profileItem.passportnumber = data['eGridDatas']['0']['eGridEmpData']['27'];
        // this.profileItem.qualification = data['eGridDatas']['0']['eGridEmpData']['28'];
        // this.profileItem.yearofpassing = data['eGridDatas']['0']['eGridEmpData']['29'];
        // this.profileItem.lastcompany = data['eGridDatas']['0']['eGridEmpData']['30'];
        // this.profileItem.previouscompany = data['eGridDatas']['0']['eGridEmpData']['31'];
        // this.profileItem.competencyname = data['eGridDatas']['0']['eGridEmpData']['32'];
        // this.profileItem.projectname = data['eGridDatas']['0']['eGridEmpData']['33'];
        this.profileItem.imgurl = data['eGridDatas']['0']['eGridEmpData']['34'];
        // this.profileItem.softskill = data['eGridDatas']['0']['eGridEmpData']['35'];
        // this.profileItem.hardskill = data['eGridDatas']['0']['eGridEmpData']['36'];
        this.profileItem.reportingmangername = data['eGridDatas']['0']['eGridEmpData']['37'];
        this.profileItem.reportingmangeremail = data['eGridDatas']['0']['eGridEmpData']['38'];
        this.profileItem.mangername = data['eGridDatas']['0']['eGridEmpData']['39'];
        this.profileItem.mangeremail = data['eGridDatas']['0']['eGridEmpData']['40'];
        this.disableButtons = false;
        this.isLoading2 = false;
       
      }
      else {
        this.errMsg = "No Data Found";

      }
      ////console.log(this.itemList)   
    });

  }
  setjoiningDate(endD: any) {
    this.errMsgPop = '';
    var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
    if ((date_regex.test(endD)))
      this.userItem.joiningDate = endD;
    else if (endD == "")
      this.errMsgPop = 'Enter valid End Date';
  }

  onSaveUser() {
    let validForm = true;
    let connection: any;
    let expFlag: boolean = true;

    if (this.empOtherDetailsItem.yearExp < this.empOtherDetailsItem.relativeExp) {
      validForm = false;
      expFlag = false;
    }

    if (validForm) {
      connection = this.httpService.put(APIURLS.BR_EMPLOYEEMASTER_API, this.userItem.id, this.userItem);
      connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.userItem.fkAddressId, this.addressItem);
      connection = this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.userItem.fkOtherDetailsId, this.empOtherDetailsItem);
      this.errMsgPop1 = "Employee Information Updated Successfully."
      jQuery("#saveModal").modal('show');
      jQuery("#updateModal").modal('hide');
      this.getEmployeeMasterList();
    }
    else if (!expFlag) {
      this.errMsgPop = "Years of Experience cannot be less than Relevant Experience";
    }

  }
  changePassword() {
    this.mismatch = false;
    // this.newPassword = '';
    // this.confirmPassword = '';
    jQuery("#updateModal").modal('hide');
    jQuery("#changePassModal").modal('show');

    // jQuery("#updateModal").modal('show');

  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }
  updatePassword() {
    let connection: any;

    if (this.newPassword != this.confirmPassword)
      this.mismatch = true;
    else {
      this.userMasterItem.password = this.newPassword;
      connection = this.httpService.put(APIURLS.BR_MASTER_USERMASTER_API, this.userMasterItem.id, this.userMasterItem);
      jQuery("#changePassModal").modal('hide');
      jQuery("#updateModal").modal('show');
      this.errMsgPop1 = "Password Updated Successfully."
      jQuery("#saveModal").modal('show');
    }
  }

//code added by Ramesh

 formdisplaylist=[
   {id:0 ,name:'ALL'},
   {id:1 ,name:'GXP'},
   {id:2 ,name:'NON-GXP'},
 ]

  onSelect(id) {   
    this.addressItem.module_enableId=id;
    // let connection = 
    // this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.userItem.fkAddressId, this.addressItem)
    //   .then(this.appService.getFormList());    

      let connection =  this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.userItem.fkAddressId, this.addressItem)
      connection.then((data: any) => {
        this.isLoadingPop = true;
        if (data == 200 || data.id > 0) {
          this.appService.getFormList()
        }
      }).catch(error => {
        this.isLoadingPop = false;        
      });
  }

}
