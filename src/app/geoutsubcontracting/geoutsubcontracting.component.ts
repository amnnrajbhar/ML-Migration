import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import * as _ from "lodash";
import { Router, ActivatedRoute } from '@angular/router';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { AuthData } from '../auth/auth.model';
import { GateOutwardMaster } from '../gateentrymodels/gateoutwardm.model';
import { GateOutwardD } from '../gateentrymodels/gateoutwardd.model';
import { FormControl } from '@angular/forms';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
import swal from 'sweetalert';
import { RFCSCMaterial } from './rfcscmaterial.model';
import { RFCSCHeader } from './rfcscheader.model';
import { RFCSCInputs } from './rfcscinputs.model';
declare var $: any;

@Component({
  selector: 'app-geoutsubcontracting',
  templateUrl: './geoutsubcontracting.html',
  styleUrls: ['./geoutsubcontracting.component.css']
})
export class GEOutSubContractingComponent implements OnInit {
 @ViewChild('userForm', { static: false }) userForm: any;

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
  gateOutwardMModel = {} as GateOutwardMaster;
  gateOutwardDModel = {} as GateOutwardD;
  gateEntryHeaderModel = {} as RFCSCHeader;
  gateOutwardMList: GateOutwardMaster[] = [];
  gateOutwardDList: GateOutwardD[] = [];
  pO_No: string;
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  userName: string;
  reason: string;
  gONO: string;
  sendingPersonName:string;

  elementtype:string;

  mindate:Date=new Date();
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

    this.elementtype="svg";
    
    this.fiscalYear = this.getCurrentFinancialYear();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.userName = this.currentUser.firstName;
      this.getLocationById(this.currentUser.baselocation);
      this.getPlantsassigned(this.currentUser.fkEmpId);
      //this.getGateList();
      this.getLocationList();
      this.getDepartmentList();
      this.getEmployeeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
      "destroy": true,
      "columnDefs": [
        { "orderable": false, "targets": 8 }
      ]
    });
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }

  geSCInputsModel = {} as RFCSCInputs;
  gateEntryMaterial: RFCSCMaterial[] = [];
  getInvoiceInfoFromBAPI(geSCInputs: RFCSCInputs) {
    this.resetForm();
    this.geSCInputsModel = geSCInputs;
    this.geSCInputsModel.werks = this.plant;//'ML12';
    if (geSCInputs.mblnr == null || geSCInputs.mblnr == '') {
      swal({
        title: "Message",
        text: "Please enter Material DOC Number",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      this.isLoadingBAPI = true;
      let existInvoice = false;
      var genericGateEntryM = {} as GenericGateEntryM;
      genericGateEntryM.planT_ID = this.plant;
      genericGateEntryM.gI_TYPE = '3';
      genericGateEntryM.isActive = '1';
      genericGateEntryM.doC_NO = geSCInputs.mblnr;
      this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
        if (data) {
          existInvoice = data.length > 0 ? true : false;
          if (!existInvoice) {
            this.httpService.post(APIURLS.BR_RFCBAPI_GETGE_SC_INFO_API, this.geSCInputsModel).then((data: any) => {
              if (data.length > 0) {
                if (data[0].type == 'S') {
                  this.gateEntryHeaderModel = data[0];
                  this.gateOutwardMModel.doC_NO = this.geSCInputsModel.mblnr;
                  this.gateOutwardMModel.doC_DATE = this.gateEntryHeaderModel.mD_BLDAT;
                  this.gateOutwardMModel.destinatioN_NM = this.gateEntryHeaderModel.mD_VENDOR;
                  //this.gateEntryMaterial = this.gateEntryHeaderModel.geSubContITEMS;
                  this.gateOutwardMModel.dC_NO = this.gateEntryHeaderModel.geSubContITEMS[0].ebeln;
                  this.gateEntryHeaderModel.geSubContITEMS.forEach(mtrl => {
                    let gateEntryMaterial ={} as RFCSCMaterial;
                    gateEntryMaterial=mtrl;
                    gateEntryMaterial.sendingQty=mtrl.menge;                    
                    this.gateEntryMaterial.push(gateEntryMaterial);
                  });
                  this.isLoadingBAPI = false;
                }
                else {
                  swal({
                    title: "Message",
                    text: data[0].message,
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                  });
                }
              }
              this.isLoadingBAPI = false;
            }).catch(error => {
              this.isLoadingBAPI = false;
              this.gateEntryHeaderModel = {} as RFCSCHeader;
              this.gateEntryMaterial = [];
            });
          }
          else {
            swal({
              title: "Message",
              text: 'Entered Material DOC Number is already exists.Please enter other Material DOC Number',
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            });
          }
        }
        this.isLoadingBAPI = false;
      }).catch(error => {
        this.errMsgPop = "Error to retrive Material DOC Number Details";
      });
    }
  }

  locationName: string;
  plant: string;
  getLocationById(lId: number) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.plant = data.code;
        this.locationName = data ? data.code + '-' + data.name : '';
        this.loadGateOutwardList('load');
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plant = '';
      this.locationName = '';
    });
  }
  plantList:any[]=[];
  location:any[]=[]; 
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
       this.getApproversDetails(this.plant);    
      }
     
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  locationGateList = [];
  selGateLocation: any;
  getGateList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATIONGATE_MASTER_ANY_API, this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.locationGateList = data;
        this.selGateLocation = this.locationGateList.find(x => x.gateNo == '1');
        // this.selGateLocation = null;
        // this.selGateLocation = this.locationGateList.find(x => x.gateNo == 'G1');
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.locationGateList = [];
    });
  }
  locationList: any;
  selDestination: any;
  getLocationList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data) {
        this.locationList = data;
        this.selDestination = null;
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  employeeList = [];
  sendingPERSON: any;
  getEmployeeList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API,this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.employeeList = data.map((i) => { i.empfull = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation; return i; });
        this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.currentUser.employeeId);
      }
    }).catch(error => {
      this.isLoading = false;
      this.employeeList = [];
    });
  }
  departmentList = [];
  sendingDEPTNAME: any;
  getDepartmentList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data;
        this.sendingDEPTNAME=this.departmentList.find(x => x.id == this.currentUser.fK_Department);
      }
    }).catch(error => {
      this.isLoading = false;
      this.departmentList = [];
    });
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
    this.from_date= new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.delete = false;
    this.fltrGONO = null;
    this.fltrInvoiceNo = null;
    this.fltrDCNO=null;
    this.selectedModes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  delete: boolean = false;
  fltrGONO: string;
  fltrInvoiceNo: string;
  fltrDCNO: string;
  loadGateOutwardList(action) {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.planT_ID = this.plant;
    genericGateEntryM.gI_TYPE = '3';
    if (this.from_date != null)
      genericGateEntryM.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      genericGateEntryM.todate = this.getDateFormate(this.to_date);
    genericGateEntryM.isActive = this.delete ? '0' : '1';
    genericGateEntryM.gI_NO = this.fltrGONO;
    genericGateEntryM.doC_NO = this.fltrInvoiceNo;
    genericGateEntryM.ack = this.fltrDCNO;
    if (this.selectedModes != null) {
      let delmodes = null;
      this.selectedModes.forEach(mode => {
        delmodes = mode.name + ',' + delmodes;
      });
      genericGateEntryM.deliverymode = delmodes;
    }
    this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.gateOutwardMList = data;
        this.gateOutwardMList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.gateOutwardMList = [];
    });
    if (action == 'print') {
      this.onGateEntryActions(true,this.gateOutwardMModel,true);
    }
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  getGoNO(gONO: string):string{
    return gONO!=null?gONO.toString().padStart(4, '0').toString():'';
  }

  onGateEntryActions(isedit: boolean, gateOutwardM: GateOutwardMaster, isprint: boolean) {
    this.isEdit = isedit;
    this.userForm.form.markAsPristine();
    this.userForm.form.markAsUntouched();
    this.userForm.form.updateValueAndValidity();
    this.resetForm();
    if (isedit) {
      this.gateOutwardMModel = Object.assign({},gateOutwardM);
      this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
      this.sendingPersonName = this.gateOutwardMModel.sendingPersonName;
      // this.sendingPersonName = this.sendingPERSON.firstName + ' ' + this.sendingPERSON.middleName + ' ' + this.sendingPERSON.lastName;
      this.sendingDEPTNAME = this.departmentList.find(x => x.name == this.gateOutwardMModel.sendinG_DEPT_NM);
      this.fiscalYear = this.gateOutwardMModel.fiN_YEAR;
      var loc = this.plantList.find(x=>x.code == this.gateOutwardMModel.planT_ID)
      this.locationName=loc.code +'-'+loc.name;
      this.httpService.getById(APIURLS.BR_MASTER_GATEOUTWARDD_ANY_API, gateOutwardM.id).then((data: any) => {
        if (data) {
          data.forEach(mtrl => {
            var geMaterialModel = {} as RFCSCMaterial;
            geMaterialModel.matnr = mtrl.iteM_CODE;
            geMaterialModel.maktx = mtrl.iteM_DESC;
            geMaterialModel.baugr = mtrl.iteM_CODE_P;
            geMaterialModel.maktX_P = mtrl.iteM_DESC_P;
            geMaterialModel.meins = mtrl.uom;
            geMaterialModel.noc = mtrl.nO_OF_CASES;
            geMaterialModel.menge = mtrl.qty;
            geMaterialModel.sendingQty=mtrl.qty;
            this.gateEntryMaterial.push(geMaterialModel);
          });
        }
      }).catch(error => {
        this.gateEntryMaterial = [];
      });
    }
    if (isprint) {
      jQuery("#printModal").modal('show');
    }
    else {
      jQuery("#myModal").modal('show');
    }
  }

  resetForm(): void {
    this.entryDateTime = new Date();
    this.gateOutwardMModel = {} as GateOutwardMaster;
    this.gateOutwardDModel = {} as GateOutwardD;
    this.gateOutwardDList = [];
    this.geSCInputsModel = {} as RFCSCInputs;
    this.gateEntryHeaderModel = {} as RFCSCHeader;
    this.gateEntryMaterial = [];
    //this.selGateLocation = null;
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    this.selDestination = null;
    // this.sendingPERSON = null;
    // this.sendingDEPTNAME = null;
    this.isLoadingPop = false;
    this.isLoadingBAPI=false;
  }

  validateQTY(event, mat) {
    var sendingQty: number = +event.target.value;
    var actQTY: number = +mat.menge;
     if (actQTY < sendingQty) {
      swal({
        title: "Message",
        text: "Entered Quantity (" + sendingQty + ") should not be grater than Actual PO quantity (" + actQTY + ")",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
      event.target.value =mat.menge;
    }
    else if (sendingQty<=0) {
      swal({
        title: "Message",
        text: "Sending Quantity (" + sendingQty + ") should be Greater than Zero",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
      event.target.value = mat.menge;
     
    }
  }


  onSaveEntry() {
    if (!this.isEdit) {
      swal({
        title: "Are you sure to submit?",
        icon: "warning",
        buttons: [true,true],
        dangerMode: false,
      })
      .then((willsave) => {
        if (willsave) {
          this.insertGateOutstock();
        }
      });
    }
    else {
      swal({
        title: "Are you sure to Cancel Entry?",
        icon: "warning",
        buttons: [true,true],
        dangerMode: false,
      })
      .then((willsave) => {
        if (willsave) {
          this.deactivateGateEntry();
        }
      });
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
  Approverslist: any[] = [];
  getApproversDetails(code) {
    this.httpService.getByParam(APIURLS.BR_GET_VMS_APPROVERS, code+',Gate' + "," + this.currentUser.employeeId).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.Approverslist = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  insertGateOutstock() {
    this.gateOutwardMModel.mandt = '450'
    this.gateOutwardMModel.fiN_YEAR = this.fiscalYear;
    this.gateOutwardMModel.planT_ID = this.plant
    this.gateOutwardMModel.gO_GATENO = "1";
    this.gateOutwardMModel.gO_TYPE = '3';
    this.gateOutwardMModel.dC_DATE = this.getDateFormate(this.gateOutwardMModel.dC_DATE);
    this.gateOutwardMModel.gO_DATE = this.getDateFormate(new Date());
    this.gateOutwardMModel.sendinG_PERSON = this.sendingPERSON.employeeId;
    this.gateOutwardMModel.sendinG_DEPT_NM = this.sendingDEPTNAME.name;
    this.gateOutwardMModel.exP_OUT_TIME = this.getFormatedDateTime(this.gateOutwardMModel.exP_OUT_TIME);
    this.gateOutwardMModel.createD_BY = this.currentUser.employeeId;
    this.gateOutwardMModel.createD_DATE = this.getFormatedDateTime(new Date());
    this.gateOutwardMModel.courier_Date = this.gateOutwardMModel.courier_Date?this.getDateFormate(this.gateOutwardMModel.doC_DATE):null;
    this.gateOutwardMModel.isActive = true;
    this.gateOutwardMModel.status = 'Pending For Approval';
    this.gateOutwardMModel.pendingWith = this.Approverslist[0].approverId;
    //Insert Material
    var index = 0;
    let lstgateOutwardD: GateOutwardD[] = [];
    this.gateEntryMaterial.forEach(mtrl => {
      index = index + 1;
      this.gateOutwardDModel = {} as GateOutwardD;
      this.gateOutwardDModel.mandt = '450'
      this.gateOutwardDModel.fiN_YEAR = this.fiscalYear;
      this.gateOutwardDModel.planT_ID = this.plant
      this.gateOutwardDModel.gO_GATENO = "1";
      this.gateOutwardDModel.iteM_NO = index;
      this.gateOutwardDModel.iteM_CODE = mtrl.matnr;
      this.gateOutwardDModel.iteM_DESC = mtrl.maktx;
      this.gateOutwardDModel.pO_NO=mtrl.ebeln;
      this.gateOutwardDModel.iteM_CODE_P = mtrl.baugr;
      this.gateOutwardDModel.iteM_DESC_P = mtrl.maktX_P;

      this.gateOutwardDModel.uom = mtrl.meins;
      this.gateOutwardDModel.nO_OF_CASES = +mtrl.noc;

      this.gateOutwardDModel.qty = +mtrl.sendingQty;

      this.gateOutwardDModel.createD_BY = this.currentUser.employeeId;
      this.gateOutwardDModel.createD_DATE = this.getFormatedDateTime(new Date());
      this.gateOutwardDModel.isActive = true;
      lstgateOutwardD.push(this.gateOutwardDModel);
    });
    this.gateOutwardMModel.gateOutwardDViewModel = lstgateOutwardD;
    let connection = this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_POST_API, this.gateOutwardMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.gateOutwardMModel=Object.assign({},data);
        jQuery('#myModal').modal('hide');
        this.errMsgModalPop = 'Saved successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.loadGateOutwardList('print');
          }
        });
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.errMsgPop = 'Error saving Header...';
      this.isLoadingPop = false;
    });
  }
  deactivateGateEntry() {
    this.gateOutwardMModel.deL_FLG = 'Y';
    this.gateOutwardMModel.deL_REASON = this.reason;
    this.gateOutwardMModel.deleteD_BY = this.currentUser.employeeId;
    this.gateOutwardMModel.deleteD_DATE = this.getFormatedDateTime(new Date());
    this.gateOutwardMModel.isActive = false;
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEOUTWARDM_POST_API, this.gateOutwardMModel.id, this.gateOutwardMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        jQuery('#myModal').modal('hide');
        this.errMsgModalPop = 'Cancelled successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.loadGateOutwardList('delete');
          }
        });
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Delete Gate Entry...';
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
          <title>Outward - Sub Contracting</title>
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
}
