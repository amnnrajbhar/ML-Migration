import { Component, OnInit, Inject, LOCALE_ID, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
declare var jQuery: any;
import * as _ from "lodash";
import swal from 'sweetalert';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';

import {  MonthView, GetMonthViewArgs } from 'calendar-utils';
//import { Visitor } from './visitor.model';
import { AuthData } from '../../auth/auth.model';
import { FormControl, NgForm } from '@angular/forms';
import { colors } from '../../shared/colors';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { UserIdRequest } from './UserIdRequest.model';
import { Transactions } from '../../eMicro/ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';

import { saveAs } from 'file-saver';
// import { element } from '@angular/core/src/render3/instructions';
declare var require: any;
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { Dictionary } from './Dictionary';



interface task {
  value: string;
  viewValue: string;
}

interface taskGroup {
  disabled?: boolean;
  name: string;
  task: task[];
}

interface UGrpsList { id: number, UserGroup: string, sid: number, UserSubGroups: any[] }

@Component({
  selector: 'app-UserIdRequest',
  templateUrl: './UserIdRequest.component.html',
  styleUrls: ['./UserIdRequest.component.css'],

})
export class UserIdRequestComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;

  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  dict = new Dictionary();


  searchTermBaseLoc = new FormControl();
  public filteredItemsBaseLoc = [];
  searchTermMgr = new FormControl();
  public filteredItemsMgr = [];
  searchTermRMgr = new FormControl();
  public filteredItemsRMgr = [];
  public tableWidget: any;

  locListCon = [];
  locListCon1 = [];

  isLoading: boolean = false;
  errMsg: string = "";
  errMsg1: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;

  formData: FormData = new FormData();
  file: File; successMsg: string = "";
  path: string = '';
  locationList: any[] = [[]];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;
  SalutationList: any[] = [{ type: 'Ms.' }, { type: 'Mr.' }, { type: 'Mrs.' }, { type: 'Miss.' }, { type: 'Dr.' }, { type: 'Br.' }, { type: 'Sr.' }]


  userIdRequest = {} as UserIdRequest
  // ItemCodeExtensionlist:ItemCodeExtension[]=[];
  userIdRequestlist: UserIdRequest[] = [];
  materialtype: string;
  comments: string = null;
  filterMaterialCode: string = null;
  filterstatus: string = null;
  filtersoftware: string = null;
  filterrequest: string = null;
  filterlocation: string = null;
  filterType: string = null;
  today = new Date();
  from_date: any;
  to_date: any;
  //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

  UserIdRequestList: UserIdRequest[] = [];
  userIdRequestsearchlist: UserIdRequest[] = [];

  emailid: string;
  requestdate: any;
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  userid: string;
  UserIdRequestist: UserIdRequest[] = [];

  storeData: any;
  jsonData: any;
  fileUploaded: File;
  worksheet: any;
  requestfor: any;
  selectedSoftwares: any[] = [];
  Plantsassigned: any[] = [];
  requestType: string;
  onBehalfEmp: string;
  //userIdRequestmodeldata = {} as ItemCodeExtension;

  //new Dev
  softType: string;
  locationCode: string;
  filteredSoftwareList: any[] = [];
  Software: string = null;
  filterEquipName: string = null;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
    , private http: HttpClient, private datePipe: DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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

  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //  this.baseLocation = this.currentUser.baselocation;
    this.emailid = this.currentUser.email;
    this.userid = this.currentUser.employeeId;
    this.requestdate = new Date(this.today);
    this.filterstatus = 'Pending';
    //this.filterlocation = this.currentUser.baselocation.toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {


      this.dict.set(3, "DMS");
      this.dict.set(4, "QAMS");
      this.dict.set(5, "LIMS");
      this.dict.set(6, "NICHELON");
      this.dict.set(7, "CLEEN");
      this.dict.set(9, "Unnati");
      this.dict.set(10, "Others");

      //this.getAllEntries();
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getLocationMaster();
      this.getSoftwareModulesList();
      this.getSoftwareUserProfilesList();
      this.getUserGroupsMasterList();
      // this.getUserSubGroupsMasterList();
      this.getRepositoryDomainsList();
      this.getsoftwareMasterList();
      this.getsoftwareRolesMasterList();
      this.getDepartList();
      this.getbase64image();
      this.getlist();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.code : '';
  }
  getloc(loc) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }

  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsRO = {
    singleSelection: false,
    idField: 'id',
    textField: 'role',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsL = {
    singleSelection: false,
    idField: 'id',
    textField: 'name1',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsM = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  }
  dropdownSettingsR = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsUM = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  }
  dropdownSettingsU = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dropdownSettingsP = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  }
  disableType: boolean = false;
  passwordReset: boolean = false;
  TrackpasswordReset: boolean = false;
  LimInactivation: boolean = false;
  LimModification: boolean = false;
  cleenInactivation: boolean = false;

  //additional changes
  getSoftwareList() {
    this.errMsg = "";
    this.isLoading = true;
    let code = "";
    this.Software = null;
    this.softwareList = [];
    if (this.softType == 'Enterprise') {
      code = 'ML00'
    }
    else {
      code = this.locationList.find(x => x.id == this.locationCode).code;
    }
    let srcstr = code + '~' + this.softType;
    this.httpService.getByParam(APIURLS.BR_SOFTWARE_BYPARAM_API, srcstr).then((data: any) => {
      if (data.length > 0) {
        this.softwareList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareList = [];
    });
  }

  //end
  plantAssignedList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantAssignedList = data;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.plantAssignedList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantAssignedList = [];
    });
  }

  onItemSelect(item: any) {
    // debugger;
  }
  onItemDeSelect(item: any) {

  }
  onSelectAll(items: any) {


  }
  onDeSelectAll(items: any) {

  }
  sid: number;
  statuslist: any[] = [
    { id: 1, name: 'Created' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'ReSubmitted' },
    { id: 4, name: 'Reverted to initiator' },
    { id: 5, name: 'Reverted' },
    { id: 6, name: 'Pending' },
    { id: 7, name: 'Rejected' },
    { id: 8, name: 'Completed' },
    { id: 9, name: 'InProcess' },
    { id: 10, name: 'Approved' }
  ];
  mastersList: any[] = [
    { id: 1, name: 'FRM' },
    { id: 2, name: 'FRDM' },
    { id: 3, name: 'ARDM' },
    { id: 4, name: 'APIM' },
    { id: 5, name: 'NA' }
  ];

  approverstatuslist: any[] = [
    { id: 1, name: 'Reviewed' },
    { id: 2, name: 'Reviewed' },
    { id: 3, name: 'Reviewed' },
    { id: 4, name: 'Approved' },
    { id: 5, name: 'Approved' },
    { id: 6, name: 'Created' },
    { id: 7, name: 'Closed' }
  ];

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
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
  clearFilter() {
    this.from_date = null;
    this.to_date = null;
    this.filtersoftware = null;
    this.filterstatus = null;
    this.filterrequest = null;
    this.filterType = null;
    this.filterlocation = null;
    this.filterEquipName = null;
  }
  location(id) {
    let loc = this.locationList.find(x => x.id == id);
    return loc ? loc.code : "";
  }

  getAllEntries() {
    this.isLoading = true;
    try {
      var filterModel: any = {};
      filterModel.location = this.filterlocation;
      filterModel.requestNo = this.filterrequest;
      filterModel.software = this.filtersoftware;
      filterModel.status = this.filterstatus;
      filterModel.type = this.filterType;
      filterModel.equipmentId = this.filterEquipName;
      filterModel.creator = this.currentUser.employeeId;
      filterModel.pageNo = this.pageNo;
      filterModel.pageSize = this.pageSize;
      filterModel.fromDate = this.from_date ? this.getFormatedDateTime(this.from_date) : null;
      filterModel.toDate = this.to_date ? this.getFormatedDateTime(this.to_date) : null;
      this.httpService.post(APIURLS.BR_USERID_REQUESTS_FILTER_API, filterModel).then((data: any) => {
        if (data) {
          this.totalCount = data[0].totalCount;
          this.totalPages = data[0].totalPages;
          this.UserIdRequestList = data;
        }
        //  this.reInitDatatable();
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.UserIdRequestList = [];
      });


    }
    catch (error) {
      this.isLoading = false;
      alert(error);
    }

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
        this.locationId = this.locListCon.find(x => x.id == this.currentUser.baselocation).name1
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  RepositoryDomainsList: any[] = [];
  getRepositoryDomainsList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.RepositoryDomainsList=[];
    this.httpService.get(APIURLS.BR_REPOSITORY_DOMAINS_API).then((data: any) => {
      if (data.length > 0) {
        this.RepositoryDomainsList = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.RepositoryDomainsList = [];
    });
  }
  softwareList: any[] = [];
  AllsoftwareList: any[] = [];
  getsoftwareMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_API).then((data: any) => {
      if (data.length > 0) {
        this.AllsoftwareList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
        this.softwareList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareList = [];
    });
  }
  SoftwareModulesList: any[] = [];
  getSoftwareModulesList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.SoftwareModulesList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_MODULES_API).then((data: any) => {
      if (data.length > 0) {
        this.SoftwareModulesList = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.SoftwareModulesList = [];
    });
  }
  softwareUserProfilesList: any[] = [];
  getSoftwareUserProfilesList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareUserProfilesList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_USER_PROFILES_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareUserProfilesList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareUserProfilesList = [];
    });
  }
  softwareRolesList: any[] = [];
  softwareRolesList1: any[] = [];
  getsoftwareRolesMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareRolesList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_ROLES_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareRolesList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareRolesList = [];
    });
  }
  UserGroupsList: any[] = [];
  UserGroupsList1: any[] = [];
  getUserGroupsMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserGroupsList=[];
    this.httpService.get(APIURLS.BR_USER_GROUPS_API).then((data: any) => {
      if (data.length > 0) {
        this.UserGroupsList = data;
        this.getUserSubGroupsMasterList();
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.UserGroupsList = [];
    });
  }
  UserSubGroupsList: any[] = [];
  UserSubGroupsListCon: any[] = [];
  UserSubGroupsList1: any[] = [];

  usergroupsList: any[] = [];
  usergroupsList1: any[] = [];
  getUserSubGroupsMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserSubGroupsList=[];
    this.httpService.get(APIURLS.BR_USER_SUB_GROUPS_API).then((data: any) => {
      if (data.length > 0) {
        this.UserSubGroupsList = data;

        this.UserGroupsList.forEach(element => {
          let groups = {} as UGrpsList;
          groups.UserGroup = element.name;
          groups.sid = element.fkSoftwareId;
          let temp = this.UserSubGroupsList.filter(x => x.fkUserGroupId == element.id && x.fkSoftwareId == element.fkSoftwareId);
          groups.UserSubGroups = temp;
          this.usergroupsList.push(groups);
        });


      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.UserSubGroupsList = [];
    });
  }
  others: boolean = false;

  checkothers(list) {
    let temp = list.find(x => x.name == 'Others');
    return temp ? this.others = true : this.others = false;
  }

  fileToUpload: File | null = null;
  File: File | null = null;
  name: string;
  files: File[] = []
  attachlist: any[] = [];
  handleFileInput(fileslist: FileList) {
    this.errMsg1 = "";
    for (var i = 0; i < fileslist.length; i++) {
      let pattern = /[(@!#\$%\^\&*\)\(+=,]/;
      let text = fileslist[i].name;
      if ((pattern.test(text))) {
        alert("Please remove all the special characters in the file name")
        this.reset();
      }
      else if (fileslist[i].size > 5e+6) {
        alert("File size cannot exceed 5mb..")
        this.reset();
      }
      else {
        this.files.push(fileslist[i]);
      }
    }
    this.userIdRequest.filesList = this.files;
    this.attachlist = this.userIdRequest.filesList;
    this.validateAttcahment();
    this.reset();
  }

  removefile(name, id) {

    const index1 = this.userIdRequest.attachmentsList.indexOf(name);
    this.userIdRequest.attachmentsList.splice(index1, 1);

    const index = this.userIdRequest.filesList.indexOf(name);
    this.userIdRequest.filesList.splice(index, 1);

  }

  deletefile(item, name) {

    if (item.attachmentsList.length > 0) {
      const index = item.attachmentsList.indexOf(name);
      item.attachmentsList.splice(index, 1);
    }
    let attach: any = item.attachmentsList[0];
    for (let i = 1; i < item.attachmentsList.length; i++) {
      attach = item.attachmentsList[i] + ',' + attach;
    }
    item.attachments = attach;
    this.userIdRequestlist[0].attachmentsList = item.attachmentsList;
    this.userIdRequest.attachments = attach;
    let connection = this.httpService.put(APIURLS.BR_USERID_REQUEST_INSERT_API, item.id, item);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        swal({
          title: "Message",
          text: "file deleted successfully",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        })
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error deleteing file..';
    });
  }
  fileslist: any[] = [];
  fileslist1: File[] = [];
  validateAttcahment() {
    this.fileslist = [];
    if (this.attachments.length > 0) {
      for (let i = 0; i < this.attachments.length; i++) {
        for (let j = 0; j < this.files.length; j++) {
          if (this.files[j].name == this.attachments[i]) {

            swal({
              title: "Message",
              text: "file with name " + (this.files[j].name) + " already Exists",
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            })
            this.files.splice(j, 1);

          }
        }
      }
    }


    // this.formData =  new  FormData();
    for (var i = 0; i < this.files.length; i++) {
      //this.formData.append('files',this.files[i]);
      this.fileslist.push(this.files[i].name);
      this.fileslist1.push(this.files[i]);
    }

    this.errMsg1 = "File Uploaded Successfully";
    this.ReadAsBase64(this.File)
      .then(result => {
        this.fileToUpload = result;
      })
      .catch(err => this.errMsg1 = err);
  }
  ReadAsBase64(file): Promise<any> {
    const reader = new FileReader();
    const fileValue = new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        const result = reader.result as string;
        if (!result) reject('Cannot read variable');
        if (result.length * 2 > 2 ** 21) reject('File exceeds the maximum size'); // Note: 2*2**20 = 2**21 
        resolve(reader.result);
      });

      reader.addEventListener('error', event => {
        reject(event);
      });

      reader.readAsDataURL(file);
    });

    return fileValue;
  }
  id: string;
  uploadfile(list: any) {
    // debugger;ks
    // this.id='VM001';
    this.id = list.requestNo;

    var filesdata = this.attachlist;
    this.formData = new FormData();
    for (var k = 0; k < filesdata.length; k++) {
      this.formData.append('files', filesdata[k]);
    }
    let connection: any;
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, this.id, this.formData);
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


  currentUser: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }
  getsoft(id) {
    let temp = this.softwareList.find(x => x.id == id);
    return temp ? temp.name : '';
  }
  getrole(id) {
    let temp = this.softwareRolesList.find(x => x.id == id);
    return temp ? temp.role : '';
  }
  resetForm() {
    this.errMsg1 = "";
    this.userIdRequest = {} as UserIdRequest;
    this.comments = null;

  }

  resetForm1() {
    this.errMsg1 = "";
    this.comments = null;
    if (this.userIdRequest.requestType.toLocaleLowerCase() == 'modification') {
      this.userIdRequest.newRoleUpdated = null;
      this.userIdRequest.comments = null;
      this.userIdRequest.remarks = null;
    }
    else if (this.userIdRequest.requestType.toLocaleLowerCase() == 'creation') {
      this.userIdRequest.newRoleInQams = null;
      this.userIdRequest.comments = null;
      this.userIdRequest.catogery = null;
      this.userIdRequest.trainingRecordPath = null;
      this.userIdRequest.dateOfTraining = null;
      this.userIdRequest.jddocument = null;
      this.userIdRequest.validFrom = null;
      this.userIdRequest.Plantsassigned = null;
      this.userIdRequest.usersubgroupsList = null;
    }
    else {

      this.userIdRequest.activity = null;
      this.userIdRequest.isWorkItemsAssignedPending = null;
      this.userIdRequest.isPendingWorkTransferred = null;
      this.userIdRequest.comments = null;
    }
  }
  locationId: any;

  transactionslist: Transactions[] = [];
  gettransactions(reqNo) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.transactionslist = [];
    });

  }
  Approverslist: WorkFlowApprovers[] = [];
  accountGroupList: any[] = [];
  Aprlpriority: number;
  getroleslist(id) {
    this.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == id);
  }
  getusergroups(id) {
    this.UserGroupsList1 = this.UserGroupsList.filter(x => x.fkSoftwareId == id);
    this.usergroupsList1 = this.usergroupsList.filter(x => x.sid == id);
  }
  getusersubgroups(id) {
    this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkUserGroupId == id);
    this.userIdRequestlist.forEach(req => {
      if (req.userGroups == id) {
        req.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkUserGroupId == id);
      }
    })

  }
  transactionslist1: any[] = [];
  gettransactionsHistory(reqNo) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_HISTORY_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist1 = data;
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.transactionslist1 = [];
    });

  }
  transactionsHistory: any[] = [];
  getHistory(reqNo) {
    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.httpService.getByParam(APIURLS.GET_REQUEST_HISTORY, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionsHistory = data;
        let temp = this.transactionsHistory.find(x => (x.doneBy == this.currentUser.employeeId || x.parallelApprover1 == this.currentUser.employeeId
          || x.parallelApprover2 == this.currentUser.employeeId || x.parallelApprover3 == this.currentUser.employeeId ||
          x.parallelApprover4 == this.currentUser.employeeId || x.parallelApprover5 == this.currentUser.employeeId) && x.transactionType == null);

        if (temp) {
          if (temp.role == 'Reviewer') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
          }
          if (temp.role == 'Approver') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Approverid2 = temp.doneBy;
          }
          if (temp.role == 'Creator') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Approverid2 = temp.doneBy;
            this.Creator = true;
          }
          if (temp.role == 'Closure') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Approverid2 = temp.doneBy;
            this.Creator = true;
            this.Closure = true;
          }



        }
        if (this.userIdRequest.requestType != 'Creation'
          && this.userIdRequest.requestType != 'Password Reset/Unlocking'
          && this.userIdRequest.requestType != 'Password Reset/Clear Logoff Request'
          && this.userIdRequest.softwareType != 'Plant Level' && this.userIdRequest.sid != 11
          && this.userIdRequest.sid != 12 && this.userIdRequest.sid != 13) {
          this.transactionsHistory.forEach(element => {
            if (element.role == "Closure") {
              element.approvalPriority = 3
            }
          });
        }
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.transactionsHistory = [];
    });
  }

  closePriority: any;
  KeyValue: any;
  ReviewerList: any[] = [];
  ApproverIdslist: any[] = [];
  getApproversList(value) {
    this.getusergroups(value.sid);
    this.getroleslist(value.sid);
    this.ReviewerList = [];
    this.ApproverIdslist = [];
    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    // let request:any;
    //request = Object.assign({}, value);
    var loc = this.locationList.find(x => x.id == value.locationId);
    var software = this.softwareList.find(x => x.id == value.sid);
    if (software.name != 'SAP UserId') {
      var keyvalue = loc.code + '~' + software.name + ',' + 6;
      this.KeyValue = loc.code + '~' + software.name;
    }
    else {
      if (value.catogery == 'Primary SAP UserId') {
        var cat = 'PR';
      }
      else {
        var cat = 'SE';
      }
      if (value.requestType == 'Block ID') {
        var subCat = 'B'
      }
      else if (value.requestType == 'Changes in Existing ID') {
        var subCat = 'C'
      }
      else if (value.requestType == 'Delete ID') {
        var subCat = 'D'
      }
      else if (value.requestType == 'New ID') {
        var subCat = 'N'
      }
      else if (value.requestType == 'Rename ID') {
        var subCat = 'R'
      }
      else {
        var subCat = 'P';
      }
      this.KeyValue = loc.code + '~' + cat + '~' + subCat
      var keyvalue = loc.code + '~' + cat + '~' + subCat + ',' + 6;
    }

    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {

        if (this.requestType == "Modification" || this.requestType == "Activation/Inactivation") {
          let apprs = data.filter(x => x.priority != 1 && x.closure != 1);
          let reviewer: any;
          let dep = this.DepartmentList.find(x => x.name == this.userIdRequest.department && x.isActive == true)
          reviewer = data.find(x => x.priority == 1 && x.dept == dep.id)

          this.Approverslist = apprs;
          if (reviewer != null || reviewer != undefined) {
            this.Approverslist.push(reviewer);
          }
          // this.Approverslist = data.filter(x=>x.closure !=1);
          this.Approverslist.forEach(element => {
            element.role = element.role == "Creator" ? "Closure" : element.role;
          });
        }
        else if (this.softType != 'Plant Level' && this.requestType != "Password Reset/Unlocking"
          && this.requestType != 'Password Reset/Clear Logoff Request'
          && software.name != 'SAP UserId' && software.name != 'SAP Roles' && software.name != 'SAP Authorization') {
          let apprs = data.filter(x => x.priority != 1);
          let reviewer: any;
          let dep = this.DepartmentList.find(x => x.name == this.userIdRequest.department && x.isActive == true)
          reviewer = data.find(x => x.priority == 1 && x.dept == dep.id)

          this.Approverslist = apprs;
          if (reviewer != null || reviewer != undefined) {
            this.Approverslist.push(reviewer);
          }

          //this.Approverslist = data;
        }

        if (this.requestType == "Password Reset/Unlocking" || this.requestType == 'Password Reset/Clear Logoff Request') {
          this.Approverslist = data.filter(x => x.role == 'Creator');
          this.Approverslist.forEach(element => {
            element.role = element.role == "Creator" ? "Closure" : element.role;
            element.priority = 1;
          });
        }
        else {
          if (software.name == 'SAP UserId' || software.name == 'AD ID' || software.name == 'USB Acess' ||
            software.name == 'File Server Access' || software.name == 'URL Access' || software.name == 'PAM User Access'
            || software.name == 'Citrix ID' || software.name == 'Email ID' || software.name == 'O365 ID' || software.name == 'Ivanti User Access'
            || software.name == 'VPN Access' || software.name == 'FTP Access' || software.name == 'Static-Public IP') {

            if (this.ApprovingManager[0].employeeId != data.find(x => x.priority == 2).approverId) {
              let Approver: any = {};
              Approver.approverId = this.ApprovingManager[0].employeeId;
              Approver.approverName = this.ApprovingManager[0].fullName
              Approver.role = 'HOD';
              Approver.keyValue = keyvalue;
              Approver.department = this.ApprovingManager[0].department;
              Approver.priority = 1;
              Approver.isActive = true;
              data.push(Approver)
              this.Approverslist = data;

            }
            else {
              data.forEach(element => {
                element.priority = element.priority - 1
              });
              this.Approverslist = data;
            }
            this.Approverslist = data;
          }
          else if (this.softType == 'Plant Level' || software.name == 'SAP Roles' || software.name == 'SAP Authorization') {

            if (this.softType == 'Plant Level') {
              let apprs = data.filter(x => x.priority != 1);
              let reviewer: any;
              let dep = this.DepartmentList.find(x => x.name == this.userIdRequest.department && x.isActive == true)
              reviewer = data.find(x => x.priority == 1 && x.dept == dep.id)

              this.Approverslist = apprs;
              if (reviewer != null || reviewer != undefined) {
                this.Approverslist.push(reviewer);
              }
            }
            else {
              this.Approverslist = data.filter(x => x.isActive == 1);
            }

          }
          else {
            if (this.requestType != "Creation") {
              this.Approverslist.forEach(element => {
                element.role = element.role == "Creator" ? "Closure" : element.role;
              });
            }

          }
        }

        //req.Approverslist=data;
        this.Approverslist = this.Approverslist.sort((a, b) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });

        this.Approverslist = this.Approverslist.filter(x => x.isActive == true);
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;

        let Appr1 = this.Approverslist.find(x => x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid && x.role != 'Creator');
        let Appr2 = this.Approverslist.find(x => x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid && x.role != 'Creator');
        let Appr3 = this.Approverslist.find(x => (x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid) && x.role == 'Creator');
        let Appr4 = this.Approverslist.find(x => (x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid) && x.role == 'Closure');
        let clos = this.transactionslist.find(x => x.approvalPriority == 3 && x.transactionType == 1)

        if ((Appr1 != null || Appr1 != undefined) &&
          (this.transactionslist1.find(x => x.approvalPriority == Appr1.priority && x.transactionType == null))) {
          this.Approverid1 = Appr1.approverId;
          this.Approver1 = true;
          this.Review = true;
          this.Aprlpriority = Appr1.priority;
        }

        else if ((Appr2 != null || Appr2 != undefined) &&
          (this.transactionslist1.find(x => x.approvalPriority == Appr2.priority && x.transactionType == null))) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Approverid2 = Appr2.approverId;
          this.Review = true;
          this.Aprlpriority = Appr2.priority;
        }

        else if (this.requestType != 'Creation' && this.softType != 'Plant Level') {
          if (Appr3 != undefined) {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Review = true;
            this.Aprlpriority = Appr3.priority;

            this.Creator = true;

            this.Closure = false;

          }
          if (Appr4 != undefined) {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Review = true;
            this.Aprlpriority = Appr4.priority;

            this.Creator = true;
            this.Closure = true;
            this.closePriority = Appr4.priority;

          }
        }
        else {
          if (clos == undefined && Appr3 != undefined) {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Review = true;
            this.Aprlpriority = Appr3.priority;

            this.Creator = true;

            this.Closure = false;

          }
          if (clos != undefined && Appr4 != undefined) {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Review = true;
            this.Aprlpriority = Appr4.priority;

            this.Creator = true;
            this.Closure = true;
            this.closePriority = Appr4.priority;

          }
          let list = this.transactionslist.reverse();
          let clorev = list.find(x => x.approvalPriority == 4 && x.transactionType == 3)
          if (clorev != undefined && Appr3 != undefined) {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Review = true;
            this.Aprlpriority = Appr3.priority;

            this.Creator = true;
            this.Closure = false;
            //this.closePriority=Appr4.priority;

          }
        }
        this.transactionslist.forEach((ad) => {
          let temp = this.Approverslist.find(x => x.priority == ad.approvalPriority);
          if (temp != undefined) {
            if (ad.transactionType == 1) {
              if (temp.role == 'Creator') {
                ad.status = 'Completed'
              }
              else if (temp.role == 'Closure') {
                ad.status = 'Closed'
              }
              else if (temp.role == 'Approver') {
                ad.status = 'Approved'
              }
              else {
                ad.status = this.approverstatuslist.find(x => x.id == ad.approvalPriority).name;
              }
            }
            else if (ad.transactionType == 3 || ad.transactionType == 4) {
              ad.status = ad.transactionType == 3 ? "Reverted To Previous Approver " : " Reverted to Initiator";
            }
            else {
              ad.status = ad.transactionType == 2 ? "Rejected" : "";
            }
            // ad.approverName = temp.approverName;
            // ad.department = temp.department;
            ad.role = temp.role;
          }

        });
        this.Approverslist.forEach((ad) => {
          let temp1 = this.transactionslist.find(x => x.approvalPriority == ad.priority && x.transactionType == 1);
          if (temp1 == undefined) {
            let trans = {} as Transactions;
            trans.doneBy = ad.approverId;
            trans.approvalPriority = ad.priority;
            trans.approverName = ad.approverName;
            trans.department = ad.department;
            trans.role = ad.role;
            this.transactionslist.push(trans);
          }


        });
        if (this.requestType != "Password Reset/Unlocking" && this.requestType != 'Password Reset/Clear Logoff Request') {
          let temp = this.Approverslist.find(x => x.priority == 1 && x.approverId != this.userIdRequest.onBehalfEmp);
          if (temp) {
            let model: any = {};
            model.approverId = temp.approverId;
            model.name = temp.approverName
            this.ReviewerList.push(model);
          }
          let temp_p = this.Approverslist.find(x => x.priority == 1 && x.parllelApprover1 != this.userIdRequest.onBehalfEmp);
          if (temp_p) {
            let model: any = {};
            model.approverId = temp_p.parllelApprover1;
            model.name = temp_p.pApproverName
            this.ReviewerList.push(model);
          }
          let temp_p1 = this.Approverslist.find(x => x.priority == 1 && x.parllelApprover2 != this.userIdRequest.onBehalfEmp);
          if (temp_p1) {
            let model: any = {};
            model.approverId = temp_p1.parllelApprover2;
            model.name = temp_p1.pA1pproverName
            this.ReviewerList.push(model);
          }
          let temp_p2 = this.Approverslist.find(x => x.priority == 1 && x.parllelApprover3 != this.userIdRequest.onBehalfEmp);
          if (temp_p2) {
            let model: any = {};
            model.approverId = temp_p2.parllelApprover3;
            model.name = temp_p2.pA2pproverName
            this.ReviewerList.push(model);
          }
          let temp_p3 = this.Approverslist.find(x => x.priority == 1 && x.parllelApprover4 != this.userIdRequest.onBehalfEmp);
          if (temp_p3) {
            let model: any = {};
            model.approverId = temp_p3.parllelApprover4;
            model.name = temp_p3.pA3pproverName
            this.ReviewerList.push(model);
          }
          let temp1 = this.Approverslist.find(x => x.priority == 2 && x.approverId != this.userIdRequest.onBehalfEmp);
          if (temp1) {
            let model1: any = {};
            model1.approverId = temp1.approverId;
            model1.name = temp1.approverName
            this.ApproverIdslist.push(model1);
          }
          let temp1_p = this.Approverslist.find(x => x.priority == 2 && x.approverId != this.userIdRequest.onBehalfEmp);
          if (temp1_p) {
            let model1: any = {};
            model1 = {};
            model1.approverId = temp1_p.parllelApprover1;
            model1.name = temp1_p.pApproverName
            this.ApproverIdslist.push(model1);
          }
          let temp1_p1 = this.Approverslist.find(x => x.priority == 2 && x.approverId != this.userIdRequest.onBehalfEmp);
          if (temp1_p1) {
            let model1: any = {};
            model1 = {};
            model1.approverId = temp1_p1.parllelApprover2;
            model1.name = temp1_p1.pA1pproverName
            this.ApproverIdslist.push(model1);
          }
          let temp1_p2 = this.Approverslist.find(x => x.priority == 2 && x.approverId != this.userIdRequest.onBehalfEmp);
          if (temp1_p2) {
            let model1: any = {};
            model1 = {};
            model1.approverId = temp1_p2.parllelApprover3;
            model1.name = temp1_p2.pA2pproverName
            this.ApproverIdslist.push(model1);
          }
          let temp1_p3 = this.Approverslist.find(x => x.priority == 2 && x.approverId != this.userIdRequest.onBehalfEmp);
          if (temp1_p3) {
            let model1: any = {};
            model1 = {};
            model1.approverId = temp1_p3.parllelApprover4;
            model1.name = temp1_p3.pA3pproverName
            this.ApproverIdslist.push(model1);
          }
        }


        this.Approverslist = this.Approverslist.sort((a, b) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        this.transactionslist = this.transactionslist.sort((a, b) => {
          if (a.doneOn > b.doneOn) return 1;
          if (a.doneOn < b.doneOn) return -1;
          if (a.approvalPriority > b.approvalPriority) return 1;
          if (a.approvalPriority < b.approvalPriority) return -1;
          return 0;
        });

      }
      else {
        this.Approverslist = [];
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }



  gettrackrole(id) {
    let role: any[] = [];
    if (id != undefined || id != null) {
      var rolesList = id == '' ? [] : id.split(',');
      for (let i = 0; i < rolesList.length; i++) {
        let temp = this.softwareRolesList.find(x => x.id == rolesList[i]);
        role.push(temp);
      }
      if (role.length > 0) {
        var val = role.map(x => x.role).join();
      }

    }

    return val;
  }
  ApprovingManager: any[] = [];
  getApprovingManager(value) {
    let filterModel: any = {};
    filterModel.onBehalfEmp = value;
    this.httpService.post(APIURLS.BR_USER_ID_REQUEST_APPROVER_API, filterModel).then((data: any) => {
      this.isLoading = true;
      if (data.employeeId > 0) {
        this.ApprovingManager.push(data);
        //   this.Approverslist.push(data);
        //   this.Approverslist.forEach(element => {
        //     element.type="Approving Manager";
        //   });
        //   //this.transactionslist.reverse();
        //  // this.Approver='Approving Manager';
        //   let temp=this.Approverslist.find(x=>x.employeeId==this.currentUser.employeeId);
        //   this.Approver=temp ==undefined?this.Approver:'Approving Manager';
        //   //this.ApprvrM=temp ==undefined?false:true;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });

  }
  DepartmentList: any[] = [];
  getDepartList() {

    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.DepartmentList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });

      }
    }).catch(error => {
      this.isLoading = false;
      this.DepartmentList = [];
    });
  }
  OnClickback() {
    this.resetForm();
    jQuery("#searchModal").modal('show');
  }

  getloc1(id) {
    let loc = this.locationList.find(x => x.id == id);
    return loc ? loc.code + '-' + loc.name : "";
  }
  currentUser1: AuthData;
  Error: any = null;;
  getEmpDetails(empId) {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserGroupsList=[];
    this.httpService.getByParam(APIURLS.BR_GET_EMP_DETAILS_API, empId).then((data: any) => {
      if (data.employeeId > 0) {
        // this.currentUser = data;
        this.userIdRequest.requestDate = this.requestdate;
        this.userIdRequest.plant = this.getloc1(data.baselocation);
        this.userIdRequest.employeeId = data.employeeId;
        this.userIdRequest.firstName = data.firstName;
        this.userIdRequest.lastName = data.lastName;
        this.userIdRequest.fullName = data.fullName;
        this.userIdRequest.designation = data.designation;
        this.userIdRequest.department = data.department;
        this.userIdRequest.reportingManager = data.reportingManager;
        this.userIdRequest.joiningDate = data.joiningDate;
        this.userIdRequest.staffCategory = data.category;
        this.userIdRequest.payGroup = data.division;

      }
      else {
        this.Error = "Error";
        swal({
          title: "Message",
          text: "Entered employee code (" + empId + ") does not exist.Please check again or contact administator",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        })
      }
      // this.reInitDatatable();()
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.currentUser = {} as AuthData;
    });
  }
  onClickNewRequest() {
    //this.resetForm();

    this.userIdRequestsearchlist = [];
    this.selectedSoftwares = [];
    this.requestType = null;
    this.softType = null;
    this.Software = null;
    this.requestfor = null;
    this.onBehalfEmp = null;
    this.errMsgPop = "";
    this.userIdRequest = {} as UserIdRequest;
    this.isEdit = false;
    jQuery("#searchModal").modal('show');

  }
  reset() {
    if (this.myInputVariable != null || this.myInputVariable != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }

  initiatorDet: any = {};
  getInitiatorDetails(empId) {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserGroupsList=[];
    this.httpService.getByParam(APIURLS.BR_GET_EMP_DETAILS_API, empId).then((data: any) => {
      if (data.employeeId > 0) {
        // this.currentUser = data;
        this.initiatorDet.employeeId = data.employeeId;
        this.initiatorDet.fullName = data.fullName;
        this.initiatorDet.designation = data.designation;
        this.initiatorDet.department = data.department;
      }

      // this.reInitDatatable();()
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.currentUser = {} as AuthData;
    });
  }



  empId: string;
  view: boolean = false;
  locationName: string;
  attachments: any[] = [];
  plants: any[] = [];
  printplats: any;
  printgroups: any;
  printsubgroups: any;
  userIdRequest1 = {} as UserIdRequest;
  room = {} as UserIdRequest;
  software: any;
  softwarerole: any;
  newRole: any;
  submit: boolean = false;
  RepDomains: any[] = [];
  printDomains: any;
  masterList: any[] = [];
  printMasters: any;
  ModuleList: any[] = [];
  printModules: any;
  ProfileList: any[] = [];
  printProfiles: any;

  rolesList: any;
  printRoles: any;
  roles: any[] = [];
  newrolesList: any;
  printNewRoles: any;
  Newroles: any[] = [];

  onUserActions(isedit: boolean, userIdRequest: UserIdRequest, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.ReviewerList = [];
    this.ApproverIdslist = [];
    this.resetForm();
    this.view = false;
    this.errMsg1 = "";
    this.errMsgPop = "";
    this.transactionslist = [];
    this.transactionsHistory = [];
    this.transactionslist1 = [];
    this.Approverslist = [];
    this.ApprovingManager = [];
    this.attachments = [];
    this.fileslist = [];
    this.files = [];
    this.fileslist1 = [];
    this.userIdRequestlist = [];
    this.userIdRequest = {} as UserIdRequest
    this.Plantsassigned = [];
    this.Error = null;
    this.plants = [];
    this.isLoadingPop = false;
    this.isLoading = false;
    this.EquipmentDetails = [];
    this.userIdRequestlist = [];
    this.Plantsassigned = [];
    this.printDomains = [];
    this.RepDomains = [];
    this.Newroles = [];
    this.masterList = [];
    this.ProfileList = [];
    this.ModuleList = [];
    this.Error = null;
    this.plants = [];
    this.roles = [];
    //this.reset();
    this.gettransactions(userIdRequest.requestNo);
    this.gettransactionsHistory(userIdRequest.requestNo);
    if (isedit) {
      this.getInitiatorDetails(userIdRequest.createdBy);
      this.requestType = userIdRequest.requestType;
      // if (this.getsoft(userIdRequest.sid) != 'QAMS') {
      //   this.NQonUserActions(isedit, userIdRequest, isprint, value);
      //   return;
      // }
      // else {
      this.getEmpDetails(userIdRequest.onBehalfEmp);
      this.getApprovingManager(userIdRequest.onBehalfEmp);
      this.getHistory(userIdRequest.requestNo);
      this.GetEquipDetailsById(userIdRequest.id);
      //  this.getApproversList(userIdRequest);
      if (this.getsoft(userIdRequest.sid) == 'Trackwise') {
        var rolesList = userIdRequest.newRoleInQams ? userIdRequest.newRoleInQams.split(',') : [];
        for (let i = 0; i < rolesList.length; i++) {
          let temp = this.softwareRolesList.find(x => x.id == rolesList[i]);
          this.roles.push(temp);
        }
        this.printRoles = this.roles.map(x => x.role).join();
        var newroleslist = userIdRequest.newRoleUpdated ? userIdRequest.newRoleUpdated.split(',') : [];
        for (let i = 0; i < newroleslist.length; i++) {
          let temp = this.softwareRolesList.find(x => x.id == newroleslist[i]);
          this.Newroles.push(temp);
        }
      }
      this.software = this.getsoft(userIdRequest.sid);
      var plantList = userIdRequest.assignedPlants ? userIdRequest.assignedPlants.split(',') : [];
      for (let i = 0; i < plantList.length; i++) {
        let temp = this.locListCon.find(x => x.id == plantList[i]);
        this.plants.push(temp);
      }
      var RepDom = userIdRequest.repositoryDomains ? userIdRequest.repositoryDomains.split(',') : [];
      for (let i = 0; i < RepDom.length; i++) {
        let temp = this.RepositoryDomainsList.find(x => x.id == RepDom[i]);
        this.RepDomains.push(temp);
      }
      this.printDomains = this.RepDomains.map(x => x.name).join();

      var mas = userIdRequest.masterAssignment ? userIdRequest.masterAssignment.split(',') : [];
      for (let i = 0; i < mas.length; i++) {
        let temp = this.mastersList.find(x => x.id == mas[i]);
        this.masterList.push(temp);
      }
      this.printMasters = this.masterList.map(x => x.name).join();

      var mod = userIdRequest.userModules ? userIdRequest.userModules.split(',') : [];
      for (let i = 0; i < mod.length; i++) {
        let temp = this.SoftwareModulesList.find(x => x.id == mod[i]);
        this.ModuleList.push(temp);
      }
      this.printModules = this.ModuleList.map(x => x.name).join();

      var pro = userIdRequest.userProfiles ? userIdRequest.userProfiles.split(',') : [];
      for (let i = 0; i < pro.length; i++) {
        let temp = this.softwareUserProfilesList.find(x => x.id == pro[i]);
        this.ProfileList.push(temp);
      }
      this.printProfiles = this.ProfileList.map(x => x.name).join();

      if (this.getsoft(userIdRequest.sid) != 'Trackwise') {
        if (userIdRequest.newRoleInQams) {
          if (userIdRequest.newRoleInQams != '') {
            this.softwarerole = this.softwareRolesList.find(x => x.id == userIdRequest.newRoleInQams).role;
          }
        }
      }
      this.newRole = userIdRequest.newRoleUpdated;
      userIdRequest.selMasters = this.masterList;
      userIdRequest.selModules = this.ModuleList;
      userIdRequest.selProfiles = this.ProfileList;
      userIdRequest.selectedRoles = this.roles;
      userIdRequest.selectedNewRoles = this.Newroles;
      userIdRequest.selectedRepoDomains = this.RepDomains;
      userIdRequest.Plantsassigned = this.plants;
      this.softType = userIdRequest.softwareType;
      // userIdRequest.sid=this.selectedSoftwares[0].id;
      this.printplats = this.plants.map(x => x.code).join();
      var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
      userIdRequest.usergroupsList = this.UserGroupsList.filter(s => UGList.includes((s.id.toString())));
      this.printgroups = userIdRequest.usergroupsList.map(x => x.name).join();
      var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
      let subList: number[]
      // subList=USGList;
      subList = USGList.map(str => {
        return Number(str);
      });
      userIdRequest.activity = userIdRequest.isActive ? 'true' : 'false';
      // userIdRequest.usersubgroupsList=subList;
      userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter(s => USGList.includes(s.id.toString()));
      let temp1 = userIdRequest.usersubgroupsList.find(x => x.name == 'Others');
      temp1 ? this.others = true : this.others = false;
      this.printsubgroups = userIdRequest.usersubgroupsList.map(x => x.name).join();
      var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
      userIdRequest.usergroupsList = this.UserGroupsList.filter(s => UGList.includes((s.id.toString())));
      var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
      userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter(s => USGList.includes(s.id.toString()));
      if (userIdRequest.attachments != null || userIdRequest.attachments != null) {
        userIdRequest.attachmentsList = userIdRequest.attachments.split(',');
      }
      this.usergroupsList1 = this.usergroupsList.filter(x => x.sid == userIdRequest.sid);
      userIdRequest.UserGroupsList1 = this.UserGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
      userIdRequest.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == userIdRequest.sid);
      this.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == userIdRequest.sid);
      this.userIdRequest = Object.assign({}, userIdRequest);
      // }

    }
    else {
      // this.requestType=userIdRequest.requestType;
      if (userIdRequest.requestNo != null || userIdRequest.requestNo != undefined) {
        this.getHistory(userIdRequest.requestNo);
        this.onBehalfEmp = userIdRequest.onBehalfEmp;
        this.requestfor = userIdRequest.requestfor;
        this.requestType = userIdRequest.requestType;
        this.Software = userIdRequest.sid.toString();
        this.GetEquipDetailsById(userIdRequest.id);
        this.softType = userIdRequest.softwareType;
        if (this.getsoft(userIdRequest.sid) == 'Trackwise') {
          var rolesList = userIdRequest.newRoleInQams ? userIdRequest.newRoleInQams.split(',') : [];
          for (let i = 0; i < rolesList.length; i++) {
            let temp = this.softwareRolesList.find(x => x.id == rolesList[i]);
            this.roles.push(temp);
          }
          this.printRoles = this.roles.map(x => x.role).join();
          var newroleslist = userIdRequest.newRoleUpdated ? userIdRequest.newRoleUpdated.split(',') : [];
          for (let i = 0; i < newroleslist.length; i++) {
            let temp = this.softwareRolesList.find(x => x.id == newroleslist[i]);
            this.Newroles.push(temp);
          }
        }

        var plantList = userIdRequest.assignedPlants ? userIdRequest.assignedPlants.split(',') : [];
        for (let i = 0; i < plantList.length; i++) {
          let temp = this.locListCon.find(x => x.id == plantList[i]);
          this.plants.push(temp);
        }
        var RepDom = userIdRequest.repositoryDomains ? userIdRequest.repositoryDomains.split(',') : [];
        for (let i = 0; i < RepDom.length; i++) {
          let temp = this.RepositoryDomainsList.find(x => x.id == RepDom[i]);
          this.RepDomains.push(temp);
        }
        var mas = userIdRequest.masterAssignment ? userIdRequest.masterAssignment.split(',') : [];
        for (let i = 0; i < mas.length; i++) {
          let temp = this.mastersList.find(x => x.id == mas[i]);
          this.masterList.push(temp);
        }
        this.printMasters = this.masterList.map(x => x.name).join();

        var mod = userIdRequest.userModules ? userIdRequest.userModules.split(',') : [];
        for (let i = 0; i < mod.length; i++) {
          let temp = this.SoftwareModulesList.find(x => x.id == mod[i]);
          this.ModuleList.push(temp);
        }
        this.printModules = this.ModuleList.map(x => x.name).join();

        var pro = userIdRequest.userProfiles ? userIdRequest.userProfiles.split(',') : [];
        for (let i = 0; i < pro.length; i++) {
          let temp = this.softwareUserProfilesList.find(x => x.id == pro[i]);
          this.ProfileList.push(temp);
        }
        this.printProfiles = this.ProfileList.map(x => x.name).join();
        userIdRequest.selMasters = this.masterList;
        userIdRequest.selModules = this.ModuleList;
        userIdRequest.selProfiles = this.ProfileList;
        userIdRequest.selectedRoles = this.roles;
        userIdRequest.selectedNewRoles = this.Newroles;
        userIdRequest.selectedRepoDomains = this.RepDomains;
        userIdRequest.Plantsassigned = this.plants;
        // userIdRequest.sid=this.selectedSoftwares[0].id;
        var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
        userIdRequest.usergroupsList = this.UserGroupsList.filter(s => UGList.includes((s.id.toString())));
        var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
        userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter(s => USGList.includes(s.id.toString()));

        this.usergroupsList1 = this.usergroupsList.filter(x => x.sid == userIdRequest.sid);
        userIdRequest.UserGroupsList1 = this.UserGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
        userIdRequest.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == userIdRequest.sid);

      }
      else {
        userIdRequest.UserGroupsList1 = this.UserGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
        userIdRequest.sid = +this.Software;
        if (this.locationCode != null || this.locationCode != undefined) {
          userIdRequest.locationId = +this.locationCode;
        }
        else {
          userIdRequest.locationId = this.currentUser.baselocation;
        }

      }

      this.submit = true;
      var selectedSoftwares = this.softwareList.find(x => x.id == this.Software);
      userIdRequest.name = selectedSoftwares.name;
      // this.getApproversList(userIdRequest);
      if (userIdRequest.status == 'Reverted to initiator') {
        this.requestfor = userIdRequest.requestfor;
        this.onBehalfEmp = userIdRequest.onBehalfEmp;
        this.requestType = userIdRequest.requestType;
      }

      if (this.requestfor == 'on-Behalf') {
        this.getEmpDetails(this.onBehalfEmp);
        this.getApprovingManager(this.onBehalfEmp);
      }
      else {
        this.getEmpDetails(this.currentUser.employeeId);
        this.getApprovingManager(this.currentUser.employeeId);
      }
      this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
      // this.userIdRequest = Object.assign({}, userIdRequest);

      // var plantList = userIdRequest.assignedPlants ? userIdRequest.assignedPlants.split(',') : [];
      // for (let i = 0; i < plantList.length; i++) {
      //   let temp = this.locListCon.find(x => x.id == plantList[i]);
      //   this.plants.push(temp);
      // }
      // userIdRequest.Plantsassigned = this.plants;
      // var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
      // userIdRequest.usergroupsList = this.UserGroupsList.filter(s => UGList.includes((s.id.toString())));
      // var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
      // userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter(s => USGList.includes(s.id.toString()));
      if (userIdRequest.attachments != null || userIdRequest.attachments != null) {
        userIdRequest.attachmentsList = userIdRequest.attachments.split(',');
      }

      userIdRequest.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == this.Software);
      userIdRequest.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == userIdRequest.sid);
      let loc = this.locationList.find(x => x.id == userIdRequest.locationId)
      if (this.softType == 'Plant Level') {
        this.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == userIdRequest.sid && x.location == loc.code);
      }
      this.getApproversList(userIdRequest);
      userIdRequest.UserGroupsList1 = this.UserGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
      this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
      this.userIdRequest = Object.assign({}, userIdRequest);
      // }
    }

    if (value == 'View') {
      this.view = true;
    }
    // if(this.Error == null)
    // {
    let soft = this.softwareList.find(x => x.id == userIdRequest.sid);



    if (isprint) {

      this.userIdRequest1 = Object.assign({}, userIdRequest)
      if (this.softType == 'Plant Level') {
        jQuery('#GprintModal').modal('show');
      }
      else if (this.requestType == 'Activation/Inactivation') {
        jQuery('#IprintModal').modal('show');
      }
      else {
        var name = this.requestType.toLocaleUpperCase()
        jQuery('#printModal').modal('show');
      }

      //this.downloadPdf();
    }
    else if (this.softType == 'Plant Level') {
      jQuery("#searchModal").modal('hide');
      jQuery('#generalModal').modal('show');
    }
    else if (soft.name != 'DMS' && soft.name != 'QAMS' && soft.name != 'NICHELON' && soft.name != 'Unnati HRMS'
     && soft.name != 'CLEEN' && soft.name != 'LIMS' && soft.name != 'Unnati'
      && soft.name != 'Trackwise' && soft.name != 'SAP UserId' && soft.name != 'SAP Roles' && soft.name != 'SAP Authorization') {
      jQuery("#searchModal").modal('hide');
      jQuery('#ADModal').modal('show');
    }
    else if (this.requestType == 'Activation/Inactivation') {
      jQuery("#searchModal").modal('hide');
      jQuery('#inactiveModal').modal('show');
    }
    else if (this.requestType == 'Password Reset/Unlocking' || this.requestType == 'Password Reset/Clear Logoff Request') {
      jQuery("#searchModal").modal('hide');
      jQuery('#passwordModal').modal('show');
    }
    else {
      jQuery("#searchModal").modal('hide');
      jQuery('#myModal').modal('show');
    }


    // inactiveModal

  }
  ClearReqType() {
    this.requestType = undefined;
  }
  employeeId: any;
  onUserActions1(isedit: boolean, userIdRequest: UserIdRequest) {
    this.isEdit = isedit;
    this.resetForm();
    this.view = false;
    this.errMsg1 = "";
    this.transactionslist = [];
    this.transactionsHistory = [];
    this.transactionslist1 = [];
    this.Approverslist = [];
    this.ApprovingManager = [];
    this.attachments = [];
    this.fileslist = [];
    this.files = [];
    this.fileslist1 = [];
    this.userIdRequestlist = [];
    this.Plantsassigned = [];
    this.Error = null;
    this.plants = [];
    this.isLoadingPop = false;
    this.isLoading = false;
    this.EquipmentDetails = [];

    if (this.requestfor == 'on-Behalf') {
      this.employeeId = this.onBehalfEmp;
      //  this.getEmpDetails(this.onBehalfEmp);
      this.httpService.getByParam(APIURLS.BR_GET_EMP_DETAILS_API, this.employeeId).then((data: any) => {
        if (data.employeeId > 0) {
          // this.currentUser = data;
          userIdRequest.requestDate = this.requestdate;
          userIdRequest.plant = this.getloc1(data.baselocation);
          userIdRequest.employeeId = data.employeeId;
          userIdRequest.firstName = data.firstName;
          userIdRequest.lastName = data.lastName;
          userIdRequest.fullName = data.fullName;
          userIdRequest.designation = data.designation;
          userIdRequest.department = data.department;
          userIdRequest.reportingManager = data.reportingManager;
          userIdRequest.joiningDate = data.joiningDate;
          userIdRequest.staffCategory = data.category;
          userIdRequest.payGroup = data.division;

        }
        else {
          this.Error = "Error";
          swal({
            title: "Message",
            text: "Entered employee code (" + this.employeeId + ") does not exist.Please check again or contact administator",
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
          return;
        }
        // this.reInitDatatable();()
        this.isLoading = false;
      })
    }
    else {
      userIdRequest.requestDate = this.requestdate;
      userIdRequest.plant = this.locationId;
      userIdRequest.employeeId = this.currentUser.employeeId;
      userIdRequest.fullName = this.currentUser.fullName;
      userIdRequest.firstName = this.currentUser.firstName;
      userIdRequest.lastName = this.currentUser.lastName;
      userIdRequest.designation = this.currentUser.designation;
      userIdRequest.department = this.currentUser.department;
      userIdRequest.reportingManager = this.currentUser.reportingManager;
      userIdRequest.joiningDate = this.currentUser.joiningDate;
      this.employeeId = this.currentUser.employeeId;
      this.userIdRequest = Object.assign({}, userIdRequest);
    }

    //BR_USERID_REQUESTS_GET_BY_PARAM_API
    this.getApprovingManager(this.employeeId);
    var value = this.employeeId + ',' + this.Software;
    this.httpService.getByParam(APIURLS.BR_USERID_MASTERS_GET_BY_PARAM_API, value).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == data[0].sid);
        var plantList = data[0].assignedPlants ? data[0].assignedPlants.split(',') : [];
        for (let i = 0; i < plantList.length; i++) {
          let temp = this.locListCon.find(x => x.id == plantList[i]);
          this.plants.push(temp);
        }
        userIdRequest.Plantsassigned = this.plants;
        var UGList = data[0].userGroups ? data[0].userGroups.split(',') : [];
        userIdRequest.usergroupsList = this.UserGroupsList.filter(s => UGList.includes((s.id.toString())));
        var USGList = data[0].userSubGroups ? data[0].userSubGroups.split(',') : [];

        userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter(s => USGList.includes((s.id.toString())));
        let temp1 = userIdRequest.usersubgroupsList.find(x => x.name == 'Others');
        temp1 ? this.others = true : this.others = false;
        userIdRequest.otherSubGroups = data[0].otherSubGroups;
        userIdRequest.newRoleInQams = data[0].softwareRole;
        userIdRequest.catogery = data[0].category;
        userIdRequest.presentRoleInQams = data[0].softwareRole;
        userIdRequest.trainingRecordPath = data[0].trainingRecordPath;
        userIdRequest.dateOfTraining = data[0].dateOfTraining;
        userIdRequest.jddocument = data[0].jddocument;
        userIdRequest.validFrom = data[0].validFrom;
        userIdRequest.allottedUserId = data[0].userId;
        userIdRequest.isActive = data[0].isActive;
        userIdRequest.requestType = this.requestType;
        userIdRequest.sid = data[0].sid;
        var RepDom = data[0].repositoryDomains ? data[0].repositoryDomains.split(',') : [];
        for (let i = 0; i < RepDom.length; i++) {
          let temp = this.RepositoryDomainsList.find(x => x.id == RepDom[i]);
          this.RepDomains.push(temp);
        }
        userIdRequest.selectedRepoDomains = this.RepDomains;
        userIdRequest.locationId = this.locationList.find(x => x.id == this.currentUser.baselocation).id;
        userIdRequest.UserGroupsList1 = this.UserGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
        userIdRequest.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == data[0].sid);
        userIdRequest.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == data[0].sid);
        userIdRequest.requestDate = data[0].createdDate;
        this.getApproversList(userIdRequest);


        this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == data[0].sid);
        this.userIdRequest = Object.assign({}, userIdRequest);

        if (this.softType == 'Plant Level') {
          jQuery("#searchModal").modal('hide');
          jQuery('#generalModal').modal('show');
        }

        else if (this.requestType == 'Activation/Inactivation') {
          jQuery("#searchModal").modal('hide');
          jQuery('#inactiveModal').modal('show');
        }
        else if (this.requestType == 'Password Reset/Unlocking' || this.requestType == 'Password Reset/Clear Logoff Request') {
          jQuery("#searchModal").modal('hide');
          jQuery('#passwordModal').modal('show');
        }
        else {
          jQuery("#searchModal").modal('hide');
          jQuery('#myModal').modal('show');
        }

      }
      else {
        this.isLoading = false;
        swal("No user Id available for the mentioned user please raise the creation request.")
        return;
      }
      // else {
      //   userIdRequest.sid = +this.Software;
      //   var selectedSoftwares = this.softwareList.find(x => x.id == this.Software);
      //   userIdRequest.name = selectedSoftwares.name;
      //   userIdRequest.requestType = this.requestType;
      //   userIdRequest.locationId = this.locationList.find(x => x.id == this.currentUser.baselocation).id;
      //   userIdRequest.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == this.Software);
      //   userIdRequest.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == this.Software);
      //   this.getApproversList(userIdRequest);
      //   this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == this.Software);
      //   this.userIdRequest = Object.assign({}, userIdRequest);
      // }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });




    // }

    // inactiveModal

  }
  isValid: boolean = false;
  validatedForm: boolean = true;

  RequestNo: any;
  ApproverId: any;
  onSaveEntry(status) {
    this.errMsg = "";
    this.isLoading = true;
    let connection: any;
    var requestsList: any[] = [];
    let soft: any;
    try {


      if (this.Approverslist.length == 0) {
        swal({
          title: "Message",
          text: "Approvers are not defined for this type",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      else if (((this.Approverslist.find(x => x.priority == 1)) == undefined)
        && (this.requestType != 'Password Reset/Unlocking' && this.requestType != 'Password Reset/Clear Logoff Request')) {
        swal({
          title: "Message",
          text: "Reviewer role in the approvers list is not assigned please check.",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      else {
        if (!this.isEdit) {
          this.userIdRequest.id = 0;
          this.userIdRequest.requestNo = null;
          this.userIdRequest.modifiedBy = null;
          this.userIdRequest.modifiedDate = null;
          this.userIdRequest.requestDate = null;
          soft = this.softwareList.find(x => x.id == this.userIdRequest.sid).name;
          if (this.requestfor == 'on-Behalf') {
            this.userIdRequest.requestfor = 'on-Behalf';
            this.userIdRequest.onBehalfEmp = this.onBehalfEmp;
          }
          else {
            this.userIdRequest.requestfor = 'Self';
            this.userIdRequest.onBehalfEmp = this.currentUser.employeeId;
          }
          if (soft != 'SAP UserId' && soft != 'SAP Roles' && soft != 'SAP Authorization') {
            this.userIdRequest.requestType = this.requestType;
          }


          if (this.userIdRequest.Plantsassigned != undefined && this.userIdRequest.Plantsassigned.length > 0) {
            this.userIdRequest.assignedPlants = this.userIdRequest.Plantsassigned.map(x => x.id).join();
          }
          if (this.userIdRequest.selectedRoles != undefined && this.userIdRequest.selectedRoles.length > 0) {
            this.userIdRequest.newRoleInQams = this.userIdRequest.selectedRoles.map(x => x.id).join();
          }
          if (this.userIdRequest.selectedNewRoles != undefined && this.userIdRequest.selectedNewRoles.length > 0) {
            this.userIdRequest.newRoleUpdated = this.userIdRequest.selectedNewRoles.map(x => x.id).join();
          }
          if (this.userIdRequest.usergroupsList != undefined && this.userIdRequest.usergroupsList.length > 0) {
            this.userIdRequest.userGroups = this.userIdRequest.usergroupsList.map(x => x.id).join();
          }
          if (this.userIdRequest.usersubgroupsList != undefined && this.userIdRequest.usersubgroupsList.length > 0) {
            // this.userIdRequest.userSubGroups = this.userIdRequest.usersubgroupsList.map(x => x.id).join();
            var list = this.userIdRequest.usersubgroupsList.map(item => item.fkUserGroupId)
              .filter((value, index, self) => self.indexOf(value) === index)
            this.userIdRequest.userGroups = list.map(x => x).join();
            this.userIdRequest.userSubGroups = this.userIdRequest.usersubgroupsList.map(x => x.id).join();
          }
          if (this.userIdRequest.selectedRepoDomains != undefined && this.userIdRequest.selectedRepoDomains.length > 0) {
            this.userIdRequest.repositoryDomains = this.userIdRequest.selectedRepoDomains.map(x => x.id).join();
          }
          if (this.userIdRequest.selMasters != undefined && this.userIdRequest.selMasters.length > 0) {
            this.userIdRequest.masterAssignment = this.userIdRequest.selMasters.map(x => x.id).join();
          }
          if (this.userIdRequest.selProfiles != undefined && this.userIdRequest.selProfiles.length > 0) {
            this.userIdRequest.userProfiles = this.userIdRequest.selProfiles.map(x => x.id).join();
          }
          if (this.userIdRequest.selModules != undefined && this.userIdRequest.selModules.length > 0) {
            this.userIdRequest.userModules = this.userIdRequest.selModules.map(x => x.id).join();
          }

          //this.userIdRequest.requestfor = this.currentUser.baselocation;
          this.userIdRequest.createdBy = this.currentUser.employeeId;
          if (this.userIdRequest.filesList != undefined) {
            // for(let i=0;i<this.userIdRequest.filesList.length;i++)
            // {
            this.userIdRequest.attachments = this.userIdRequest.filesList[0].name;
            for (let j = 1; j < this.userIdRequest.filesList.length; j++) {
              this.userIdRequest.attachments = this.userIdRequest.filesList[j].name + ',' + this.userIdRequest.attachments;
            }
            // }
          }
          if (this.requestType == 'Activation/Inactivation' || this.requestType == 'Discontinuation') {

            this.userIdRequest.isActive = this.userIdRequest.activity == 'false' ? false : true;
            this.userIdRequest.releivedDate = this.userIdRequest.releivedDate ? this.getDateFormate(this.userIdRequest.releivedDate) : null;
          }
          else {
            this.userIdRequest.isActive = true;
          }

          if (this.userIdRequest.validFrom != null || this.userIdRequest.validFrom != undefined) {
            this.userIdRequest.validFrom = this.getDateFormate(this.userIdRequest.validFrom);
          }
          if (this.userIdRequest.usbTodate != null || this.userIdRequest.usbTodate != undefined) {
            this.userIdRequest.usbTodate = this.getDateFormate(this.userIdRequest.usbTodate);
          }
          this.userIdRequest.requesterId = this.currentUser.employeeId;
          // this.userIdRequest.requestDate = new Date().toLocaleString();
          //this.userIdRequest.createdDate = new Date().toLocaleString();
          if (this.userIdRequest.requestType != 'Password Reset/Unlocking' && this.userIdRequest.requestType != 'Password Reset/Clear Logoff Request') {
            this.ApproverId = this.userIdRequest.approverId ? this.userIdRequest.approverId : this.Approverslist.find(x => x.priority == 2).approverId;
          }
          this.userIdRequest.pendingApprover = this.userIdRequest.pendingApprover ? this.userIdRequest.pendingApprover : this.Approverslist.find(x => x.priority == 1).approverId;
          this.userIdRequest.lastApprover = 'No';
          this.userIdRequest.softwareType = this.softType;
          this.userIdRequest.status = status == "Submit" ? "Submitted" : "Created";
        }
        if (this.userIdRequest.requestType == null || this.userIdRequest.requestType == undefined) {
          this.userIdRequest.requestType = 'Creation';
        }
        connection = this.httpService.post(APIURLS.BR_USERID_REQUEST_INSERT_API, this.userIdRequest);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          this.submit = false;
          if (data.id > 0) {
            //this.id = data.requestNo;
            // this.returnList = data;
            this.uploadfile(data)

            if (data.requestType == 'Activation/Inactivation') {
              jQuery("#inactiveModal").modal('hide');
            }
            else if (data.requestType == 'Password Reset/Unlocking' || data.requestType == 'Password Reset/Clear Logoff Request') {
              jQuery("#passwordModal").modal('hide');
            }
            else if (this.softType == 'Plant Level') {
              jQuery("#generalModal").modal('hide');
            }
            // else if (!this.dict.has(data.sid)) {
            //   jQuery("#ADModal").modal('hide');
            // }
            else {
              jQuery("#myModal").modal('hide');

            }
            this.RequestNo = data.requestNo;
            this.errMsgPop1 = status == 'Save' ? 'Request ' + this.RequestNo + ' saved successfully!' : 'Request ' + this.RequestNo + ' Submitted Successfully!';
            jQuery("#saveModal").modal('show');
            if (status != 'Save') {
              data.approverId = this.Approverslist.find(x => x.priority == 1).approverId;
              this.priority = 0;
              this.sendPendingMail(data);
            }
            if (this.EquipmentDetails.length > 0) {
              this.InsertEquipments(data);
            }
            this.InsertHistory();
            this.getAllEntries();
            this.reset();
            this.isLoading = false;
          }
          this.isLoading = false;
        },
          (err: any) => {
            this.isLoading = false;
            swal(err);
          })
          .catch(error => {
            this.isLoadingPop = false;
            this.isLoading = false;
            this.errMsgPop = 'Error saving Request..';
          });
      }




    }
    catch (e) {
      this.isLoadingPop = false;
      this.isLoading = false;
      this.errMsgPop = 'Error saving Request..';
    }



  }
  InsertHistory() {
    this.isLoading = true;
    this.httpService.get(APIURLS.INSERT_TRANSACION_HISTORY + "/" + 'value' + "/" + this.RequestNo + "/" + this.ApproverId).then((data: any) => {
      if (data) {


      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  onSubmitEntry(userIdRequest: UserIdRequest) {
    try {
      let connection: any;
      this.isLoading = true;
      this.userIdRequest = {} as UserIdRequest;
      let soft = this.softwareList.find(x => x.id == userIdRequest.sid).name;
      // let temp = this.userIdRequestlist.find(x => x.requestNo == userIdRequest.requestNo);
      if (!this.submit) {
        this.userIdRequest = Object.assign({}, userIdRequest);
        this.userIdRequest.status = "Submitted";
        this.userIdRequest.isActive = true;
        this.userIdRequest.modifiedBy = this.currentUser.employeeId;
        // this.userIdRequest.modifiedDate = new Date().toLocaleString();
      }
      else {
        this.userIdRequest = Object.assign({}, userIdRequest);


        this.errMsg = "";

        if (this.userIdRequest.modifiedDate != null || this.userIdRequest.modifiedDate != undefined) {
          this.userIdRequest.status = "ReSubmitted";
        }
        else {
          this.userIdRequest.status = "Submitted";
        }
        if (this.userIdRequest.attachmentsList != undefined) {
          if (this.userIdRequest.attachmentsList.length > 0) {
            this.userIdRequest.attachments = this.userIdRequest.attachmentsList.map(x => x).join();
          }
        }

        if (this.userIdRequest.filesList != undefined) {

          this.userIdRequest.attachments = this.userIdRequest.attachments + ',' + this.userIdRequest.filesList[0].name;
          for (let j = 1; j < this.userIdRequest.filesList.length; j++) {
            this.userIdRequest.attachments = this.userIdRequest.filesList[j].name + ',' + this.userIdRequest.attachments;
          }

        }
        if (this.userIdRequest.selectedRoles != undefined && this.userIdRequest.selectedRoles.length > 0) {
          this.userIdRequest.newRoleInQams = this.userIdRequest.selectedRoles.map(x => x.id).join();
        }
        if (this.userIdRequest.selectedNewRoles != undefined && this.userIdRequest.selectedNewRoles.length > 0) {
          this.userIdRequest.newRoleUpdated = this.userIdRequest.selectedNewRoles.map(x => x.id).join();
        }
        if (this.requestType == 'Activation/Inactivation') {
          this.userIdRequest.isActive = this.userIdRequest.activity == 'false' ? false : true;
        }
        else {
          this.userIdRequest.isActive = true;
        }
        // if(this.userIdRequest.usergroupsList != undefined && this.userIdRequest.usergroupsList.length>0)
        // {
        //   this.userIdRequest.userGroups = this.userIdRequest.usergroupsList.map(x => x.id).join();
        // } 
        if (this.userIdRequest.requestType != 'Activation/Inactivation') {
          //this.userIdRequest.userGroups=this.userIdRequest.usergroupsList.map(x => x.id).join();
          //this.userIdRequest.userSubGroups=userIdRequest.usersubgroupsList.map(x => x.id).join();
          // req.userSubGroups = req.usersubgroupsList.map(x => x.id).join();
          if (this.userIdRequest.usergroupsList != undefined && this.userIdRequest.usergroupsList.length > 0) {
            this.userIdRequest.userGroups = this.userIdRequest.usergroupsList.map(x => x.id).join();
          }
          if (this.userIdRequest.usersubgroupsList != undefined && this.userIdRequest.usersubgroupsList.length > 0) {
            // req.userSubGroups = req.usersubgroupsList.map(x => x.id).join();
            var list = this.userIdRequest.usersubgroupsList.map(item => item.fkUserGroupId)
              .filter((value, index, self) => self.indexOf(value) === index)
            this.userIdRequest.userGroups = list.map(x => x).join();
            this.userIdRequest.userSubGroups = this.userIdRequest.usersubgroupsList.map(x => x.id).join();
          }
          this.userIdRequest.assignedPlants = this.userIdRequest.Plantsassigned.map(x => x.id).join();
          // this.userIdRequest.approverId=this.Approverslist.find(x => x.priority == 1).approverId;
        }
        if (this.userIdRequest.selectedRepoDomains != null || this.userIdRequest.selectedRepoDomains != undefined) {
          this.userIdRequest.repositoryDomains = this.userIdRequest.selectedRepoDomains.map(x => x.id).join();
        }
        if (this.userIdRequest.selMasters != null || this.userIdRequest.selMasters != undefined) {
          this.userIdRequest.masterAssignment = this.userIdRequest.selMasters.map(x => x.id).join();
        }
        if (this.userIdRequest.selProfiles != null || this.userIdRequest.selProfiles != undefined) {
          this.userIdRequest.userProfiles = this.userIdRequest.selProfiles.map(x => x.id).join();
        }
        if (this.userIdRequest.selModules != null || this.userIdRequest.selModules != undefined) {
          this.userIdRequest.userModules = this.userIdRequest.selModules.map(x => x.id).join();
        }
        //  this.userIdRequest.approverId = this.Approverslist.find(x => x.priority == 1).approverId;
        //this.ApproverId = this.transactionsHistory.find(x => x.approvalPriority == 2).doneBy;
        let app = this.transactionsHistory.find(x => x.approvalPriority == 1);
        this.userIdRequest.pendingApprover = app ? app.doneBy :
          this.Approverslist.find(x => x.priority == 1).approverId;
        this.userIdRequest.modifiedBy = this.currentUser.employeeId;
        this.userIdRequest.validFrom = this.userIdRequest.validFrom ? this.getDateFormate(this.userIdRequest.validFrom) : null;
        //  this.userIdRequest.modifiedDate = new Date().toLocaleString();
      }
      connection = this.httpService.put(APIURLS.BR_USERID_REQUEST_INSERT_API, this.userIdRequest.id, this.userIdRequest);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          this.id = this.userIdRequest.requestNo;
          this.uploadfile(this.userIdRequest);
          let softwr = this.softwareList.find(x => x.id == this.userIdRequest.sid).name;
          if (this.userIdRequest.requestType == 'Activation/Inactivation') {
            jQuery("#inactiveModal").modal('hide');
          }
          else if (this.userIdRequest.requestType == 'Password Reset/Unlocking' || this.userIdRequest.requestType == 'Password Reset/Clear Logoff Request') {
            jQuery("#passwordModal").modal('hide');
          }
          else if (this.softType == 'Plant Level') {
            jQuery("#generalModal").modal('hide');
          }
          // else if (!this.dict.has(this.userIdRequest.sid)) {
          //   jQuery("#ADModal").modal('hide');
          // }
          else {
            jQuery("#myModal").modal('hide');

          }
          this.errMsgPop1 = 'Request ' + this.userIdRequest.requestNo + ' submitted successfully!';
          jQuery("#saveModal").modal('show');
          if (this.EquipmentDetails != undefined) {
            if (this.EquipmentDetails.length > 0) {
              this.UpdateEquipments(this.userIdRequest);
            }
          }
          
          this.sendPendingMail(this.userIdRequest);
          this.Inserttransactions(userIdRequest, 0)
          this.getAllEntries();
          this.reset();
          this.isLoading = false;
        }
      }).catch(error => {
        this.isLoading = false;
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Submitting Request' + '' + this.userIdRequest.requestNo;
      });

    }
    catch (error) {
      this.isLoading = false;
      alert(error)
    }
  }
  Role: any;
  onreview(status) {
    this.errMsg = "";
    this.isLoading = true;
    let connection: any;
    let uid = this.currentUser.employeeId;
    let soft = this.softwareList.find(x => x.id == this.userIdRequest.sid).name;
    if (status == "Rejected") {
      let user = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid || x.parallelApprover5 == uid) && x.transactionType == null);
      this.userIdRequest.pendingApprover = 'No';
    }
    else {
      let user = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid || x.parallelApprover5 == uid) && x.transactionType == null);
      this.Role = user.role;
      this.userIdRequest.pendingApprover = this.transactionsHistory.find(x => x.approvalPriority == user.approvalPriority + 1).doneBy;
      // this.userIdRequest.approverId = this.transactionsHistory.find(x => x.approvalPriority == user.approvalPriority + 1).doneBy;
    }


    this.userIdRequest.lastApprover = this.currentUser.fullName;
    this.userIdRequest.modifiedBy = this.currentUser.employeeId;
    // this.userIdRequest.modifiedDate = new Date().toLocaleString();
    this.userIdRequest.status = status == "Rejected" ? status : status;
    connection = this.httpService.put(APIURLS.BR_USERID_REQUEST_INSERT_API, this.userIdRequest.id, this.userIdRequest);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        if (this.userIdRequest.requestType == 'Activation/Inactivation') {
          jQuery("#inactiveModal").modal('hide');
        }
        else if (this.userIdRequest.requestType == 'Password Reset/Unlocking' || this.userIdRequest.requestType == 'Password Reset/Clear Logoff Request') {
          jQuery("#passwordModal").modal('hide');
        }
        else if (this.softType == 'Plant Level') {
          jQuery("#generalModal").modal('hide');
        }
        // else if (!this.dict.has(this.userIdRequest.sid)) {
        //   jQuery("#ADModal").modal('hide');
        // }
        else {
          jQuery("#myModal").modal('hide');

        }
        //var role=this.Approverslist.find(x=>x.role=='Approver' && x.approverId==this.currentUser.employeeId)
        if (this.Role == "Approver") {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.userIdRequest.requestNo + '' + status + " Successfully!" : "Request " + this.userIdRequest.requestNo + " Approved Successfully!";
        }
        else {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.userIdRequest.requestNo + '' + status + " Successfully!" : "Request " + this.userIdRequest.requestNo + " Reviewed Successfully!";
        }

        jQuery("#saveModal").modal('show');
        let id = status == "Rejected" ? 2 : 1;
        if (status == "Rejected") {
          this.sendRejectedMail(this.userIdRequest);
        }
        else {
          this.sendApprovedMail(this.userIdRequest);
          this.sendPendingMail(this.userIdRequest)
        }
        //this.sendMail('Rejected', this.userIdRequest);

        // this.Inserttransactions(this.userIdRequest, id)
        this.Updatetransactions(this.userIdRequest, id)
        this.getAllEntries();
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.isLoading = false;
      this.errMsgPop = status == "Rejected" ? "Error Rejecting Request.." + '' + this.userIdRequest.requestNo : "Error Reviewing Request" + '' + this.userIdRequest.requestNo;
    });
  }

  onRevertRequest(status) {
    this.errMsg = "";
    let connection: any;
    this.isLoading = true;
    let soft = this.softwareList.find(x => x.id == this.userIdRequest.sid).name;
    if (status == "ReverttoInitiator") {
      let uid = this.currentUser.employeeId;
      let user = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid || x.parallelApprover5 == uid) && x.transactionType == null);

      this.userIdRequest.pendingApprover = this.transactionsHistory.find(x => x.transactionType == 0).doneBy;
      this.userIdRequest.status = "Reverted to initiator";
      //this.userIdRequest.approverId = this.transactionsHistory.find(x => x.transactionType == 0).doneBy;
    }
    else {
      let uid = this.userIdRequest.modifiedBy;
      let user = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid || x.parallelApprover5 == uid) && x.transactionType == null);

      this.userIdRequest.pendingApprover = this.transactionsHistory.find(x => x.approvalPriority == user.approvalPriority).doneBy;
      // this.userIdRequest.approverId = this.transactionsHistory.find(x => x.approvalPriority == user.approvalPriority).doneBy;
      this.userIdRequest.status = "Reverted";
    }

    this.userIdRequest.lastApprover = this.currentUser.fullName;
    this.userIdRequest.modifiedBy = this.currentUser.employeeId;
    // this.userIdRequest.modifiedDate = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_USERID_REQUEST_INSERT_API, this.userIdRequest.id, this.userIdRequest);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        let softwr = this.softwareList.find(x => x.id == this.userIdRequest.sid).name;
        if (this.userIdRequest.requestType == 'Activation/Inactivation') {
          jQuery("#inactiveModal").modal('hide');
        }
        else if (this.userIdRequest.requestType == 'Password Reset/Unlocking' || this.userIdRequest.requestType == 'Password Reset/Clear Logoff Request') {
          jQuery("#passwordModal").modal('hide');
        }
        else if (this.softType == 'Plant Level') {
          jQuery("#generalModal").modal('hide');
        }
        // else if (!this.dict.has(this.userIdRequest.sid)) {
        //   jQuery("#ADModal").modal('hide');
        // }
        else {
          jQuery("#myModal").modal('hide');

        }
        this.errMsgPop1 = "Request " + this.userIdRequest.requestNo + " Reverted Successfully!";
        jQuery("#saveModal").modal('show');
        let id = status == "ReverttoInitiator" ? 4 : 3;
        this.Updatetransactions(this.userIdRequest, id)
        if (status == "ReverttoInitiator") {

        }
        //  this.sendMail(status, this.userIdRequest);
        // this.Inserttransactions(this.userIdRequest, id)

        this.getAllEntries();
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.isLoading = false;
      this.errMsgPop = "Error Reverting Request" + '' + this.userIdRequest.requestNo;
    });
  }

  onCreate() {
    this.errMsg = "";
    let connection: any;
    this.isLoading = true;
    let uid = this.currentUser.employeeId;
    let soft = this.softwareList.find(x => x.id == this.userIdRequest.sid).name;

    let user = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
      || x.parallelApprover3 == uid || x.parallelApprover4 == uid || x.parallelApprover5 == uid) && x.transactionType == null);

    let temp = this.transactionsHistory.find(x => x.approvalPriority == user.approvalPriority + 1);
    if (temp != null || temp != undefined) {
      this.userIdRequest.pendingApprover = temp.doneBy;
      this.userIdRequest.status = 'InProcess';
      // this.userIdRequest.approverId = temp.doneBy;
    }
    else {
      this.userIdRequest.pendingApprover = 'No';
      this.userIdRequest.status = 'Completed';
    }
    this.userIdRequest.lastApprover = this.currentUser.fullName;
    this.userIdRequest.modifiedBy = this.currentUser.employeeId;
    //this.userIdRequest.modifiedDate = new Date().toLocaleString();


    connection = this.httpService.put(APIURLS.BR_USERID_REQUEST_INSERT_API, this.userIdRequest.id, this.userIdRequest);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        let softwr = this.softwareList.find(x => x.id == this.userIdRequest.sid).name;
        if (this.userIdRequest.requestType == 'Activation/Inactivation') {
          jQuery("#inactiveModal").modal('hide');
        }
        else if (this.userIdRequest.requestType == 'Password Reset/Unlocking' || this.userIdRequest.requestType == 'Password Reset/Clear Logoff Request') {
          jQuery("#passwordModal").modal('hide');
        }
        else if (this.softType == 'Plant Level') {
          jQuery("#generalModal").modal('hide');
        }
        // else if (!this.dict.has(this.userIdRequest.sid)) {
        //   jQuery("#ADModal").modal('hide');
        // }
        else {
          jQuery("#myModal").modal('hide');

        }
        if (this.userIdRequest.requestType == "Creation") {
          this.errMsgPop1 = "User Id Created Successfully!";
        }
        else if (this.userIdRequest.requestType == "Modification") {
          this.errMsgPop1 = "User Id Modified Successfully!";
        }
        else if (this.userIdRequest.requestType == "Discontinuation") {
          this.errMsgPop1 = "User Id Discontinued Successfully!";
        }
        else {
          this.errMsgPop1 = "User Id Created Successfully!";
        }

        jQuery("#saveModal").modal('show');
        this.sendMail('Completed', this.userIdRequest);
        if (this.userIdRequest.pendingApprover != 'No') {
          this.sendPendingMail(this.userIdRequest);
        }
        // this.Inserttransactions(this.userIdRequest, 1)
        this.Updatetransactions(this.userIdRequest, 1)
        this.getAllEntries();
        this.isLoading = false;
      }
    }
      ,
      (err: any) => {
        this.isLoading = false;
        swal(err);
      }).catch(error => {
        this.isLoadingPop = false;
        this.isLoading = false;
        this.errMsgPop = "Error Creating user Id..";
      });

  }
  priority: number;
  oncloserequest(status) {
    this.errMsg = "";
    let connection: any;
    this.isLoading = true;

    this.userIdRequest.lastApprover = this.currentUser.fullName;
    this.userIdRequest.modifiedBy = this.currentUser.employeeId;
    // this.userIdRequest.modifiedDate = new Date().toLocaleString();
    this.userIdRequest.status = 'Completed';
    this.userIdRequest.pendingApprover = 'No';

    connection = this.httpService.put(APIURLS.BR_USERID_REQUEST_INSERT_API, this.userIdRequest.id, this.userIdRequest);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        let softwr = this.softwareList.find(x => x.id == this.userIdRequest.sid).name;
        if (this.userIdRequest.requestType == 'Activation/Inactivation') {
          jQuery("#inactiveModal").modal('hide');
        }
        else if (this.userIdRequest.requestType == 'Password Reset/Unlocking' || this.userIdRequest.requestType == 'Password Reset/Clear Logoff Request') {
          jQuery("#passwordModal").modal('hide');
        }
        else if (this.softType == 'Plant Level') {
          jQuery("#generalModal").modal('hide');
        }
        else {
          jQuery("#myModal").modal('hide');
        }
        this.errMsgPop1 = "Request " + '' + this.userIdRequest.requestNo + '' + " Closed Successfully!";
        jQuery("#saveModal").modal('show');
        //  this.Inserttransactions(this.userIdRequest, 1)
        this.Updatetransactions(this.userIdRequest, 1)
        this.sendMail('Closed', this.userIdRequest)
        this.getAllEntries();
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.isLoading = false;
      this.errMsgPop = "Error Closing Request" + '' + this.userIdRequest.requestNo;
    });
  }
  transactions = {} as Transactions;
  Inserttransactions(data, id) {
    this.errMsg = "";
    let connection: any;
    this.transactions.doneBy = this.currentUser.employeeId;
    this.transactions.parallelApprover1 = this.currentUser.employeeId;
    // this.transactions.doneOn = new Date().toLocaleString();
    this.transactions.requestNo = data.requestNo;
    this.transactions.keyValue = this.KeyValue;
    this.transactions.approvalPriority = this.priority;
    this.transactions.transactionType = id;
    this.transactions.comments = data.comments;
    this.transactions.processType = "UserId Request";
    connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);

  }
  Updatetransactions(data, id) {
    this.errMsg = "";
    let connection: any;
    let temp = this.transactionsHistory.find(x => (x.doneBy == this.currentUser.employeeId || x.parallelApprover1 == this.currentUser.employeeId
      || x.parallelApprover2 == this.currentUser.employeeId || x.parallelApprover3 == this.currentUser.employeeId ||
      x.parallelApprover4 == this.currentUser.employeeId || x.parallelApprover5 == this.currentUser.employeeId) && x.transactionType == null);
    temp.comments = this.comments;
    temp.doneBy = this.currentUser.employeeId;
    temp.transactionType = id;
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, temp.id, temp);
    connection.then((data) => {
      if (data == 200) {
        if (id == '4') {
          if (this.isEdit) {
            var loc = this.locationList.find(x => x.id == this.userIdRequest.locationId);
          }
          else {
            var loc = this.locationList.find(x => x.id == this.currentUser.baselocation);
          }
          var software = this.softwareList.find(x => x.id == this.userIdRequest.sid);
          if (software.name != 'SAP UserId') {
            var keyvalue = loc.code + '~' + software.name;
          }
          else {
            if (this.userIdRequest.catogery == 'Primary SAP UserId') {
              var cat = 'PR';
            }
            else {
              var cat = 'SE';
            }
            if (this.userIdRequest.requestType == 'Block ID') {
              var subCat = 'B'
            }
            else if (this.userIdRequest.requestType == 'Changes in Existing ID') {
              var subCat = 'C'
            }
            else if (this.userIdRequest.requestType == 'Delete ID') {
              var subCat = 'D'
            }
            else if (this.userIdRequest.requestType == 'New ID') {
              var subCat = 'N'
            }
            else if (this.userIdRequest.requestType == 'Rename ID') {
              var subCat = 'R'
            }
            else {
              var subCat = 'P';
            }

            var keyvalue = loc.code + '~' + cat + '~' + subCat;
          }
          this.KeyValue = keyvalue;
          this.RequestNo = this.userIdRequest.requestNo;
          this.ApproverId = this.transactionsHistory.find(x => x.approvalPriority == 2).doneBy;
          this.InsertHistory();
        }
      }
    })

  }
  sendMail(type, userIdRequest: UserIdRequest) {
    let connection: any;

    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_MAIL_API, type, userIdRequest);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });

  }

  sendPendingMail(userIdRequest) {
    let connection: any;

    connection = this.httpService.post(APIURLS.BR_SEND_PEND_MAIL_API_NEW, userIdRequest);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });

  }
  sendRejectedMail(userIdRequest) {
    let connection: any;

    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_REJECTED_MAIL_API_NEW, '1', userIdRequest);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });

  }
  sendApprovedMail(userIdRequest) {
    let connection: any;

    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_APPROVED_MAIL_API_NEW, '1', userIdRequest);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });

  }
  downloadFile(id, value) {

    // console.log(filename);
    if (value.length > 0) {
      this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, id, value).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find(s => s.id == id).name;
        if (data != undefined) {
          var FileSaver = require('file-saver');
          const imageFile = new File([data], value, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);


        }
      }).catch(error => {
        this.isLoading = false;
      });

    } else {
      swal({
        title: "Message",
        text: "No File on server",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
  }
  downloadFile1(id, name) {
    let temp = this.userIdRequestlist.find(x => x.sid == id);
    // console.log(filename);
    if (temp.filesList.length > 0) {
      var data = temp.filesList.find(x => x.name == name.name);
      var FileSaver = require('file-saver');
      const imageFile = new File([data], name.name, { type: 'application/doc' });
      // console.log(imageFile);
      FileSaver.saveAs(imageFile);




    }
  }
  printReason: any;

  print(): void {
    // this.printElement(document.getElementById("print-section"));
    let printContents, popupWin;
    if (this.softType == 'Plant Level') {
      printContents = document.getElementById('Gprint-section').innerHTML;
    }
    else {
      printContents = document.getElementById('print-section').innerHTML;
    }

    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
        <html>
          <head>
            <title>User Id Request Form</title>
           <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
            <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
          </head>
          <body onload="window.print();window.close()">
          <table class="report-container">
            <thead class="report-header">
            <tr>
            <td class="report-header-cell">
              <div class="header-info">
                Print Date: ${new Date().toLocaleDateString('en-GB')}  Printed By: ${this.currentUser.fullName}
              </div>
            </td>
          </tr>
            </thead>
            <tbody class="report-content">
              <tr>
                <td class="report-content-cell">
                  <div class="main">
                  ${printContents}
                  </div>
                </td>
              </tr>
            </tbody>
         
          </table>
          </body>
        </html>`
    );
    popupWin.document.close();
  }

  printModel: any;

  showprintmodel(data: UserIdRequest) {
    this.printReason = null;
    this.printModel = {};
    this.printModel = Object.assign({}, data);
    jQuery("#printReasonModal").modal('show');
  }
  image: string;
  getbase64image() {
    this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
        };

      });
  }
  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  setFormatedTime(date: any) {
    let dt = new Date(date);
    let formateddate =
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  locationname: string;
  downloadPdf() {
    this.InsertPrintLog();
    jQuery("#printModal").modal('hide');
    jQuery("#printReasonModal").modal('hide');
    // var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
    //generalpdf
    var printContents: any;
    if (this.softType == 'Plant Level') {
      var name = this.userIdRequest.requestType.toLocaleUpperCase();
      printContents = document.getElementById('generalpdf').innerHTML;
    }
    else if (this.requestType != 'Activation/Inactivation' && this.requestType != 'Password Reset/Unlocking' && this.requestType != 'Password Reset/Clear Logoff Request') {
      var name = this.requestType.toLocaleUpperCase();
      printContents = document.getElementById('pdf').innerHTML;
    }
    else if (this.requestType == 'Activation/Inactivation') {
      var name = this.requestType.toLocaleUpperCase();
      printContents = document.getElementById('Ipdf').innerHTML;
    }
    else if (this.requestType == 'Password Reset/Unlocking' || this.requestType == 'Password Reset/Clear Logoff Request') {
      var name = this.requestType.toLocaleUpperCase();
      printContents = document.getElementById('Password').innerHTML;
    }

    var temp1 = this.locationList.find(x => x.id == this.userIdRequest.locationId);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + temp1.code + '-' + temp1.name;

    if ((this.softwareList.find(x => x.id == this.userIdRequest.sid).name) == 'SAP UserId') {
      var ReportName = 'SAP USER ID REQUEST FORM';
    }
    else {
      var ReportName = 'USER ID ' + name + ' FORM';
    }

    var reason = this.printReason;
    var printedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
    var logo = this.image;
    var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>
  ${printContents}
  <div>     
  </div>
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: 'User Id Form',
      },

      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        //p: { margin: [10, 15, 10, 20] },
        bold: false,
        table: {
          width: '*',
        },
        th: { bold: true, fillColor: '#8B0000' }
      },
      stack: [{
        unbreakable: true,
      }],
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 100, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {

          columns: [
            {
              // pageMargins: [40, 80, 40, 60],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [50, 370, 70],
                headerRows: 2,
                keepWithHeaderRows: 1,
                body: [
                  [{
                    rowSpan: 2, image: logo,
                    width: 50,
                    alignment: 'center'
                  }
                    , { text: OrganisationName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' },
                  {
                    rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                      { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                  }],
                  [''
                    , { text: ReportName, bold: true, fontSize: 14, color: 'black', alignment: 'center', height: '*' }, '']

                ]
              }
            }
          ],
          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' + ' This document printed electronically through Unnati v2.0 software' },
                { text: 'Reason' + ": " + reason }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

          ],
          margin: 20
        }
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }


  InsertPrintLog() {
    this.errMsg = "";
    let connection: any;
    let model: any = {};
    model.process = "User ID Request";
    model.printingReason = this.printReason;
    model.printedBy = this.currentUser.fullName;
    model.printedOn = new Date().toLocaleString();
    model.requestNo = this.userIdRequest.requestNo;
    connection = this.httpService.post(APIURLS.BR_PRINT_LOG_INSERT, model);

  }





  NQonUserActions(isedit: boolean, userIdRequest: UserIdRequest, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.resetForm();
    this.view = false;
    this.errMsg1 = "";
    this.errMsgPop = "";
    this.transactionslist = [];
    this.transactionsHistory = [];
    this.transactionslist1 = [];
    this.Approverslist = [];
    this.ApprovingManager = [];
    this.attachments = [];
    this.fileslist = [];
    this.files = [];
    this.fileslist1 = [];
    this.userIdRequestlist = [];
    this.Plantsassigned = [];
    this.printDomains = [];
    this.RepDomains = [];
    this.Newroles = [];
    this.masterList = [];
    this.ProfileList = [];
    this.ModuleList = [];
    this.Error = null;
    this.plants = [];
    this.roles = [];
    this.isLoadingPop = false;
    //this.reset();
    this.gettransactions(userIdRequest.requestNo);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    if (isedit) {
      this.getApprovingManager(userIdRequest.onBehalfEmp);
      this.getApproversList(userIdRequest);
      let soft1 = this.softwareList.find(x => x.id == userIdRequest.sid);
      this.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == userIdRequest.sid);
      if (this.softType != 'Plant Level') {
        this.requestType = userIdRequest.requestType;
        var plantList = userIdRequest.assignedPlants ? userIdRequest.assignedPlants.split(',') : [];
        for (let i = 0; i < plantList.length; i++) {
          let temp = this.locListCon.find(x => x.id == plantList[i]);
          this.plants.push(temp);
        }
        if (this.getsoft(userIdRequest.sid) == 'Trackwise') {
          var rolesList = userIdRequest.newRoleInQams ? userIdRequest.newRoleInQams.split(',') : [];
          for (let i = 0; i < rolesList.length; i++) {
            let temp = this.softwareRolesList1.find(x => x.id == rolesList[i]);
            this.roles.push(temp);
          }
          this.printRoles = this.roles.map(x => x.role).join();
          var newroleslist = userIdRequest.newRoleUpdated ? userIdRequest.newRoleUpdated.split(',') : [];
          for (let i = 0; i < newroleslist.length; i++) {
            let temp = this.softwareRolesList1.find(x => x.id == newroleslist[i]);
            this.Newroles.push(temp);
          }
        }
        this.printNewRoles = this.Newroles.map(x => x.role).join();
        var RepDom = userIdRequest.repositoryDomains ? userIdRequest.repositoryDomains.split(',') : [];
        for (let i = 0; i < RepDom.length; i++) {
          let temp = this.RepositoryDomainsList.find(x => x.id == RepDom[i]);
          this.RepDomains.push(temp);
        }
        this.printDomains = this.RepDomains.map(x => x.name).join();

        var mas = userIdRequest.masterAssignment ? userIdRequest.masterAssignment.split(',') : [];
        for (let i = 0; i < mas.length; i++) {
          let temp = this.mastersList.find(x => x.id == mas[i]);
          this.masterList.push(temp);
        }
        this.printMasters = this.masterList.map(x => x.name).join();

        var mod = userIdRequest.userModules ? userIdRequest.userModules.split(',') : [];
        for (let i = 0; i < mod.length; i++) {
          let temp = this.SoftwareModulesList.find(x => x.id == mod[i]);
          this.ModuleList.push(temp);
        }
        this.printModules = this.ModuleList.map(x => x.name).join();

        var pro = userIdRequest.userProfiles ? userIdRequest.userProfiles.split(',') : [];
        for (let i = 0; i < pro.length; i++) {
          let temp = this.softwareUserProfilesList.find(x => x.id == pro[i]);
          this.ProfileList.push(temp);
        }
        this.printProfiles = this.ProfileList.map(x => x.name).join();
        userIdRequest.selMasters = this.masterList;
        userIdRequest.selModules = this.ModuleList;
        userIdRequest.selProfiles = this.ProfileList;
        userIdRequest.selectedRepoDomains = this.RepDomains;
        userIdRequest.Plantsassigned = this.plants;
        userIdRequest.selectedRoles = this.roles;
        userIdRequest.selectedNewRoles = this.Newroles;
        this.printplats = this.plants.map(x => x.code).join();
        var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
        userIdRequest.usergroupsList = this.UserGroupsList.filter(s => UGList.includes((s.id.toString())));
        this.printgroups = userIdRequest.usergroupsList.map(x => x.name).join();
        var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
        let subList: number[]
        // subList=USGList;
        subList = USGList.map(str => {
          return Number(str);
        });
        userIdRequest.activity = userIdRequest.isActive ? 'true' : 'false';
        // userIdRequest.usersubgroupsList=subList;
        userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter(s => USGList.includes(s.id.toString()));
        let temp1 = userIdRequest.usersubgroupsList.find(x => x.name == 'Others');
        temp1 ? this.others = true : this.others = false;
        this.printsubgroups = userIdRequest.usersubgroupsList.map(x => x.name).join();
        if (this.getsoft(userIdRequest.sid) != 'Trackwise') {
          if (userIdRequest.newRoleInQams) {
            if (userIdRequest.newRoleInQams != '') {
              this.softwarerole = this.softwareRolesList.find(x => x.id == userIdRequest.newRoleInQams).role;
            }
          }
        }
        this.newRole = userIdRequest.newRoleUpdated;
      }
      this.selectedSoftwares = [];

      if (userIdRequest.attachments != undefined || userIdRequest.attachments != null) {
        userIdRequest.attachmentsList = userIdRequest.attachments.split(',');
      }
      this.software = this.softwareList.find(x => x.id == userIdRequest.sid).name;

      this.selectedSoftwares = this.softwareList.filter(x => x.id == userIdRequest.sid);
      this.selectedSoftwares.forEach(soft => {
        let userId = {} as UserIdRequest;
        userId.sid = soft.id;
        userIdRequest.name = soft.name;
        userIdRequest.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == soft.id);
        userId.requestDate = userIdRequest.createdDate;
        userId = userIdRequest;
        // userId.software=soft.name;
        //userId.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == soft.id);
        //userId.role=this.softwareRolesList1.find(x=>x.id==userIdRequest.newRoleInQams).name;
        this.userIdRequestlist.push(userId);
      })
      this.room = this.userIdRequestlist[0];
      // userIdRequest.Plantsassigned=this.locListCon.filter(x=>x.id==userIdRequest.assignedPlants);
      this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
      let loc = this.locationList.find(x => x.id == userIdRequest.locationId);
      userIdRequest.plant = loc.code + '-' + loc.name;
      this.userIdRequest = Object.assign({}, userIdRequest);
    }
    else {
      this.submit = true;

      // this.getApproversList(userIdRequest);
      if (userIdRequest.status == 'Reverted to initiator') {
        this.requestfor = userIdRequest.requestfor;
        this.onBehalfEmp = userIdRequest.onBehalfEmp;
        this.requestType = userIdRequest.requestType;
      }
      if (this.requestfor == 'on-Behalf') {
        this.getEmpDetails(this.onBehalfEmp);
        this.getApprovingManager(this.onBehalfEmp);
      }
      else {
        userIdRequest.requestDate = this.requestdate;
        userIdRequest.plant = this.locationId;
        userIdRequest.employeeId = this.currentUser.employeeId;
        userIdRequest.fullName = this.currentUser.fullName;
        userIdRequest.firstName = this.currentUser.firstName;
        userIdRequest.lastName = this.currentUser.lastName;
        userIdRequest.designation = this.currentUser.designation;
        userIdRequest.department = this.currentUser.department;
        userIdRequest.reportingManager = this.currentUser.reportingManager;
        userIdRequest.joiningDate = this.currentUser.joiningDate;
        userIdRequest.onBehalfEmp = this.currentUser.employeeId;
        userIdRequest.sid = this.selectedSoftwares[0].id;
        this.getApprovingManager(this.currentUser.employeeId);
      }
      this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
      // this.userIdRequest = Object.assign({}, userIdRequest);
      if (userIdRequest.requestNo != null) {
        this.selectedSoftwares = [];
      }
      else {
        userIdRequest.sid = this.selectedSoftwares[0].id;
      }
      if (this.getsoft(userIdRequest.sid) == 'Trackwise') {
        var rolesList = userIdRequest.newRoleInQams ? userIdRequest.newRoleInQams.split(',') : [];
        for (let i = 0; i < rolesList.length; i++) {
          let temp = this.softwareRolesList.find(x => x.id == rolesList[i]);
          this.roles.push(temp);
        }
        this.printRoles = this.roles.map(x => x.role).join();
        var newroleslist = userIdRequest.newRoleUpdated ? userIdRequest.newRoleUpdated.split(',') : [];
        for (let i = 0; i < newroleslist.length; i++) {
          let temp = this.softwareRolesList.find(x => x.id == newroleslist[i]);
          this.Newroles.push(temp);
        }
      }

      var plantList = userIdRequest.assignedPlants ? userIdRequest.assignedPlants.split(',') : [];
      for (let i = 0; i < plantList.length; i++) {
        let temp = this.locListCon.find(x => x.id == plantList[i]);
        this.plants.push(temp);
      }
      var RepDom = userIdRequest.repositoryDomains ? userIdRequest.repositoryDomains.split(',') : [];
      for (let i = 0; i < RepDom.length; i++) {
        let temp = this.RepositoryDomainsList.find(x => x.id == RepDom[i]);
        this.RepDomains.push(temp);
      }
      var mas = userIdRequest.masterAssignment ? userIdRequest.masterAssignment.split(',') : [];
      for (let i = 0; i < mas.length; i++) {
        let temp = this.mastersList.find(x => x.id == mas[i]);
        this.masterList.push(temp);
      }
      this.printMasters = this.masterList.map(x => x.name).join();

      var mod = userIdRequest.userModules ? userIdRequest.userModules.split(',') : [];
      for (let i = 0; i < mod.length; i++) {
        let temp = this.SoftwareModulesList.find(x => x.id == mod[i]);
        this.ModuleList.push(temp);
      }
      this.printModules = this.ModuleList.map(x => x.name).join();

      var pro = userIdRequest.userProfiles ? userIdRequest.userProfiles.split(',') : [];
      for (let i = 0; i < pro.length; i++) {
        let temp = this.softwareUserProfilesList.find(x => x.id == pro[i]);
        this.ProfileList.push(temp);
      }
      this.printProfiles = this.ProfileList.map(x => x.name).join();
      userIdRequest.selMasters = this.masterList;
      userIdRequest.selModules = this.ModuleList;
      userIdRequest.selProfiles = this.ProfileList;
      userIdRequest.selectedRoles = this.roles;
      userIdRequest.selectedNewRoles = this.Newroles;
      userIdRequest.selectedRepoDomains = this.RepDomains;
      userIdRequest.Plantsassigned = this.plants;
      // userIdRequest.sid=this.selectedSoftwares[0].id;
      var UGList = userIdRequest.userGroups ? userIdRequest.userGroups.split(',') : [];
      userIdRequest.usergroupsList = this.UserGroupsList.filter(s => UGList.includes((s.id.toString())));
      var USGList = userIdRequest.userSubGroups ? userIdRequest.userSubGroups.split(',') : [];
      userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter(s => USGList.includes(s.id.toString()));
      if (userIdRequest.attachments != null || userIdRequest.attachments != null) {
        userIdRequest.attachmentsList = userIdRequest.attachments.split(',');
      }

      if (this.selectedSoftwares.length == 0) {
        this.selectedSoftwares = this.softwareList.filter(x => x.id == userIdRequest.sid);
        this.selectedSoftwares.forEach(soft => {
          let userId = {} as UserIdRequest;
          userId = userIdRequest;
          userId.sid = soft.id;
          userId.name = soft.name;
          userId.locationId = this.locationList.find(x => x.id == this.currentUser.baselocation).id;
          userId.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == soft.id);
          //      userId.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == soft.id);
          this.userIdRequestlist.push(userId);
          this.getApproversList(userId);
        })
      }
      else {
        this.selectedSoftwares.forEach(soft => {
          let userId = {} as UserIdRequest;
          //userId=userIdRequest;
          userId.sid = soft.id;
          userId.name = soft.name;
          userId.locationId = this.locationList.find(x => x.id == this.currentUser.baselocation).id;
          userId.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == soft.id);
          //    userId.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == soft.id);
          this.userIdRequestlist.push(userId);
          this.getApproversList(userId);
        })
      }


      // let plant=userIdRequest.assignedPlants.split(',');
      // for(let i=0;i<plant.length;i++)
      // {
      //   let temp=this.locListCon.filter(x=>x.id==plant[i]);
      //   userIdRequest.Plantsassigned.push(temp);
      // }
      //this.getApproversList(userIdRequest);
      // this.Creator=false;

      this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == userIdRequest.sid);
      this.userIdRequest = Object.assign({}, userIdRequest);
    }
    if (value == 'View') {
      this.view = true;
    }
    // if(this.Error == null)
    // {
    let soft = this.softwareList.find(x => x.id == this.userIdRequestlist[0].sid);



    if (isprint) {
      this.userIdRequest1 = Object.assign({}, userIdRequest)
      if (this.softType == 'Plant Level') {
        jQuery('#GprintModal').modal('show');
      }
      else if (this.requestType == 'Activation/Inactivation') {
        jQuery('#NQIprintModal').modal('show');
      }
      else if (this.requestType == 'Password Reset/Unlocking' || this.requestType == 'Password Reset/Clear Logoff Request') {
        jQuery('#NQprintPModal').modal('show');
      }
      else {
        var name = this.requestType.toLocaleUpperCase()
        jQuery('#NQprintModal').modal('show');
      }

      //this.downloadPdf();
    }
    else if (soft.name == 'Others') {
      jQuery("#searchModal").modal('hide');
      jQuery('#generalModal').modal('show');
    }
    else if (this.requestType == 'Password Reset/Unlocking' || this.requestType == 'Password Reset/Clear Logoff Request') {
      jQuery("#searchModal").modal('hide');
      jQuery('#NQpasswordModal').modal('show');
    }
    else if (this.requestType == 'Activation/Inactivation') {
      jQuery("#searchModal").modal('hide');
      jQuery('#NQinactiveModal').modal('show');
    }
    else {
      jQuery("#searchModal").modal('hide');
      jQuery('#NQmyModal').modal('show');
    }


    // inactiveModal

  }
  NQonUserActions1(isedit: boolean, userIdRequest: UserIdRequest) {
    this.isEdit = isedit;
    this.resetForm();
    this.view = false;
    this.errMsg1 = "";
    this.errMsgPop = "";
    this.transactionslist = [];
    this.transactionsHistory = [];
    this.transactionslist1 = [];
    this.Approverslist = [];
    this.ApprovingManager = [];
    this.attachments = [];
    this.fileslist = [];
    this.files = [];
    this.fileslist1 = [];
    this.userIdRequestlist = [];
    this.Plantsassigned = [];
    this.printDomains = [];
    this.RepDomains = [];
    this.Newroles = [];
    this.masterList = [];
    this.ProfileList = [];
    this.ModuleList = [];
    this.Error = null;
    this.plants = [];
    this.roles = [];
    this.isLoadingPop = false;
    //this.reset();
    //this.gettransactions(userIdRequest.requestNo);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();


    // this.getApprovingManager(this.currentUser.employeeId);
    // this.getApproversList(userIdRequest);
    if (this.requestfor == 'on-Behalf') {
      this.employeeId = this.onBehalfEmp;
      this.getEmpDetails(this.onBehalfEmp);
    }
    else {
      userIdRequest.requestDate = this.requestdate;
      userIdRequest.plant = this.locationId;
      userIdRequest.employeeId = this.currentUser.employeeId;
      userIdRequest.fullName = this.currentUser.fullName;
      userIdRequest.firstName = this.currentUser.firstName;
      userIdRequest.lastName = this.currentUser.lastName;
      userIdRequest.designation = this.currentUser.designation;
      userIdRequest.department = this.currentUser.department;
      userIdRequest.reportingManager = this.currentUser.reportingManager;
      userIdRequest.joiningDate = this.currentUser.joiningDate;
      userIdRequest.sid = this.selectedSoftwares[0].id;
      this.employeeId = this.currentUser.employeeId;
      this.userIdRequest = Object.assign({}, userIdRequest);
    }

    //BR_USERID_REQUESTS_GET_BY_PARAM_API
    var value = this.employeeId + ',' + this.selectedSoftwares[0].id;
    this.httpService.getByParam(APIURLS.BR_USERID_REQUESTS_GET_BY_PARAM_API, value).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //  this.ApprovingManager.push(data);
        // userIdRequest=Object.assign({},data[0]);
        this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == data[0].sid);
        // this.userIdRequest = Object.assign({}, userIdRequest);
        this.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == data[0].sid);
        if (data[0].requestNo != null) {
          this.selectedSoftwares = [];
        }
        var plantList = data[0].assignedPlants ? data[0].assignedPlants.split(',') : [];
        for (let i = 0; i < plantList.length; i++) {
          let temp = this.locListCon.find(x => x.id == plantList[i]);
          this.plants.push(temp);
        }
        if (data[0].sid == 14) {
          var rolesList = data[0].newRoleInQams ? data[0].newRoleInQams.split(',') : [];
          for (let i = 0; i < rolesList.length; i++) {
            let temp = this.softwareRolesList1.find(x => x.id == rolesList[i]);
            temp ? this.roles.push(temp) : null;
          }
          userIdRequest.selectedRoles = this.roles;
        }
        if (data[0].sid == 14) {
          var newroleslist = data[0].newRoleUpdated ? data[0].newRoleUpdated.split(',') : [];
          for (let i = 0; i < newroleslist.length; i++) {
            let temp = this.softwareRolesList1.find(x => x.id == newroleslist[i]);
            this.Newroles.push(temp);
          }
        }

        userIdRequest.Plantsassigned = this.plants;
        var RepDom = userIdRequest.repositoryDomains ? userIdRequest.repositoryDomains.split(',') : [];
        for (let i = 0; i < RepDom.length; i++) {
          let temp = this.RepositoryDomainsList.find(x => x.id == RepDom[i]);
          this.RepDomains.push(temp);
        }
        userIdRequest.selectedRepoDomains = this.RepDomains;
        var UGList = data[0].userGroups ? data[0].userGroups.split(',') : [];
        userIdRequest.usergroupsList = this.UserGroupsList.filter(s => UGList.includes((s.id.toString())));
        var USGList = data[0].userSubGroups ? data[0].userSubGroups.split(',') : [];

        userIdRequest.usersubgroupsList = this.UserSubGroupsList.filter(s => USGList.includes((s.id.toString())));
        //  if(userIdRequest.attachments != null || userIdRequest.attachments != null  )
        //  {
        //    userIdRequest.attachmentsList=userIdRequest.attachments.split(',');
        //  }
        let temp1 = userIdRequest.usersubgroupsList.find(x => x.name == 'Others');
        temp1 ? this.others = true : this.others = false;
        userIdRequest.otherSubGroups = data[0].otherSubGroups;
        userIdRequest.newRoleInQams = data[0].newRoleInQams;
        userIdRequest.catogery = data[0].catogery;
        userIdRequest.presentRoleInQams = data[0].newRoleInQams;
        userIdRequest.trainingRecordPath = data[0].trainingRecordPath;
        userIdRequest.dateOfTraining = data[0].dateOfTraining;
        userIdRequest.jddocument = data[0].jddocument;
        userIdRequest.validFrom = data[0].validFrom;
        userIdRequest.allottedUserId = data[0].allottedUserId;
        userIdRequest.isActive = data[0].isActive;
        userIdRequest.requestDate = data[0].createdDate;
        userIdRequest.salutation = data[0].salutation;
        userIdRequest.selectedRoles = this.roles;
        userIdRequest.selectedNewRoles = this.Newroles;
        this.userIdRequest.requestDate = this.requestdate;
        userIdRequest.plant = this.userIdRequest.plant;
        userIdRequest.employeeId = this.userIdRequest.employeeId;
        userIdRequest.firstName = this.userIdRequest.firstName;
        userIdRequest.lastName = this.userIdRequest.lastName;
        userIdRequest.fullName = this.userIdRequest.fullName;
        userIdRequest.designation = this.userIdRequest.designation;
        userIdRequest.department = this.userIdRequest.department;
        userIdRequest.reportingManager = this.userIdRequest.reportingManager;
        userIdRequest.joiningDate = this.userIdRequest.joiningDate;
        if (this.selectedSoftwares.length == 0) {
          this.selectedSoftwares = this.softwareList.filter(x => x.id == data[0].sid);
          this.selectedSoftwares.forEach(soft => {
            let userId = {} as UserIdRequest;
            //userId=data[0];
            userIdRequest.sid = soft.id;
            userIdRequest.name = soft.name;
            userIdRequest.locationId = this.locationList.find(x => x.id == this.currentUser.baselocation).id;
            userIdRequest.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == soft.id);
            userIdRequest.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == soft.id);
            this.userIdRequestlist.push(userIdRequest);
            this.getApproversList(userIdRequest);
          })
        }
        else {
          this.selectedSoftwares.forEach(soft => {
            let userId = {} as UserIdRequest;
            //userId=userIdRequest;
            userIdRequest.sid = soft.id;
            userIdRequest.name = soft.name;

            userIdRequest.locationId = this.locationList.find(x => x.id == this.currentUser.baselocation).id;
            userIdRequest.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == soft.id);
            userIdRequest.softwareRolesList1 = this.softwareRolesList.filter(x => x.sid == soft.id);
            this.userIdRequestlist.push(userIdRequest);
            this.getApproversList(userIdRequest);
          })
        }


        // let plant=userIdRequest.assignedPlants.split(',');
        // for(let i=0;i<plant.length;i++)
        // {
        //   let temp=this.locListCon.filter(x=>x.id==plant[i]);
        //   userIdRequest.Plantsassigned.push(temp);
        // }
        //this.getApproversList(userIdRequest);
        // this.Creator=false;
        this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == data[0].sid);
        this.userIdRequest = Object.assign({}, userIdRequest);


      }
      else {
        this.selectedSoftwares.forEach(soft => {
          let userId = {} as UserIdRequest;
          //userId=userIdRequest;
          userIdRequest.sid = soft.id;
          userIdRequest.name = soft.name;
          userId.requestType = this.requestType;
          userIdRequest.locationId = this.locationList.find(x => x.id == this.currentUser.baselocation).id;
          userIdRequest.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == soft.id);
          this.userIdRequestlist.push(userIdRequest);
          this.getApproversList(userIdRequest);
        })
      }
      // this.UserSubGroupsList1 = this.UserSubGroupsList.filter(x => x.fkSoftwareId == data[0].sid);

      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });


    if (this.requestType == 'Activation/Inactivation') {
      jQuery("#searchModal").modal('hide');
      jQuery('#NQinactiveModal').modal('show');
    }
    else if (this.requestType == 'Password Reset/Unlocking' || this.requestType == 'Password Reset/Clear Logoff Request') {
      jQuery("#searchModal").modal('hide');
      jQuery('#NQpasswordModal').modal('show');
    }
    else {
      jQuery("#searchModal").modal('hide');
      jQuery('#NQmyModal').modal('show');
    }


    // }

    // inactiveModal

  }
  //filterModel: PageFilter = {} as PageFilter;
  pageSize: any = 10;
  pageNo: any;
  totalCount: number;
  totalPages: number
  gotoPage(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getAllEntries();
  }

  pageSizeChange() {
    this.pageNo = 1;
    this.getAllEntries();
  }
  getlist() {
    this.pageNo = 1
    this.getAllEntries();
  }

  EquipmentDetails: any[] = [];
  count = 0;
  onAddLineClick() {
    this.isLoading = true;
    this.EquipmentDetails.push({});
    //console.log(this.departmentList);
    this.count++;
    this.isLoading = false;
  }

  RemoveLine(no, id) {
    this.isLoading = true;
    this.EquipmentDetails.splice(no, 1);
    // console.log(this.departmentList);
    this.count--;
    this.isLoading = false;
  }

  InsertEquipments(useridrequest) {
    let connection: any;
    this.EquipmentDetails.forEach((element) => {
      let equip: any = {};
      equip.id = element.id ? element.id : 0;
      equip.sid = useridrequest.sid;
      equip.reqId = useridrequest.id;
      equip.requestNo = useridrequest.requestNo;
      equip.equipmentName = element.name;
      equip.equipmentId = element.equipId;
      equip.areaorLocation = element.area;
      equip.createdBy = this.currentUser.employeeId;
      connection = this.httpService.post(APIURLS.USERID_EQUIPDETAILS_INSERT, equip);
      connection.then((data) => {
        if (data) {

        }
      }).catch((error) => {

      })

    });

  }

  UpdateEquipments(useridrequest) {
    let connection: any;
    this.EquipmentDetails.forEach((element) => {
      let equip: any = {};
      equip.id = element.id ? element.id : 0;
      equip.sid = useridrequest.sid;
      equip.reqId = useridrequest.id;
      equip.requestNo = useridrequest.requestNo;
      equip.equipmentName = element.name;
      equip.equipmentId = element.equipId;
      equip.areaorLocation = element.area;
      equip.createdBy = this.currentUser.employeeId;
      connection = this.httpService.put(APIURLS.USERID_EQUIPDETAILS_INSERT, equip.id, equip);
      connection.then((data) => {
        if (data) {

        }
      }).catch((error) => {

      })

    });

  }

  GetEquipDetailsById(id) {
    this.isLoading = true;
    let connection: any;
    connection = this.httpService.getById(APIURLS.USERID_EQUIPDETAILS_GETBYID, id);
    connection.then((data) => {
      if (data.length > 0) {
        data.forEach((element) => {
          let equip: any = {};
          equip.id = element.id;
          equip.name = element.equipmentName;
          equip.equipId = element.equipmentId;
          equip.area = element.areaorLocation;
          equip.reqId = element.reqId;
          equip.requestNo = element.requestNo;
          equip.sid = element.sid;
          this.EquipmentDetails.push(equip);
        });
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
      this.EquipmentDetails = [];
    })
  }

}