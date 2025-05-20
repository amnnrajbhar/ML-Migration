import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { GateInwardMaster } from '../gateentrymodels/gateinwardm.model';
import { APIURLS } from '../shared/api-url';
import { HttpService } from '../shared/http-service';
import { GateEntryM } from './gateentrym.model';
import { GateEntryD } from './gateentryd.model';
import { GateEntryHeader } from './gateentryheader.model';
import { GEPOInputs } from './gepoinputs.model';
import { GateEntryMaterial } from './gateentrymaterial.model';
import { eraseStyles } from '@angular/animations/browser/src/util';
import { GenericGateEntryM } from './genericgateentrym.model';
import { RFCCreateGEPO } from './rfccreategepo.model';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-gateentry',
  templateUrl: './gateentry.component.html',
  styleUrls: ['./gateentry.component.css']
})
export class GateentryComponent implements OnInit {
  @ViewChild(NgForm) userForm: NgForm;
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
  gateEntryDModel = {} as GateEntryD;
  gateEntryHeaderModel = {} as GateEntryHeader;
  gateEntryMList: GateEntryM[] = [];
  gateEntryDList: GateEntryD[] = [];
  pO_No: string;
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  userName: string;
  iN_TIME: any;
  reason: string;
  maxDate:Date=new Date();

  filteredpolist:GateEntryD[]=[];
  gateEntryMList1: GateEntryM[] = [];

  elementtype:string;

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
    this.elementtype="svg";
    this.fiscalYear = this.getCurrentFinancialYear();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.userName = this.currentUser.fullName;
     // this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getLocationById(this.currentUser.baselocation);
      this.getGateList();
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
        { "orderable": false, "targets": 9 }
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
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.locationGateList = [];
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
    this.acknowledge = false;
    this.delete = false;
    this.fltrGINO = null;
    this.fltrInvoice = null;
    this.fltrPo='';
    this.fltrSupplier = null;
    this.selectedModes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  acknowledge: boolean = false;
  delete: boolean = false;
  fltrGINO: string;
  fltrInvoice: string;
  fltrPo:string='';
  fltrSupplier: string;
  getAllGateEntries(msg) {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    genericGateEntryM.planT_ID = this.plant;
    genericGateEntryM.gI_TYPE = '0';
    genericGateEntryM.gI_NO = this.fltrGINO;
    genericGateEntryM.doC_NO = this.fltrInvoice;
    genericGateEntryM.namE1 = this.fltrSupplier;
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
    this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_GETGEGATEPO_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.httpService.getByParam(APIURLS.BR_MASTER_GATEINWARDD_PARAM_API, this.plant).then((polist: any) => {
          if (polist) {    
             let filterlist:GateEntryD[]=[];
             filterlist=polist;
            let stDt=new Date(genericGateEntryM.fromdate);
            let edDt=new Date(genericGateEntryM.todate);
            filterlist=filterlist.filter(x=>new Date(x.createD_DATE)> stDt && new Date(x.createD_DATE) <edDt)
            this.filteredpolist=filterlist; 
            
            this.gateEntryMList1 = data;
            for(var i=0;i<this.gateEntryMList1.length;i++)
            {
              
              for(var j=0;j<polist.length;j++)
              {
                if(polist[j].fkgatE_ENTRY_M==this.gateEntryMList1[i].id)
                {
                  this.gateEntryMList1[i].ponumber=polist[j].pO_NO;
                }
              }
             
            }
           
            if(this.fltrPo != '')
            {
              this.gateEntryMList1=this.gateEntryMList1.filter(x=>x.ponumber == this.fltrPo);
            }            
            this.gateEntryMList=this.gateEntryMList1;
            this.gateEntryMList.reverse();
            // this.gateEntryMList.forEach(element => {
            //   let temp={} as GateEntryD;
            //   temp=polist.filter(x=>x.gI_NO == element.gI_NO);
            //   this.filteredpolist.push(temp);              
            // });
          }
          this.reInitDatatable();
          this.isLoading = false;
        }).catch(error => {
          this.isLoading = false;
          this.gateEntryMList = [];
        });
        this.gateEntryMList = data;
        this.gateEntryMList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.gateEntryMList = [];
    });
    if (msg == 'print') {
      this.onGateEntryActions(true,this.gateEntryMModel,true);
    }
  }

  gePOInputsModel = {} as GEPOInputs;
  gateEntryMaterial: GateEntryMaterial[] = [];

  gateEntryMaterial1: GateEntryMaterial[] = [];


  vendorCode: string = '';
  getPOInfoFromBAPI(gePOInputs: GEPOInputs) {
    if (gePOInputs.purchaseorder == null || gePOInputs.purchaseorder == '') {
      swal({
        title: "Message",
        text: "Please enter PO Number",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      let gePOexists: any = [];
      gePOInputs.plant = this.plant;
      gePOInputs.witH_PO_HEADERS = "Y";
      gePOInputs.itemS_OPEN_FOR_RECEIPT = "Y";
      if (this.gateEntryMaterial.length > 0) {
        gePOexists = this.gateEntryMaterial.filter(function (x) {
          return x.pO_NUMBER == gePOInputs.purchaseorder;
        });
      }
      if (gePOexists.length > 0) {
        swal({
          title: "Message",
          text: "PO related material already exists.Please enter different PO",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      else {
        this.isLoadingBAPI = true;
        this.httpService.post(APIURLS.BR_RFCBAPI_GETGEPOINFO_API, gePOInputs).then((data: any) => {
          if (data.length > 0) {
            if (data[0].type == 'S') {
              if (data[0].doC_TYPE !='ZS') {
                if (this.vendorCode == '' || this.vendorCode == data[0].vendor) {
                  this.vendorCode = data[0].vendor;
                  //this.gateEntryHeaderModel = data[0];                

                  Object.assign(this.gateEntryHeaderModel,data[0]);
                  this.gateEntryHeaderModel.geMaterialPO.forEach(mtrl => {
                    mtrl.pO_DATE = data[0].doC_DATE;                    
                    this.gateEntryMaterial1.push(mtrl);
                  });
                  let material:any[]=[];
                  this.gateEntryMaterial1.forEach(ele =>{
                    let temp =this.filteredpolist.filter(x=>x.pO_NO ==ele.pO_NUMBER && x.linE_ITEM==ele.pO_ITEM && 
                                              x.iteM_CODE == ele.puR_MAT); 
                    if(temp.length <=0)   
                    {
                      material.push(ele)
                    }           
                    else
                    {
                      let sum:any;
                      let max:any;
                      let qty:any[]=[];
                      for(let i=0;i<temp.length;i++)
                      {
                        qty.push(temp[i].qty);
                      } 
                       max = qty.reduce((a ,b)=>Math.max(a, b));
                      for(let i=0;i<temp.length;i++)
                      {
                        sum=temp[0].qtY_RCVD
                        for(i=1;i<temp.length;i++)
                        {
                          sum=temp[i].qtY_RCVD + sum;
                        }
                      }
                      if(sum <max)
                        {
                          material.push(ele)
                        }                      
                    }
                  });
                  if(material.length == 0 || material == undefined)
                  {
                    swal({
                      title: "Message",
                      text: "PO related material already exists.Please enter different PO",
                      icon: "warning",
                      dangerMode: false,
                      buttons: [false, true]
                    });
                  }
                  else{
                    this.gateEntryMaterial=material;
                  }


                  this.isLoadingBAPI = false;
                }
                else {
                  swal({
                    title: "Message",
                    text: "Entered PO, which is not related to present vendor.Please check again.",
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                  });
                }
              }
              // else if (data[0].doC_TYPE == 'ZUS' || data[0].doC_TYPE == 'ZUB') {
              //   swal({
              //     title: "Message",
              //     text: "PO entered is for STO. Please enter correct PO",
              //     icon: "warning",
              //     dangerMode: false,
              //     buttons: [false, true]
              //   });
              // }
              else if (data[0].doC_TYPE == 'ZS') {
                swal({
                  title: "Message",
                  text: "PO entered is for Sub-contracting. Please enter correct PO",
                  icon: "warning",
                  dangerMode: false,
                  buttons: [false, true]
                });
              }
              else {
                swal({
                  title: "Message",
                  text: "Please check and enter correct PO",
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
          this.gateEntryHeaderModel = {} as GateEntryHeader;
          this.gateEntryMaterial = [];
        });
      }
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
  onGateEntryActions(isedit: boolean, gateEntryM: GateEntryM, isprint: boolean) {
    this.isEdit = isedit;
    this.resetForm();
    this.userForm.form.markAsPristine();
    this.userForm.form.markAsUntouched();
    this.userForm.form.updateValueAndValidity();
    if (isedit) {
      this.gateEntryMModel = Object.assign({},gateEntryM) ;
      this.selGateLocation = this.locationGateList.find(x => x.gateNo == this.gateEntryMModel.gI_GATENO);
      this.fiscalYear = this.gateEntryMModel.fiN_YEAR;
      this.gateEntryHeaderModel.vendor = this.gateEntryMModel.lifnr;
      this.gateEntryHeaderModel.venD_NAME = this.gateEntryMModel.namE1;
      this.gateEntryHeaderModel.orT01 = this.gateEntryMModel.orT01;
      this.gateEntryHeaderModel.landx = this.gateEntryMModel.landx;
      this.iN_TIME = this.gateEntryMModel.iN_TIME;
      this.userName = this.gateEntryMModel.persoN_NAME;
      this.httpService.getById(APIURLS.BR_MASTER_GATEINWARDD_ANY_API, gateEntryM.id).then((data: any) => {
        if (data.length > 0) {
          data.forEach(mtrl => {
            var geMaterialModel = {} as GateEntryMaterial;
            geMaterialModel.pO_NUMBER = mtrl.pO_NO;
            geMaterialModel.pO_DATE = this.gateEntryMModel.doC_DATE;
            geMaterialModel.puR_MAT = mtrl.iteM_CODE;
            geMaterialModel.shorT_TEXT = mtrl.iteM_DESC;
            geMaterialModel.unit = mtrl.uom;
            geMaterialModel.disP_QUAN = mtrl.qty;
            geMaterialModel.qtY_RCVD = mtrl.qtY_RCVD;
            this.gateEntryMaterial.push(geMaterialModel);
          });
        }
      }).catch(error => {
        // this.locationGateList = [];
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
    this.iN_TIME = new Date();
    this.userName = this.currentUser.fullName;
    this.gePOInputsModel = {} as GEPOInputs;
    this.gateEntryHeaderModel = {} as GateEntryHeader;
    this.gateEntryMaterial = [];
    this.gateEntryMaterial1=[];
    this.gateEntryMModel = {} as GateEntryM;
    this.gateEntryDModel = {} as GateEntryD;
    //this.locationGateList = [];
    this.gateEntryDList = [];
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    this.isLoadingPop = false;
    this.vendorCode = '';
  }

  validateQTY(event, mat) {
    var recQTY: number = +event.target.value;
    var actQTY: number = +mat.disP_QUAN;
    //  if (actQTY < recQTY) {
    //   swal({
    //     title: "Message",
    //     text: "Quantity received (" + recQTY + ") should be less than quantity (" + actQTY + ") supplied",
    //     icon: "warning",
    //     dangerMode: false,
    //     buttons: [false, true]
    //   });
    //   event.target.value = '';
    // }
       if (recQTY<0) {
        swal({
          title: "Message",
          text: "Quantity received (" + recQTY + ") should be greater than Zero",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
        event.target.value = '';
    }
  }
  onSaveEntry() {
    if (!this.isEdit) {
      let zeroQTYMatList = this.gateEntryMaterial.filter(x => { return x.qtY_RCVD && x.qtY_RCVD>0 });
      if (zeroQTYMatList.length==0) {
        swal({
          title: "Message",
          text: "Please check and update atleast one Material received Quantity",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      else {
        swal({
          title: "Are you sure to submit?",
          icon: "warning",
          buttons: [true, true],
        })
          .then((willsave) => {
            if (willsave) {
             this.insertGateEntry();
            }
          });
      }
    }
    else {
      swal({
        title: "Are you sure to Cancel Entry?",
        icon: "warning",
        buttons: [true,true],
      })
      .then((willsave) => {
        if (willsave) {
          this.deleteGateEntry();
        }
      });
    }
  }

  insertGateEntry() {
    var dtinTime = new Date(this.iN_TIME);
    this.gateEntryMModel.mandt = '450'
    this.gateEntryMModel.fiN_YEAR = this.fiscalYear;
    this.gateEntryMModel.planT_ID = this.plant
    this.gateEntryMModel.gI_GATENO = this.selGateLocation.gateNo;
    this.gateEntryMModel.gI_TYPE = '0'
    this.gateEntryMModel.doC_DATE = this.getDateFormate(this.gateEntryMModel.doC_DATE);
    this.gateEntryMModel.gI_DATE = this.getDateFormate(dtinTime);
    this.gateEntryMModel.lifnr = this.gateEntryHeaderModel.vendor;
    this.gateEntryMModel.namE1 = this.gateEntryHeaderModel.venD_NAME;
    this.gateEntryMModel.orT01 = this.gateEntryHeaderModel.orT01
    this.gateEntryMModel.regio = this.gateEntryHeaderModel.lanD1;
    this.gateEntryMModel.landx = this.gateEntryHeaderModel.landx;
    this.gateEntryMModel.courier_Date = this.gateEntryMModel.courier_Date?this.getDateFormate(this.gateEntryMModel.doC_DATE):null;
    var inTime = ("00" + dtinTime.getHours()).slice(-2) + ":" +
      ("00" + dtinTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtinTime.getSeconds()).slice(-2);
    this.gateEntryMModel.iN_TIME = inTime;
    //this.gateEntryMModel.persoN_NAME = this.userName;
    this.gateEntryMModel.createD_BY = this.currentUser.employeeId;
  
    this.gateEntryMModel.createD_DATE = this.getFormatedDateTime(new Date());

    this.gateEntryMModel.isActive = true;
    //Insert Material
    var index = 0;
    this.gateEntryMaterial.forEach(mtrl => {
      if (mtrl.qtY_RCVD && mtrl.qtY_RCVD>0) {
        index = index + 1;
        this.gateEntryDModel = {} as GateEntryD;
        this.gateEntryDModel.mandt = '450'
        this.gateEntryDModel.fiN_YEAR = this.fiscalYear;
        this.gateEntryDModel.planT_ID = this.plant
        this.gateEntryDModel.gI_GATENO = this.selGateLocation.gateNo;
        this.gateEntryDModel.iteM_NO =index;
        this.gateEntryDModel.linE_ITEM=mtrl.pO_ITEM;
        this.gateEntryDModel.iteM_CODE = mtrl.puR_MAT
        this.gateEntryDModel.iteM_DESC = mtrl.shorT_TEXT;
        this.gateEntryDModel.uom = mtrl.unit;
        this.gateEntryDModel.nO_OF_CASES = 0;
        this.gateEntryDModel.qty = mtrl.disP_QUAN;
        this.gateEntryDModel.qtY_RCVD = mtrl.qtY_RCVD;
        this.gateEntryDModel.pO_NO = mtrl.pO_NUMBER;
        this.gateEntryDModel.pO_DATE = mtrl.pO_DATE;
        this.gateEntryDModel.createD_BY = this.currentUser.employeeId;
        this.gateEntryDModel.createD_DATE = this.getFormatedDateTime(new Date());
        this.gateEntryDModel.isActive = true;
        this.gateEntryDList.push(this.gateEntryDModel);
      }
    });
    this.gateEntryMModel.gateEntryDViewModel = this.gateEntryDList;
    let connection = this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.sendGEPOtoCreateBAPI(data);
      }
    }).catch(error => {
      this.errMsgPop = 'Error saving Header...';
      this.isLoadingPop = false;
    });
  }
  sendGEPOtoCreateBAPI(model) {
    this.gateEntryMModel= Object.assign({},model);
    this.gateEntryDList.forEach(x => {
      x.gI_NO = model.gI_NO;
    });
    let rfcCreateGEPO = {} as RFCCreateGEPO;
    rfcCreateGEPO.gateEntryInputs = this.gateEntryMModel;
    rfcCreateGEPO.gateEntryMaterial = this.gateEntryDList;
    let connection = this.httpService.post(APIURLS.BR_RFCBAPI_CREATEGEPO_API, rfcCreateGEPO);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      jQuery('#myModal').modal('hide');
      if (data != null) {
        if (data.message == 'SUCESSFULLY INSERTED' || data.type == 'X') {
          this.updateACKinGEPO(model);
          this.errMsgModalPop = 'PO saved successfully!';
          swal(this.errMsgModalPop, {
            icon: "success",
          }).then((willsave) => {
            if (willsave) {
              this.getAllGateEntries('print');
            }
          });
        }
        else {
          this.errMsgModalPop = 'Successfully inserted in gate entry system,Could not connect to SAP';
          swal(this.errMsgModalPop, {
            icon: "warning",
          }).then((willsave) => {
            if (willsave) {
              this.getAllGateEntries('print');
            }
          });
        }
      }
      else {
        this.errMsgModalPop = 'Successfully inserted in gate entry system,Could not connect to SAP';
        swal(this.errMsgModalPop, {
          icon: "warning",
        }).then((willsave) => {
          if (willsave) {
            this.getAllGateEntries('print');
          }
        });
      }
     // jQuery("#saveModal").modal('show');
      this.isLoadingPop = false;
    }).catch(error => {
      this.errMsgPop = 'Successfully inserted in gate entry system,Could not connect to SAP';
      this.isLoadingPop = false;
    });
  }
  updateACKinGEPO(model) {
    let updategateEntryM = {} as GateEntryM;
    updategateEntryM = model;
    updategateEntryM.ack = true;
    updategateEntryM.modifieD_BY = this.currentUser.employeeId;
    updategateEntryM.modifieD_DATE = this.getFormatedDateTime(new Date());
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, updategateEntryM.id, updategateEntryM);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.isLoadingPop = false;
      }
    }).catch(error => {
      this.errMsgPop = 'Error update acknowledgement in GEPO Header';
      this.isLoadingPop = false;
    });
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

  lastReportingkeydown = 0;
  getpersonResponsible($event, i) {
    let self = this;
    let text = $('#persoN_NAME').val();
    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.get(APIURLS.BR_GET_EMPLOYEE_BASED_ON_SEARCHTEXT + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return {
                label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId, name: item.name, mobile: item.mobileNo,
                email: item.emailId, plant: item.plant
              };
            })
            $('#persoN_NAME').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#persoN_NAME").val(ui.item.name);
                  self.gateEntryMModel.persoN_NAME=ui.item.name;
                }
                else {
                  $("#persoN_NAME").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#persoN_NAME").val(ui.item.name);
                  self.gateEntryMModel.persoN_NAME=ui.item.name;
                }
                else {
                  $("#persoN_NAME").val('');
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

  deleteGateEntry() {
    this.gateEntryMModel.deL_FLG = 'Y';
    this.gateEntryMModel.deL_REASON = this.reason;
    this.gateEntryMModel.deleteD_BY = this.currentUser.employeeId;
    this.gateEntryMModel.deleteD_DATE = this.getFormatedDateTime(new Date());
    this.gateEntryMModel.isActive = false;
    let connection = this.httpService.post(APIURLS.BR_RFCBAPI_DELETEGEPO_API, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      jQuery('#myModal').modal('hide');
      if (data != null) {
        if (data.type == 'Y') {
          this.deactivateGateEntry();
          this.errMsgModalPop = 'Cancelled successfully!';
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
     // jQuery("#saveModal").modal('show');
      this.isLoadingPop = false;
    }).catch(error => {
      this.errMsgPop = 'Could not connect to SAP.Please try after sometime or contact to administrator';
      //jQuery("#saveModal").modal('show');
      this.isLoadingPop = false;
    });
  }

  deactivateGateEntry() {
    let connection = this.httpService.put(APIURLS.BR_MASTER_GATEINWARDM_POST_API, this.gateEntryMModel.id, this.gateEntryMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.isLoadingPop = false;
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Delete PO...';
    });
  }
  print(): void {
  // this.printElement(document.getElementById("print-section"));
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Gate Entry - With PO</title>
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

  printElement(elem) {
    var domClone = elem.cloneNode(true);
    var $printSection = document.getElementById("printSection");
    if (!$printSection) {
      $printSection = document.createElement("div");
      $printSection.id = "printSection";
      document.body.appendChild($printSection);
    }
    $printSection.innerHTML = "";
    $printSection.appendChild(domClone);
    window.print();
  }
}
