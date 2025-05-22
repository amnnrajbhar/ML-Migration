import { AuthData } from '../../auth/auth.model'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Location } from '../../masters/employee/location.model';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

import { stringify } from 'querystring';
import { saveAs } from 'file-saver';
declare var require: any;
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
//import { NPDRequest } from './NPDRequest.model';
// import { Transactions } from '../eMicro/ItemCodeCreation/transactions.model';
// import { WorkFlowApprovers } from '../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { ExcelService } from '../../shared/excel-service';
//import { NPDRequestHistory } from '../../MedicalServices/NPDRequestHistory/NPDRequestHistory.model';
//import { WorkFlowApprovers } from '../../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { NPDRequest } from '../NPDRequest/NPDRequest.model';
import { MediServiceBrand } from '../../MedicalServices/MediServiceBrand/MediServiceBrand.model';
import { MediServiceRequestHistory } from '../../MedicalServices/MediServiceRequestHistory/MediServiceRequestHistory.model';
import { NPDCMD } from '../NPDRequest/NPDCmddetails.model';
import { NPDCQA } from '../NPDRequest/NPDCqadetails.model';
import { NPDDIST } from '../NPDRequest/NPDDistdetails.model';
import { NPDHOD } from '../NPDRequest/NPDHoddetails.model';
import { NPDIPR } from '../NPDRequest/NPDIprdetails.model';
import { NPDMED } from '../NPDRequest/NPDMeddetails.model';
import { NPDRND } from '../NPDRequest/NPDRnddetails.model';
import { NPDSCM } from '../NPDRequest/NPDScmdetails.model';
import { NPDSTRATEGIC } from '../NPDRequest/NPDStrategicdetails.model';
import { NPDBrands } from '../NPDRequest/NPDBrands.model';

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient,HttpClientModule } from '@angular/common/http';
//import { MediServiceBrand } from '../MediServiceBrand/MediServiceBrand.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;

@ViewChild('myInput', { static: false }) myInputVariable: ElementRef;


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

    filterProduct:string=null;
    filterBrand:string=null;

    NPDRequestmodel = {} as NPDRequest;
    NPDCmdmodel={} as NPDCMD;
    NPDCqamodel={} as NPDCQA;
    NPDDistmodel={} as NPDDIST;
    NPDHodmodel={} as NPDHOD;
    NPDIprmodel={} as NPDIPR;
    NPDMedmodel={} as NPDMED;
    NPDRndmodel={} as NPDRND;
    NPDScmmodel={} as NPDSCM;
    NPDStrategicmodel={} as NPDSTRATEGIC;
    NPDBrandsModel={} as NPDBrands;


    NPDRequestlist: NPDRequest[] = [];
    // ItemCodeExtensionlist:ItemCodeExtension[]=[];
    materialtype: string;
    filterMaterialCode: string = null;
    filterstatus: string = null;
    filterlocation: string = null;
    filterrequest: string = null;
    filterplace: string = null;
    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;
    //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

    NPDRequestFilter: NPDRequest[] = [];
    NPDRequestsearchlist: NPDRequest[] = [];

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


    MedHead:string='Manjula  Suresh';
    MedHeadList:any[]=[];
    Reviewer:string=null;
    ReviewerList:any[]=[];
    MediRequestFilter:any[]=[];
    Approves:any;
    Comments: string;

    storeData: any;
    jsonData: any;
    fileUploaded: File;
    worksheet: any;
  inprocess: number;
  completed: number;
  rejected: number;

    //NPDRequestmodeldata = {} as ItemCodeExtension;

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
      private http: HttpClient,private datePipe: DatePipe,private excelService :ExcelService) { pdfMake.vfs = pdfFonts.pdfMake.vfs;}

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
      this.filterlocation = this.currentUser.baselocation.toString();
      var chkaccess = this.appService.validateUrlBasedAccess(this.path);
      // if (chkaccess == true) {
        this.Approves='Approve';   
      this.filterReport();
      this.getLocationMaster();
      this.getBrandList();
      this.GetMedHeadList();
      this.GetApprovers();
      this.getbase64image();
      
      // }
      // else
      //  this.router.navigate(["/unauthorized"]);
    }

   

  
    BrandList: MediServiceBrand[] = [];
    getBrandList() {
      this.httpService.get(APIURLS.BR_MED_SERVICE_BRAND_API).then((data: any) => {
        if (data.length > 0) {
          this.BrandList = data;
          let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
          this.BrandList.sort((a, b) => { return collator.compare(a.brandDesc, b.brandDesc) });

        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.BrandList = [];
      });

    }

    locationAllList: any[] = [[]];
    getLocation(id) {
      let temp = this.locationList.find(e => e.id == id);
      return temp ? temp.code : '';
    }
    getloc(loc) {
      let loccode = loc.keyValue.split('~');
      return loccode ? loccode[0] : '';
    }
   
    statuslist: any[] = [
      { id: 1, name: 'Saved' },
      { id: 2, name: 'InProcess' },
      { id: 3, name: 'Rejected' },
      { id: 4, name: 'Completed' }
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
      this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
      this.to_date = this.today;
      this.filterlocation = null;
      this.filterstatus = null;
      this.filterrequest = null;
      this.filterplace = null;
      this.filterProduct=null;
      this.filterBrand=null;
      this.Approves=null;

    }

    NPDRequestFilter1:NPDRequest[]=[];
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

      filterModel.RequestNo = this.filterrequest;
      filterModel.Brand = this.filterBrand;
      filterModel.status = this.filterstatus;
      filterModel.Product = this.filterProduct;
      filterModel.employee=this.currentUser.employeeId;
      filterModel.FromDate = this.getFormatedDateTime(this.from_date);
      filterModel.ToDate = this.getFormatedDateTime(this.to_date);
      this.httpService.post(APIURLS.BR_NPD_REQUEST_FILTER_API, filterModel).then((data: any) => {
        if (data) {
          if (this.filterstatus == 'Pending') {
            this.NPDRequestFilter = data.filter(x => x.pendingApprover == this.currentUser.fullName);
            this.NPDRequestFilter.reverse();
          
            
          }
          else {
            this.NPDRequestFilter = data;
            this.NPDRequestFilter.reverse();
          }
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.NPDRequestFilter = [];
      });

    }
  

     GetRequest(value)
    {
    //   if(value=="Approve")
    //   {
    //     this.NPDRequestFilter=this.NPDRequestFilter1.filter(x=>x.reviewerAssignFlag==1 && x.stage=='4');
    //   }
    //   else if(value=="Assign")
    //   {
    //     this.NPDRequestFilter=this.NPDRequestFilter1.filter(x=>x.reviewerAssignFlag==0 && x.stage=='1' && x.approveType !='Rejected');
    //   }
    //   this.reInitDatatable();
     }

     dynamicArray: any = [];
     newDynamic: any = {};
     rowcount: number = 0;
     addRows() {
       this.rowcount = this.rowcount + 1;
       this.newDynamic = { id: this.rowcount, competitorBrand: "", competitorDetails: "", competitorExistingmarketshare: "", competitorMrp: "", stored: "0" };
       this.dynamicArray.push(this.newDynamic);
     }
     removeRows(item) {
       if (this.dynamicArray.length > 1) {
         const index = this.dynamicArray.indexOf(item);
         this.dynamicArray.splice(index, 1);
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
        }
      }).catch(error => {
        this.isLoading = false;
        this.locationList = [];
      });
    }
    Approver:string;
    Apprvr:boolean=false;
    ApproversList:any[]=[];
    GetApprovers()
    {
      this.httpService.get(APIURLS.BR_NPD_APPROVERS_GET_ALL_API).then((data: any) => {
        if (data.length > 0) {
          this.ApproversList = data;
          var temp=this.ApproversList.find(x=>x.approverId==this.currentUser.employeeId);
          this.Approver =  temp==undefined?'':temp.department;
          this.Apprvr=  temp==undefined?false:true;
        }
      }).catch(error => {
        this.isLoading = false;
        this.locationList = [];
      });
    }
    MedReviewer:boolean=false;
    GetReviewersList(empId) {
      this.httpService.post(APIURLS.BR_MED_HEAD_REVIEWERS_LIST_API,empId).then((data: any) => {
        if (data.length > 0) {
          this.ReviewerList = data;
          let temp=this.ReviewerList.find(x=>x.employeeId==this.currentUser.employeeId);
          temp ?this.MedReviewer=true:this.MedReviewer=false;
         // temp ? this.Approver ='Medical':'';
        }
      }).catch(error => {
        this.isLoading = false;
        this.ReviewerList = [];
      });
    }
    
    Head:boolean=false;
    GetMedHeadList() {
        this.httpService.get(APIURLS.BR_MED_HEAD_APPROVERS_LIST_API).then((data: any) => {
          if (data.length > 0) {
            this.MedHeadList = data;
            this.MedHead=this.MedHeadList.find(x=>x.employeeId=='93823').name;
            var temp=this.MedHeadList.find(x=>x.employeeId==this.currentUser.employeeId);
            temp ? this.Head=true:this.Head=false;
            if(this.Head)
            {
              this.Approves='Approve';
              this.GetRequest(this.Approves);
             
            }
            this.GetReviewersList('93823');
          }
        }).catch(error => {
          this.isLoading = false;
          this.MedHeadList = [];
        });
      }
    fileToUpload: File | null = null;
    File: File | null = null;
    name: string;
    files: File[] = []
    handleFileInput(files: FileList) {
      this.errMsg1 = "";
      this.File = files[0];
      // this.files=[];
      for (var i = 0; i < files.length; i++) {
        this.files.push(files[i]);
      }
      this.validateAttcahment();
      this.reset();
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
    uploadfile() {
      // debugger;
      // this.id='VM001';
      this.formData = new FormData();
      for (var i = 0; i < this.fileslist1.length; i++) {
        this.formData.append('files', this.fileslist1[i]);
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

    resetForm() {
      this.errMsg1 = "";
      this.NPDRequestmodel = {} as NPDRequest;
      this.NPDCmdmodel={} as NPDCMD;
      this.NPDCqamodel={} as NPDCQA;
      this.NPDDistmodel={} as NPDDIST;
      this.NPDHodmodel={} as NPDHOD;
      this.NPDIprmodel={} as NPDIPR;
      this.NPDMedmodel={} as NPDMED;
      this.NPDRndmodel={} as NPDRND;
      this.NPDScmmodel={} as NPDSCM;
      this.NPDStrategicmodel={} as NPDSTRATEGIC;
      this.NPDBrandsModel={} as NPDBrands;
      this.Comments = null;
    }


    transactionslist: any[] = [];
    gettransactions(reqNo) {
      this.httpService.getByParam(APIURLS.BR_MED_SERVICE_HISTORY_API, reqNo).then((data: any) => {
        this.isLoading = true;
        if (data.length > 0) {
          this.transactionslist = data;
         // var temp=this.transactionslist.find(x=>x.doneBy==this.currentUser.employeeId && x.transactionType=='Pending');
         // this.Approver ='Medical';
        }
        //this.reInitDatatable();
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.transactionslist = [];
      });

    }
    Approverslist: any[] = [];
    accountGroupList: any[] = [];
    Aprlpriority: number;
    ApprovingManager:any;
    ApprvrM:boolean=false;
    getApproversList(value) {
      this.httpService.post(APIURLS.BR_MED_SERVICE_REQUEST_APPROVER_API, value).then((data: any) => {
        this.isLoading = true;
        if (data.employeeId > 0) {
          this.ApprovingManager=data;
          this.Approverslist.push(data);
          this.Approverslist.forEach(element => {
            element.type="Approving Manager";
          });
          //this.transactionslist.reverse();
         // this.Approver='Approving Manager';
          let temp=this.Approverslist.find(x=>x.employeeId==this.currentUser.employeeId);
          this.Approver=temp ==undefined?this.Approver:'Approving Manager';
          //this.ApprvrM=temp ==undefined?false:true;
        }
        //this.reInitDatatable();
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.Approverslist = [];
      });
      
    }

  
    reset() {
      if (this.myInputVariable != null || this.myInputVariable != undefined) {
        this.myInputVariable.nativeElement.value = "";
      }
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

    empId: string;
    view: boolean = false;
    locationName: string;
    attachments: any[] = [];
    onUserActions(NPDRequest: NPDRequest) {
      this.resetForm();
      this.view = false;
      this.errMsg1 = "";
      this.errMsgPop="";
      this.transactionslist1 = [];
      this.transactionslist = [];
      this.Approverslist = [];
      this.ReviewerList = [];
      this.attachments = [];
      this.fileslist = [];
      this.files = [];
      this.fileslist1 = [];
      this.Reviewer=null;
      //this.reset();
      
      // this.dataForm.form.markAsPristine();
      // this.dataForm.form.markAsUntouched();
      // this.dataForm.form.updateValueAndValidity();
    //  if (isedit) {
        //   this.getApproversList(ItemCodeExtension);
        //this.getApproversList(NPDRequest);
        if (NPDRequest.attachments != null || NPDRequest.attachments != undefined) {
          this.attachments = NPDRequest.attachments.split(',');
        }
        this.dynamicArray=NPDRequest.brandsList;
        if(this.Head)
        {
          this.GetReviewersList(this.currentUser.employeeId);
        }
       this.Approver;
        this.NPDRequestmodel = Object.assign({}, NPDRequest);
        this.NPDHodmodel=Object.assign({},NPDRequest.hodModel);
        this.NPDIprmodel=Object.assign({},NPDRequest.iprModel);
        this.NPDCqamodel=Object.assign({},NPDRequest.cqaModel);
        this.NPDStrategicmodel=Object.assign({},NPDRequest.strategicModel);
        this.NPDScmmodel=Object.assign({},NPDRequest.supplyChainModel);
        this.NPDRndmodel=Object.assign({},NPDRequest.rndModel);
        this.NPDDistmodel=Object.assign({},NPDRequest.distModel);
        this.NPDCmdmodel=Object.assign({},NPDRequest.cmdModel);
        this.NPDMedmodel=Object.assign({},NPDRequest.medModel);
        this.NPDHodmodel.submitedDate= this.NPDHodmodel.submitedDate==null?this.today.toLocaleString():this.NPDHodmodel.submitedDate;
        this.NPDMedmodel.submitedDate= this.NPDMedmodel.submitedDate==null?this.today.toLocaleString():this.NPDMedmodel.submitedDate;
        this.NPDCqamodel.submitedDate= this.NPDCqamodel.submitedDate==null?this.today.toLocaleString():this.NPDCqamodel.submitedDate;
        this.NPDIprmodel.submitedDate= this.NPDIprmodel.submitedDate==null?this.today.toLocaleString():this.NPDIprmodel.submitedDate;
        this.NPDRndmodel.submitedDate= this.NPDRndmodel.submitedDate==null?this.today.toLocaleString():this.NPDRndmodel.submitedDate;
        this.NPDScmmodel.submitedDate= this.NPDScmmodel.submitedDate==null?this.today.toLocaleString():this.NPDScmmodel.submitedDate;
        this.NPDStrategicmodel.submitedDate= this.NPDStrategicmodel.submitedDate==null?this.today.toLocaleString():this.NPDStrategicmodel.submitedDate;
        this.NPDDistmodel.submitedDate= this.NPDDistmodel.submitedDate==null?this.today.toLocaleString():this.NPDDistmodel.submitedDate;
        this.NPDCmdmodel.submitedDate= this.NPDCmdmodel.submitedDate==null?this.today.toLocaleString():this.NPDCmdmodel.submitedDate;
        this.ShowHistory(this.NPDRequestmodel);
        this.getApproversList(this.NPDRequestmodel.requestedBy)
        this.gettransactions(this.NPDRequestmodel.requestNo);

     // }
    
     swal({
      title: "Are you sure to Print?",
      icon: "warning",
      buttons: [true, true],
    })
      .then((willsave) => {
        if (willsave) {
          this.downloadPdf1();
        }
      });
    
     
   
      
    }

    isValid: boolean = false;
    validatedForm: boolean = true;

    downloadFile(reqNo, value) {

      // console.log(filename);
      if (value.length > 0) {
        this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
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
    deletefile(item, name) {
      //let attach:any='';
      if (this.attachments.length > 1) {
        const index = this.attachments.indexOf(name);
        this.attachments.splice(index, 1);
      }
      let attach: any = this.attachments[0];
      for (let i = 1; i < this.attachments.length; i++) {
        attach = this.attachments[i] + ',' + attach;
      }
      item.attachements = attach;
      this.NPDRequestmodel.attachments = attach;
      let connection = this.httpService.put(APIURLS.BR_NPD_REQUEST_INSERT_API, item.id, item);
      connection.then((data: any) => {
        this.isLoadingPop = false;
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
    removefile(name) {
      const index = this.fileslist.indexOf(name);
      this.fileslist.splice(index, 1);
    }
  

 

  transactionslist1:MediServiceRequestHistory[]=[];
  Finalcopy:boolean=false;
  ShowHistory(data)
  {
    this.transactionslist1=[];
    this.NPDRequestmodel=data;
    this.httpService.getByParam(APIURLS.BR_MED_SERVICE_HISTORY_API, this.NPDRequestmodel.requestNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist1 = data;
        this.transactionslistCMD=this.transactionslist1.filter(x=>x.role=='CMD')
        this.transactionslistHODI=this.transactionslist1.filter(x=>x.role=='HOD' && x.approvalPriority==2)
        this.transactionslistHODF=this.transactionslist1.filter(x=>x.role=='HOD' && x.approvalPriority==4)
        this.transactionslistCQA=this.transactionslist1.filter(x=>x.role=='CQA')
        this.transactionslistIPR=this.transactionslist1.filter(x=>x.role=='IPR')
        this.transactionslistSCM=this.transactionslist1.filter(x=>x.role=='SupplyChain')
        this.transactionslistSM=this.transactionslist1.filter(x=>x.role=='Strategic')
        this.transactionslistDIST=this.transactionslist1.filter(x=>x.role=='Distribution')
        this.transactionslistMED=this.transactionslist1.filter(x=>x.role=='Medical')
        this.transactionslistRND=this.transactionslist1.filter(x=>x.role=='RND')
        var temp=this.transactionslist1.find(x=>x.role !='CMD' && x.transactionType =='Pending')
        this.Finalcopy= temp==undefined?true:false;
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.transactionslist1 = [];
    });    
   


   // jQuery("#HistoryModal").modal('show');
  }

  printModel:any={}
  printModelM:any={}
  printModelI:any={}
  printModelC:any={}
  printModelSC:any={}

  transactionslistCMD:any[]=[];
  transactionslistHODI:any[]=[];
  transactionslistHODF:any[]=[];
  transactionslistCQA:any[]=[];
  transactionslistIPR:any[]=[];
  transactionslistSCM:any[]=[];
  transactionslistSM:any[]=[];
  transactionslistDIST:any[]=[];
  transactionslistMED:any[]=[];
  transactionslistRND:any[]=[];



  image:string;
  getbase64image()
  {
    this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
    .subscribe(blob => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
        console.log('Image in Base64: ', event.target.result);
        this.image=event.target.result;
      };

    });
  }
  // downloadPdf()
  // {
  //   jQuery('#NPDRequestmodel').modal('show');
  // }
  downloadPdf()
  {
   
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName ="MICRO LABS LIMITED";
    var ReportName = "NEW PRODUCT DEVELOPMENT (NPD) FORM"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var year=now.getFullYear();
    var month=now.getMonth();
    var day=now.getDay();
    var jsDate =this.datePipe.transform(now,'dd/MM/yyyy');
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
        title:'NPD_Form_'+this.NPDRequestmodel.requestNo,
        },
      // watermark: { text: 'DRAFT', fontSize: 80 },
      watermark: { text: 'DRAFT', opacity: 0.2, fontSize:10 },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
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
      pageMargins: [40, 80, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
          
          columns: [
            {
            pageMargins: [40, 80, 40, 60],
            style: 'tableExample',
            color: '#444',
            table: {
              widths: [50, 400, 70],
              headerRows: 2,
              keepWithHeaderRows: 1,
              body: [
                [{rowSpan: 2,	image: logo,
                width: 50,
                  alignment: 'center'}
                , {text: OrganisationName, 	bold: true, fontSize: 13,color: 'black',alignment: 'center',height:'*'}, 
                {rowSpan: 2,text: ['Page ', { text: currentPage.toString() }, ' of ',
                 { text: pageCount.toString() }], bold: true, fontSize: 10,color: 'black', alignment: 'center'}],
                 [''
                  , {text: ReportName, bold: true, fontSize: 15,color: 'black', alignment: 'center',height:'*'},'']
               
              ]
            }
            }
          ],
          margin: 20
        }
      },
      footer: function(){
        return {

          columns: [
           
            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy +', '+'Printed On' + ": " + jsDate+'.'  }
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
  downloadPdf1()
  {
   
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName ="MICRO LABS LIMITED";
    var ReportName = "NEW PRODUCT DEVELOPMENT (NPD) FORM"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var year=now.getFullYear();
    var month=now.getMonth();
    var day=now.getDay();
    var jsDate =this.datePipe.transform(now,'dd/MM/yyyy');
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
        title:'NPD_Form_'+this.NPDRequestmodel.requestNo,
        },
      // watermark: { text: 'DRAFT', fontSize: 80 },
    //  watermark: { text: 'DRAFT', opacity: 0.2, fontSize:10 },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
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
      pageMargins: [40, 80, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
          
          columns: [
            {
            pageMargins: [40, 80, 40, 60],
            style: 'tableExample',
            color: '#444',
            table: {
              widths: [50, 400, 70],
              headerRows: 2,
              keepWithHeaderRows: 1,
              body: [
                [{rowSpan: 2,	image: logo,
                width: 50,
                  alignment: 'center'}
                , {text: OrganisationName, 	bold: true, fontSize: 13,color: 'black',alignment: 'center',height:'*'}, 
                {rowSpan: 2,text: ['Page ', { text: currentPage.toString() }, ' of ',
                 { text: pageCount.toString() }], bold: true, fontSize: 10,color: 'black', alignment: 'center'}],
                 [''
                  , {text: ReportName, bold: true, fontSize: 15,color: 'black', alignment: 'center',height:'*'},'']
               
              ]
            }
            }
          ],
          margin: 20
        }
      },
      footer: function(){
        return {

          columns: [
           
            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy +', '+'Printed On' + ": " + jsDate+'.'  }
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

  
 

  exportList:any[]=[];

exportAsXLSX(): void {
  this.exportList = [];
  //var templist=this.assessList.length;
  // debugger;
  for (var i = 0; i <= this.NPDRequestFilter.length - 1; i++) {

    var expListItem = {
      SlNo: (i + 1),
      Location: this.NPDRequestFilter[i].location,
      'Requested No':(this.NPDRequestFilter[i].requestNo),
      'Requested By':(this.NPDRequestFilter[i].requestedBy),
      'Requested Date':this.datePipe.transform(this.NPDRequestFilter[i].requestDate,'dd/MM/yyyy') ,
      'Division': this.NPDRequestFilter[i].division,
      'Dosage': this.NPDRequestFilter[i].dosageForm,
      'Generic Name': this.NPDRequestFilter[i].genericName,
      'Composition': this.NPDRequestFilter[i].composition,
      'Dosage Details': this.NPDRequestFilter[i].dosageDetails,
      'Final Medical Code':this.NPDRequestFilter[i].finalDocNo,
      'Medical Code Created Date':this.datePipe.transform(this.NPDRequestFilter[i].finalDocDate,'dd/MM/yyyy') ,
      'Pending Approver': this.NPDRequestFilter[i].pendingApprover,
      'Last Approver': this.NPDRequestFilter[i].lastApprover,
      Status: this.NPDRequestFilter[i].apprvrStatus,
    
    };

    this.exportList.push(expListItem);
    // console.log('export list'+this.exportList);
  }

  //this.exportList = {  }


  this.excelService.exportAsExcelFile(this.exportList, 'MediService_Report');
}

  filterReport() {
    this.inprocess=0;
    this.completed=0;
    this.rejected=0;
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

  
    filterModel.status = this.filterstatus;   
    filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    filterModel.ToDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_NPD_REQUEST_FILTER_API, filterModel).then((data: any) => {
      if (data) {
       
          this.NPDRequestFilter = data.reverse();
          this.inprocess=this.NPDRequestFilter.filter(x=>x.apprvrStatus=='InProcess').length;
          this.completed=this.NPDRequestFilter.filter(x=>x.apprvrStatus=='Completed').length;
          this.rejected=this.NPDRequestFilter.filter(x=>x.apprvrStatus=='Rejected').length;
          
        }
       
      
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.NPDRequestFilter = [];
    });

  }

}