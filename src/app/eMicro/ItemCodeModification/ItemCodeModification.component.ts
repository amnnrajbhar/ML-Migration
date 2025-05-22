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

import { ItemCodeModification } from '../ItemCodeModification/ItemCodeModification.model';
import { MaterialType } from '../../masters/material/materialtype.model';
import { Transactions } from '../ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { ItemCodeRequest } from '../ItemCodeCreation/ItemCodeCreation.model';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { saveAs } from 'file-saver';
declare var require: any;

@Component({
  selector: 'app-ItemCodeModification',
  templateUrl: './ItemCodeModification.component.html',
  styleUrls: ['./ItemCodeModification.component.css']
})
export class ItemCodeModificationComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
  
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

  
  path: string = '';
  locationList: any[] = [[]];
  locationList1: any[] = [[]];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;

  ItemCodeModificationModel = {} as ItemCodeModification;

  ItemCodeModificationlist: ItemCodeModification[] = [];
  materialtype: string;
  comments: string;
  filterMaterialCode: string = null;
  filterstatus: string = "Pending";
  filterlocation: string = null;
  filterrequest: string = null;
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  ItemCodeModificationFilter: ItemCodeModification[] = [];
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


  storeData: any;
  jsonData: any;
  fileUploaded: File;
  worksheet: any;

  ItemCodeModificationModeldata = {} as ItemCodeModification;

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

  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.emailid = this.currentUser.email;
    this.userid = this.currentUser.employeeId;
    this.ItemCodeModificationModel.requestedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName
    this.requestdate = new Date(this.today);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {

    this.getAllEntries();
    this.getLocationMaster();
    this.getMaterialMasterList();
    this.getMaterialGroupList();

    // this.filterstatus = "Pending";
   // this.getItemCodes();
    // }
    // else
    //  this.router.navigate(["/unauthorized"]);
  }


  locationAllList: any[] = [[]];
 
 
  statuslist: any[] = [
    { id: 1, name: 'Created' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'Pending' },
    { id: 4, name: 'Rejected' },
    { id: 5, name: 'Completed' },
    { id: 6, name: 'Deleted' }
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

  approverstatuslist: any[] = [
    { id: 1, name: 'Reviewed' },
    { id: 2, name: 'Reviewed' },
    { id: 3, name: 'Reviewed' },
    { id: 4, name: 'Approved' },
    { id: 5, name: 'Approved' },
    { id: 6, name: 'Created' },
    { id: 7, name: 'Closed' }
  ];
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.filterMaterialCode = null;
    this.filterlocation = null;
    this.filterstatus = null;
    this.filterrequest = null;

  }

  getloc(loc) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }

  // ********************* GetApprovers() NOT USED *********************
  // getApprovers(code)
  // {
    //code=this.SelectedCode[0].sapCodeNo;
    // this.httpService.getByParam(APIURLS.BR_ITEMCODE_MODIFICATION_FILTER_API, code).then((data: any) => {
    //   if (data.length>0) {
    //     this.Approverslist = data;
    //     let matData=this.Approverslist[0];
    //     let itemData=matData.itemCodeRequest;
    //     this.ItemCodeModificationModel.materialGroupId=itemData.materialGroupId;
    //     this.ItemCodeModificationModel.materialTypeId=itemData.materialTypeId;
    //     this.ItemCodeModificationModel.materialShortName=itemData.materialShortName;
    //     this.ItemCodeModificationModel.materialLongName=itemData.materialLongName;

    //     this.Approverslist = this.Approverslist.filter(x => x.isActive == true);
    //     let empid = this.currentUser.employeeId
    //     let empName = this.currentUser.fullName;
      
    //     let Appr1 = this.Approverslist.find(x => x.priority == 1 && x.approverId == empid ||
    //       x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
    //       x.parllelApprover3 == empid || x.parllelApprover4 == empid);

    //     if (Appr1 != null || Appr1 != undefined) {
    //       this.Approverid1 = Appr1.approverId;
    //       this.Approver1 = true;
    //       this.Review = true;
    //       this.Aprlpriority = Appr1.priority;
    //     }
    //     let Appr2 = this.Approverslist.find(x => x.priority == 2 && x.approverId == empid ||
    //       x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
    //       x.parllelApprover3 == empid || x.parllelApprover4 == empid);
    //     if (Appr2 != null || Appr2 != undefined) {
    //       this.Approver1 = true;
    //       this.Approver2 = true;
    //       this.Approverid2 = Appr2.approverId;
    //       this.Review = true;
    //       this.Aprlpriority = Appr2.priority;
    //     }
    //     let Appr3 = this.Approverslist.find(x => x.approverId == empid ||
    //       x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
    //       x.parllelApprover3 == empid || x.parllelApprover4 == empid);
    //     if (Appr3 != null || Appr3 != undefined) {
    //       this.Approver1 = true;
    //       this.Approver2 = true;
    //       this.Aprlpriority = Appr3.priority;
    //       this.Review = true;
    //       if (Appr3.role == 'Creator') {
    //         this.Creator = true;
    //         this.creatorid = true;
    //         // this.ItemCodeRequestModel.sapCreatedBy = empid + '-'+empName;
    //         // this.ItemCodeRequestModel.sapCreationDate = new Date().toLocaleString();
    //         //this.serializer = true;
    //       }
    //       else if (Appr3.role == 'Closure') {
    //         this.Creator = true;
    //         this.Closure = true
    //       }
    //       else {
    //         this.Closure = false;
    //       }
    //     }


    //     this.transactionslist.forEach((ad) => {
    //       let temp = this.Approverslist.find(x => x.priority == ad.approvalPriority);
    //       if (temp != undefined) {
    //         if (ad.transactionType == 1) {
    //           if (temp.role == 'Creator') {
    //             ad.status = 'Completed'
    //           }
    //           else if (temp.role == 'Closure') {
    //             ad.status = 'Closed'
    //           }
    //           else if (temp.role == 'Approver') {
    //             ad.status = 'Approved'
    //           }
    //           else {
    //             ad.status = this.approverstatuslist.find(x => x.id == ad.approvalPriority).name;
    //           }
    //         }
    //         else if (ad.transactionType == 3 || ad.transactionType == 4) {
    //           ad.status = ad.transactionType == 3 ? "Reverted To Previous Approver " : " Reverted to Initiator";
    //         }
    //         else {
    //           ad.status = ad.transactionType == 2 ? "Rejected" : "";
    //         }
    //         ad.approverName = temp.approverName;
    //         ad.department = temp.department;
    //         ad.role = temp.role;
    //       }


    //     });
    //     this.Approverslist.forEach((ad) => {
    //       let temp1 = this.transactionslist.find(x => x.approvalPriority == ad.priority);
    //       if (temp1 == undefined) {
    //         let trans = {} as Transactions;
    //         trans.doneBy = ad.approverId;
    //         trans.approvalPriority = ad.priority;
    //         trans.approverName = ad.approverName;
    //         trans.department = ad.department;
    //         trans.role = ad.role;
    //         this.transactionslist.push(trans);
    //       }

    //     });
    //     this.Approverslist = this.Approverslist.sort((a, b) => {
    //       if (a.priority > b.priority) return 1;
    //       if (a.priority < b.priority) return -1;
    //       return 0;
    //     });
    //     this.transactionslist = this.transactionslist.sort((a, b) => {
    //       if (a.doneOn > b.doneOn) return 1;
    //       if (a.doneOn < b.doneOn) return -1;
    //       return 0;
    //     });

    //   }
    //   else {
    //     this.Approverslist = [];
    //     swal({
    //       title: "Message",
    //       text: "Approvers are not defined for this item",
    //       icon: "warning",
    //       dangerMode: false,
    //       buttons: [false, true]
    //     });
    //   }
        
    //   this.isLoading = false;
    // }).catch(error => {
    //   console.log(error);
    //   this.isLoading = false;
    //   this.Approverslist = [];
    // });
  // }

  isApproversLoading: boolean = false;
  currentApprover: WorkFlowApprovers;
  getApproverslatest(code, newFlag: boolean)
  {
    this.isApproversLoading = true;
    let srcstr = code + "," + this.Plantcode;

    this.httpService.getByParam(APIURLS.BR_ITEMCODE_MODIFICATION_CODE_API, srcstr).then((data: any) => {
      if (data.length > 0) {
        this.Approverslist = data;
        let matData = this.Approverslist[0];
        let itemData = matData.materialMaster;
        this.ItemCodeModificationModel.materialGroupId = itemData.materialGroupId;
        this.ItemCodeModificationModel.materialTypeId = itemData.materialTypeId;
        this.ItemCodeModificationModel.materialShortName = itemData.materialShortName;
        this.ItemCodeModificationModel.materialLongName = itemData.materialLongName;

        this.Approverslist = this.Approverslist.filter(x => x.isActive == true);
        let empid = this.currentUser.employeeId;

        this.Approverslist = this.Approverslist.sort((a, b) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });

        this.transactionslist = this.transactionslist.sort((a, b) => {
          if (a.approvalPriority > b.approvalPriority) return 1;
          if (a.approvalPriority < b.approvalPriority) return -1;
          return 0;
        });

        this.transactionslist = this.transactionslist.sort((a, b) => {
          if (a.doneOn > b.doneOn) return 1;
          if (a.doneOn < b.doneOn) return -1;
          return 0;
        });
      
        // let Appr1 = this.Approverslist.find(x => x.priority == 1 && x.approverId == empid ||
        //   x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
        //   x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        // if (Appr1 != null || Appr1 != undefined) {
        //   this.Approverid1 = Appr1.approverId;
        //   this.Approver1 = true;
        //   this.Review = true;
        //   this.Aprlpriority = Appr1.priority;
        // }

        // let Appr2 = this.Approverslist.find(x => x.priority == 2 && x.approverId == empid ||
        //   x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
        //   x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        // if (Appr2 != null || Appr2 != undefined) {
        //   this.Approver1 = true;
        //   this.Approver2 = true;
        //   this.Approverid2 = Appr2.approverId;
        //   this.Review = true;
        //   this.Aprlpriority = Appr2.priority;
        // }

        // let Appr3 = this.Approverslist.find(x => x.approverId == empid ||
        //   x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
        //   x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        // if (Appr3 != null || Appr3 != undefined) {
        //   this.Approver1 = true;
        //   this.Approver2 = true;
        //   this.Aprlpriority = Appr3.priority;
        //   this.Review = true;
        //   if (Appr3.role == 'Creator') {
        //     this.Creator = true;
        //     this.creatorid = true;
        //     // this.ItemCodeRequestModel.sapCreatedBy = empid + '-'+empName;
        //     // this.ItemCodeRequestModel.sapCreationDate = new Date().toLocaleString();
        //     //this.serializer = true;
        //   }
        //   else if (Appr3.role == 'Closure') {
        //     this.Creator = true;
        //     this.Closure = true
        //   }
        //   else {
        //     this.Closure = false;
        //   }
        // }

        this.transactionslist.forEach(ad => {
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
            ad.department = temp.department;
            ad.role = temp.role;
          }
        });

        // console.log(this.transactionslist);

        // this.Approverslist.forEach(ad => {
        //   let temp1 = this.transactionslist.find(x => x.approvalPriority == ad.priority);
        //   if (temp1 == undefined) {
        //     let trans = {} as Transactions;
        //     trans.doneBy = ad.approverId;
        //     trans.approvalPriority = ad.priority;
        //     trans.approverName = ad.approverName;
        //     trans.department = ad.department;
        //     trans.role = ad.role;
        //     this.transactionslist.push(trans);
            
        //     if (!currentApprover) {
        //       currentApprover = ad;
        //     }
        //   }
        // });

        // console.log(this.Approverslist);
        // console.log(currentApprover);

        if (this.ItemCodeModificationModel.status == "Created" || this.ItemCodeModificationModel.status == "Reverted to initiator") {
          // Add initiator's transaction entry
          let transaction = {} as Transactions;
          transaction.doneBy = this.transactionslist[0].doneBy;
          transaction.approvalPriority = this.transactionslist[0].approvalPriority;
          transaction.approverName = this.transactionslist[0].approverName;
          transaction.department = this.transactionslist[0].department;
          transaction.role = this.transactionslist[0].role;
          this.transactionslist.push(transaction);

          this.currentApprover = {
            keyValue: this.Approverslist[0].keyvalue,
            approverId: empid,
            priority: 0,
            role: 'Initiator',
            processId: 1
          } as WorkFlowApprovers;

          // Add the approver transaction entries
          this.Approverslist.forEach(element => {
            let transaction = {
              doneBy: element.approverId,
              approvalPriority: element.priority,
              approverName: element.approverName,
              department: element.department,
              role: element.role
            } as Transactions;
            
            this.transactionslist.push(transaction);
          });
        } else {
          console.log(this.transactionslist);
          console.log(this.Approverslist);

          let pendingPriority = !this.ItemCodeModificationModel.status ? 1 : this.ItemCodeModificationModel.status == "Reverted" ? this.transactionslist[this.transactionslist.length - 1].approvalPriority - 1 
            : this.transactionslist[this.transactionslist.length - 1].approvalPriority + 1;

          this.Approverslist.forEach(element => {
            if (element.priority >= pendingPriority) {
              let transaction = {
                doneBy: element.approverId,
                approvalPriority: element.priority,
                approverName: element.approverName,
                department: element.department,
                role: element.role,
                parallelApprover1: element.parllelApprover1,
                parallelApprover2: element.parllelApprover2,
                parallelApprover3: element.parllelApprover3,
                parallelApprover4: element.parllelApprover4,
                parallelApprover5: element.parllelApprover5
              } as Transactions;
              
              this.transactionslist.push(transaction);
            }

            if (element.priority == pendingPriority) {
              this.currentApprover = element;
            }
          });
          console.log(pendingPriority);
          console.log(this.currentApprover);
          console.log(this.transactionslist);
        }

        if (this.currentApprover && !newFlag) {
          if (this.currentApprover.priority == 1 && (this.currentApprover.approverId == empid || this.currentApprover.parllelApprover1 == empid || this.currentApprover.parllelApprover2 == empid 
            || this.currentApprover.parllelApprover3 == empid || this.currentApprover.parllelApprover4 == empid || this.currentApprover.parllelApprover5 == empid)) {
            this.Approverid1 = this.currentApprover.approverId;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = this.currentApprover.priority;
          } else if (this.currentApprover.priority == 2 && (this.currentApprover.approverId == empid || this.currentApprover.parllelApprover1 == empid || this.currentApprover.parllelApprover2 == empid 
            || this.currentApprover.parllelApprover3 == empid || this.currentApprover.parllelApprover4 == empid || this.currentApprover.parllelApprover5 == empid)) {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Approverid2 = this.currentApprover.approverId;
            this.Review = true;
            this.Aprlpriority = this.currentApprover.priority;
          } else if (this.currentApprover.approverId == empid || this.currentApprover.parllelApprover1 == empid || this.currentApprover.parllelApprover2 == empid 
            || this.currentApprover.parllelApprover3 == empid || this.currentApprover.parllelApprover4 == empid || this.currentApprover.parllelApprover5 == empid) {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Aprlpriority = this.currentApprover.priority;
            this.Review = true;
          }
          
          if (this.currentApprover.role == 'Creator') {
            this.Creator = true;
            this.creatorid = true;
          }
          else if (this.currentApprover.role == 'Closure') {
            console.log(this.currentApprover);
            this.Creator = true;
            this.Closure = true;
          }
          else {
            this.Closure = false;
          }
        }
      }
      else {
        this.Approverslist = [];
        swal({
          title: "Message",
          text: "Approvers are not defined for this item",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }
        
      this.isLoading = false;
      this.isApproversLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.isApproversLoading = false;
      this.Approverslist = [];
    });
  }

  ItemcodesList:any[]=[];
  ItemcodesListCon:any[]=[];
  SelectedCode:any;
  getItemCodes()
  {    
    this.httpService.get(APIURLS.BR_ITEMCODE_REQUEST_GET_CODES_API).then((data: any) => {
      if (data.length > 0) {
        this.ItemcodesList = data;
        this.ItemcodesListCon = data.map((x) => { x.name1 = x.sapCodeNo + '-' + x.materialShortName;x.sapCodeNo=x.sapCodeNo; return x; });
       
      }
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.ItemcodesList = [];
    });
  }
  dropdownSettings = {
    singleSelection: true,
    idField: 'sapCodeNo',
    textField: 'name1',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  onItemSelect(item: any) {
    // debugger;

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
    filterModel.materialCode = this.filterMaterialCode;
    filterModel.requestNo = this.filterrequest;
    filterModel.status = this.filterstatus == 'Pending' ? 'Created,InProcess,Submitted,Reverted,Reverted to initiator' : this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_ITEMCODE_MODIFICATION_FILTER_DATA_API, filterModel).then((data: any) => {
      if (data) {
        this.ItemCodeModificationFilter = data;
        this.ItemCodeModificationFilter.reverse();
        console.log(this.ItemCodeModificationFilter);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.ItemCodeModificationFilter = [];
    });

  }

  Plantcode:string;
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.Plantcode=this.locationList.find(x=>x.id== this.currentUser.baselocation).code;

      }
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.locationList = [];
    });
  }

  currentUser: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }

  resetForm() {
    this.ItemCodeModificationModel = {} as ItemCodeModification;
    this.SelectedCode = null;
    this.comments = "";
    this.ItemCodeModificationModel.requestedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName
    this.requestdate = new Date(this.today);
   // this.ItemCodeModificationModel.requestDate=this.requestdate.toLocaleString();
  }
  materialList: MaterialType[] = [];
  getMaterialMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_MATERIALTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.materialList = data.filter(x => x.isActive);
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.materialList = [];
    });
  }
  
  materialgroupList: any[] = []
  getMaterialGroupList() {
    this.httpService.get(APIURLS.BR_MASTER_MATERIAL_GROUP_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.materialgroupList = data;
        //this.materialgroupList = data.filter(x => x.stxt != null);
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.materialgroupList = [];
    });
  }

  transactionslist: Transactions[] = [];
  isTransactionsLoading: boolean = false;
  gettransactions(request, isEdit: boolean) {
    this.isTransactionsLoading = true;
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, request.requestNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        this.transactionslist = this.transactionslist.filter(x => x.processType == 'Item Code Modification' && x.approvalPriority != null);
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      
      if (isEdit || (!isEdit && request.requestNo)) {
        this.getApproverslatest(request.itemCode, false);
      }      
      
      this.isLoading = false;
      this.isTransactionsLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.isTransactionsLoading = false;
      this.transactionslist = [];
    });

  }

  Approverslist: any[] = [];
  creatorid:boolean;
  Aprlpriority: number;
  view: boolean = false;
  empId: string;
  onClickNewRequest(isedit: boolean, ItemCodeModification: ItemCodeModification, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.isLoadingPop = false;
    this.resetForm();
    this.files = [];
    this.fileslist = [];
    this.fileslist1 = [];
    this.SelectedCode = null;
    this.attachments = [];
    this.Approverslist = [];
    this.transactionslist = [];
    this.view = false;

    this.Review = false;
    this.Creator = false;
    this.Closure = false;
    this.SelectedCode = null;
    this.priority = null;
    this.comments = null;
    this.errMsgPop = "";

    if (ItemCodeModification) {
      this.gettransactions(ItemCodeModification, isedit);

      if (isedit) {
        if(ItemCodeModification.attachments != null || ItemCodeModification.attachments != undefined) {       
          this.attachments=ItemCodeModification.attachments.split(',');
        }
  
        this.attachments.filter(x=>x.name != null || undefined)
        this.SelectedCode=ItemCodeModification.itemCode;
  
        this.ItemCodeModificationModel = Object.assign({}, ItemCodeModification);
      }
      else {
        if(ItemCodeModification.requestNo != null || ItemCodeModification.requestNo != undefined) {
          if(ItemCodeModification.attachments != null || ItemCodeModification.attachments != undefined) {
            this.attachments=ItemCodeModification.attachments.split(',');
          }   
  
          this.SelectedCode=ItemCodeModification.itemCode;
        }    
  
        this.ItemCodeModificationModel = Object.assign({}, ItemCodeModification);
        this.ItemCodeModificationModel.requestedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
      }
    } else {
      this.ItemCodeModificationModel = {} as ItemCodeModification;
      this.ItemCodeModificationModel.requestedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
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
    if (this.Approverslist.length == 0) {
      swal({
        title: "Message",
        text: "Approvers are not defined for this type",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else
    {
      if (!this.isEdit) {
       // this.ItemCodeModificationModel.itemCode=this.SelectedCode[0].sapCodeNo;
       this.ItemCodeModificationModel.itemCode=this.SelectedCode;
        this.ItemCodeModificationModel.createdBy = this.currentUser.employeeId;
        // this.ItemCodeModificationModel.requestDate = new Date().toLocaleString();
        // this.ItemCodeModificationModel.createdOn = new Date().toLocaleString();
        this.ItemCodeModificationModel.lastApprover='No';
        if(this.fileslist!=null || this.fileslist != undefined)
        {
         // let file:any='';
         
            let file:any=this.fileslist[0];
            for(let i=1;i<this.fileslist.length;i++)
            {
             file=this.fileslist[i] + ',' + file; 
            } 
          this.ItemCodeModificationModel.attachments = file;
          
        }

        this.ItemCodeModificationModel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
        this.ItemCodeModificationModel.status = status == "Submit" ? "Submitted" : "Created";
        
        connection = this.httpService.post(APIURLS.BR_ITEMCODE_MODIFICATION_INSERT_API, this.ItemCodeModificationModel);
      }

      connection.then((data: any) => {
        this.isLoadingPop = true;
        if (data == 200 || data.id > 0) {
          this.id=data.requestNo;
          this.uploadfile();
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = status == 'Save' ? 'Request ' + ''+data.requestNo + ' saved successfully!' : 'Request ' + data.requestNo + ' Submitted Successfully!';
          jQuery("#saveModal").modal('show');
          if (status == 'Submit') {
            this.Inserttransactions(data, 0);
            this.sendPendingMail('MPending',data)
          }
          this.getAllEntries();
          this.resetForm();
        }
      }).catch(error => {
        console.log(error);
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Saving Request: ' + error;
      });
    }
  }

  onSubmitEntry(ItemCodeModification: ItemCodeModification) {
    this.ItemCodeModificationModel = {} as ItemCodeModification;
    this.ItemCodeModificationModel = Object.assign({}, ItemCodeModification);
    this.errMsg = "";
    this.ItemCodeModificationModel.modifiedBy = this.currentUser.employeeId;
    this.ItemCodeModificationModel.status = "Submitted";

    if(this.fileslist!=null || this.fileslist != undefined)
    {     
      for(let i=0;i<this.fileslist.length;i++) {
        this.ItemCodeModificationModel.attachments = this.ItemCodeModificationModel.attachments + ',' + this.fileslist[i]; 
      }
    }

    this.ItemCodeModificationModel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
    this.ItemCodeModificationModel.status = "Submitted";

    console.log(this.ItemCodeModificationModel);
    let connection = this.httpService.put(APIURLS.BR_ITEMCODE_MODIFICATION_INSERT_API, this.ItemCodeModificationModel.id, this.ItemCodeModificationModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.id=this.ItemCodeModificationModel.requestNo;
        this.uploadfile();
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Request ' + this.ItemCodeModificationModel.requestNo + ' Submitted Successfully!';
        jQuery("#saveModal").modal('show');
        this.getAllEntries();
        this.Inserttransactions(this.ItemCodeModificationModel, 0);
        this.resetForm();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Submitting Request ' + this.ItemCodeModificationModel.requestNo + ": " + error;
    });
  }
  Role:any;
  onreview(status) {
    this.errMsg = "";
    // let uid = this.currentUser.employeeId;
    if (status == "Rejected") {
      // let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
      //   || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.ItemCodeModificationModel.pendingApprover = '';
      this.priority = this.currentApprover.priority;
    }
    else {
      // let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
      //   || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.Role = this.currentApprover.role;
      this.ItemCodeModificationModel.pendingApprover = this.Approverslist.find(x => x.priority == this.currentApprover.priority + 1).approverId;
      this.priority = this.currentApprover.priority;
    }

    this.ItemCodeModificationModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeModificationModel.modifiedBy = this.currentUser.employeeId;
    this.ItemCodeModificationModel.status = status == "Rejected" ? status : status;

    console.log(this.ItemCodeModificationModel);
    console.log(this.priority);

    let connection = this.httpService.put(APIURLS.BR_ITEMCODE_MODIFICATION_INSERT_API, this.ItemCodeModificationModel.id, this.ItemCodeModificationModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');

        if(this.Role =="Approver")
        {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.ItemCodeModificationModel.requestNo + " " + status + " Successfully!" : "Request " + this.ItemCodeModificationModel.requestNo  + " Approved Successfully!";
        }
        else
        {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.ItemCodeModificationModel.requestNo + " " + status + " Successfully!" : "Request " + this.ItemCodeModificationModel.requestNo  + " Reviewed Successfully!";
        }
        jQuery("#saveModal").modal('show');
        let id = status == "Rejected" ? 2 : 1;
        if (status != "Rejected") {
          this.sendPendingMail("MPending", this.ItemCodeModificationModel)
        }
        this.sendMail(status, this.ItemCodeModificationModel)
        this.Inserttransactions(this.ItemCodeModificationModel, id)
        this.getAllEntries();
        this.resetForm();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = status == "Rejected" ? "Error Rejecting Request " + this.ItemCodeModificationModel.requestNo + ": " + error : "Error Reviewing Request " + this.ItemCodeModificationModel.requestNo + ": " + error;
    });
  }

  onRevertRequest(status) {
    this.errMsg = "";
    if (status == "ReverttoInitiator") {
      // let usid = this.currentUser.employeeId;
      // let user = this.Approverslist.find(x => x.approverId == usid || x.parllelApprover1 == usid || x.parllelApprover2 == usid
      //   || x.parllelApprover3 == usid || x.parllelApprover4 == usid);

      this.ItemCodeModificationModel.pendingApprover = this.ItemCodeModificationModel.createdBy;
      this.ItemCodeModificationModel.status = "Reverted to initiator";
      this.priority = this.currentApprover.priority;
    }
    else {
      // let uid = this.ItemCodeModificationModel.modifiedBy;
      // let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
      //   || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

      this.ItemCodeModificationModel.pendingApprover = this.Approverslist.find(x => x.priority == this.currentApprover.priority - 1).approverId;
      this.priority = this.currentApprover.priority;
      this.ItemCodeModificationModel.status = "Reverted";
    }

    this.ItemCodeModificationModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeModificationModel.modifiedBy = this.currentUser.employeeId;

    let connection = this.httpService.put(APIURLS.BR_ITEMCODE_MODIFICATION_INSERT_API, this.ItemCodeModificationModel.id, this.ItemCodeModificationModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request " + this.ItemCodeModificationModel.requestNo + " Reverted Successfully!";
        jQuery("#saveModal").modal('show');
        let id = status == "ReverttoInitiator" ? 4 : 3;
        this.sendMail(status, this.ItemCodeModificationModel)
        if (this.ItemCodeModificationModel.status != "Reverted to initiator") {
          this.sendPendingMail("MPending", this.ItemCodeModificationModel)
        }
        this.Inserttransactions(this.ItemCodeModificationModel, id)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Reverting Request " + this.ItemCodeModificationModel.requestNo + ": " + error;
    });
  }

  onCreate() {
    this.errMsg = "";
    // let uid = this.currentUser.employeeId;

    // let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
    //   || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

    let temp = this.Approverslist.find(x => x.priority == this.currentApprover.priority + 1);
    if (temp != null || temp != undefined) {
      this.ItemCodeModificationModel.pendingApprover = temp.approverId;
      this.ItemCodeModificationModel.status = "InProcess";
    }
    else {
      this.ItemCodeModificationModel.pendingApprover = "No";
      this.ItemCodeModificationModel.status = "Completed";
    }

    this.priority = this.currentApprover.priority;
    this.ItemCodeModificationModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeModificationModel.modifiedBy = this.currentUser.employeeId;

    let connection = this.httpService.put(APIURLS.BR_ITEMCODE_MODIFICATION_INSERT_API, this.ItemCodeModificationModel.id, this.ItemCodeModificationModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal("hide");
        this.errMsgPop1 = "Item Code Modified Successfully!";

        jQuery("#saveModal").modal("show");
        this.sendMail("Created", this.ItemCodeModificationModel);

        if (this.ItemCodeModificationModel.pendingApprover != "No") {
          this.sendPendingMail("MPending", this.ItemCodeModificationModel)
        }

        this.Inserttransactions(this.ItemCodeModificationModel, 1)
        this.getAllEntries();
        this.resetForm();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Modifying Item Code: " + error;
    });

  }
  priority: number;
  oncloserequest() {
    this.errMsg = "";

    this.ItemCodeModificationModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeModificationModel.modifiedBy = this.currentUser.employeeId;
    this.ItemCodeModificationModel.status = 'Completed';
    this.ItemCodeModificationModel.pendingApprover = 'No';
    this.priority = this.currentApprover.priority;

    let connection = this.httpService.put(APIURLS.BR_ITEMCODE_MODIFICATION_INSERT_API, this.ItemCodeModificationModel.id, this.ItemCodeModificationModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request " + this.ItemCodeModificationModel.requestNo + " Closed Successfully!";
        jQuery("#saveModal").modal('show');
        this.Inserttransactions(this.ItemCodeModificationModel, 1)
        this.sendMail("Created", this.ItemCodeModificationModel)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Closing Request: " + error;
    });
  }
  transactions = {} as Transactions;
  Inserttransactions(data, id) {
    this.errMsg = "";
    this.transactions.doneBy = this.currentUser.employeeId;
    this.transactions.requestNo = data.requestNo;
    this.transactions.comments = this.comments;
    this.transactions.approvalPriority = this.priority;
    this.transactions.transactionType = id;
    this.transactions.processType = "Item Code Modification";
    
    this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions).catch(error => {
      console.log(error);
    });
  }

  sendMail(type, ItemCodeModification: ItemCodeModification) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_ITEM_CODE_MOD_EMAIL_API, 'M' + type, ItemCodeModification);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error in sending mail: ' + error;
    });

  }

  sendPendingMail(type, ItemCodeModification: ItemCodeModification) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_ITEM_CODE_MOD_PENDING_EMAIL_API, type, ItemCodeModification);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error in sending mail: ' + error;
    });

  }

  attachments:any[]=[];
  fileToUpload: File | null = null;
  File: File | null = null;
  files:File[]=[]
  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;
  formData: FormData = new FormData();

  handleFileInput(files: FileList) {
    this.errMsg1 = "";
    this.File = files[0]; 
   // this.files=[];
    for  (var i =  0; i <files.length; i++)  {  
      this.files.push(files[i]);
    }     
    this.validateAttcahment();
    this.reset();
  }
  reset()
  {
    if(this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined )
    {
      this.myInputVariable.nativeElement.value = "";
    }   
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
    this.formData =  new  FormData();
    for  (var i =  0; i <  this.fileslist1.length; i++)  {  
      this.formData.append('files',this.fileslist1[i]);   
    } 
    let connection: any;   
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API,this.id,this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log('copied file to server')
        //this.imageFlag = true;
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error uploading file: ' + error;
    });

  }
  fileslist:any[]=[];
  fileslist1:File[]=[];
  validateAttcahment()
  {
    this.fileslist=[];
    if(this.attachments.length>0)
    {
      for(let i=0;i<this.attachments.length;i++)
      {
        for(let j=0;j<this.files.length;j++)
        {
          if(this.files[j].name == this.attachments[i])
          {
            
            swal({
              title: "Message",
              text: "file with name " + (this.files[j].name)+ " already Exists",
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            })
            this.files.splice(j,1);
          }
        }
      }
    }

    
    // this.formData =  new  FormData();
    for  (var i =  0; i <  this.files.length; i++)  {  
      //this.formData.append('files',this.files[i]);
      this.fileslist.push(this.files[i].name);
      this.fileslist1.push(this.files[i]);
    }
    //this.files=[];
      //this.errMsg1 = "File Uploaded Successfully";
        this.ReadAsBase64(this.File )
          .then(result => {
            this.fileToUpload = result;
          })
          .catch(err => this.errMsg1 = err);
  }

  downloadFile(reqNo,value) {
  
    // console.log(filename);
    if (value.length > 0) {
      this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find(s => s.id == id).name;
          if (data != undefined) {
        var FileSaver = require('file-saver');
        const imageFile = new File([data],value, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);


        }
      }).catch(error => {
        console.log(error);
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
  deletefile(item,name)
  {
    if (this.attachments.length > 1) {
      const index = this.attachments.indexOf(name);
      this.attachments.splice(index,1);
    }

    let attach:any=this.attachments[0];

    for(let i=1;i<this.attachments.length;i++)
    {
      attach=this.attachments[i] + ',' + attach;
    }

    item.attachments=attach;  
    this.ItemCodeModificationModel.attachments=attach; 

    let connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_POST_API, item.id,item);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {      
        swal({
          title: "Message",
          text: "File deleted successfully",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
      }
    }).catch(error => {
    console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = 'Error deleting file: ' + error;
    });
  }

  removefile(name)
  {
    const index = this.fileslist.indexOf(name);
    const index1 = this.files.indexOf(name);
    this.files.splice(index1,1);
    this.fileslist.splice(index,1);
  }
  downloadFile1(name) {
    // let temp=this.userIdRequestlist.find(x=>x.sid==id);
    // console.log(filename);
    if (this.fileslist.length > 0) {
      var data=this.fileslist1.find(x=>x.name==name);
          var FileSaver = require('file-saver');
          const imageFile = new File([data], name, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);
    }
  }
}
