import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { GateOutwardD } from '../gateentrymodels/gateoutwardd.model';
import { GateOutwardMaster } from '../gateentrymodels/gateoutwardm.model';
import { APIURLS } from '../shared/api-url';
import { HttpService } from '../shared/http-service';
import { GateEntryHeader } from '../gateentry/gateentryheader.model';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
import { RFCSTOHeader } from '../geoutstocktransfer/rfcstoheader.model';
import { RFCSTOInputs } from '../geoutstocktransfer/rfcstoinputs.model';
import { RFCSTOMaterial } from '../geoutstocktransfer/rfcstomaterial.model';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-geoutexciseinvoice',
  templateUrl: './geoutexciseinvoice.component.html',
  styleUrls: ['./geoutexciseinvoice.component.css']
})
export class GEOutExciseInvoiceComponent implements OnInit {
  @ViewChild('userForm') userForm: any;
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
  gateEntryHeaderModel = {} as RFCSTOHeader;
  gateOutwardMList: GateOutwardMaster[] = [];
  gateOutwardDList: GateOutwardD[] = [];
  pO_No: string;
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  reason: string;
  gateNo: string;
  invNO:string;
  sendingPersonName:string;
  mindate:Date=new Date();

  elementtype:string;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  getCurrentFinancialYear() {
    var fiscalyear = "";
    var today = new Date();
    
    this.elementtype="svg";

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
    this.fiscalYear = this.getCurrentFinancialYear();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getLocationById(this.currentUser.baselocation);
      //this.getGateList();
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
  geSTOInputsModel = {} as RFCSTOInputs;
  gateEntryMaterial: RFCSTOMaterial[] = [];
  getInvoiceInfoFromBAPI(geSTOInputs: RFCSTOInputs) {
    this.resetForm();
    this.geSTOInputsModel=geSTOInputs;
    if (geSTOInputs.exnum == null || geSTOInputs.exnum == '') {
      swal({
        title: "Message",
        text: "Please enter Invoice Number",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      let geSTOexists: any = [];
      if (this.gateEntryMaterial.length > 0) {
        geSTOexists = this.gateEntryMaterial.filter(function (x) {
          return x.docno == geSTOInputs.exnum;
        });
      }
      if (geSTOexists.length > 0) {
        swal({
          title: "Message",
          text: "Invoice related material already exists.Please enter different Invoice No",
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
        genericGateEntryM.gI_TYPE = 'E';
        genericGateEntryM.isActive='1';
        genericGateEntryM.doC_NO = geSTOInputs.exnum;
        this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_FILTER_API, genericGateEntryM).then((data: any) => {
          if (data) {
            existInvoice = data.length > 0 ? true : false;
            if (!existInvoice) {
              this.httpService.post(APIURLS.BR_RFCBAPI_GETGE_STO_SALES_INFO_API, geSTOInputs).then((data: any) => {
                if (data.length > 0) {
                  if (data[0].type == 'S') {
                    if (data[0].trntyp == 'SALE') {
                      if (data[0].werks == this.plant) {
                        this.gateEntryHeaderModel = data[0];
                        this.gateEntryMaterial= Object.assign([],this.gateEntryHeaderModel.gestoitems);
                        // this.gateEntryHeaderModel.gestoitems.forEach(mtrl => {
                        //   this.gateEntryMaterial.push(mtrl);
                        // });
                        this.isLoadingBAPI = false;
                      }
                      else {
                        swal({
                          title: "Message",
                          text: 'Entered invoice number belongs to '+data[0].werks+' location. Please enter correct invoice number',
                          icon: "warning",
                          dangerMode: false,
                          buttons: [false, true]
                        });
                      }
                    }
                    else {
                      swal({
                        title: "Message",
                        text: 'Entered invoice number is not for sales.Please enter correct invoice number',
                        icon: "warning",
                        dangerMode: false,
                        buttons: [false, true]
                      });
                    }
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
                this.gateEntryHeaderModel = {} as RFCSTOHeader;
                this.gateEntryMaterial = [];
              });
            }
            else {
              swal({
                title: "Message",
                text: 'Entered invoice No is already exists.Please enter other invoice no',
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
              });
            }
          }
          this.isLoadingBAPI = false;
        }).catch(error => {
          this.isLoadingBAPI = false;
          this.errMsgPop = "Error to retrive Invoice Details";
        });
      }
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
        //this.selGateLocation = null;
        // this.selGateLocation = this.locationGateList.find(x => x.gateNo == 'G1');
        // this.gateNo = this.selGateLocation.id;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.locationGateList = [];
    });
  }
  employeeList=[];
  sendingPERSON:any;
  getEmployeeList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API,this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.employeeList = data.map((i) => { i.empfull = i.firstName +' '+i.middleName +' '+ i.lastName + '-'+i.employeeId + '-' + i.designation; return i; });
        this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.currentUser.employeeId);

      }
    }).catch(error => {
      this.isLoading = false;
      this.employeeList = [];
    });
  }
  departmentList=[];
  sendingDEPTNAME:any;
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
    genericGateEntryM.gI_TYPE = 'E'; //E:ExciseInvoice
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
      this.gateEntryHeaderModel.docno=gateOutwardM.doC_NO;
      this.gateEntryHeaderModel.exdat=gateOutwardM.doC_DATE;
      this.gateEntryHeaderModel.eI_DCNO=gateOutwardM.dC_NO;
      this.gateEntryHeaderModel.eI_BLDAT=gateOutwardM.dC_DATE;
      this.gateEntryHeaderModel.eI_CUSTOMER=gateOutwardM.destinatioN_NM;
      var loc = this.plantList.find(x=>x.code == this.gateOutwardMModel.planT_ID)
      this.locationName=loc.code +'-'+loc.name;
      this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.gateOutwardMModel.sendinG_PERSON);
      this.sendingPersonName = this.gateOutwardMModel.sendingPersonName;
      // this.sendingPersonName=this.sendingPERSON.firstName +' '+this.sendingPERSON.middleName +' '+ this.sendingPERSON.lastName;
      this.sendingDEPTNAME=this.departmentList.find(x => x.name == this.gateOutwardMModel.sendinG_DEPT_NM);
      this.fiscalYear = this.gateOutwardMModel.fiN_YEAR;
      this.httpService.getById(APIURLS.BR_MASTER_GATEOUTWARDD_ANY_API, gateOutwardM.id).then((data: any) => {
        if (data) {
          data.forEach(mtrl => {
            var geMaterialModel = {} as RFCSTOMaterial;
            geMaterialModel.matnr = mtrl.iteM_CODE;
            geMaterialModel.maktx = mtrl.iteM_DESC;
            geMaterialModel.meins = mtrl.uom;
            geMaterialModel.riteM1 = mtrl.nO_OF_CASES;
            geMaterialModel.menge = mtrl.qty;
            this.gateEntryMaterial.push(geMaterialModel);
          });
        }
      }).catch(error => {
        this.gateEntryMaterial= [];
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
    this.entryDateTime=new Date();
    this.gateOutwardMModel = {} as GateOutwardMaster;
    this.gateOutwardDModel = {} as GateOutwardD;
    this.gateOutwardDList = [];
    this.geSTOInputsModel = {} as RFCSTOInputs;
    this.gateEntryHeaderModel = {} as RFCSTOHeader;
    this.gateEntryMaterial = [];
    //this.selGateLocation = null;
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    // this.sendingPERSON=null;
    // this.sendingDEPTNAME=null;
    this.isLoadingPop = false;
    this.isLoadingBAPI = false;
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
    this.gateOutwardMModel.gO_GATENO = '1';
    this.gateOutwardMModel.gO_TYPE = 'E'; //E:ExciseInvoice
    this.gateOutwardMModel.doC_NO=this.gateEntryHeaderModel.docno;
    this.gateOutwardMModel.doC_DATE = this.getDateFormate(this.gateEntryHeaderModel.exdat);
    this.gateOutwardMModel.dC_NO=this.gateEntryHeaderModel.eI_DCNO;
    this.gateOutwardMModel.dC_DATE = this.getDateFormate(this.gateEntryHeaderModel.eI_BLDAT);
    this.gateOutwardMModel.gO_DATE = this.getDateFormate(new Date());
    this.gateOutwardMModel.sendinG_PERSON=this.sendingPERSON.employeeId;
    this.gateOutwardMModel.sendinG_DEPT_NM=this.sendingDEPTNAME.name;
    this.gateOutwardMModel.destinatioN_NM = this.gateEntryHeaderModel.eI_CUSTOMER;
    this.gateOutwardMModel.exP_OUT_TIME = this.getFormatedDateTime(this.gateOutwardMModel.exP_OUT_TIME);
    this.gateOutwardMModel.createD_BY = this.currentUser.employeeId;
    this.gateOutwardMModel.createD_DATE = this.getFormatedDateTime(new Date());
    this.gateOutwardMModel.courier_Date = this.gateOutwardMModel.courier_Date?this.getDateFormate(this.gateOutwardMModel.doC_DATE):null;
    this.gateOutwardMModel.isActive = true;
    this.gateOutwardMModel.status = 'Pending For Approval';
    this.gateOutwardMModel.pendingWith = this.Approverslist[0].approverId;
    //Insert Material
    var index = 0;
    let lstgateOutwardD:GateOutwardD[]=[];
    this.gateEntryMaterial.forEach(mtrl => {
      index = index + 1;
      this.gateOutwardDModel = {} as GateOutwardD;
      this.gateOutwardDModel.mandt = '450'
      this.gateOutwardDModel.fiN_YEAR = this.fiscalYear;
      this.gateOutwardDModel.planT_ID = this.plant
      this.gateOutwardDModel.gO_GATENO = "1";
      this.gateOutwardDModel.iteM_NO = index;
      this.gateOutwardDModel.iteM_CODE = mtrl.matnr
      this.gateOutwardDModel.iteM_DESC = mtrl.maktx;
      this.gateOutwardDModel.uom = mtrl.meins;
      this.gateOutwardDModel.nO_OF_CASES = +mtrl.riteM1;
      this.gateOutwardDModel.qty = +mtrl.menge;
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
          <title>Outward - Sales</title>
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
