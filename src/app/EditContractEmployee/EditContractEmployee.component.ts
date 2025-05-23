import { AuthData } from '../auth/auth.model'
//import { ContractEmployee } from '.ContractEmployee/';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';


declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { ContractEmployee } from '../ContractEmployee/ContractEmployee.model';
declare var require: any;

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
  today = new Date();
}

@Component({
  selector: 'app-EditContractEmployee',
  templateUrl: './EditContractEmployee.component.html',
  styleUrls: ['./EditContractEmployee.component.css']
})
export class EditContractEmployeeComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;

  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  public tableWidget: any;
  //designationList: any[] = [];
  roleList: any[] = [];
  departmentList: any[] = [];
  profileList: any[] = []; managerList: any[] = []; reporting_managerList: any[] = [];
  projectList: any[] = [];
  userDivisionList: any[] = [];
  userList: ContractEmployee[];
  userMasterItem = {} as ContractEmployee;
  empListCon = [];
  empListCon1 = [];
  locListCon = [];
  locListCon1 = [];
  genders: any[] = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }];
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  addressList: any[];
  empOtherDetailList: any[];
  employeePayrollList: any[];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  path: string;
  selectedBaseLocation: any[] = [];
  employeeId: any = null;
  types = [{ type: "Passport size Photo" }, { type: "Aadhar Card" }, { type: "PAN Card" }, { type: "PF-UAN Ac Details" },
  { type: "ESI Number" }, { type: "UAN Details" }, { type: "Bank Passbook / Cheque" },
  { type: "Medical Certificate" }, { type: "Previous Employer Relieving Letter" }, { type: "Previous Employer 3 months payslip" },
  { type: "Previous Employer Form 16" }, { type: "Previous Employer Offer Letter" }];

  item: any = {};
  count: number = 0;
  fileList: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private route: ActivatedRoute) { }




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
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.getMaritalstatusList()
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.plantList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  EmpShiftMasterList: any[] = [];
  getEmpShiftMasterList() {
    this.isLoading = true;
    this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
      if (data.length > 0) {
        this.EmpShiftMasterList = data.filter(x => x.isActive == 1).sort((a, b) => {
          if (a.shiftCode > b.shiftCode) return 1;
          if (a.shiftCode < b.shiftCode) return -1;
          return 0;
        });
        // console.log(this.EmpShiftMasterList);
      }
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.EmpShiftMasterList = [];
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

  BloodGroupList: any[] = [];

  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.baseLocation = this.currentUser.baselocation;
    this.employeeId = this.route.snapshot.paramMap.get('id')!;

    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.getLocationMaster();
    this.getempCatList();
    this.getEmpShiftMasterList();
    // this.getMaritalstatusList();
    // this.getReportingGroupList();
    // this.getDepartList();
    // this.getCountryList();
    // this.getCountryList
    // this.getRolelist();
    // this.getstateList();
    // this.getsubDeptList();
    // this.getpayGroupList();
    this.getPlantsassigned(this.currentUser.fkEmpId);
  }

  ngAfterViewInit() {
    //this.initDatatable();
  }

  back() {
    this.router.navigate(['/ContractEmployeeList']);
  }
  empCatList: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.empCatList = [];
    });
  }
  getUsersList(id) {
    this.errMsg = "";
    this.httpService.LAgetById(APIURLS.CONTRACT_EMPLOYEE_INSERT, this.employeeId).then((data: any) => {
      if (data) {
        this.isEdit = true;
        //this.userList = data;
        this.userMasterItem = data;
        this.getContractorDetails(this.userMasterItem.vendorContractorId);
        this.fileList = this.userMasterItem.fileList;
        this.fileList.forEach(element => {
          element.attachmentType = element.filePath;
        });
        // this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.userList = [];
    });
  }
  MaritalStatusList: any[] = [];
  getMaritalstatusList() {
    this.errMsg = "";
    this.get("MaritalM/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.MaritalStatusList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
        this.getReportingGroupList()
      }
    }).catch(error => {
      this.isLoading = false;
      this.MaritalStatusList = [];
    });
  }

  stateList: any[] = [];
  getstateList() {
    this.errMsg = "";
    this.get("State/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.filter(x => x.isActive && x.land1 == 'IN').sort((a, b) => {
          if (a.bezei > b.bezei) return 1;
          if (a.bezei < b.bezei) return -1;
          return 0;
        });
        this.getsubDeptList();
      }
    }).catch(error => {
      this.isLoading = false;
      this.stateList = [];
    });
  }
  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
        this.getUsersList(this.employeeId);
      }
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }


  CountryList: any[] = [];
  getCountryList() {
    this.errMsg = "";
    this.get("Country/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.CountryList = data.filter(x => x.isActive);
        this.getDesignationList();
      }
    }).catch(error => {
      this.isLoading = false;
      this.CountryList = [];
    });
  }

  Rolelist: any[] = [];
  getRolelist() {
    this.errMsg = "";
    this.get("RoleMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.Rolelist = data.filter(x => x.isActive);
        this.getstateList();
      }
    }).catch(error => {
      this.isLoading = false;
      this.Rolelist = [];
    });
  }

  subDeptList: any[] = [];
  getsubDeptList() {
    this.errMsg = "";
    this.get("SubDeptMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.subDeptList = data;
        this.getpayGroupList();
      }
    }).catch(error => {
      this.isLoading = false;
      this.subDeptList = [];
    });
  }

  ReportingGroupList: any[] = [];
  getReportingGroupList() {
    this.errMsg = "";
    this.get("ReportingGroupM/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.ReportingGroupList = data;
        this.getDepartList()
      }
    }).catch(error => {
      this.isLoading = false;
      this.ReportingGroupList = [];
    });
  }

  lastReportingkeydown = 0;
  getReportingManager($event) {
    let text = $('#reportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#reportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#reportingManager").val(ui.item.value);
                }
                else {
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#reportingManager").val(ui.item.value);
                }
                else {
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }
  lastApprovingkeydown = 0;
  getApprovingManager($event) {
    let text = $('#approvingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#approvingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#approvingManager").val(ui.item.value);
                }
                else {
                  $("#approvingManager").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#approvingManager").val(ui.item.value);
                }
                else {
                  $("#approvingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApprovingkeydown = $event.timeStamp;
    }
  }
  lastcontractkeydown = 0;
  getContractor($event) {
    let text = $('#contractor').val();

    if (text.length > 1) {
      if ($event.timeStamp - this.lastcontractkeydown > 400) {
        this.httpService.LAgetByParam(APIURLS.BR_API_GET_CONTRACTORS, text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.name + " (" + item.sapCodeNo + ")", value: item.sapCodeNo };
            })
            $('#contractor').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#contractorId").val(ui.item.value);
                  $("#contractor").val(ui.item.label);
                  //   self.userMasterItem.vendorContractorId = ui.item.value;
                }
                else {
                  $("#contractorId").val('');
                  $("#contractor").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#contractorId").val(ui.item.value);
                  $("#contractor").val(ui.item.label);
                  //   self.userMasterItem.vendorContractorId = ui.item.value;
                }
                else {
                  $("#contractorId").val('');
                  $("#contractor").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastcontractkeydown = $event.timeStamp;
    }
  }
  designationList: any[] = [];
  getDesignationList() {
    this.errMsg = "";
    this.get("DesignationMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
        this.getRolelist();
      }
    }).catch(error => {
      this.isLoading = false;
      this.designationList = [];
    });
  }
  onDesignationChange() {
    this.userMasterItem.gradeId = this.designationList.find(x => x.id == this.userMasterItem.dsgid).grade;
    this.userMasterItem.bandid = this.designationList.find(x => x.id == this.userMasterItem.dsgid).band;
  }


  clear() {
    this.userMasterItem = {} as ContractEmployee;
  }

  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
        this.getCountryList();
      }
    }).catch(error => {
      this.departmentList = [];
      this.isLoading = false;

    });
  }




  isValid: boolean = false;
  validatedForm: boolean = true;


  saveEmployee() {
    // debugger;
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    //this.userItem.fkSbuId = this.SelempSBUList.id;

    let connection: any;
    this.userMasterItem.modifiedBy = this.currentUser.employeeId;
    this.userMasterItem.fileList = this.fileList;
    this.userMasterItem.doj = this.setFormatedDate(this.userMasterItem.doj);
    this.userMasterItem.dol = this.userMasterItem.dol ? this.setFormatedDate(this.userMasterItem.dol) : this.userMasterItem.dol;
    connection = this.httpService.LAput(APIURLS.CONTRACT_EMPLOYEE_INSERT, this.userMasterItem.id, this.userMasterItem);

    connection.then((dataaddress: any) => {
      if (dataaddress == 200) {
        this.uploadfile(this.userMasterItem.id);
        // jQuery("#myModal").modal('hide');
        swal({
          title: "Message",
          text: "Employee Updated Successfully",
          icon: "success",
          dangerMode: false,
          buttons: [false,true]
        });
        // jQuery("#saveModal").modal('show');
        this.clear();
        this.router.navigate(['/ContractEmployeeList'])
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      alert('Error saving user data..');
    });
  }

  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res);
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
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

  filesList: File[] = [];
  ItemList: any[] = [];
  uploadfiles(files: File) {

    if (!this.checkSpecialCharactersInFileName(files[0].name)) {
      swal({
        title: "Error",
        text: "Filenames cannot have the following special characters: @, !, #, $, &, /, %, ^, *, +, =, {, }, ?, |. Please remove them from " + files[0].name + " before uploading it.",
        icon: "error",
        dangerMode: false,
        buttons: [false, true]
      });
      return;
    } else {
      this.item.fileName = files[0].name;
      this.filesList.push(files[0]);
      this.fileList.push(this.item);
      this.reset();
      this.item = {};
    }
  }

  checkSpecialCharactersInFileName(fileName: string): boolean {
    let pattern = new RegExp("[@!#\$\&%\^*+=\{\}\?\|]");

    if (pattern.test(fileName)) {
      return false;
    }

    return true;
  }

  reset() {
    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }

  getFile(id, fileName) {
    if (id <= 0) return;
    var name = id + ',' + fileName;
    this.httpService.LAgetFile(APIURLS.BR_GET_EMP_ATTACHMENTS, id, fileName).then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find(s => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }

      if (data != undefined) {
        var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
      }
    }).catch(error => {
      this.isLoading = false;
    });
  }

  onAddLineClick() {
    this.fileList.push(this.item);
    this.count++;
    this.clearInput();
  }

  removeLine(no) {
    var data = this.fileList[no];
    this.fileList.splice(no, 1);
    for (let i = 0; i < this.filesList.length; i++) {
      if (this.filesList[i].name == data.fileName) {
        var index = this.filesList.indexOf(this.filesList[i])
        this.filesList.splice(index, 1);
      }
    }
  }


  clearInput() {
    this.item = {};
  }

  id: string;
  formData: FormData = new FormData();
  uploadfile(id) {
    // debugger;
    // this.id='VM001';
    this.formData = new FormData();
    for (var i = 0; i < this.filesList.length; i++) {
      this.formData.append('files', this.filesList[i]);
    }
    let connection: any;
    connection = this.httpService.LAfileUpload(APIURLS.BR_SAVE_EMP_ATTACHMENTS, this.id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log('copied file to server')
        //this.imageFlag = true;
      }
    }).catch(error => {
      this.errMsgPop = 'Error uploading file ..';
    });

  }


  CalculateSalary() {
    if (this.userMasterItem.location == null) {
      alert("Please select location");
      return;
    }
    if (this.userMasterItem.payGroup == null) {
      alert("Please select pay group");
      return;
    }
    if (this.userMasterItem.staffCat == null) {
      alert("Please select employee category");
      return;
    }
    if (this.userMasterItem.dptid == null) {
      alert("Please select department");
      return;
    }
    if (this.userMasterItem.sdptid == null) {
      alert("Please select sub department");
      return;
    }
    if (this.userMasterItem.salaryAmount == null || this.userMasterItem.salaryAmount == 0) {
      alert("Please enter salary");
      return;
    }
    if (this.userMasterItem.salaryFreq == null) {
      alert("Please select salary Frequency");
      return;
    }
    if (this.userMasterItem.workingDays <= 0) {
      alert("Working days should be greater than 0");
      return;
    }
    

    if (this.userMasterItem.salaryFreq == 'A') {
      this.userMasterItem.sendSalaryAmount = Math.round((this.userMasterItem.salaryAmount / 12)).toString();
    }
    else if (this.userMasterItem.salaryFreq == 'Q') {
      this.userMasterItem.sendSalaryAmount = Math.round((this.userMasterItem.salaryAmount / 4)).toString();
    }
    else if (this.userMasterItem.salaryFreq == 'M') {
      this.userMasterItem.sendSalaryAmount = this.userMasterItem.salaryAmount.toString();
    }
    else if (this.userMasterItem.salaryFreq == 'H') {
      this.userMasterItem.sendSalaryAmount = Math.round((this.userMasterItem.salaryAmount / 6)).toString();
    }
    else {
      this.userMasterItem.sendSalaryAmount = (this.userMasterItem.salaryAmount * this.userMasterItem.workingDays).toString();
    }

    let connection = this.httpService.LApost(APIURLS.VALIDATE_MAN_POWER, this.userMasterItem);

    connection.then((dataaddress: any) => {
      if (dataaddress == 200 || dataaddress.success) {
        // jQuery("#myModal").modal('hide');
        let data = dataaddress.manpowerplannig;
        if (data.type == 'E') {
          alert(data.message);
        }
        else {
          if (this.userMasterItem.salaryFreq == 'A') {
            this.userMasterItem.salarypermonth = Math.round((this.userMasterItem.salaryAmount / 12)).toString();
          }
          else if (this.userMasterItem.salaryFreq == 'Q') {
            this.userMasterItem.salarypermonth = Math.round((this.userMasterItem.salaryAmount / 4)).toString();
          }
          else if (this.userMasterItem.salaryFreq == 'M') {
            this.userMasterItem.salarypermonth = this.userMasterItem.salaryAmount.toString();
          }
          else if (this.userMasterItem.salaryFreq == 'H') {
            this.userMasterItem.salarypermonth = Math.round((this.userMasterItem.salaryAmount / 6)).toString();
          }
          else {
            this.userMasterItem.salarypermonth = (this.userMasterItem.salaryAmount * this.userMasterItem.workingDays).toString();
          }
        }
      }
      else {
        alert(dataaddress.message);
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      alert('Error saving user data..');
    });

  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

  getContractorDetails(contracterId) {
    this.httpService.LAgetByParam(APIURLS.BR_API_GET_CONTRACTORS, contracterId).then((data: any) => {
      if (data.length > 0) {
        var sortedList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
        var list = $.map(sortedList, function (item) {
          return { label: item.name + " (" + item.sapCodeNo + ")", value: item.sapCodeNo };
        })
        var item = list.find(x => x.value == contracterId);
        this.userMasterItem.vendorContractorId = item.value;
        this.userMasterItem.vendorContractorName = item.label;
      }
    });
  }
}
