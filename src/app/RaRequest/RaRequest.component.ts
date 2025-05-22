import { AuthData } from '../auth/auth.model'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../shared/http-service';
import { APIURLS } from '../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { FormControl, NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Payroll } from '../masters/employee/employee-payroll.model';
import { Role } from '../profile/add-role/add-role.model';
import { debug } from 'util';
import { Location } from '../masters/employee/location.model';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

import { stringify } from 'querystring';
import { saveAs } from 'file-saver';
declare var require: any;
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { RaRequest } from './RaRequest.model';
// import { Transactions } from '../eMicro/ItemCodeCreation/transactions.model';
// import { WorkFlowApprovers } from '../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { ExcelService } from '../shared/excel-service';

@Component({
  selector: 'app-RaRequest',
  templateUrl: './RaRequest.component.html',
  styleUrls: ['./RaRequest.component.css']
})
export class RaRequestComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm, { static: false }) dataForm: NgForm;

   @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;
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
  locationList1: any[] = [[]];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;

  materialtype: string;
  comments: string;
  filterAPI: string = null;
  filterstatus: string = null;
  filterlocation: string = null;
  filterrequest: string = null;
  today = new Date();
  today1: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(),0,0,0);
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  emailid: string;
  requestdate: Date;
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  userid: string;

  Request = {} as RaRequest;
  storeData: any;
  jsonData: any;
  fileUploaded: File;
  worksheet: any;
  selectedDocuments:any[]=[];
  providedDocuments:any[]=[];
  approverList:any[]=[
    { id:1 ,name:'67218-Lavanya R'},
    { id:2 ,name:'79504-Salma Inamdar'},
    { id:3 ,name:'66702-Dhanalakshmi'},
    { id:4 ,name:'111846-Marudhappa Govindarajan A'},
    { id:5 ,name:'96648-Anitha V'}
  ];
  approver:any;
  user:any;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
    ,private excelService:ExcelService,) { }

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
    this.user=this.currentUser.employeeId+'-'+this.currentUser.fullName;
    this.Request.requestedBy=this.currentUser.employeeId+'-'+this.currentUser.fullName;
    // this.Request.requestDate = new Date(this.today).toLocaleString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {

    this.getAllEntries();
    this.getLocationMaster();
    this.getAPIManufacturerlist();
    this.getAPIlist();
    this.getdocumentlist();
    this.getGradelist();
    this.getCountryList();
    // }
    // else
    //  this.router.navigate(["/unauthorized"]);
  }


  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  getloc(loc) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }
 
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
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.filterAPI = null;
    this.filterlocation = null;
    this.filterstatus = null;
    this.filterrequest = null;

  }
  countrylist: any[] = [];
  getCountryList() {
    this.httpService.get(APIURLS.BR_MASTER_COUNTRY_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.countrylist = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.countrylist = [];
    });
  }

  location(id) {
    let loc = this.locationList.find(x => x.id == id);
    return loc ? loc.code : "";
  }
  RequestList:any[]=[];
  getAllEntries() {
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string;
    let formatedTOdate: string;
    var filterModel: any = {};
    if (this.from_date == '' || this.from_date == null) {
      formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
      this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
    }
    else {
      let fd = new Date(this.from_date);
      formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
        ("00" + fd.getDate()).slice(-2);
      this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

    }

    if (this.to_date == '' || this.to_date == null) {
      formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
        ("00" + td.getDate()).slice(-2);
      this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
    }
    else {
      let ed = new Date(this.to_date);
      formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
        ("00" + ed.getDate()).slice(-2);
      this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

    }
    filterModel.apiName = this.filterAPI;
    filterModel.requestNo = this.filterrequest;
    filterModel.status = this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_RA_REQUEST_GET_BY_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        // if(this.filterstatus==null)
        // {
        //   let user=this.currentUser.employeeId+'-'+this.currentUser.fullName;
        //   this.RequestList=data.filter(x=>x.pendingWith==user);
        //   this.RequestList.reverse();
        // }
        // else
        // {
          this.RequestList = data;
          this.RequestList.reverse();
       // }
      
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.RequestList = [];
    });

  }
  AddDoc:boolean;
  checkdoc(docs)
  {
    let temp=this.selectedDocuments.find(x=>x.id==15);
    return temp ? this.AddDoc=true:this.AddDoc=false;
  }
  getAPI(id)
  {
      let temp=this.apiList.find(x=>x.id==id);
      return temp ?temp.name:'';
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
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  apiList:any[]=[];
  getAPIlist() {
    this.httpService.get(APIURLS.BR_MASTER_API_MASTER_API).then((data: any) => {
      if (data.length > 0) {
        this.apiList = data;
       
      }
    }).catch(error => {
      this.isLoading = false;
      this.apiList = [];
    });
  }
  APIManufacturerList:any[]=[];
  getAPIManufacturerlist() {
    this.httpService.get(APIURLS.BR_MASTER_API_MANUFACTURER_API).then((data: any) => {
      if (data.length > 0) {
        this.APIManufacturerList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.APIManufacturerList = [];
    });
  }
  GradeList:any[]=[];
  getGradelist() {
    this.httpService.get(APIURLS.BR_MASTER_RA_GRADE_API).then((data: any) => {
      if (data.length > 0) {
        this.GradeList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.GradeList = [];
    });
  }
  DocumentList:any[]=[];
  DocumentList1:any[]=[];
  getdocumentlist() {
    this.httpService.get(APIURLS.BR_MASTER_DOCUMENTS_API).then((data: any) => {
      if (data.length > 0) {
        this.DocumentList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.DocumentList = [];
    });
  }

  currentUser: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }

  resetForm() {
    this.Request = {} as RaRequest;
    this.comments = "";
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
  onItemSelect(item: any) {
    // debugger;
    let temp=this.selectedDocuments.find(x=>x.id==15);
    return temp ? this.AddDoc=true:this.AddDoc=false;

  }
  onItemDeSelect(item: any) {
    // debugger;
    //  console.log(item);

  }
  onSelectAll(items: any) {
    //debugger;
    //  console.log(items);

  }
  onDeSelectAll(items: any) {

  }
  //Approverslist: WorkFlowApprovers[] = [];
  Aprlpriority: number;
  view: boolean = false;
 
  empId: string;
  dmfquery:boolean;
  attachments: any[] = [];
  onClickNewRequest(isedit: boolean, Request: RaRequest, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.Review=false;
    this.resetForm();
   // this.Approverslist = [];
    this.view = false;
    this.selectedDocuments=[];
    this.providedDocuments=[];
    this.fileslist=[];
    this.attachments=[];
    this.dmfquery=false;
    this.AddDoc=false;
    this.approver=null;
    //this.getApproversList(Request);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    if (isedit) {
      //   this.getApproversList(Request);
      //this.getApproversList(Request);
      this.Request = Object.assign({}, Request);
      //this.Request.sharedOn=this.today.toLocaleString();
      if (this.Request.attachments != null || this.Request.attachments != undefined) {
        this.attachments = this.Request.attachments.split(',');
      }
      var docList = this.Request.documentRequired ? this.Request.documentRequired.split(',') : [];
      this.selectedDocuments= this.DocumentList.filter(s => docList.includes(s.id.toString()));
      let temp=docList.find(x=>x=='9');
      if(temp != undefined || temp != null)
      {
          this.dmfquery=true;
      }
      var pdocList = this.Request.documentShared ? this.Request.documentShared.split(',') : [];
      this.Request.additionalDoc?pdocList.push(this.Request.additionalDoc):null;     
      this.providedDocuments= this.DocumentList.filter(s => pdocList.includes(s.id.toString()));
      this.DocumentList1=this.DocumentList.filter(o1 => docList.some(o2 => o1.id === +o2));
      let temp1=this.DocumentList1.find(x=>x.id==15);
      temp1 ? this.AddDoc=true:this.AddDoc=false;
    }
    else  if (value=='Review') {
      this.Review=true;
      //   this.getApproversList(Request);
      //this.getApproversList(Request);
      this.Request = Object.assign({}, Request);
      //this.Request.sharedOn=this.today.toLocaleString();
      if (this.Request.attachments != null || this.Request.attachments != undefined) {
        this.attachments = this.Request.attachments.split(',');
      }
      var docList = this.Request.documentRequired ? this.Request.documentRequired.split(',') : [];
      this.selectedDocuments= this.DocumentList.filter(s => docList.includes(s.id.toString()));
      let temp=docList.find(x=>x=='9');
      if(temp != undefined || temp != null)
      {
          this.dmfquery=true;
      }
      var pdocList = this.Request.documentShared ? this.Request.documentShared.split(',') : [];
      this.Request.additionalDoc?pdocList.push(this.Request.additionalDoc):null;     
      this.providedDocuments= this.DocumentList.filter(s => pdocList.includes(s.id.toString()));
      this.DocumentList1=this.DocumentList.filter(o1 => docList.some(o2 => o1.id === +o2));
      let temp1=this.DocumentList1.find(x=>x.id==15);
      temp1 ? this.AddDoc=true:this.AddDoc=false;
    }
    else {
      //this.Request = Object.assign({}, Request);
      this.Request = {} as RaRequest;
      this.Request.requestedBy=this.currentUser.employeeId+'-'+this.currentUser.fullName;
      // this.Request.requestDate = new Date(this.today).toLocaleString();
      // var docList = this.Request.documentRequired ? this.Request.documentRequired.split(',') : [];
      // this.selectedDocuments= this.DocumentList.filter(s => docList.includes(s.id));
      // var pdocList = this.Request.documentShared ? this.Request.documentShared.split(',') : [];
      // this.providedDocuments= this.DocumentList.filter(s => pdocList.includes(s.id));
    }
    if (isprint) {
      jQuery("#printModal").modal('show');
    }
    else {

      jQuery('#myModal').modal('show');
      if (value == "View") {
        this.view = true;

      }


    }
  }

  isValid: boolean = false;
  validatedForm: boolean = true;

  onSaveEntry(status) {
    this.errMsg = "";
    let connection: any;
   
      if (!this.isEdit) {
        this.Request.createdBy = this.currentUser.employeeId;
        this.Request.documentRequired= this.selectedDocuments.map(x => x.id).join();
       // this.Request.documentShared= this.selectedDocuments.map(x => x.id).join();
       // this.Request.createdOn = new Date().toLocaleString();
        this.Request.status = 'Submitted';
        this.Request.lastApprover='No';
        if (this.fileslist != null || this.fileslist != undefined) {
          // let file:any='';         
          let file: any = this.fileslist[0];
          for (let i = 1; i < this.fileslist.length; i++) {
            file = this.fileslist[i] + ',' + file;
          }
          this.Request.attachments = file;
  
        }
        this.Request.pendingWith=this.approver;
        connection = this.httpService.post(APIURLS.BR_RA_REQUEST_INSERT_API, this.Request);
      }
      else
      {
        this.Request.documentShared= this.providedDocuments.map(x => x.id).join();
       // this.Request.modifiedBy = this.currentUser.employeeId;
        if(this.selectedDocuments.length==this.providedDocuments.length)
        {
            this.Request.status='Closed';
            this.Request.pendingWith='No';
        }
        else
        {
            this.Request.status='Pending';
            this.Request.pendingWith=this.currentUser.employeeId+'-'+this.currentUser.fullName;
        }
        
        this.Request.lastApprover=this.currentUser.employeeId+'-'+this.currentUser.fullName;
        this.Request.sharedBy =this.currentUser.employeeId;
        connection = this.httpService.put(APIURLS.BR_RA_REQUEST_INSERT_API, this.Request.id,this.Request);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Request saved successfully!';
          jQuery("#saveModal").modal('show');  
          if(this.isEdit)
          {
              this.sendMail('Ra_Provide',this.Request);
          }   
          else 
          {
            this.id=data.requestNo;
              this.uploadfile();
              this.sendPendingMail('Ra_Approve',data);
          }    
          this.getAllEntries();
          this.resetForm();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Saving Request..';
      });
    


  }
  onApprove()
  {
    this.errMsg = "";
    let connection: any;
   
     
        this.Request.documentShared= this.providedDocuments.map(x => x.id).join();
        this.Request.modifiedBy = this.currentUser.employeeId; 
        this.Request.status='Pending';
        this.Request.pendingWith='77704-Kusuma Devi .G';
        this.Request.lastApprover=this.currentUser.employeeId+'-'+this.currentUser.fullName;
       // this.Request.modifiedOn = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_RA_REQUEST_INSERT_API, this.Request.id,this.Request);
      
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Request approved successfully!';
          jQuery("#saveModal").modal('show'); 
          this.sendPendingMail('Ra_Request',this.Request);
          this.getAllEntries();
          this.resetForm();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Saving Request..';
      });
    


  }
  onReject()
  {
    this.errMsg = "";
    let connection: any;
   
     
        this.Request.documentShared= this.providedDocuments.map(x => x.id).join();
        this.Request.modifiedBy = this.currentUser.employeeId; 
        this.Request.status='Rejected';
        this.Request.pendingWith='No';
        this.Request.lastApprover=this.currentUser.employeeId+'-'+this.currentUser.fullName;
        //this.Request.modifiedOn = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_RA_REQUEST_INSERT_API, this.Request.id,this.Request);
      
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Request rejected successfully!';
          jQuery("#saveModal").modal('show'); 
          this.sendMail('Ra_Reject',this.Request);
          this.getAllEntries();
          this.resetForm();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Saving Request..';
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
 
  exportList: any[];
  exportAsXLSX(): void {
    this.exportList=[];
    let index=0;
    this.RequestList.forEach(item => {
      index=index+1;
      var doclist:any;
      var docreq=item.documentRequired.split(',');
        for(let i=0;i<docreq.length;i++)
        {
          let temp=this.DocumentList.find(x=>x.id==+docreq[0]);
            {
              if(temp != null || temp != undefined)
              {
                  doclist=temp.name;
              }  
            }
          for(let j=1;j<docreq.length;j++)
          {
            let doc=this.DocumentList.find(x=>x.id==+docreq[i]);
            if(doc != null || doc != undefined)
            {
                doclist=doc.name+','+doclist;
            } 
          }                       
        }
        var sdoclist:any;
        if(item.documentShared != null || item.documentShared!=undefined)
        {
          var sdocreq=item.documentShared.split(',');
          for(let i=0;i<sdocreq.length;i++)
          {
            let temp=this.DocumentList.find(x=>x.id==+sdocreq[0]);
            {
              if(temp != null || temp != undefined)
              {
                  sdoclist=temp.name;
              }  
            }
            for(let j=1;j<sdocreq.length;j++)
            {
              let sdoc=this.DocumentList.find(x=>x.id==+sdocreq[i]);
              if(sdoc != null || sdoc != undefined)
              {
                  sdoclist=sdoc.name+','+doclist;
              } 
            }  
          }
        }
        
      let exportItem={
        "SNo":index,
      //  "RequestNo":item.requestNo,
        "RequestedBy":item.requestedBy,
        "RequestedDate":item.requestDate?this.getFormatedDateTime(item.requestDate):'',
        "API Name":item.apiName,
        "Grade":item.grade,
        "API Manufacturer":item.apiManufacturer,
        "Manufacturing Site":item.manufacturingSite,
        "Documents Required":doclist,
        "Product being filed":item.product,
        "Country":this.countrylist.find(x=>x.land1==item.country).landx,
        "Purpose":item.purpose,
        //"Document path":item.documentPath,
        "DMF version reference":item.dmfVersion,
        "Document Shared":sdoclist,
        "DMF Query Document":item.dmfQueryDoc,
        "Shared on":item.sharedOn?this.getFormatedDateTime(item.sharedOn):'',
        "Remarks":item.remarks,
        "Status":item.status,
      }
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, 'API_Requests_Report');
  }
  
  sendMail(type, Request: RaRequest) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_RA_PROVIDE_EMAIL_API, type, Request);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });

  }

  sendPendingMail(type, Request: RaRequest) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_RA_REQUEST_EMAIL_API, type, Request);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });

  }

  fileToUpload: File | null = null;
  File: File | null = null;
  name: string;
  files: File[] = []
  fileslist: any[] = [];
  handleFileInput(files: FileList) {
    this.errMsg1 = "";
    this.File = files[0];
    // this.files=[];
    for (var i = 0; i < files.length; i++) {
      this.files.push(files[i]);
      this.fileslist.push(files[i].name);
    }    
    this.reset();
  }


  reset() {
    if (this.myInputVariable != null || this.myInputVariable != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }
  id: string;
  uploadfile() {
    // debugger;
    // this.id='VM001';
    this.formData = new FormData();
    for (var i = 0; i < this.files.length; i++) {
      this.formData.append('files', this.files[i]);
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

  removefile(name) {
    const index = this.fileslist.indexOf(name);
    this.fileslist.splice(index, 1);
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


}
