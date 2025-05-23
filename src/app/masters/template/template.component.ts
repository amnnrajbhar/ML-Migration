//import { Customer } from './customer.model';
import { APIURLS } from './../../shared/api-url';
import { AppComponent } from './../../app.component';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { Template } from './template.model';
import * as _ from "lodash";
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {

    public tableWidget: any;
    country_name: string = "";
    stateList: any[];
    SelState: any;
    ApprovalTemplateName ="";
    isDispHide: boolean = true;
    selectedtempVal1: string="";
    selectedtempVal2: string="";
    templateList1: any[] =[];
    templateListSel1: any[];
    templateListSel2: any[];
    hdrMappedList1: any[]=[];
    hdrMappedList2: any[]=[];
    templateList2: any[];
    templateItem: any;
    projectList:any[];
    approvalItem: Template  = new Template(0,"","","",0,0,"","");
    sbuLst:any[];
    isLoading: boolean = false;
    tempHeaderList: any[];
    errMsg: string = "";
    errMsgPAN: string = "";
    errMsgGSTIN: string = "";
    isLoadingPop: boolean = false;
    isValidgstin: boolean = false;
    errMsgPop: string = "";
    //regDate: Date = new Date();
    isEdit: boolean = false;
    path:string ='';
    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }


    private initDatatable(): void {
        let exampleId: any = jQuery('#customerTable');
        this.tableWidget = exampleId.DataTable();
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
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        if(chkaccess == true){
          ////console.log(chkaccess);
          this.getTemplateHeadersList(); 
        this.geSbuList();
        this.getProjectList();
        }
        else 
          this.router.navigate(["/unauthorized"]);
      }
    ngAfterViewInit() {
        this.initDatatable()
    }

    OnApprovalSave(){
        let connection: any;
        ////console.log(this.approvalItem)
        this.approvalItem.fkSbuId =1;
        this.approvalItem.fkProject =1;
        connection = this.httpService.post(APIURLS.BR_MASTER_APPROVALTEMPLATE_API, this.approvalItem);
        connection.then((dataaddress: any) => {
           this.isLoadingPop = false;
          if (dataaddress.id >0) {
              ////console.log("Submit");
              this.clearselection();
          }
        });

    }
    getTemplateHeadersList() {
        //this.country_name = JSON.parse(localStorage.getItem('currentUser')).country;
        this.errMsg = "";
        this.isLoading = true;
        // debugger;
        this.httpService.get(APIURLS.BR_MASTER_ERRORMASTER_All).then((data: any) => {
           
                this.templateList1 = data;
                // debugger;
             //   this.templateList2 = data.templateList2;
                //this.reInitDatatable();
         
        }).catch(error => {
            this.isLoading = false;
            this.templateList1 = [];
            this.templateList2 = [];
        });
        this.httpService.get(APIURLS.BR_DESIGNATION_API).then((data: any) => {
            this.isLoading = false;
           
             //  this.templateList1 = data;
                this.templateList2 = data;
                //this.reInitDatatable();
            
        }).catch(error => {
            this.isLoading = false;
            this.templateList1 = [];
            this.templateList2 = [];
        });
    }
    getProjectList(){
        this.errMsg = "";
        this.isLoading = true;
        this.httpService.get(APIURLS.BR_MASTER_PROJECTMASTER_API).then((data: any) => {
            this.isLoading = false;
            if (data.length > 0) {
                this.projectList = data;
               // this.reInitDatatable();
            }
        }).catch(error => {
            this.isLoading = false;
            this.projectList = [];
        });
      }
      geSbuList() {
        this.httpService.get(APIURLS.BR_MASTER_SBU_All).then((data: any) => {
         // this.isLoading = false;
          if (data.length>0) {
            this.sbuLst = data;
            //this.parentList = data.roleList;
            //this.roleList.forEach(item => { item.isChecked = false; });
           // this.reInitDatatable();
          }
        }).catch(error => {
          //this.isLoading = false;
          this.sbuLst = [];
        });
      }
  MapSelectedHeaders() {
    this.templateListSel1.forEach(obj => this.hdrMappedList1.push(obj.type));
    this.templateListSel2.forEach(obj => this.hdrMappedList2.push(obj.name));
   // this.templateListSel1.forEach(obj => this.selectedtempVal1.push(obj.header_name));
    //this.templateListSel2.forEach(obj => this.selectedtempVal2.push(obj.header_name));
    this.selectedtempVal1 = this.hdrMappedList1.join();
    this.selectedtempVal2 = this.hdrMappedList2.join();
    ////console.log(this.selectedtempVal1 + "sel2  " + this.selectedtempVal2);
    this.approvalItem.approvalOrderByHierarchy = this.selectedtempVal1;
    this.approvalItem.approvalOrderByTemplate= this.selectedtempVal2;
    
  }

clearselection(){
    this.hdrMappedList1=[];
    this.hdrMappedList2=[];
}
    getStateList() {
        this.httpService.get(APIURLS.BR_MASTER_STATE_API).then((data: any) => {
            if (data.lenght>0) {
                this.stateList = data;
            }
        }).catch(error => {
            this.stateList = [];
        });
    }

    //onSaveCustomer(status: boolean) {
    //    this.errMsg = "";
    //    this.errMsgPAN = "";
    //    this.errMsgGSTIN = "";
    //    this.errMsgPop = "";
    //    this.isLoadingPop = true;
    //    this.customerItem.cust_state = this.SelState.sname;
    //    this.customerItem.cust_state_code = this.SelState.scode;
    //    // this.customerItem.en_date_reg = Number(new Date(this.regDate));
    //    let connection: any;
    //    if (!this.isEdit)
    //        connection = this.httpService.post(APIURLS.BR_MASTER_CUSTOMER_API, this.customerItem);
    //    else
    //        connection = this.httpService.put(APIURLS.BR_MASTER_CUSTOMER_API, this.customerItem.custid, this.customerItem);

    //    connection.then((data: any) => {
    //        this.isLoadingPop = false;
    //        if (data.status == 'SUCCESS') {
    //            jQuery("#myModal").modal('hide');
    //            this.getCustomerMasterList();
    //        }
    //        else {
    //            this.errMsgPop = data;
    //        }
    //    }).catch(error => {
    //        this.isLoadingPop = false;
    //        this.errMsgPop = 'Error saving customer data..';
    //    });
    //}

    onStatusChange(custId) {
        this.errMsg = "";
        this.isLoading = true;
        this.httpService.delete(APIURLS.BR_MASTER_APPROVAL_All, custId).then((data: any) => {
            this.isLoading = false;
            if (data.status == 200) {
                //this.getCustomerMasterList();
            }
            else {
                this.errMsg = data;
            }
        }).catch(error => {
            this.isLoading = false;
            this.errMsg = 'Error saving customer data..';
        });
    }
    
    //onStateChange() {
    //    if (this.customerItem.cust_gstin != "") {
    //        this.validateGstin(this.customerItem.cust_gstin);
    //    }
    //}
    //getCustHeaders() {
    //    this.httpService.get(APIURLS.BR_FORM_DATA_API).then((data: any) => {
    //        if (data.status == 'SUCCESS') {
    //            this.cusHeaderList = data.formDataList;
    //            this.cusHeaderList = data.formDataList.find(s => s.subMenuId == '5'); //_.filter(data.formData, function (obj) { if (obj.name == 'Entity') return obj; });
    //        }
    //    }).catch(error => {
    //        this.cusHeaderList = null;
    //    });
    //}
 
}
