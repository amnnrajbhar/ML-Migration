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

import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DocTypeMaster } from './DocTypeMaster.model';

@Component({
    selector: 'app-DocTypeMaster',
    templateUrl: './DocTypeMaster.component.html',
    styleUrls: ['./DocTypeMaster.component.css']
})
export class DocTypeMasterComponent implements OnInit {
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

    filterbarcode: string = null;
    filterBrand: string = null;

    DocTypeMastermodel = {} as DocTypeMaster;
    DocTypeMasterlist: DocTypeMaster[] = [];
    // ItemCodeExtensionlist:ItemCodeExtension[]=[];
    materialtype: string;
    filterMaterialCode: string = null;
    filterstatus: string = null;
    filterlocation: string = null;
    filterdocno: string = null;
    filterplace: string = null;
    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;
    //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

    DocTypeMasterFilter: DocTypeMaster[] = [];
    DocTypeMastersearchlist: DocTypeMaster[] = [];

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

    //DocTypeMastermodeldata = {} as ItemCodeExtension;

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
        private http: HttpClient, private datePipe: DatePipe) {  }

    private initDatatable(): void {
        let exampleId: any = jQuery('#categTable');
        this.tableWidget = exampleId.DataTable({
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
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
       // this.getCategoryList();
        this.getLocationMaster();
    }

    CategoryList: any[] = [];
    getCategoryList() {
        this.httpService.DLSgetByParam(APIURLS.BR_GET_TYP_CAT_GET_BYPARAM_MASTER,this.locationCode).then((data: any) => {
            if (data.length > 0) {
                this.CategoryList = data
            }
            this.isLoading = false;
            this.reInitDatatable();
        }).catch(error => {
            this.isLoading = false;
            this.CategoryList = [];
        });

    }

    locationCode: string;
    getLocationMaster() {
        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
            if (data.length > 0) {
                this.locationList = data.filter(x => x.isActive);
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
                this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
                this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
                this.locationCode = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
                this.getCategoryList();
            }
        }).catch(error => {
            this.isLoading = false;
            this.locationList = [];
        });
    }
    ChangeRetType(value)
    {
        if(value=='NA')
        {
            this.DocTypeMastermodel.retentionNo=0;
        }
    }
   
    currentUser: AuthData;
    ngAfterViewInit() {
        this.initDatatable();
    }

    resetForm() {
        this.errMsg1 = "";
        this.DocTypeMastermodel = {} as DocTypeMaster;
    }

    empId: string;
    view: boolean = false;
    locationName: string;
    onUserActions(isedit: boolean, DocTypeMaster: DocTypeMaster, isprint: boolean, value: string) {
        this.isEdit = isedit;
        this.resetForm();
        this.view = false;
        this.errMsg1 = "";
        this.errMsgPop = "";
        if (isedit) {
            this.DocTypeMastermodel = Object.assign({}, DocTypeMaster);
        }
        else {
            this.DocTypeMastermodel = {} as DocTypeMaster;
        }
        jQuery("#searchModal").modal('hide');
        jQuery('#myModal').modal('show');
    }
    isValid: boolean = false;
    validatedForm: boolean = true;

    onSaveEntry(status) {
        this.errMsg = "";
        let connection: any;
     
            if (!this.isEdit) {
            this.DocTypeMastermodel.location = this.locationCode;   
            this.DocTypeMastermodel.createdBy = this.currentUser.employeeId;
            this.DocTypeMastermodel.createdDate = new Date().toLocaleString();
                connection = this.httpService.DLSpost(APIURLS.BR_MASTER_TYP_CAT_MASTER_INSERT, this.DocTypeMastermodel);
            }
            else 
            {
                this.DocTypeMastermodel.modifiedBy = this.currentUser.employeeId;
            this.DocTypeMastermodel.modifiedDate = new Date().toLocaleString();
                connection = this.httpService.DLSput(APIURLS.BR_MASTER_TYP_CAT_MASTER_INSERT, this.DocTypeMastermodel.id,this.DocTypeMastermodel); 
            }
            connection.then((output: any) => {
                this.isLoadingPop = false;
                if (output == 200 || output.id > 0) {
                   
                        jQuery("#myModal").modal('hide');
                        this.errMsgPop1 = 'Doc Type Saved successfully!';
                        jQuery("#saveModal").modal('show');
                     
                     this.getCategoryList();
                  
                    
                    // this.reset();
                }
            }).catch(error => {
                this.isLoadingPop = false;
                this.errMsgPop = 'Error saving Type..';
            });

      //  }


    }

    deleteType(data): void {
        this.DocTypeMastermodel = new DocTypeMaster();        
        swal({
          title: "Are you sure to delete?",
          icon: "warning",
          dangerMode: true,
          buttons: [true, true],
        }).then((willdelete) => {
          if (willdelete) {
            Object.assign(this.DocTypeMastermodel, data);
            let connection: any;
            this.DocTypeMastermodel.deleteFlag = 'Y';
            this.DocTypeMastermodel.modifiedBy = this.currentUser.employeeId;
            this.DocTypeMastermodel.modifiedDate = new Date().toLocaleString();
            connection = this.httpService.DLSput(APIURLS.BR_MASTER_TYP_CAT_MASTER_INSERT, this.DocTypeMastermodel.id, this.DocTypeMastermodel);
            connection.then((data: any) => {
              this.isLoadingPop = false;
              if (data == 200 || data.id > 0) {
                this.errMsgPop1 = ' Deleted successfully!';
                jQuery("#saveModal").modal('show');
                this.getCategoryList();
              }
            }).catch(() => {
              this.isLoadingPop = false;
              this.errMsgPop = 'Error deleting Type..';
            });
          }
        });
      }


}


