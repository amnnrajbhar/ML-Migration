import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl, NgForm } from '@angular/forms';
import { GateOutwardMaster } from '../../gateentrymodels/gateoutwardm.model';
import swal from 'sweetalert';
import { GateEntryM } from '../../gateentry/gateentrym.model';
import { GateEntryD } from '../../gateentry/gateentryd.model';
import { GenericGateEntryM } from '../../gateentry/genericgateentrym.model';
import { RFCCreateGEPO } from '../../gateentry/rfccreategepo.model';
declare var jQuery: any;

@Component({
  selector: 'app-geinreturnablematdept',
  templateUrl: './geinreturnablematdept.component.html',
  styleUrls: ['./geinreturnablematdept.component.css']
})
export class GeinreturnablematdeptComponent implements OnInit {
  @ViewChild(NgForm) depForm: NgForm;

  searchTerm = new FormControl();
  currentUser: AuthData;
  tableWidget: any;
  path: string;
  fiscalYear: string;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isEdit: boolean;
  isLoading: boolean;
  isLoadingPop: boolean;
  isLoadingBAPI: boolean;
  gateEntryMModel = {} as GateEntryM;
  gateEntryMList: GateEntryM[] = [];
  gateEntryDList: GateEntryD[] = [];
  gateOutwardMModel = {} as GateOutwardMaster;
  gateOutwardMList: GateOutwardMaster[] = [];
  pO_No: string;
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  userName: string;
  iN_TIME: any;
  reason: string;
  gateNo: string;
  gONo: string;
  sendingPersonName: string;

  elementtype:string;

  maxdate:Date=new Date();
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }
  getCurrentFinancialYear() {
    var fiscalyear = "";
    var today = new Date();
    if ((today.getMonth() + 1) <= 3) {
      fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear().toString().substr(-2);
    } else {
      fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1).toString().substr(-2);
    }
    return fiscalyear
  }
  ngOnInit() {
    this.path = this.router.url;
    var today = new Date();
    this.elementtype="svg"
    this.fiscalYear = this.getCurrentFinancialYear();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.userName = this.currentUser.fullName;
      this.getGateList();
    //  this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getLocationById(this.currentUser.baselocation);
      this.getEmployeeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  locationGateList = [];
  selGateLocation: any;
  getGateList() {
    this.httpService.getById(APIURLS.BR_MASTER_LOCATIONGATE_MASTER_ANY_API, this.currentUser.baselocation).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.locationGateList = data;
        this.selGateLocation = null;
      }
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.locationGateList = [];
    });
  }
  employeeList = [];
  sendingPERSON: any;
  getEmployeeList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API,this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.employeeList = data.map((i) => { i.empfull = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation; return i; });
      }
    }).catch(error => {
      this.isLoading = false;
      this.employeeList = [];
    });
  }
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
      "destroy": true,
      "columnDefs": [
        { "orderable": false, "targets": 9 }
      ]
    });
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0)
  }
  locationName: string;
  plant: string;
  plantList:any[]=[];
  location:any[]=[];
  getLocationById(lId: number) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.location.push(data);
        this.locationName = data ? data.code + '-' + data.name : '';
        this.getPlantsassigned(this.currentUser.fkEmpId);
        this.plant=data.code;
        this.getAllGateEntries("load");  
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plant = '';
      this.locationName = '';
    });
  }
  baseloc={fkPlantId:0,code:'',name:''}
  getPlantsassigned(id)
  {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data;  
        let temp=this.plantList.find(x=>x.fkPlantId == this.currentUser.baselocation);
        if(temp == null || temp == undefined)
        {
          this.location.forEach(element => {
            this.baseloc.fkPlantId=element.id;
            this.baseloc.code=element.code;
            this.baseloc.name=element.name;
          });
          this.plantList.push(this.baseloc);
        }    
       this.plant=this.plantList.find(x=>x.fkPlantId == this.currentUser.baselocation).code;     
      // this.getAllGateEntries("load"); 
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  getFormatedInTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' + "00" + ":" +"00" + ":" +"00" ;
    return formateddate;
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
  //Search Filters
  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  deliveryModeList = [
    { id:0, name: 'In Person' },
    { id:1,name: 'Courier' },
    { id:2,name: 'Vehicle' }
  ]
  selectedModes: any = null;
  onItemDeSelect(item: any) {
  }
  onDeSelectAll(items: any) {
    this.selectedModes = [];
  }
  onSelectAll(items: any) {
    this.selectedModes = items;
  }
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.acknowledge = false;
    this.delete = false;
    this.fltrGINO = null;
    this.fltrInvoice = null;
    this.gIacknowledge = null;
    this.selectedModes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  acknowledge: boolean = false;
  delete: boolean = false;
  fltrGINO: string;
  fltrInvoice: string;
  gIacknowledge: any = null;
  getAllGateEntries(msg) {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.planT_ID = this.plant;
    genericGateEntryM.gI_TYPE = '2';
    genericGateEntryM.gI_NO = this.fltrGINO;
    genericGateEntryM.doC_NO = this.fltrInvoice;
    if (this.selectedModes != null) {
      let delmodes = null;
      this.selectedModes.forEach(mode => {
        delmodes = mode.name + ',' + delmodes;
      });
      genericGateEntryM.deliverymode = delmodes;
    }
    if (this.from_date != null)
      genericGateEntryM.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      genericGateEntryM.todate = this.getDateFormate(this.to_date);
    genericGateEntryM.isActive = this.delete ? '0' : '1';
    genericGateEntryM.ack = this.acknowledge ? '0' : '';
    genericGateEntryM.isack = this.gIacknowledge;
    this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_GETGEGATEPO_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.gateEntryMList = data;
        this.gateEntryMList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.gateEntryMList = [];
    });
    if (msg == 'print') {
      this.onGateEntryActions(true,this.gateEntryMModel,'print');
    }
  }
  keyPressNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
  isaction:string;
  isAcknowledge:boolean;

  intime:string;

  onGateEntryActions(isedit: boolean, gateEntryM:GateEntryM, action: string) {
    this.isEdit = isedit;
    this.isaction=action;
    this.resetForm();
    this.depForm.form.markAsPristine();
    this.depForm.form.markAsUntouched();
    this.depForm.form.updateValueAndValidity();
    if (isedit) {
      this.gateEntryMModel=Object.assign({},gateEntryM);
      var genericGateEntryM = {} as GenericGateEntryM;
      genericGateEntryM.gI_TYPE = '2';
      genericGateEntryM.gI_NO = gateEntryM.gO_NO;
      this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
        if (data) {
          // this.gateOutwardMModel = data[0];
          Object.assign(this.gateOutwardMModel,data[0]);
          this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
          this.sendingPersonName = this.sendingPERSON.firstName + ' ' + this.sendingPERSON.middleName + ' ' + this.sendingPERSON.lastName;
       
          this.intime=this.getFormatedInTime(this.gateEntryMModel.iN_TIME);
        }
      }).catch(() => {
        this.gateOutwardMModel = {} as GateOutwardMaster;
      });
      this.userName =  gateEntryM.persoN_NAME;
      this.isAcknowledge= gateEntryM.receiveD_DATE!=null?true:false;
      this.httpService.getById(APIURLS.BR_MASTER_GATEINWARDD_ANY_API, gateEntryM.id).then((data: any) => {
        if (data.length > 0) {
          this.gateEntryDList = data;
        }
      }).catch(() => {
        this.gateEntryDList = [];
      });
    }
    if (action == 'print') {
      jQuery("#printModal").modal('show');
    }
    else {
      jQuery("#depModal").modal('show');
    }
  }

  resetForm(): void {
    this.entryDateTime = new Date();
    this.iN_TIME = new Date();
    this.userName = this.currentUser.fullName;
    this.gateOutwardMModel = {} as GateOutwardMaster;
    this.gateEntryDList = [];
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    this.gONo = '';
    this.selGateLocation = null;
    this.isLoadingBAPI = false;
    this.isLoadingPop = false;
    this.sendingPersonName = '';
    this.isAcknowledge=false;
  }
  departmentAcknowledge() {   
    swal({
      title: "Are you sure to submit?",
      icon: "warning",
      buttons: [true, true],
      dangerMode: false,
    })
      .then((willsave) => {
        if (willsave) {
          this.gateEntryMModel.receiveD_BY = this.currentUser.fullName;
          this.gateEntryMModel.receiveD_DATE = this.getFormatedDateTime(this.gateEntryMModel.receiveD_DATE);
          let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel.id, this.gateEntryMModel);
          connection.then((data: any) => {
            this.isLoadingPop = true;
            if (data == 200 || data.id > 0) {
              jQuery('#depModal').modal('hide');
              this.errMsgModalPop = 'Gate entry acknowledged successfully!';
              swal(this.errMsgModalPop, {
                icon: "success",
              }).then((x) => {
                if (x) {
                  this.getAllGateEntries('print');
                }
              });
              this.isLoadingPop = false;
            }
          }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error Acknowledge Return Materials...';
          });
        }
      });
  }
  deleteEntry() {
    swal({
      title: "Are you sure to Cancel Entry?",
      icon: "warning",
      buttons: [true,true],
      dangerMode: false,
    })
    .then((willsave) => {
      if (willsave) {
        this.deleteGateEntry();
      }
    });
  }
  deleteGateEntry() {
    this.gateEntryMModel.deL_FLG = 'Y';
    this.gateEntryMModel.deL_REASON = this.reason;
    this.gateEntryMModel.deleteD_BY = this.currentUser.employeeId;
    //this.gateEntryMModel.deleteD_DATE = this.getFormatedDateTime(new Date());
    this.gateEntryMModel.isActive = false;
    let connection = this.httpService.post(APIURLS.BR_RFCBAPI_DELETEGEPO_API, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      jQuery('#depModal').modal('hide');
      if (data != null) {
        if (data.type == 'Y') {
          this.deactivateGateEntry();
          this.errMsgModalPop ='Cancelled successfully!';
          swal(this.errMsgModalPop, {
            icon: "success",
          }).then((willsave) => {
            if (willsave) {
              this.getAllGateEntries('delete');
            }
          });
        }
        else {
          this.errMsgModalPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
          swal(this.errMsgModalPop, {
            icon: "error",
          }).then((willsave) => {
            if (willsave) {
              this.getAllGateEntries('delete');
            }
          });
        }
      }
      else {
        this.errMsgModalPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
        swal(this.errMsgModalPop, {
          icon: "error",
        }).then((willsave) => {
          if (willsave) {
            this.getAllGateEntries('delete');
          }
        });
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.errMsgPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
      this.isLoadingPop = false;
    });
  }

  deactivateGateEntry() {
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel.id, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this. onUpdateOutwardSTO();
        this.isLoadingPop = false;
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Delete Returnable Materials...';
    });
  }
  onUpdateOutwardSTO() {
    if (this.gateEntryMModel.deL_FLG == 'Y')
      this.gateOutwardMModel.gO_FLG = 'N';
    else
      this.gateOutwardMModel.gO_FLG = 'Y';
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEOUTWARDM_POST_API, this.gateOutwardMModel.id, this.gateOutwardMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error in Gate Outward Header';
    });
  }
  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Gate Entry - Returnable Material</title>
          <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
          <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
        </head>
        <body onload="window.print();window.close()">
        <table class="report-container">
          <thead class="report-header">
            <tr>
              <th class="report-header-cell">
                <div class="header-info">
                  Print Date: ${new Date().toLocaleDateString('en-GB')}  Printed By: ${this.currentUser.fullName}
                </div>
              </th>
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


  validate() {
    var intime = new Date(this.gateEntryMModel.iN_TIME);
    var recdate =new Date(this.gateEntryMModel.receiveD_DATE); 
    if (recdate < intime) {
      swal({
        title: "Message",
        text: "Received Date should be greater than or equal to Inward Date & time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
      this.gateEntryMModel.receiveD_DATE = '';
    }      
  }
}
